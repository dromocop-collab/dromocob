"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  AlertCircle,
  LoaderCircle,
  MessageCircle,
  RotateCcw,
  Send,
  X,
} from "lucide-react";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import {
  onAuthStateChanged,
  signInAnonymously,
  type User,
} from "firebase/auth";

import { auth, db } from "@/lib/firebase";

const CHAT_STORAGE_KEY = "dromocob-chat-id";
const MAX_MESSAGE_LENGTH = 1000;
const MAX_MESSAGES = 100;

type MessageSender = "visitor" | "admin";

type ChatMessage = {
  id: string;
  sender: MessageSender;
  senderUid?: string;
  text: string;
  read?: boolean;
  createdAt?: Timestamp | null;
};

type ChatSession = {
  ownerUid?: string;
  status?: "open" | "closed";
};

type ChatStatus =
  | "initializing"
  | "ready"
  | "sending"
  | "error";

function createSessionId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `chat-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 12)}`;
}

function getStoredSessionId(): string {
  if (typeof window === "undefined") {
    return "";
  }

  const storedSessionId =
    window.localStorage.getItem(CHAT_STORAGE_KEY);

  if (storedSessionId) {
    return storedSessionId;
  }

  const newSessionId = createSessionId();

  window.localStorage.setItem(
    CHAT_STORAGE_KEY,
    newSessionId
  );

  return newSessionId;
}

function persistUidBasedSessionId(uid: string): string {
  window.localStorage.setItem(CHAT_STORAGE_KEY, uid);

  return uid;
}

function getErrorMessage(error: unknown): string {
  const code = getErrorCode(error);

  if (code === "auth/configuration-not-found") {
    return "Firebase Auth yapılandırması bulunamadı. Canlı ortam Firebase public env değerlerini kontrol et.";
  }

  if (code === "permission-denied") {
    return "Canlı destek izinleri kapalı. Firestore rules deploy edilmiş mi kontrol et.";
  }

  if (code === "auth/operation-not-allowed") {
    return "Firebase Anonymous Authentication etkin değil.";
  }

  if (code === "auth/network-request-failed") {
    return "İnternet bağlantısı kurulamadı.";
  }

  if (code === "failed-precondition") {
    return "Canlı destek için Firestore index veya servis koşulu eksik.";
  }

  if (code === "unavailable") {
    return "Firestore canlı destek servisine ulaşılamıyor. Firebase env, domain izinleri veya ağ bağlantısını kontrol et.";
  }

  return code
    ? `Canlı destek başlatılamadı (${code}).`
    : "Canlı destek başlatılırken bir hata oluştu.";
}

function getErrorCode(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error
  ) {
    return String(error.code);
  }

  return "";
}

