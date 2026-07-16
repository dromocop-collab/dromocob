import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="footer">
      <div>
        <div className="brand"><span className="brand-dot" />DROMOCOB</div>
        <p>Film. Dijital ürün. Büyüme sistemi.</p>
      </div>
      <div className="footer-links">
        <Link href="/projeler">Projeler</Link>
        <Link href="/paketler">Paketler</Link>
        <Link href="/iletisim">İletişim</Link>
        <Link href="/kvkk-aydinlatma">KVKK</Link>
        <Link href="/gizlilik-politikasi">Gizlilik</Link>
        <Link href="/admin">Admin</Link>
      </div>
      <small>© {new Date().getFullYear()} Dromocob. Tüm hakları saklıdır.</small>
    </footer>
  );
}
