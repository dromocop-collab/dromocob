"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  BookOpenCheck,
  Building2,
  Check,
  ChevronRight,
  CircleAlert,
  Clock3,
  Database,
  FileClock,
  GraduationCap,
  Loader2,
  RefreshCw,
  Save,
  Search,
  Settings2,
  ShieldCheck,
  UserCheck,
  Users,
  X,
} from "lucide-react";

import { auth } from "@/lib/firebase";
import styles from "./hafiz-control-center.module.css";

type Tab = "overview" | "approvals" | "directory" | "settings" | "audit";
type DirectoryResource = "institutions" | "teachers" | "students" | "parents" | "classes";

type Institution = { id: string; name: string; status: string; institutionId: string };
type DirectoryRecord = Institution & { email?: string | null; academicPeriod?: string | null };
type TeacherClassAssignment = {
  id: string;
  classId: string;
  teacherMembershipId: string;
  status: string;
};
type Registration = {
  id: string;
  email: string;
  displayName: string;
  institutionId: string;
  requestedRole: string;
  status: string;
  createdAt: string | null;
};
type Dashboard = {
  institutionId: string;
  memberships: number;
  classes: number;
  assignments: number;
  reviews: number;
  pendingReviews: number;
  auditEvents: number;
};
type SystemConfiguration = {
  institutionId: string;
  timezone: string;
  requireTeacherConfirmationForVideoLesson: boolean;
  allowParentDailySummary: boolean;
  updatedAt: string | null;
};
type AuditEvent = {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string;
  actorMembershipId: string;
  createdAt: string | null;
};

const EMPTY_DASHBOARD: Dashboard = {
  institutionId: "",
  memberships: 0,
  classes: 0,
  assignments: 0,
  reviews: 0,
  pendingReviews: 0,
  auditEvents: 0,
};

const EMPTY_SETTINGS: SystemConfiguration = {
  institutionId: "",
  timezone: "Europe/Istanbul",
  requireTeacherConfirmationForVideoLesson: false,
  allowParentDailySummary: true,
  updatedAt: null,
};

const roleLabels: Record<string, string> = {
  STUDENT: "Öğrenci",
  TEACHER: "Öğretmen",
  PARENT: "Veli",
  ADMIN: "Yönetici",
};

const resourceLabels: Record<DirectoryResource, string> = {
  institutions: "Kurumlar",
  teachers: "Öğretmenler",
  students: "Öğrenciler",
  parents: "Veliler",
  classes: "Sınıflar",
};

