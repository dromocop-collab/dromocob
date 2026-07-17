"use client";

import { FormEvent, useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Activity, Ban, Construction, ExternalLink, Plus, Power, RefreshCw, ShieldCheck, X } from "lucide-react";
import type { ManagedSite } from "@/lib/types";

type ExtendedSite = ManagedSite & {
  lastHealthLatencyMs?: number;
  lastHealthStatusCode?: number;
};

async function adminFetch(url: string, init?: RequestInit) {
  const token = await auth.currentUser?.getIdToken();
  const res = await fetch(url, {
    ...init,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
      ...(init?.headers || {})
    }
  });
  if (!res.ok) {
    const contentType = res.headers.get("content-type") || "";
    const body = contentType.includes("application/json")
      ? await res.json().catch(() => null)
      : await res.text().catch(() => "");
    const message =
      body && typeof body === "object" && "message" in body
        ? String(body.message)
        : String(body || res.statusText || "Request failed");

    throw new Error(message);
  }
  return res;
}

export default function SiteControlCenter() {
  const [sites, setSites] = useState<ExtendedSite[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState("");
  const [checkingAll, setCheckingAll] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => onSnapshot(
    collection(db, "managed_sites"),
    snap => {
      setSites(snap.docs.map(d => ({ id: d.id, ...d.data() } as ExtendedSite)));
      setError("");
    },
    snapshotError => {
      setSites([]);
      setError(snapshotError.message || "Yönetilen siteler okunamadı.");
    }
  ), []);

  async function command(site: ExtendedSite, status: ManagedSite["status"]) {
    setBusy(site.id);
    try {
      await adminFetch(`/api/control/sites/${site.id}/command`, {
        method: "POST",
        body: JSON.stringify({ status })
      });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Komut gönderilemedi");
    } finally {
      setBusy("");
    }
  }

  async function health(site: ExtendedSite) {
    setBusy(site.id);
    try {
      await adminFetch(`/api/control/sites/${site.id}/health`, { method: "POST" });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Health check başarısız");
    } finally {
      setBusy("");
    }
  }

  async function healthAll() {
    setCheckingAll(true);
    try {
      await adminFetch("/api/control/health-check-all", { method: "POST" });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Toplu health check başarısız");
    } finally {
      setCheckingAll(false);
    }
  }

  async function addSite(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setBusy("register");
    try {
      await adminFetch("/api/control/sites/register", {
        method: "POST",
        body: JSON.stringify({
          name: fd.get("name"),
          domain: fd.get("domain"),
          controlEndpoint: fd.get("controlEndpoint"),
          healthEndpoint: fd.get("healthEndpoint"),
          secret: fd.get("secret")
        })
      });
      form.reset();
      setOpen(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Site eklenemedi");
    } finally {
      setBusy("");
    }
  }

  return <>
    <div className="admin-title">
      <div>
        <p className="admin-kicker">REMOTE OPERATIONS / FLEET V2</p>
        <h1>Site Control Center</h1>
        <p>Bağlı projelere imzalı komut gönder, gerçek health durumlarını ölç ve operasyon geçmişini kaydet.</p>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button className="admin-action" onClick={healthAll} disabled={checkingAll}>
          <Activity size={17}/>{checkingAll ? "Kontrol ediliyor" : "Tümünü kontrol et"}
        </button>
        <button className="admin-action" onClick={() => setOpen(true)}><Plus size={17}/> Site ekle</button>
      </div>
    </div>

    {error && <div className="admin-alert">{error}</div>}

    <div className="fleet-summary">
      <div><ShieldCheck/><span><strong>{sites.filter(s => s.status === "active").length}</strong> Aktif</span></div>
      <div><Construction/><span><strong>{sites.filter(s => s.status === "maintenance").length}</strong> Bakımda</span></div>
      <div><Ban/><span><strong>{sites.filter(s => s.status === "disabled").length}</strong> Devre dışı</span></div>
    </div>

    <div className="site-fleet">
      {sites.map(site => <article className="site-card" key={site.id}>
        <div className="site-card-top">
          <span className={`site-health ${site.lastHealth}`}/>
          <div>
            <h3>{site.name}</h3>
            <a href={`https://${site.domain}`} target="_blank" rel="noreferrer">{site.domain} <ExternalLink size={13}/></a>
          </div>
          <i className={`status-badge status-${site.status}`}>{site.status}</i>
        </div>

        <div className="site-data">
          <span>Health<strong>{site.lastHealth || "unknown"}</strong></span>
          <span>Latency<strong>{site.lastHealthLatencyMs ? `${site.lastHealthLatencyMs} ms` : "—"}</strong></span>
          <span>HTTP<strong>{site.lastHealthStatusCode || "—"}</strong></span>
        </div>

        <div className="site-controls">
          <button disabled={busy === site.id} className={site.status === "active" ? "selected" : ""} onClick={() => command(site, "active")}><Power size={16}/>Aktif</button>
          <button disabled={busy === site.id} className={site.status === "maintenance" ? "selected warn" : ""} onClick={() => command(site, "maintenance")}><Construction size={16}/>Bakıma al</button>
          <button disabled={busy === site.id} className={site.status === "disabled" ? "selected danger" : ""} onClick={() => command(site, "disabled")}><Ban size={16}/>Devre dışı</button>
          <button disabled={busy === site.id} onClick={() => health(site)} title="Health check"><RefreshCw size={16}/></button>
        </div>
      </article>)}
      {!sites.length && <div className="admin-panel empty-state">Henüz yönetilen site eklenmedi.</div>}
    </div>

    {open && <div className="admin-modal-backdrop">
      <form className="admin-modal" onSubmit={addSite}>
        <button type="button" className="modal-close icon-button" onClick={() => setOpen(false)}><X/></button>
        <p className="admin-kicker">SECURE FLEET REGISTRATION</p>
        <h2>Yeni site bağla</h2>
        <label>Proje adı<input name="name" required placeholder="AKC Oto Kılıf"/></label>
        <label>Domain<input name="domain" required placeholder="akcotokilif.com"/></label>
        <label>Control endpoint<input name="controlEndpoint" required placeholder="https://akcotokilif.com/api/dromocob-control"/></label>
        <label>Health endpoint<input name="healthEndpoint" required placeholder="https://akcotokilif.com/api/health"/></label>
        <label>Site Control Secret<input name="secret" type="password" minLength={40} required placeholder="openssl rand -hex 48 ile üret"/></label>
        <div className="admin-note">Secret Firestore&apos;da public site kaydına yazılmaz. Server-only secret koleksiyonunda tutulur.</div>
        <button className="button button-full" disabled={busy === "register"}>{busy === "register" ? "Bağlanıyor..." : "Control Center&apos;a ekle"}</button>
      </form>
    </div>}
  </>;
}
