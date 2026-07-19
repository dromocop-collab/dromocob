"use client";

import {
  KeyboardEvent,
  FormEvent,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  addDoc,
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import {
  AlertCircle,
  BadgeAlert,
  CheckCircle2,
  Clock3,
  Copy,
  Loader2,
  MessageCircle,
  Search,
  Send,
  Sparkles,
  Tag,
  Trash2,
  UserCheck,
  XCircle,
} from "lucide-react";

import {
  auth,
  db,
} from "@/lib/firebase";

type Session = {
  id: string;
  lastMessage?: string;
  lastMessageAt?: Timestamp | null;
  ownerUid?: string;
  visitorName?: string;
  visitorEmail?: string;
  visitorPhone?: string;
  status?: "open" | "closed";
  priority?: "normal" | "high";
  tags?: string[];
  adminNote?: string;
  assignedTo?: string;
  unreadAdmin?: number;
  unreadVisitor?: number;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
};

type Message = {
  id: string;
  sender: "visitor" | "admin";
  senderUid?: string;
  text: string;
  createdAt?: Timestamp | null;
};

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

function getAdminErrorMessage(error: unknown): string {
  const code = getErrorCode(error);

  if (code === "permission-denied") {
    return "Firestore admin izni reddetti. firestore.rules dosyasını Firebase'e deploy et veya admin_users kaydını aktif yap.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Canlı destek işlemi tamamlanamadı.";
}

function toTimestamp(value: unknown): Timestamp | null {
  return value instanceof Timestamp ? value : null;
}

function toOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim()
    ? value
    : undefined;
}

function toTags(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((tag): tag is string => typeof tag === "string")
    .map(tag => tag.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function formatTime(value?: Timestamp | null): string {
  if (!value) {
    return "Zaman yok";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value.toDate());
}

const quickReplies = [
  "Merhaba, ben Dromocob destek ekibinden yazıyorum. Size hemen yardımcı olayım.",
  "Kontrol ediyorum, birkaç dakika içinde net bilgi paylaşacağım.",
  "Bu işlem tamamlandı. Sizin tarafta tekrar kontrol eder misiniz?",
  "Konuyu teknik ekibe aktardım, gelişme oldukça buradan yazacağım.",
];

export default function LiveChatAdmin() {
  const [
    sessions,
    setSessions,
  ] = useState<Session[]>([]);
  const [
    active,
    setActive,
  ] = useState("");
  const [
    messages,
    setMessages,
  ] = useState<Message[]>([]);
  const [
    draft,
    setDraft,
  ] = useState("");
  const [
    search,
    setSearch,
  ] = useState("");
  const [
    filter,
    setFilter,
  ] = useState<"all" | "open" | "unread" | "priority" | "closed">("open");
  const [
    tagDraft,
    setTagDraft,
  ] = useState("");
  const [
    loadingSessions,
    setLoadingSessions,
  ] = useState(true);
  const [
    loadingMessages,
    setLoadingMessages,
  ] = useState(false);
  const [
    sending,
    setSending,
  ] = useState(false);
  const [
    error,
    setError,
  ] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletePhrase, setDeletePhrase] = useState("");
  const [deleting, setDeleting] = useState(false);

  const messagesRef =
    useRef<HTMLDivElement | null>(null);
  const noteRef =
    useRef<HTMLTextAreaElement | null>(null);
  const pageScrollRef = useRef<number | null>(null);

  useEffect(() => {
    return onSnapshot(
      collection(db, "chat_sessions"),
      snapshot => {
        const nextSessions =
          snapshot.docs
            .map(document => {
              const data = document.data();

              return {
                id: document.id,
                lastMessage:
                  typeof data.lastMessage === "string"
                    ? data.lastMessage
                    : "",
                ownerUid:
                  toOptionalString(data.ownerUid),
                visitorName:
                  toOptionalString(data.visitorName),
                visitorEmail:
                  toOptionalString(data.visitorEmail),
                visitorPhone:
                  toOptionalString(data.visitorPhone),
                status:
                  data.status === "closed"
                    ? "closed"
                    : "open",
                priority:
                  data.priority === "high"
                    ? "high"
                    : "normal",
                tags: toTags(data.tags),
                adminNote:
                  toOptionalString(data.adminNote),
                assignedTo:
                  toOptionalString(data.assignedTo),
                unreadAdmin:
                  typeof data.unreadAdmin === "number"
                    ? data.unreadAdmin
                    : 0,
                unreadVisitor:
                  typeof data.unreadVisitor === "number"
                    ? data.unreadVisitor
                    : 0,
                createdAt: toTimestamp(data.createdAt),
                lastMessageAt:
                  toTimestamp(data.lastMessageAt),
                updatedAt: toTimestamp(data.updatedAt),
              } satisfies Session;
            })
            .sort(
              (left, right) =>
                (right.lastMessageAt?.toMillis() || right.createdAt?.toMillis() || 0) -
                (left.lastMessageAt?.toMillis() || left.createdAt?.toMillis() || 0)
            );

        setSessions(nextSessions);
        setLoadingSessions(false);
        setError("");

        setActive(current => {
          if (
            current &&
            nextSessions.some(session => session.id === current)
          ) {
            return current;
          }

          return nextSessions[0]?.id || "";
        });
      },
      snapshotError => {
        setLoadingSessions(false);
        setSessions([]);
        setError(getAdminErrorMessage(snapshotError));
      }
    );
  }, []);

  useEffect(() => {
    if (!active) {
      return;
    }

    const messagesQuery = query(
      collection(
        db,
        "chat_sessions",
        active,
        "messages"
      ),
      orderBy("createdAt", "asc"),
      limit(200)
    );

    return onSnapshot(
      messagesQuery,
      snapshot => {
        const nextMessages =
          snapshot.docs.map(document => {
            const data = document.data();

            return {
              id: document.id,
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
              createdAt: toTimestamp(data.createdAt),
            } satisfies Message;
          });

        setMessages(nextMessages);
        setLoadingMessages(false);
        setError("");

        void updateDoc(
          doc(db, "chat_sessions", active),
          {
            unreadAdmin: 0,
          }
        ).catch(updateError => {
          if (getErrorCode(updateError) !== "permission-denied") {
            setError(getAdminErrorMessage(updateError));
          }
        });
      },
      snapshotError => {
        setLoadingMessages(false);
        setMessages([]);
        setError(getAdminErrorMessage(snapshotError));
      }
    );
  }, [active]);

  useEffect(() => {
    const container = messagesRef.current;

    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, active]);

  useLayoutEffect(() => {
    if (pageScrollRef.current === null) {
      return;
    }

    window.scrollTo({
      top: pageScrollRef.current,
      behavior: "auto",
    });
    pageScrollRef.current = null;
  }, [active]);

  const activeSession = useMemo(
    () =>
      sessions.find(session => session.id === active) ||
      null,
    [active, sessions]
  );

  const stats = useMemo(() => {
    const open = sessions.filter(
      session => session.status !== "closed"
    ).length;
    const closed = sessions.length - open;
    const unread = sessions.reduce(
      (total, session) =>
        total + (session.unreadAdmin || 0),
      0
    );
    const priority = sessions.filter(
      session => session.priority === "high"
    ).length;

    return {
      closed,
      open,
      priority,
      total: sessions.length,
      unread,
    };
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    const cleanSearch = search.trim().toLocaleLowerCase("tr-TR");

    return sessions.filter(session => {
      const matchesFilter =
        filter === "all" ||
        (filter === "open" && session.status !== "closed") ||
        (filter === "closed" && session.status === "closed") ||
        (filter === "unread" && Boolean(session.unreadAdmin)) ||
        (filter === "priority" && session.priority === "high");

      if (!matchesFilter) {
        return false;
      }

      if (!cleanSearch) {
        return true;
      }

      return [
        session.id,
        session.lastMessage,
        session.visitorName,
        session.visitorEmail,
        session.visitorPhone,
        session.ownerUid,
        ...(session.tags || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("tr-TR")
        .includes(cleanSearch);
    });
  }, [filter, search, sessions]);

  function selectSession(sessionId: string): void {
    pageScrollRef.current = window.scrollY;
    setMessages([]);
    setTagDraft("");
    setDeleteConfirmOpen(false);
    setDeletePhrase("");
    setLoadingMessages(true);
    setActive(sessionId);
  }

  async function sendText(cleanText: string): Promise<void> {
    if (!active || !cleanText || sending) {
      return;
    }

    const currentUser = auth.currentUser;

    if (!currentUser) {
      setError("Admin oturumu bulunamadı. Yeniden giriş yap.");
      return;
    }

    setSending(true);
    setError("");

    try {
      await addDoc(
        collection(
          db,
          "chat_sessions",
          active,
          "messages"
        ),
        {
          sender: "admin",
          senderUid: currentUser.uid,
          text: cleanText,
          read: false,
          createdAt: serverTimestamp(),
        }
      );

      await updateDoc(
        doc(db, "chat_sessions", active),
        {
          lastMessage: cleanText,
          lastMessageAt: serverTimestamp(),
          status: "open",
          unreadVisitor:
            (activeSession?.unreadVisitor || 0) + 1,
          updatedAt: serverTimestamp(),
        }
      );

      setDraft("");
    } catch (sendError) {
      setError(getAdminErrorMessage(sendError));
    } finally {
      setSending(false);
    }
  }

  async function send(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();
    await sendText(draft.trim());
  }

  function handleComposerKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>
  ): void {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();
    void sendText(draft.trim());
  }

  async function updateActiveSession(
    payload: Record<string, unknown>
  ): Promise<void> {
    if (!active) {
      return;
    }

    setSending(true);
    setError("");

    try {
      await updateDoc(
        doc(db, "chat_sessions", active),
        {
          ...payload,
          updatedAt: serverTimestamp(),
        }
      );
    } catch (updateError) {
      setError(getAdminErrorMessage(updateError));
    } finally {
      setSending(false);
    }
  }

  async function closeSession(): Promise<void> {
    await updateActiveSession({
      status: "closed",
    });
  }

  async function reopenSession(): Promise<void> {
    await updateActiveSession({
      status: "open",
    });
  }

  async function togglePriority(): Promise<void> {
    await updateActiveSession({
      priority:
        activeSession?.priority === "high"
          ? "normal"
          : "high",
    });
  }

  async function assignToMe(): Promise<void> {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setError("Admin oturumu bulunamadı. Yeniden giriş yap.");
      return;
    }

    await updateActiveSession({
      assignedTo:
        currentUser.email || currentUser.uid,
    });
  }

  async function saveNote(): Promise<void> {
    await updateActiveSession({
      adminNote: noteRef.current?.value.trim() || "",
    });
  }

  async function addTag(): Promise<void> {
    const cleanTag = tagDraft.trim().slice(0, 32);

    if (!cleanTag || !activeSession) {
      return;
    }

    await updateActiveSession({
      tags: Array.from(
        new Set([
          ...(activeSession.tags || []),
          cleanTag,
        ])
      ).slice(0, 8),
    });
    setTagDraft("");
  }

  async function removeTag(tag: string): Promise<void> {
    await updateActiveSession({
      tags:
        activeSession?.tags?.filter(
          currentTag => currentTag !== tag
        ) || [],
    });
  }

  async function copySessionId(): Promise<void> {
    if (!active) {
      return;
    }

    try {
      await navigator.clipboard.writeText(active);
    } catch {
      setError("Görüşme ID kopyalanamadı.");
    }
  }

  async function deleteSession(): Promise<void> {
    if (!active || deleting) {
      return;
    }

    const currentUser = auth.currentUser;

    if (!currentUser) {
      setError("Admin oturumu bulunamadı. Yeniden giriş yap.");
      return;
    }

    setDeleting(true);
    setError("");

    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`/api/admin/chat-sessions/${encodeURIComponent(active)}`, {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Görüşme silinemedi. Lütfen tekrar deneyin.");
      }

      setDeleteConfirmOpen(false);
      setDeletePhrase("");
      setMessages([]);
      setActive("");
    } catch (deleteError) {
      setError(getAdminErrorMessage(deleteError));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="support-desk">
      <div className="support-command-bar">
        <article>
          <MessageCircle size={18} />
          <span>Toplam</span>
          <strong>{stats.total}</strong>
        </article>
        <article>
          <CheckCircle2 size={18} />
          <span>Açık</span>
          <strong>{stats.open}</strong>
        </article>
        <article>
          <BadgeAlert size={18} />
          <span>Bekleyen</span>
          <strong>{stats.unread}</strong>
        </article>
        <article>
          <Sparkles size={18} />
          <span>Öncelikli</span>
          <strong>{stats.priority}</strong>
        </article>
        <article>
          <XCircle size={18} />
          <span>Kapalı</span>
          <strong>{stats.closed}</strong>
        </article>
      </div>

      <div className="support-console">
      <aside>
        <div className="support-sidebar-head">
          <div>
            <span>Live Desk</span>
            <p>Operasyon kuyruğu</p>
          </div>
          <strong>{filteredSessions.length}</strong>
        </div>

        <div className="support-sidebar-tools">
          <label className="support-search">
            <Search size={15} />
            <input
              value={search}
              onChange={event =>
                setSearch(event.target.value)
              }
              placeholder="Görüşme ara..."
            />
          </label>

          <div className="support-filter-row">
            {[
              ["open", "Açık"],
              ["unread", "Bekleyen"],
              ["priority", "VIP"],
              ["closed", "Kapalı"],
              ["all", "Tümü"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={
                  filter === value
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setFilter(value as typeof filter)
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {loadingSessions && (
          <div className="empty-state">
            <Loader2
              className="spin"
              size={18}
            />
            Görüşmeler yükleniyor...
          </div>
        )}

        {!loadingSessions &&
          filteredSessions.map(session => (
            <button
              key={session.id}
              type="button"
              onClick={() => selectSession(session.id)}
              className={
                active === session.id
                  ? "support-session-button active"
                  : "support-session-button"
              }
            >
              <span>
                {session.visitorName ||
                  session.id.slice(0, 8)}
              </span>
              <small>
                {session.lastMessage || "Yeni görüşme"}
              </small>
              <em>
                <Clock3 size={11} />
                {formatTime(
                  session.lastMessageAt ||
                    session.updatedAt
                )}
              </em>
              <i>
                {session.unreadAdmin
                  ? `${session.unreadAdmin} yeni`
                  : session.priority === "high"
                    ? "vip"
                    : session.status || "open"}
              </i>
            </button>
          ))}

        {!loadingSessions && !filteredSessions.length && (
          <div className="empty-state">
            Bu filtrede görüşme yok.
          </div>
        )}
      </aside>

      <section>
        <div className="support-thread-head">
          <div>
              <span>Aktif görüşme</span>
              <strong>
                {activeSession?.visitorName ||
                  (active
                    ? active.slice(0, 12)
                    : "Seçilmedi")}
              </strong>
            </div>

            {activeSession && (
              <div className="support-thread-actions">
                <button
                  type="button"
                  onClick={copySessionId}
                  title="Görüşme ID kopyala"
                >
                  <Copy size={15} />
                </button>
                <i
                  className={`support-status support-status-${activeSession.status || "open"}`}
                >
                  {activeSession.status || "open"}
                </i>
              </div>
            )}
        </div>

        {error && (
          <div className="admin-alert">
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        {active ? (
          <div className="support-main-grid">
            <div className="support-messages" ref={messagesRef}>
              {loadingMessages && (
                <div className="support-placeholder">
                  Mesajlar yükleniyor...
                </div>
              )}

              {!loadingMessages &&
                messages.map(message => (
                  <div
                    className={`message ${
                      message.sender === "admin"
                        ? "admin-message"
                        : "visitor-message"
                    }`}
                    key={message.id}
                  >
                    <p>{message.text}</p>
                    <span className="support-message-meta">
                      {message.sender === "admin"
                        ? "Admin"
                        : "Ziyaretçi"} · {formatTime(message.createdAt)}
                    </span>
                  </div>
                ))}

              {!loadingMessages && !messages.length && (
                <div className="support-placeholder">
                  Bu görüşmede henüz mesaj yok.
                </div>
              )}

            </div>

            <aside className="support-inspector">
              <div className="support-inspector-card">
                <span>Müşteri</span>
                <strong>
                  {activeSession?.visitorName ||
                    "Anonim ziyaretçi"}
                </strong>
                <p>{activeSession?.visitorEmail || "E-posta yok"}</p>
                <p>{activeSession?.visitorPhone || "Telefon yok"}</p>
              </div>

              <div className="support-inspector-card">
                <span>Operasyon</span>
                <div className="support-action-row">
                  <button
                    type="button"
                    onClick={assignToMe}
                    disabled={sending}
                  >
                    <UserCheck size={15} />
                    Bana ata
                  </button>
                  <button
                    type="button"
                    onClick={togglePriority}
                    disabled={sending}
                    className={
                      activeSession?.priority === "high"
                        ? "is-hot"
                        : ""
                    }
                  >
                    <BadgeAlert size={15} />
                    {activeSession?.priority === "high"
                      ? "VIP"
                      : "Öncelik"}
                  </button>
                </div>
                <dl className="support-detail-list">
                  <div>
                    <dt>Atanan</dt>
                    <dd>{activeSession?.assignedTo || "Yok"}</dd>
                  </div>
                  <div>
                    <dt>Güncelleme</dt>
                    <dd>{formatTime(activeSession?.updatedAt)}</dd>
                  </div>
                  <div>
                    <dt>UID</dt>
                    <dd>{activeSession?.ownerUid || "Yok"}</dd>
                  </div>
                </dl>
              </div>

              <div className="support-inspector-card">
                <span>Etiketler</span>
                <div className="support-tag-list">
                  {activeSession?.tags?.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => removeTag(tag)}
                    >
                      <Tag size={12} />
                      {tag}
                    </button>
                  ))}
                  {!activeSession?.tags?.length && (
                    <p>Etiket yok.</p>
                  )}
                </div>
                <div className="support-inline-form">
                  <input
                    value={tagDraft}
                    onChange={event =>
                      setTagDraft(event.target.value)
                    }
                    placeholder="Etiket ekle"
                    maxLength={32}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    disabled={!tagDraft.trim() || sending}
                  >
                    Ekle
                  </button>
                </div>
              </div>

              <div className="support-inspector-card">
                <span>Hızlı cevaplar</span>
                <div className="support-quick-replies">
                  {quickReplies.map(reply => (
                    <button
                      key={reply}
                      type="button"
                      onClick={() => setDraft(reply)}
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>

              <div className="support-inspector-card">
                <span>İç not</span>
                <textarea
                  key={activeSession?.id || "empty-note"}
                  ref={noteRef}
                  defaultValue={activeSession?.adminNote || ""}
                  placeholder="Sadece admin ekibi görür"
                  maxLength={600}
                />
                <button
                  type="button"
                  onClick={saveNote}
                  disabled={sending}
                >
                  Notu kaydet
                </button>
              </div>

              <div className="support-inspector-card support-danger-card">
                <span>Görüşme yönetimi</span>
                <p>Görüşmeyi ve tüm mesaj geçmişini kalıcı olarak siler.</p>
                {deleteConfirmOpen ? (
                  <div className="support-delete-confirm">
                    <strong>Bu işlem geri alınamaz.</strong>
                    <label>
                      Onaylamak için SİL yazın
                      <input
                        value={deletePhrase}
                        onChange={event => setDeletePhrase(event.target.value)}
                        placeholder="SİL"
                        autoComplete="off"
                      />
                    </label>
                    <div>
                      <button type="button" onClick={() => { setDeleteConfirmOpen(false); setDeletePhrase(""); }} disabled={deleting}>Vazgeç</button>
                      <button type="button" className="danger" onClick={deleteSession} disabled={deleting || deletePhrase.trim().toLocaleUpperCase("tr-TR") !== "SİL"}>
                        {deleting ? <Loader2 size={14} className="spin" /> : <Trash2 size={14} />}
                        Kalıcı olarak sil
                      </button>
                    </div>
                  </div>
                ) : (
                  <button type="button" className="support-delete-button" onClick={() => { setDeletePhrase(""); setDeleteConfirmOpen(true); }} disabled={deleting}>
                    <Trash2 size={14} /> Görüşmeyi sil
                  </button>
                )}
              </div>
            </aside>

            <form
              className="support-composer"
              onSubmit={send}
            >
              <textarea
                value={draft}
                onChange={event =>
                  setDraft(event.target.value)
                }
                onKeyDown={handleComposerKeyDown}
                placeholder="Yanıt yaz... Enter gönderir, Shift+Enter satır açar."
                autoComplete="off"
                maxLength={1000}
                disabled={sending}
              />

              <div className="support-composer-actions">
                <small>{draft.length}/1000</small>
                {activeSession?.status === "closed" ? (
                  <button
                    type="button"
                    className="support-close-button"
                    onClick={reopenSession}
                    disabled={sending}
                  >
                    Aç
                  </button>
                ) : (
                <button
                  type="button"
                  className="support-close-button"
                  onClick={closeSession}
                  disabled={sending}
                >
                  Kapat
                </button>
                )}

                <button
                  type="submit"
                  disabled={
                    sending ||
                    draft.trim().length === 0
                  }
                  aria-label="Yanıt gönder"
                >
                  {sending ? (
                    <Loader2
                      size={17}
                      className="spin"
                    />
                  ) : (
                    <Send size={17} />
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="support-placeholder">
            Bir görüşme seç.
          </div>
        )}
      </section>
      </div>
    </div>
  );
}