export default function LiveChat() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(
    []
  );
  const [sessionId, setSessionId] = useState(
    getStoredSessionId
  );
  const [currentUser, setCurrentUser] =
    useState<User | null>(null);
  const [status, setStatus] =
    useState<ChatStatus>("initializing");
  const [errorMessage, setErrorMessage] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement | null>(
    null
  );
  const listenerUnsubscribeRef = useRef<
    (() => void) | null
  >(null);
  const initializationIdRef = useRef(0);

  const isReady =
    status === "ready" || status === "sending";
  const isSending = status === "sending";
  const hasFirebaseConfig = Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  );

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, open, scrollToBottom]);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    if (!hasFirebaseConfig) {
      const timer = window.setTimeout(() => {
        if (!cancelled) {
          setStatus("error");
          setErrorMessage(
            "Firebase public env değerleri eksik. NEXT_PUBLIC_FIREBASE_* ayarlarını kontrol et."
          );
        }
      }, 0);

      return () => {
        cancelled = true;
        window.clearTimeout(timer);
      };
    }

    const unsubscribeAuth = onAuthStateChanged(
      auth,
      async (user) => {
        if (cancelled) {
          return;
        }

        try {
          setStatus("initializing");
          setErrorMessage("");

          if (!user) {
            await signInAnonymously(auth);
            return;
          }

          setCurrentUser(user);

          /*
           * Oturum yolu auth UID'sine bağlı olunca rules, belge henüz
           * oluşmadan yapılan ilk get isteğini de güvenle doğrulayabilir.
           */
          setSessionId((activeSessionId) => {
            if (activeSessionId === user.uid) {
              return activeSessionId;
            }

            setMessages([]);
            return persistUidBasedSessionId(user.uid);
          });
        } catch (error) {
          if (cancelled) {
            return;
          }

          console.warn(
            "[DROMOCOB CHAT] Authentication error:",
            getErrorCode(error),
            error
          );

          setCurrentUser(null);
          setStatus("error");
          setErrorMessage(getErrorMessage(error));
        }
      }
    );

    return () => {
      cancelled = true;
      unsubscribeAuth();
    };
  }, [hasFirebaseConfig, open, retryKey]);

  useEffect(() => {
    if (!open || !sessionId || !currentUser) {
      return;
    }

    const initializationId =
      ++initializationIdRef.current;

    let cancelled = false;

    listenerUnsubscribeRef.current?.();
    listenerUnsubscribeRef.current = null;

    async function initializeSession(
      activeSessionId: string,
      user: User
    ): Promise<void> {
      try {
        setStatus("initializing");
        setErrorMessage("");

        const sessionReference = doc(
          db,
          "chat_sessions",
          activeSessionId
        );

        const sessionSnapshot = await getDoc(
          sessionReference
        );

        if (
          cancelled ||
          initializationId !== initializationIdRef.current
        ) {
          return;
        }

        if (!sessionSnapshot.exists()) {
          await setDoc(sessionReference, {
            ownerUid: user.uid,
            status: "open",
            visitorName: "",
            visitorEmail: "",
            visitorPhone: "",
            lastMessage: "",
            lastMessageAt: serverTimestamp(),
            unreadAdmin: 0,
            unreadVisitor: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } else {
          const session =
            sessionSnapshot.data() as ChatSession;

          /*
           * Eski session başka anonim kullanıcıya aitse
           * veya ownerUid alanı bulunmuyorsa yeni session aç.
           */
          if (session.ownerUid !== user.uid) {
            const newSessionId =
              persistUidBasedSessionId(user.uid);

            setMessages([]);
            setSessionId(newSessionId);
            return;
          }

          /*
           * Admin oturumu kapattıysa yeni konuşma başlat.
           */
          if (session.status === "closed") {
            setMessages([]);
            setStatus("error");
            setErrorMessage(
              "Bu destek konuşması kapatılmış. Yeni görüşme için destek ekibiyle iletişime geç."
            );
            return;
          }
        }

        const messagesQuery = query(
          collection(
            db,
            "chat_sessions",
            activeSessionId,
            "messages"
          ),
          orderBy("createdAt", "asc"),
          limit(MAX_MESSAGES)
        );

        listenerUnsubscribeRef.current = onSnapshot(
          messagesQuery,
          (snapshot) => {
            if (
              cancelled ||
              initializationId !==
                initializationIdRef.current
            ) {
              return;
            }

            const nextMessages: ChatMessage[] =
              snapshot.docs.map((messageDocument) => {
                const data = messageDocument.data();

                return {
                  id: messageDocument.id,
                  sender:
                    data.sender === "admin"
                      ? "admin"
                      : "visitor",
                  senderUid:
                    typeof data.senderUid === "string"
                      ? data.senderUid
                      : undefined,
                  text:
                    typeof data.text === "string"
                      ? data.text
                      : "",
                  read:
                    typeof data.read === "boolean"
                      ? data.read
                      : undefined,
                  createdAt:
                    data.createdAt instanceof Timestamp
                      ? data.createdAt
                      : null,
                };
              });

            setMessages(nextMessages);
            setStatus("ready");
            setErrorMessage("");
          },
          (error) => {
            if (cancelled) {
              return;
            }

            /*
             * console.error yerine console.warn:
             * Next.js geliştirme overlay'ini gereksiz yere
             * kırmızı hata ekranına çevirmesin.
             */
        if (getErrorCode(error) !== "permission-denied") {
          console.warn(
            "[DROMOCOB CHAT] Snapshot error:",
                error.code,
                error.message
              );
            }

            setStatus("error");
            setErrorMessage(getErrorMessage(error));
          }
        );
      } catch (error) {
        if (
          cancelled ||
          initializationId !== initializationIdRef.current
        ) {
          return;
        }

        if (getErrorCode(error) !== "permission-denied") {
          console.warn(
            "[DROMOCOB CHAT] Initialization error:",
            getErrorCode(error),
            error
          );
        }

        setStatus("error");
        setErrorMessage(getErrorMessage(error));
      }
    }

    void initializeSession(sessionId, currentUser);

    return () => {
      cancelled = true;

      listenerUnsubscribeRef.current?.();
      listenerUnsubscribeRef.current = null;
    };
  }, [open, sessionId, currentUser, retryKey]);

  async function send(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();

    const cleanText = text.trim();

    if (
      !cleanText ||
      !sessionId ||
      !currentUser ||
      !isReady ||
      isSending
    ) {
      return;
    }

    if (cleanText.length > MAX_MESSAGE_LENGTH) {
      setErrorMessage(
        `Mesaj en fazla ${MAX_MESSAGE_LENGTH} karakter olabilir.`
      );
      return;
    }

    setStatus("sending");
    setErrorMessage("");

    try {
      const sessionReference = doc(
        db,
        "chat_sessions",
        sessionId
      );

      /*
       * Önce mesajı oluşturuyoruz.
       * Rules senderUid ile auth.uid eşleşmesini bekliyor.
       */
      const messageReference = await addDoc(
        collection(
          db,
          "chat_sessions",
          sessionId,
          "messages"
        ),
        {
          sender: "visitor",
          senderUid: currentUser.uid,
          text: cleanText,
          read: false,
          createdAt: serverTimestamp(),
        }
      );

      /*
       * Session güncellemesi sadece rules'un ziyaretçiye
       * izin verdiği alanlarla yapılır.
       */
      await updateDoc(sessionReference, {
        lastMessage: cleanText,
        lastMessageAt: serverTimestamp(),
        unreadAdmin: 1,
        updatedAt: serverTimestamp(),
      });

      setText("");
      setStatus("ready");

      try {
        const idToken = await currentUser.getIdToken();
        const notificationResponse = await fetch("/api/public/chat-notification", {
          method: "POST",
          headers: {
            authorization: `Bearer ${idToken}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({ sessionId, messageId: messageReference.id }),
        });

        if (!notificationResponse.ok) {
          console.warn("[DROMOCOB CHAT] Email notification could not be queued.");
        }
      } catch (notificationError) {
        console.warn("[DROMOCOB CHAT] Email notification error:", notificationError);
      }
    } catch (error) {
      if (getErrorCode(error) !== "permission-denied") {
        console.warn(
          "[DROMOCOB CHAT] Send error:",
          getErrorCode(error),
          error
        );
      }

      setStatus("error");
      setErrorMessage(getErrorMessage(error));
    }
  }

  function retryChat(): void {
    listenerUnsubscribeRef.current?.();
    listenerUnsubscribeRef.current = null;

    setMessages([]);
    setErrorMessage("");
    setStatus("initializing");
    setRetryKey((current) => current + 1);
  }

  return (
    <>
      <button
        type="button"
        className="chat-launcher"
        onClick={() => setOpen((current) => !current)}
        aria-label={
          open
            ? "Canlı desteği kapat"
            : "Canlı desteği aç"
        }
        aria-expanded={open}
        aria-controls="dromocob-live-chat"
      >
        {open ? (
          <X aria-hidden="true" />
        ) : (
          <MessageCircle aria-hidden="true" />
        )}
      </button>

      {open && (
        <aside
          id="dromocob-live-chat"
          className="chat-panel"
          aria-label="Dromocob canlı destek"
        >
          <div className="chat-head">
            <div>
              <strong>Dromocob Canlı Destek</strong>

              <span>
                <i aria-hidden="true" />

                {status === "error"
                    ? "Bağlantı sorunu"
                    : "Çevrimiçi"}
              </span>
            </div>

            <button
              type="button"
              className="icon-button"
              onClick={() => setOpen(false)}
              aria-label="Canlı desteği kapat"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <div
            className="chat-body"
            role="log"
            aria-live="polite"
            aria-relevant="additions"
          >
            <div className="message admin-message">
              Selam 👋 Projen için buradayım. Ne inşa
              etmek istiyorsun?
            </div>

            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${
                  message.sender === "visitor"
                    ? "visitor-message"
                    : "admin-message"
                }`}
              >
                {message.text}
              </div>
            ))}

            {status === "error" && (
              <div
                className="chat-error"
                role="alert"
              >
                <AlertCircle
                  size={17}
                  aria-hidden="true"
                />

                <span>
                  {errorMessage ||
                    "Canlı destek bağlantısı kurulamadı."}
                </span>

                <button
                  type="button"
                  onClick={retryChat}
                >
                  <RotateCcw
                    size={15}
                    aria-hidden="true"
                  />
                  Yeniden dene
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form
            className="chat-form"
            onSubmit={send}
          >
            <input
              value={text}
              onChange={(event) =>
                setText(event.target.value)
              }
              placeholder={
                isReady
                  ? "Mesajını yaz..."
                  : "Mesaj alanı hazırlanıyor..."
              }
              maxLength={MAX_MESSAGE_LENGTH}
              disabled={!isReady || isSending}
              aria-label="Mesaj"
              autoComplete="off"
            />

            <button
              type="submit"
              className="icon-button"
              aria-label="Gönder"
              disabled={
                !isReady ||
                isSending ||
                text.trim().length === 0
              }
            >
              {isSending ? (
                <LoaderCircle
                  size={18}
                  className="chat-spinner"
                  aria-hidden="true"
                />
              ) : (
                <Send size={18} aria-hidden="true" />
              )}
            </button>
          </form>
        </aside>
      )}
    </>
  );
}
