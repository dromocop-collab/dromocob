"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Check, ChevronDown, Edit3, Eye, Filter, Globe2, MoreHorizontal, Plus, Search, Smartphone, Star, Trash2, TrendingUp, X } from "lucide-react";

interface AppItem {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  platforms: string[];
  status: "active" | "beta" | "coming_soon" | "maintenance";
  version: string;
  downloads: number;
  rating: number;
  color: string;
  slug: string;
}

const initialApps: AppItem[] = [
  {
    id: "photoresize",
    name: "PhotoResize",
    tagline: "Image Production Utility",
    icon: "/resize.png",
    platforms: ["macOS"],
    status: "active",
    version: "1.0.1",
    downloads: 12400,
    rating: 4.9,
    color: "#159df4",
    slug: "/uygulamalar/photoresize",
  },
  {
    id: "kalori-merkezi",
    name: "Kalori Merkezi",
    tagline: "Nutrition Tracker App",
    icon: "/kalori.jpeg",
    platforms: ["iOS"],
    status: "active",
    version: "2.3.1",
    downloads: 18200,
    rating: 4.7,
    color: "#ff8c42",
    slug: "/kalori-merkezi",
  },
  {
    id: "altinci-kuyumculuk",
    name: "Altıncı Kuyumculuk",
    tagline: "Luxury Jewelry Brand App",
    icon: "/altinci-kuyumculuk.png",
    platforms: ["iOS", "Android"],
    status: "coming_soon",
    version: "1.0 Beta",
    downloads: 0,
    rating: 0,
    color: "#d4a853",
    slug: "/uygulamalar/altinci-kuyumculuk",
  },
  {
    id: "jacks-coffee",
    name: "Jacks Coffee",
    tagline: "Artisan Coffee Experience",
    icon: "/jacks-coffee.png",
    platforms: ["iOS", "Android"],
    status: "coming_soon",
    version: "1.0 Beta",
    downloads: 0,
    rating: 0,
    color: "#a0622e",
    slug: "/uygulamalar/jacks-coffee",
  },
  {
    id: "dromocob-app",
    name: "Dromocob",
    tagline: "Digital Agency Hub",
    icon: "/dromocob-app.png",
    platforms: ["Web", "iOS", "Android"],
    status: "beta",
    version: "0.9 Beta",
    downloads: 3200,
    rating: 4.8,
    color: "#00c8d4",
    slug: "/uygulamalar/dromocob",
  },
];

const statusMap: Record<string, { label: string; className: string }> = {
  active: { label: "Aktif", className: "status-active" },
  beta: { label: "Beta", className: "status-beta" },
  coming_soon: { label: "Yakında", className: "status-coming" },
  maintenance: { label: "Bakım", className: "status-maintenance" },
};

