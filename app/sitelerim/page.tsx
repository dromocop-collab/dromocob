"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, onSnapshot, query, where } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { ArrowRight, ExternalLink, Globe2, LayoutDashboard, Loader2, Plus, Settings2, Sparkles, Trash2, X } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { db } from "@/lib/firebase";
import type { CustomerSiteRecord } from "@/lib/customer-sites";
import { importPendingSite } from "@/lib/customer-sites";

const templateNames = { studio: "Nova Studio", restaurant: "Masa No.7", portfolio: "Forma" };

export default function MySitesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [sites, setSites] = useState<CustomerSiteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<CustomerSiteRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/giris");
  }, [authLoading, router, user]);

  useEffect(() => {
    if (!user) return;
    void importPendingSite(user.uid).catch(() => {
      setError("Bekleyen site taslağın hesaba aktarılamadı.");
    });
    const sitesQuery = query(collection(db, "customer_sites"), where("ownerId", "==", user.uid));
    return onSnapshot(sitesQuery, (snapshot) => {
      const records = snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as CustomerSiteRecord));
      records.sort((a, b) => (b.updatedAt?.toMillis?.() ?? 0) - (a.updatedAt?.toMillis?.() ?? 0));
      setSites(records);
      setLoading(false);
    }, () => {
      setError("Sitelerin yüklenemedi. Lütfen tekrar dene.");
      setLoading(false);
    });
  }, [user]);

  async function deleteSite() {
    if (!deleteTarget || !user || deleteTarget.ownerId !== user.uid) return;
    setDeleting(true);
    setError("");
    try {
      await deleteDoc(doc(db, "customer_sites", deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      setError("Site silinemedi. Lütfen tekrar dene.");
    } finally {
      setDeleting(false);
    }
  }

  if (authLoading || loading) return <div className="my-sites-loading"><Loader2 className="spin" /></div>;

  return <main className="my-sites-page section">
    <header className="my-sites-head">
      <div><p className="eyebrow"><LayoutDashboard size={14} /> Dromocob Sites / Workspace</p><h1>Sitelerim<span>.</span></h1><p>Tüm web sitelerini tek merkezden yönet, düzenle ve yayına hazırla.</p></div>
      <Link href="/site-olustur" className="button"><Plus size={17} /> Yeni site oluştur</Link>
    </header>

    {error && <div className="auth-error">{error}</div>}

    {sites.length === 0 ? <section className="my-sites-empty">
      <div><Sparkles size={27} /></div><p>İLK SİTENİ OLUŞTUR</p><h2>Markanın yeni adresi<br/>birkaç adım uzağında.</h2><span>Şablonunu seç, içeriğini düzenle ve Dromocob alan adınla yayınla.</span><Link href="/site-olustur" className="button">Site oluşturmaya başla <ArrowRight size={17} /></Link>
    </section> : <section className="my-sites-grid">
      {sites.map((site) => <article className="my-site-card" key={site.id}>
        <div className={`my-site-preview my-site-${site.template}`} style={{ "--site-accent": site.accent } as React.CSSProperties}>
          <div><strong>{site.businessName}</strong><span /><span /><button /></div>
          <section><small>BAĞIMSIZ · İSTANBUL</small><h2>{site.headline}</h2><i /></section>
        </div>
        <div className="my-site-info">
          <div><span className="my-site-status"><i /> YAYINDA</span><span>{templateNames[site.template]}</span></div>
          <h2>{site.businessName}</h2>
          <Link href={`/site-onizleme/${site.id}`} target="_blank"><Globe2 size={13} /> {site.subdomain}.dromocob.tr <ExternalLink size={12} /></Link>
          <div className="my-site-actions"><Link href={`/site-duzenle/${site.id}`}><Settings2 size={15} /> Siteyi düzenle</Link><button onClick={() => setDeleteTarget(site)} aria-label={`${site.businessName} sitesini sil`}><Trash2 size={15} /></button><Link href={`/site-onizleme/${site.id}`} target="_blank" aria-label={`${site.businessName} sitesini önizle`}><ArrowRight size={16} /></Link></div>
        </div>
      </article>)}
      <Link href="/site-olustur" className="my-site-add"><Plus size={23} /><strong>Yeni site oluştur</strong><span>Yeni bir marka deneyimi başlat</span></Link>
    </section>}
    {deleteTarget && <div className="site-delete-backdrop" onMouseDown={() => !deleting && setDeleteTarget(null)}><section className="site-delete-modal" onMouseDown={event => event.stopPropagation()}><button className="site-delete-close" onClick={() => setDeleteTarget(null)} disabled={deleting}><X size={17} /></button><div><Trash2 size={24} /></div><p>GERİ ALINAMAZ İŞLEM</p><h2>{deleteTarget.businessName} silinsin mi?</h2><span>Site tasarımı, sayfaları ve tüm düzenlemeler kalıcı olarak silinecek. Bu işlem geri alınamaz.</span><strong>Silmek için site adını kontrol et: {deleteTarget.businessName}</strong><section><button onClick={() => setDeleteTarget(null)} disabled={deleting}>Vazgeç</button><button onClick={deleteSite} disabled={deleting}>{deleting ? <Loader2 className="spin" size={16} /> : <Trash2 size={16} />}{deleting ? "Siliniyor" : "Siteyi kalıcı sil"}</button></section></section></div>}
  </main>;
}
