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
  Clapperboard,
  Code2,
  LoaderCircle,
  MessageCircle,
  RotateCcw,
  Send,
  Sparkles,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  collection,
  doc,
  getDoc,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  writeBatch,
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
const quickStarts = [
  { label: "Web projesi", text: "Merhaba, markam için kurumsal web sitesi planlıyorum. Kapsamı birlikte netleştirebilir miyiz?", icon: Code2 },
  { label: "Film / video", text: "Merhaba, markam için film veya video prodüksiyonu hakkında bilgi almak istiyorum.", icon: Clapperboard },
  { label: "Fikir danışmak", text: "Merhaba, bir proje fikrim var ama nereden başlamam gerektiğinden emin değilim.", icon: Sparkles },
] as const;

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
  visitorName?: string;
  visitorEmail?: string;
  visitorPhone?: string;
  consentAccepted?: boolean;
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
  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
  const [consent, setConsent] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const [profileStored, setProfileStored] = useState(false);
  const [profileError, setProfileError] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(
    null
  );
  const listenerUnsubscribeRef = useRef<
    (() => void) | null
  >(null);
  const initializationIdRef = useRef(0);
  const sessionExistsRef = useRef(false);

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
          // Sohbet penceresini açmak konuşma oluşturmaz. Oturum ve ilk
          // mesaj, kullanıcı gerçekten gönder tuşuna bastığında yazılır.
          sessionExistsRef.current = false;
          setMessages([]);
          setStatus("ready");
          return;
        } else {
          sessionExistsRef.current = true;
          const session =
            sessionSnapshot.data() as ChatSession;
          const hasProfile = Boolean(session.visitorName?.trim() && /^\S+@\S+\.\S+$/.test(session.visitorEmail || "") && (session.visitorPhone || "").replace(/\D/g, "").length >= 10 && session.consentAccepted === true);
          setProfileComplete(hasProfile);
          setProfileStored(hasProfile);
          if (hasProfile) setProfile({ name: session.visitorName || "", email: session.visitorEmail || "", phone: session.visitorPhone || "" });

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
            if (nextMessages.some(message => message.sender === "admin")) {
              void updateDoc(doc(db, "chat_sessions", activeSessionId), { unreadVisitor: 0, updatedAt: serverTimestamp() }).catch(() => undefined);
            }
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
      isSending || !profileComplete
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

      // Oturum özeti ve ilk mesaj tek atomik yazmada oluşturulur.
      const messageReference = doc(collection(db, "chat_sessions", sessionId, "messages"));
      const batch = writeBatch(db);

      if (sessionExistsRef.current) {
        batch.update(sessionReference, {
          ...(!profileStored ? { visitorName: profile.name.trim(), visitorEmail: profile.email.trim().toLocaleLowerCase("tr-TR"), visitorPhone: profile.phone.trim(), consentAccepted: true, consentAcceptedAt: serverTimestamp() } : {}),
          lastMessage: cleanText,
          lastMessageAt: serverTimestamp(),
          unreadAdmin: increment(1),
          updatedAt: serverTimestamp(),
        });
      } else {
        batch.set(sessionReference, {
          ownerUid: currentUser.uid,
          status: "open",
          visitorName: profile.name.trim(),
          visitorEmail: profile.email.trim().toLocaleLowerCase("tr-TR"),
          visitorPhone: profile.phone.trim(),
          consentAccepted: true,
          consentAcceptedAt: serverTimestamp(),
          lastMessage: cleanText,
          lastMessageAt: serverTimestamp(),
          unreadAdmin: 1,
          unreadVisitor: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      batch.set(messageReference, {
          sender: "visitor",
          senderUid: currentUser.uid,
          text: cleanText,
          read: false,
          createdAt: serverTimestamp(),
      });
      await batch.commit();
      sessionExistsRef.current = true;
      setProfileStored(true);

      setText("");
      setStatus("ready");
      setRetryKey(value => value + 1);

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

  function unlockChat(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = profile.name.trim();
    const cleanEmail = profile.email.trim().toLocaleLowerCase("tr-TR");
    const cleanPhone = profile.phone.replace(/\D/g, "");
    if (cleanName.length < 2) return setProfileError("Lütfen adınızı ve soyadınızı yazın.");
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) return setProfileError("Geçerli bir e-posta adresi yazın.");
    if (cleanPhone.length < 10 || cleanPhone.length > 15) return setProfileError("Geçerli bir telefon numarası yazın.");
    if (!consent) return setProfileError("Canlı destek için aydınlatma onayını vermeniz gerekiyor.");
    setProfile({ name: cleanName.slice(0, 120), email: cleanEmail.slice(0, 320), phone: profile.phone.trim().slice(0, 30) });
    setProfileError("");
    setProfileComplete(true);
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
        {!open && messages.some(message => message.sender === "admin" && !message.read) && <span className="chat-unread">!</span>}
        <span className="chat-launcher-pulse" aria-hidden="true"/>
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
            <div className="chat-agent">
              <div className="chat-agent-avatar"><span>DC</span><i/></div>
              <div><small>DROMOCOB / LIVE CONCIERGE</small><strong>Proje Danışmanı</strong>

              <span>
                <i aria-hidden="true" />

                {status === "error"
                    ? "Bağlantı sorunu"
                    : "Çevrimiçi · Genellikle aynı gün dönüş"}
              </span>
              </div>
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

          {!profileComplete ? <form className="chat-identity-gate" onSubmit={unlockChat}>
            <div className="chat-lock-visual"><span><i/><i/><i/></span><ShieldCheck/><small>SECURE SESSION</small></div>
            <div><small>DROMOCOB / VERIFIED CONVERSATION</small><h3>Görüşmeyi güvenle başlat.</h3><p>Size doğru şekilde dönüş yapabilmemiz ve konuşmayı yalnız size bağlayabilmemiz için bilgilerinizi doğrulayın.</p></div>
            <label>Ad soyad *<input value={profile.name} onChange={event => setProfile({...profile,name:event.target.value})} autoComplete="name" maxLength={120} required/></label>
            <label>E-posta *<input type="email" value={profile.email} onChange={event => setProfile({...profile,email:event.target.value})} autoComplete="email" maxLength={320} required/></label>
            <label>Telefon *<input type="tel" value={profile.phone} onChange={event => setProfile({...profile,phone:event.target.value})} autoComplete="tel" maxLength={30} placeholder="05xx xxx xx xx" required/></label>
            <label className="chat-consent"><input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)}/><span>Canlı destek talebimin yanıtlanması için bilgilerimin işlenmesini kabul ediyorum.</span></label>
            {profileError && <div className="chat-profile-error"><AlertCircle/>{profileError}</div>}
            <button type="submit"><ShieldCheck/> Güvenli görüşmeyi aç</button>
            <small className="chat-privacy-note">Bilgileriniz yalnızca talebinizi yanıtlamak ve görüşme güvenliğini sağlamak için kullanılır.</small>
          </form> : <><div
            className="chat-body"
            role="log"
            aria-live="polite"
            aria-relevant="additions"
          >
            <div className="message admin-message">
              <small>DROMOCOB CONCIERGE</small>
              <span>Selam 👋 Projen için buradayım. Ne inşa etmek istiyorsun?</span>
            </div>

            {messages.length === 0 && <div className="chat-quick-starts"><small>HIZLI BAŞLANGIÇ</small>{quickStarts.map(({ label, text: quickText, icon: Icon }) => <button type="button" key={label} onClick={() => setText(quickText)}><Icon/><span>{label}</span><b>↗</b></button>)}</div>}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${
                  message.sender === "visitor"
                    ? "visitor-message"
                    : "admin-message"
                }`}
              >
                <small>{message.sender === "visitor" ? "SİZ" : "DROMOCOB"}</small><span>{message.text}</span>
              </div>
            ))}

            {(status === "initializing" || isSending) && <div className="chat-typing" aria-label="Mesaj hazırlanıyor"><span/><span/><span/><small>{isSending ? "Mesaj gönderiliyor" : "Güvenli bağlantı kuruluyor"}</small></div>}

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
            <div className="chat-input-shell"><small>MESAJ / {text.length}/{MAX_MESSAGE_LENGTH}</small><input
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
            /></div>

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
          </form></>}
        </aside>
      )}
    </>
  );
}