async function authorizedFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const user = auth.currentUser;
  if (!user) throw new Error("Yönetici oturumu bulunamadı.");
  const token = await user.getIdToken();
  const response = await fetch(path, {
    ...init,
    cache: "no-store",
    headers: {
      authorization: `Bearer ${token}`,
      ...(init?.body ? { "content-type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || payload.code || "İşlem tamamlanamadı.");
  }
  return payload as T;
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function humanize(value: string) {
  return value.replaceAll("_", " ").toLocaleLowerCase("tr-TR");
}

export default function HafizControlCenter() {
  const [tab, setTab] = useState<Tab>("overview");
  const [booting, setBooting] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [institutionID, setInstitutionID] = useState("");
  const [dashboard, setDashboard] = useState<Dashboard>(EMPTY_DASHBOARD);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [system, setSystem] = useState<SystemConfiguration>(EMPTY_SETTINGS);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [directoryResource, setDirectoryResource] = useState<DirectoryResource>("students");
  const [directoryItems, setDirectoryItems] = useState<DirectoryRecord[]>([]);
  const [teacherOptions, setTeacherOptions] = useState<DirectoryRecord[]>([]);
  const [classOptions, setClassOptions] = useState<DirectoryRecord[]>([]);
  const [teacherClassAssignments, setTeacherClassAssignments] = useState<TeacherClassAssignment[]>([]);
  const [directorySearch, setDirectorySearch] = useState("");
  const [workingID, setWorkingID] = useState("");

  const selectedInstitution = useMemo(
    () => institutions.find(item => item.id === institutionID),
    [institutionID, institutions],
  );

  const loadDirectory = useCallback(async (
    resource: DirectoryResource,
    selectedID: string,
    search = "",
  ) => {
    const query = new URLSearchParams({ limit: "50" });
    if (resource !== "institutions") query.set("institutionId", selectedID);
    if (search.trim()) query.set("search", search.trim());
    const page = await authorizedFetch<{ items: DirectoryRecord[] }>(
      `/api/hafiz/admin/directory/${resource}?${query}`,
    );
    setDirectoryItems(page.items);
  }, []);

  const loadTeacherClassOptions = useCallback(async (selectedID: string) => {
    const scoped = encodeURIComponent(selectedID);
    const [teachers, classes, assignments] = await Promise.all([
      authorizedFetch<{ items: DirectoryRecord[] }>(
        `/api/hafiz/admin/directory/teachers?institutionId=${scoped}&status=ACTIVE&limit=100`,
      ),
      authorizedFetch<{ items: DirectoryRecord[] }>(
        `/api/hafiz/admin/directory/classes?institutionId=${scoped}&status=ACTIVE&limit=100`,
      ),
      authorizedFetch<{ items: TeacherClassAssignment[] }>(
        `/api/hafiz/admin/relationships/teacherClassAssignment?institutionId=${scoped}&status=ACTIVE&limit=100`,
      ),
    ]);
    setTeacherOptions(teachers.items);
    setClassOptions(classes.items);
    setTeacherClassAssignments(assignments.items);
  }, []);

  const loadInstitution = useCallback(async (selectedID: string, resource: DirectoryResource) => {
    setRefreshing(true);
    setError("");
    const scoped = encodeURIComponent(selectedID);
    try {
      const [dashboardPayload, registrationPayload, systemPayload, auditPayload] = await Promise.all([
        authorizedFetch<Dashboard>(`/api/hafiz/admin/dashboard?institutionId=${scoped}`),
        authorizedFetch<{ items: Registration[] }>(
          `/api/hafiz/admin/registration-requests?institutionId=${scoped}&status=PENDING&limit=50`,
        ),
        authorizedFetch<SystemConfiguration>(`/api/hafiz/admin/system?institutionId=${scoped}`),
        authorizedFetch<{ items: AuditEvent[] }>(
          `/api/hafiz/admin/audit-events?institutionId=${scoped}&limit=30`,
        ),
        loadDirectory(resource, selectedID),
        loadTeacherClassOptions(selectedID),
      ]);
      setDashboard(dashboardPayload);
      setRegistrations(registrationPayload.items);
      setSystem(systemPayload);
      setAuditEvents(auditPayload.items);
      localStorage.setItem("dromocob.hafiz.institution", selectedID);
    } catch (value) {
      setError(value instanceof Error ? value.message : "Hafız verileri yüklenemedi.");
    } finally {
      setRefreshing(false);
    }
  }, [loadDirectory, loadTeacherClassOptions]);

  const initialize = useCallback(async () => {
    setBooting(true);
    setError("");
    try {
      await authorizedFetch<{ ok: true }>("/api/admin/hafiz/bootstrap", { method: "POST" });
      await auth.currentUser?.getIdToken(true);
      const page = await authorizedFetch<{ items: Institution[] }>(
        "/api/hafiz/admin/directory/institutions?limit=50",
      );
      setInstitutions(page.items);
      const saved = localStorage.getItem("dromocob.hafiz.institution");
      const preferred = page.items.find(item => item.id === saved)
        || page.items.find(item => item.id !== "hafiz-platform")
        || page.items[0];
      if (!preferred) throw new Error("Hafız yönetim kurumu oluşturulamadı.");
      setInstitutionID(preferred.id);
      await loadInstitution(preferred.id, "students");
    } catch (value) {
      setError(value instanceof Error ? value.message : "Hafız yönetim merkezi açılamadı.");
    } finally {
      setBooting(false);
    }
  }, [loadInstitution]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void initialize();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [initialize]);

  async function reviewRegistration(requestID: string, decision: "APPROVE" | "REJECT") {
    if (decision === "REJECT" && !window.confirm("Bu hesap başvurusunu reddetmek istediğine emin misin?")) return;
    setWorkingID(requestID);
    setError("");
    try {
      await authorizedFetch("/api/hafiz/admin/registration-requests", {
        method: "PATCH",
        body: JSON.stringify({ requestId: requestID, decision }),
      });
      setRegistrations(current => current.filter(item => item.id !== requestID));
      setNotice(decision === "APPROVE" ? "Hesap onaylandı ve erişim açıldı." : "Başvuru reddedildi.");
      await loadInstitution(institutionID, directoryResource);
    } catch (value) {
      setError(value instanceof Error ? value.message : "Başvuru güncellenemedi.");
    } finally {
      setWorkingID("");
    }
  }

  async function saveSystemSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWorkingID("system");
    setError("");
    try {
      await authorizedFetch("/api/hafiz/admin/system", {
        method: "PUT",
        body: JSON.stringify({ ...system, institutionId: institutionID }),
      });
      setNotice("Genel Hafız ayarları kaydedildi.");
      await loadInstitution(institutionID, directoryResource);
    } catch (value) {
      setError(value instanceof Error ? value.message : "Ayarlar kaydedilemedi.");
    } finally {
      setWorkingID("");
    }
  }

  async function createDirectoryRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const resource = String(data.get("resource")) as "institutions" | "classes";
    const body = resource === "institutions"
      ? { name: String(data.get("name") || "") }
      : {
          institutionId: institutionID,
          name: String(data.get("name") || ""),
          academicPeriod: String(data.get("academicPeriod") || ""),
        };
    setWorkingID("create");
    setError("");
    try {
      const created = await authorizedFetch<{ id: string }>(`/api/hafiz/admin/directory/${resource}`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      const teacherMembershipId = String(data.get("teacherMembershipId") || "");
      if (resource === "classes" && teacherMembershipId) {
        await authorizedFetch("/api/hafiz/admin/relationships/teacherClassAssignment", {
          method: "POST",
          body: JSON.stringify({
            institutionId: institutionID,
            classId: created.id,
            teacherMembershipId,
          }),
        });
      }
      form.reset();
      setNotice(resource === "institutions"
        ? "Yeni kurum oluşturuldu."
        : teacherMembershipId
          ? "Yeni sınıf oluşturuldu ve öğretmene atandı."
          : "Yeni sınıf oluşturuldu.");
      const institutionPage = await authorizedFetch<{ items: Institution[] }>(
        "/api/hafiz/admin/directory/institutions?limit=50",
      );
      setInstitutions(institutionPage.items);
      await Promise.all([
        loadDirectory(directoryResource, institutionID, directorySearch),
        loadTeacherClassOptions(institutionID),
      ]);
    } catch (value) {
      setError(value instanceof Error ? value.message : "Kayıt oluşturulamadı.");
    } finally {
      setWorkingID("");
    }
  }

  async function createTeacherClassAssignment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setWorkingID("teacher-class");
    setError("");
    try {
      await authorizedFetch("/api/hafiz/admin/relationships/teacherClassAssignment", {
        method: "POST",
        body: JSON.stringify({
          institutionId: institutionID,
          classId: String(data.get("classId") || ""),
          teacherMembershipId: String(data.get("teacherMembershipId") || ""),
        }),
      });
      setNotice("Öğretmen sınıfa bağlandı. Sınıf iOS uygulamasında artık görünür.");
      await loadTeacherClassOptions(institutionID);
    } catch (value) {
      setError(value instanceof Error ? value.message : "Öğretmen sınıfa bağlanamadı.");
    } finally {
      setWorkingID("");
    }
  }

  async function changeAccountStatus(record: DirectoryRecord) {
    const next = record.status === "ACTIVE" ? "DISABLED" : "ACTIVE";
    if (next === "DISABLED" && !window.confirm(`${record.name} hesabını devre dışı bırakmak istiyor musun?`)) return;
    setWorkingID(record.id);
    setError("");
    try {
      await authorizedFetch("/api/hafiz/admin/account-status", {
        method: "PATCH",
        body: JSON.stringify({ membershipId: record.id, status: next }),
      });
      setNotice(next === "ACTIVE" ? "Hesap yeniden etkinleştirildi." : "Hesap devre dışı bırakıldı.");
      await loadDirectory(directoryResource, institutionID, directorySearch);
    } catch (value) {
      setError(value instanceof Error ? value.message : "Hesap durumu değiştirilemedi.");
    } finally {
      setWorkingID("");
    }
  }

  async function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRefreshing(true);
    try {
      await loadDirectory(directoryResource, institutionID, directorySearch);
    } catch (value) {
      setError(value instanceof Error ? value.message : "Arama tamamlanamadı.");
    } finally {
      setRefreshing(false);
    }
  }

  if (booting) {
    return <div className={styles.loading}><Loader2 className={styles.spin} /><strong>Hafız yönetim merkezi hazırlanıyor</strong><span>Güvenli yönetici kapsamı doğrulanıyor…</span></div>;
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroMark}><BookOpenCheck /></div>
        <div className={styles.heroCopy}>
          <span>HAFIZ · PLATFORM CONTROL</span>
          <h1>Hafız Yönetim Merkezi</h1>
          <p>Hesap onayları, kurumlar, öğrenciler, öğretmenler ve pedagojik sistem ayarları tek güvenli merkezde.</p>
        </div>
        <div className={styles.heroActions}>
          <label>
            <small>AKTİF KURUM</small>
            <select value={institutionID} onChange={event => {
              const value = event.target.value;
              setInstitutionID(value);
              void loadInstitution(value, directoryResource);
            }}>
              {institutions.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}
            </select>
          </label>
          <button onClick={() => void loadInstitution(institutionID, directoryResource)} disabled={refreshing} aria-label="Hafız verilerini yenile">
            <RefreshCw className={refreshing ? styles.spin : ""} /> Yenile
          </button>
        </div>
      </section>

      <div className={styles.securityStrip}>
        <span><ShieldCheck /> Platform admin doğrulandı</span>
        <span><Database /> Sunucu tarafı yetkilendirme aktif</span>
        <span><Activity /> Audit kaydı açık</span>
        <b>{selectedInstitution?.name || institutionID}</b>
      </div>

      {(error || notice) && <div className={error ? styles.error : styles.notice}>
        {error ? <CircleAlert /> : <Check />}
        <span>{error || notice}</span>
        <button onClick={() => { setError(""); setNotice(""); }} aria-label="Bildirimi kapat"><X /></button>
      </div>}

      <nav className={styles.tabs} aria-label="Hafız yönetim bölümleri">
        {([
          ["overview", "Genel Bakış", Activity],
          ["approvals", `Hesap Onayları · ${registrations.length}`, UserCheck],
          ["directory", "Kurum & Kullanıcılar", Users],
          ["settings", "Genel Ayarlar", Settings2],
          ["audit", "İşlem Geçmişi", FileClock],
        ] as const).map(([value, label, Icon]) => (
          <button key={value} className={tab === value ? styles.activeTab : ""} onClick={() => setTab(value)}>
            <Icon /> {label}
          </button>
        ))}
      </nav>

      {tab === "overview" && <Overview dashboard={dashboard} registrations={registrations} onOpenApprovals={() => setTab("approvals")} />}

      {tab === "approvals" && <section className={styles.panel}>
        <PanelHeading icon={UserCheck} eyebrow="ERİŞİM KONTROLÜ" title="Bekleyen hesap onayları" description="Rol ve kurum kapsamını kontrol etmeden erişim verme." />
        {registrations.length === 0 ? <EmptyState icon={ShieldCheck} title="Bekleyen onay yok" message="Bu kurumdaki tüm başvurular değerlendirildi." /> : <div className={styles.approvalList}>
          {registrations.map(item => <article key={item.id}>
            <div className={styles.avatar}>{item.displayName.slice(0, 1).toLocaleUpperCase("tr-TR")}</div>
            <div><strong>{item.displayName}</strong><span>{item.email}</span><small>{formatDate(item.createdAt)} · {item.id.slice(0, 8)}</small></div>
            <span className={styles.role}>{roleLabels[item.requestedRole] || item.requestedRole}</span>
            <div className={styles.rowActions}>
              <button className={styles.reject} disabled={workingID === item.id} onClick={() => void reviewRegistration(item.id, "REJECT")}><X /> Reddet</button>
              <button className={styles.approve} disabled={workingID === item.id} onClick={() => void reviewRegistration(item.id, "APPROVE")}>
                {workingID === item.id ? <Loader2 className={styles.spin} /> : <Check />} Onayla
              </button>
            </div>
          </article>)}
        </div>}
      </section>}

      {tab === "directory" && <section className={styles.directoryGrid}>
        <div className={styles.panel}>
          <PanelHeading icon={Users} eyebrow="YETKİLİ KAYITLAR" title="Kurum ve kullanıcı dizini" description="Arama, filtreleme ve hesap durum yönetimi." />
          <div className={styles.resourceTabs}>
            {(Object.keys(resourceLabels) as DirectoryResource[]).map(resource => <button key={resource} className={directoryResource === resource ? styles.selectedResource : ""} onClick={() => {
              setDirectoryResource(resource);
              setDirectorySearch("");
              void loadDirectory(resource, institutionID);
            }}>{resourceLabels[resource]}</button>)}
          </div>
          <form className={styles.search} onSubmit={submitSearch}><Search /><input value={directorySearch} onChange={event => setDirectorySearch(event.target.value)} placeholder={`${resourceLabels[directoryResource]} içinde ara`} /><button>Ara</button></form>
          {directoryItems.length === 0 ? <EmptyState icon={Users} title="Kayıt bulunamadı" message="Filtreyi değiştir veya yeni bir kayıt oluştur." /> : <div className={styles.table}>
            {directoryItems.map(record => <div className={styles.tableRow} key={record.id}>
              <span className={styles.miniIcon}>{directoryResource === "classes" ? <GraduationCap /> : directoryResource === "institutions" ? <Building2 /> : <Users />}</span>
              <div><strong>{record.name}</strong><small>{record.email || record.academicPeriod || record.id}</small></div>
              <span className={`${styles.status} ${record.status === "ACTIVE" ? styles.statusActive : styles.statusMuted}`}>{record.status}</span>
              {!["institutions", "classes"].includes(directoryResource) && <button className={styles.textButton} disabled={workingID === record.id} onClick={() => void changeAccountStatus(record)}>{record.status === "ACTIVE" ? "Devre dışı bırak" : "Etkinleştir"}<ChevronRight /></button>}
            </div>)}
          </div>}
        </div>
        <div style={{ display: "grid", gap: 14 }}>
          <form className={`${styles.panel} ${styles.createCard}`} onSubmit={createDirectoryRecord}>
            <PanelHeading icon={Building2} eyebrow="HIZLI OLUŞTUR" title="Kurum veya sınıf ekle" description="Sınıfı oluştururken öğretmeni de bağlayabilirsin." />
            <label><span>Kayıt türü</span><select name="resource"><option value="classes">Sınıf</option><option value="institutions">Kurum</option></select></label>
            <label><span>Ad</span><input name="name" required minLength={2} placeholder="Örn. 2026 Hafızlık A" /></label>
            <label><span>Akademik dönem</span><input name="academicPeriod" placeholder="2026–2027" /></label>
            <label><span>Öğretmen (isteğe bağlı)</span><select name="teacherMembershipId"><option value="">Daha sonra ata</option>{teacherOptions.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
            <button className={styles.primaryButton} disabled={workingID === "create"}>{workingID === "create" ? <Loader2 className={styles.spin} /> : <Check />} Kaydı oluştur</button>
            <div className={styles.infoBox}><ShieldCheck /><span>Sınıf, yalnızca bağlanan öğretmenin iOS uygulamasında görünür.</span></div>
          </form>
          <form className={`${styles.panel} ${styles.createCard}`} onSubmit={createTeacherClassAssignment}>
            <PanelHeading icon={GraduationCap} eyebrow="YETKİ BAĞLANTISI" title="Öğretmeni sınıfa bağla" description={`Aktif bağlantı: ${teacherClassAssignments.length}`} />
            <label><span>Sınıf</span><select name="classId" required><option value="">Sınıf seç</option>{classOptions.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
            <label><span>Öğretmen</span><select name="teacherMembershipId" required><option value="">Öğretmen seç</option>{teacherOptions.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
            <button className={styles.primaryButton} disabled={workingID === "teacher-class" || !classOptions.length || !teacherOptions.length}>{workingID === "teacher-class" ? <Loader2 className={styles.spin} /> : <UserCheck />} Bağlantıyı etkinleştir</button>
          </form>
        </div>
      </section>}

      {tab === "settings" && <form className={styles.panel} onSubmit={saveSystemSettings}>
        <PanelHeading icon={Settings2} eyebrow="KURUM POLİTİKASI" title="Genel Hafız ayarları" description="Seçili kurumun zaman, ders onayı ve veli özeti davranışlarını yönet." />
        <div className={styles.settingsGrid}>
          <label className={styles.field}><span>Zaman dilimi</span><input value={system.timezone} onChange={event => setSystem(current => ({ ...current, timezone: event.target.value }))} placeholder="Europe/Istanbul" /><small>Bildirimler ve günlük özet sınırları bu alana göre hesaplanır.</small></label>
          <Toggle title="Görüntülü ders öğretmen onayı" description="Öğrencinin işaretlemesi tek başına tamamlanmış sayılmaz." checked={system.requireTeacherConfirmationForVideoLesson} onChange={checked => setSystem(current => ({ ...current, requireTeacherConfirmationForVideoLesson: checked }))} />
          <Toggle title="Veli günlük özeti" description="Veliler yalnızca izin verilen toplu ilerleme bilgisini görür." checked={system.allowParentDailySummary} onChange={checked => setSystem(current => ({ ...current, allowParentDailySummary: checked }))} />
        </div>
        <footer className={styles.formFooter}><span>Son güncelleme: {formatDate(system.updatedAt)}</span><button className={styles.primaryButton} disabled={workingID === "system"}>{workingID === "system" ? <Loader2 className={styles.spin} /> : <Save />} Ayarları Kaydet</button></footer>
      </form>}

      {tab === "audit" && <section className={styles.panel}>
        <PanelHeading icon={FileClock} eyebrow="DEĞİŞMEZ İZ" title="İşlem geçmişi" description="Onay, yetki ve yapılandırma işlemlerinin son kayıtları." />
        {auditEvents.length === 0 ? <EmptyState icon={FileClock} title="İşlem kaydı yok" message="Bu kurum için henüz denetlenebilir bir işlem oluşmadı." /> : <div className={styles.timeline}>
          {auditEvents.map(event => <article key={event.id}><span><Clock3 /></span><div><strong>{humanize(event.action)}</strong><small>{event.resourceType} · {event.resourceId}</small></div><time>{formatDate(event.createdAt)}</time></article>)}
        </div>}
      </section>}
    </main>
  );
}

function Overview({ dashboard, registrations, onOpenApprovals }: { dashboard: Dashboard; registrations: Registration[]; onOpenApprovals(): void }) {
  const cards = [
    ["Aktif üyelik", dashboard.memberships, Users, "Kurum kapsamındaki hesaplar"],
    ["Sınıflar", dashboard.classes, GraduationCap, "Aktif eğitim grupları"],
    ["Görevler", dashboard.assignments, BookOpenCheck, "Oluşturulan çalışmalar"],
    ["Kontrol bekleyen", dashboard.pendingReviews, Clock3, "Öğretmen değerlendirmesi"],
  ] as const;
  return <>
    <section className={styles.metricGrid}>{cards.map(([label, value, Icon, caption]) => <article key={label}><span><Icon /></span><small>{label}</small><strong>{value.toLocaleString("tr-TR")}</strong><p>{caption}</p></article>)}</section>
    <section className={styles.overviewGrid}>
      <div className={`${styles.panel} ${styles.priorityPanel}`}><PanelHeading icon={UserCheck} eyebrow="ÖNCELİKLİ AKIŞ" title="Hesap onayları" description="Bekleyen kullanıcıları rol ve kurum kapsamına göre değerlendir." /><div className={styles.bigNumber}>{registrations.length}</div><span>onay bekleyen hesap</span><button className={styles.primaryButton} onClick={onOpenApprovals}>Onay kuyruğunu aç <ChevronRight /></button></div>
      <div className={styles.panel}><PanelHeading icon={ShieldCheck} eyebrow="GÜVENLİK DURUMU" title="Yetki katmanı aktif" description="Kritik işlemler yalnızca backend tarafından doğrulanan rol ve kurum kapsamıyla çalışır." /><ul className={styles.checkList}><li><Check /> Client rolüne güvenilmiyor</li><li><Check /> Kurum izolasyonu zorunlu</li><li><Check /> Doğrudan Firestore erişimi kapalı</li><li><Check /> Hesap onayları audit kayıtlı</li></ul></div>
    </section>
  </>;
}

function PanelHeading({ icon: Icon, eyebrow, title, description }: { icon: typeof Activity; eyebrow: string; title: string; description: string }) {
  return <header className={styles.panelHeading}><span><Icon /></span><div><small>{eyebrow}</small><h2>{title}</h2><p>{description}</p></div></header>;
}

function EmptyState({ icon: Icon, title, message }: { icon: typeof Activity; title: string; message: string }) {
  return <div className={styles.empty}><Icon /><strong>{title}</strong><span>{message}</span></div>;
}

function Toggle({ title, description, checked, onChange }: { title: string; description: string; checked: boolean; onChange(value: boolean): void }) {
  return <label className={styles.toggle}><div><strong>{title}</strong><span>{description}</span></div><input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} /><i /></label>;
}