export default function AdminAppsManager() {
  const [apps, setApps] = useState(initialApps);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [editingApp, setEditingApp] = useState<AppItem | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [formName, setFormName] = useState("");
  const [formTagline, setFormTagline] = useState("");
  const [formVersion, setFormVersion] = useState("");
  const [formStatus, setFormStatus] = useState<AppItem["status"]>("coming_soon");
  const [formPlatforms, setFormPlatforms] = useState<string[]>([]);
  const [formColor, setFormColor] = useState("#159df4");

  const filtered = apps.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.tagline.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalDownloads = apps.reduce((sum, a) => sum + a.downloads, 0);
  const activeCount = apps.filter(a => a.status === "active" || a.status === "beta").length;
  const avgRating = apps.filter(a => a.rating > 0).reduce((sum, a, _, arr) => sum + a.rating / arr.length, 0);

  function openCreate() {
    setEditingApp(null);
    setFormName(""); setFormTagline(""); setFormVersion("1.0.0"); setFormStatus("coming_soon"); setFormPlatforms(["iOS"]); setFormColor("#159df4");
    setShowModal(true);
  }

  function openEdit(app: AppItem) {
    setEditingApp(app);
    setFormName(app.name); setFormTagline(app.tagline); setFormVersion(app.version); setFormStatus(app.status); setFormPlatforms([...app.platforms]); setFormColor(app.color);
    setShowModal(true);
  }

  function handleSave() {
    if (!formName.trim()) return;
    if (editingApp) {
      setApps(prev => prev.map(a => a.id === editingApp.id ? { ...a, name: formName, tagline: formTagline, version: formVersion, status: formStatus, platforms: formPlatforms, color: formColor } : a));
    } else {
      const newApp: AppItem = {
        id: formName.toLowerCase().replace(/\s+/g, "-"),
        name: formName,
        tagline: formTagline,
        icon: "/logo.svg",
        platforms: formPlatforms,
        status: formStatus,
        version: formVersion,
        downloads: 0,
        rating: 0,
        color: formColor,
        slug: `/uygulamalar/${formName.toLowerCase().replace(/\s+/g, "-")}`,
      };
      setApps(prev => [...prev, newApp]);
    }
    setShowModal(false);
  }

  function handleDelete(id: string) {
    setApps(prev => prev.filter(a => a.id !== id));
  }

  function togglePlatform(p: string) {
    setFormPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  }

  return (
    <>
      {/* ── HEADER ── */}
      <div className="admin-title">
        <div>
          <p className="admin-kicker">APPS MANAGEMENT / ECOSYSTEM</p>
          <h1>Uygulama yönetimi.</h1>
          <p>Dromocob ekosistemindeki tüm uygulamaları buradan yönetin.</p>
        </div>
        <button className="admin-action" onClick={openCreate}><Plus size={17}/> Yeni uygulama</button>
      </div>

      {/* ── METRICS ── */}
      <section className="admin-apps-metrics">
        <article style={{ borderColor: "#159df4" }}>
          <div className="admin-apps-metric-icon" style={{ background: "rgba(21,157,244,.15)", color: "#159df4" }}><Smartphone/></div>
          <div><strong>{apps.length}</strong><span>Toplam Uygulama</span></div>
        </article>
        <article style={{ borderColor: "#38d477" }}>
          <div className="admin-apps-metric-icon" style={{ background: "rgba(56,212,119,.15)", color: "#38d477" }}><Check/></div>
          <div><strong>{activeCount}</strong><span>Aktif / Beta</span></div>
        </article>
        <article style={{ borderColor: "#ff8c42" }}>
          <div className="admin-apps-metric-icon" style={{ background: "rgba(255,140,66,.15)", color: "#ff8c42" }}><TrendingUp/></div>
          <div><strong>{totalDownloads.toLocaleString("tr-TR")}</strong><span>Toplam İndirme</span></div>
        </article>
        <article style={{ borderColor: "#d4a853" }}>
          <div className="admin-apps-metric-icon" style={{ background: "rgba(212,168,83,.15)", color: "#d4a853" }}><Star/></div>
          <div><strong>{avgRating.toFixed(1)}</strong><span>Ort. Puan</span></div>
        </article>
      </section>

      {/* ── TOOLBAR ── */}
      <div className="admin-apps-toolbar">
        <div className="admin-apps-search">
          <Search size={16}/>
          <input type="text" placeholder="Uygulama ara..." value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <div className="admin-apps-filters">
          {["all", "active", "beta", "coming_soon", "maintenance"].map(s => (
            <button key={s} className={filterStatus === s ? "active" : ""} onClick={() => setFilterStatus(s)}>
              {s === "all" ? "Tümü" : statusMap[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* ── APP LIST ── */}
      <section className="admin-apps-list">
        <div className="admin-apps-list-header">
          <span>Uygulama</span>
          <span>Platform</span>
          <span>Durum</span>
          <span>Versiyon</span>
          <span>İndirme</span>
          <span>Puan</span>
          <span/>
        </div>
        {filtered.map(app => (
          <div key={app.id} className={`admin-apps-row ${expandedId === app.id ? "expanded" : ""}`}>
            <div className="admin-apps-row-main" onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}>
              <div className="admin-apps-row-name">
                <div className="admin-apps-row-icon" style={{ borderColor: app.color }}>
                  <Image src={app.icon} alt={app.name} width={42} height={42}/>
                </div>
                <div>
                  <strong>{app.name}</strong>
                  <small>{app.tagline}</small>
                </div>
              </div>
              <div className="admin-apps-row-platforms">
                {app.platforms.map(p => <span key={p} className="admin-apps-platform-tag">{p}</span>)}
              </div>
              <div>
                <span className={`admin-apps-status ${statusMap[app.status].className}`}>
                  <i/>{statusMap[app.status].label}
                </span>
              </div>
              <div className="admin-apps-row-version">{app.version}</div>
              <div className="admin-apps-row-downloads">{app.downloads > 0 ? app.downloads.toLocaleString("tr-TR") : "—"}</div>
              <div className="admin-apps-row-rating">
                {app.rating > 0 ? <><Star size={13}/> {app.rating}</> : "—"}
              </div>
              <div className="admin-apps-row-actions">
                <button onClick={e => { e.stopPropagation(); openEdit(app); }} title="Düzenle"><Edit3 size={15}/></button>
                <button onClick={e => { e.stopPropagation(); window.open(app.slug, "_blank"); }} title="Önizle"><Eye size={15}/></button>
                <button className="danger" onClick={e => { e.stopPropagation(); handleDelete(app.id); }} title="Sil"><Trash2 size={15}/></button>
              </div>
            </div>
            {expandedId === app.id && (
              <div className="admin-apps-row-expanded">
                <div className="admin-apps-expanded-grid">
                  <article><small>SLUG</small><code>{app.slug}</code></article>
                  <article><small>RENK KODU</small><div className="admin-apps-color-preview" style={{ background: app.color }}/><code>{app.color}</code></article>
                  <article><small>ID</small><code>{app.id}</code></article>
                  <article><small>İKON</small><code>{app.icon}</code></article>
                </div>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <div className="admin-apps-empty"><p>Sonuç bulunamadı.</p></div>}
      </section>

      {/* ── MODAL ── */}
      {showModal && (
        <div className="admin-apps-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="admin-apps-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-apps-modal-head">
              <h2>{editingApp ? "Uygulamayı Düzenle" : "Yeni Uygulama Ekle"}</h2>
              <button onClick={() => setShowModal(false)}><X size={18}/></button>
            </div>
            <div className="admin-apps-modal-body">
              <label>
                <span>Uygulama Adı</span>
                <input type="text" value={formName} onChange={e => setFormName(e.target.value)} placeholder="Uygulama adı..."/>
              </label>
              <label>
                <span>Tagline</span>
                <input type="text" value={formTagline} onChange={e => setFormTagline(e.target.value)} placeholder="Kısa açıklama..."/>
              </label>
              <div className="admin-apps-modal-row">
                <label>
                  <span>Versiyon</span>
                  <input type="text" value={formVersion} onChange={e => setFormVersion(e.target.value)} placeholder="1.0.0"/>
                </label>
                <label>
                  <span>Renk</span>
                  <div className="admin-apps-color-input">
                    <input type="color" value={formColor} onChange={e => setFormColor(e.target.value)}/>
                    <input type="text" value={formColor} onChange={e => setFormColor(e.target.value)}/>
                  </div>
                </label>
              </div>
              <label>
                <span>Durum</span>
                <div className="admin-apps-status-select">
                  {(["active", "beta", "coming_soon", "maintenance"] as const).map(s => (
                    <button key={s} className={formStatus === s ? "active" : ""} onClick={() => setFormStatus(s)}>
                      {statusMap[s].label}
                    </button>
                  ))}
                </div>
              </label>
              <label>
                <span>Platformlar</span>
                <div className="admin-apps-platform-select">
                  {["macOS", "iOS", "Android", "Web"].map(p => (
                    <button key={p} className={formPlatforms.includes(p) ? "active" : ""} onClick={() => togglePlatform(p)}>
                      {p}
                    </button>
                  ))}
                </div>
              </label>
            </div>
            <div className="admin-apps-modal-foot">
              <button className="admin-apps-modal-cancel" onClick={() => setShowModal(false)}>İptal</button>
              <button className="admin-apps-modal-save" onClick={handleSave}>{editingApp ? "Güncelle" : "Oluştur"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
