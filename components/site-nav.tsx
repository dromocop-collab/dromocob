"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowUpRight, ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import AccountMenu from "@/components/auth/account-menu";

type NavDropdownGroup = {
  label: string;
  items: { label: string; href: string }[];
};

type NavItem =
  | { label: string; href: string; dropdown?: undefined }
  | { label: string; href?: undefined; dropdown: NavDropdownGroup[] };

const navItems: NavItem[] = [
  { label: "Anasayfa", href: "/" },
  { label: "Uygulamalar", href: "/uygulamalar" },
  {
    label: "Hizmetler",
    dropdown: [
      {
        label: "Web & Yazılım",
        items: [
          { label: "Web Tasarım", href: "/web-tasarim" },
          { label: "Kurumsal Web Tasarım", href: "/kurumsal-web-tasarim" },
          { label: "E-Ticaret Web Tasarım", href: "/e-ticaret-web-tasarim" },
          { label: "Landing Page", href: "/landing-page" },
          { label: "Mobil Uygulama", href: "/mobil-uygulama" },
        ],
      },
      {
        label: "SEO & Reklam",
        items: [
          { label: "SEO Hizmeti", href: "/seo" },
          { label: "Teknik SEO", href: "/teknik-seo" },
          { label: "Yerel SEO", href: "/yerel-seo" },
          { label: "Google Ads", href: "/google-ads" },
          { label: "Meta Reklamları", href: "/meta-reklamlari" },
          { label: "Instagram Yönetimi", href: "/instagram-yonetimi" },
        ],
      },
      {
        label: "Video & Prodüksiyon",
        items: [
          { label: "Video Prodüksiyon", href: "/video-produksiyon" },
          { label: "Tanıtım Filmi", href: "/tanitim-filmi" },
          { label: "Drone Çekimi", href: "/drone-cekimi" },
          { label: "Kurumsal Fotoğraf", href: "/kurumsal-fotograf-cekimi" },
        ],
      },
      {
        label: "Sektörel Tanıtım",
        items: [
          { label: "Mağaza Tanıtımı", href: "/magaza-tanitimi" },
          { label: "Villa Tanıtımı", href: "/villa-tanitimi" },
          { label: "Restoran Tanıtımı", href: "/restoran-tanitimi" },
          { label: "Otel Tanıtımı", href: "/otel-tanitimi" },
          { label: "İnşaat Firma Tanıtımı", href: "/insaat-firma-tanitimi" },
        ],
      },
    ],
  },
  { label: "Projeler", href: "/projeler" },
  { label: "Paketler", href: "/paketler" },
  { label: "Kurumsal", href: "/kurumsal" },
  { label: "İletişim", href: "/iletisim" },
];

export default function SiteNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const pathname = usePathname();
  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let previous = window.scrollY;
    let frame = 0;
    const handleScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        const current = window.scrollY;
        setScrolled(current > 18);
        setHidden(current > 180 && current > previous + 7 && !open);
        previous = current;
        frame = 0;
      });
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", handleScroll); };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  // Close dropdown on route change
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setActiveDropdown(null);
      setMobileExpanded(null);
      setOpen(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  // Close desktop dropdown on outside click
  useEffect(() => {
    if (!activeDropdown) return;
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeDropdown]);

  // Close dropdown on Escape
  useEffect(() => {
    if (!activeDropdown) return;
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setActiveDropdown(null);
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [activeDropdown]);

  const handleDropdownEnter = useCallback((label: string) => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setActiveDropdown(label);
  }, []);

  const handleDropdownLeave = useCallback(() => {
    dropdownTimeoutRef.current = setTimeout(() => setActiveDropdown(null), 180);
  }, []);

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  function isDropdownActive(item: NavItem & { dropdown: NavDropdownGroup[] }) {
    return item.dropdown.some(group => group.items.some(sub => isActive(sub.href)));
  }

  const flatIndex = (() => {
    let i = 0;
    return () => ++i;
  })();

  return <header className={`nav-shell ${scrolled ? "is-scrolled" : ""} ${hidden ? "is-hidden" : ""} ${open ? "menu-open" : ""}`}>
    <Link className="brand" href="/" aria-label="Dromocob ana sayfa" onClick={() => setOpen(false)}>
      <span className="brand-monogram"><Image src="/logo.svg" alt="" width={43} height={43} priority /></span>
      <span className="brand-copy"><b>DROMOCOB</b><small>Film · Web · Growth</small></span>
    </Link>
    <nav className="desktop-nav" aria-label="Ana navigasyon" ref={dropdownRef}>
      <div className="nav-primary">
        {navItems.map(item => {
          if (item.dropdown) {
            const isOpen = activeDropdown === item.label;
            const active = isDropdownActive(item as NavItem & { dropdown: NavDropdownGroup[] });
            return <div
              key={item.label}
              className="nav-dropdown-wrap"
              onMouseEnter={() => handleDropdownEnter(item.label)}
              onMouseLeave={handleDropdownLeave}
            >
              <button
                type="button"
                className={`nav-link nav-dropdown-trigger ${active ? "active" : ""}`}
                aria-expanded={isOpen}
                aria-haspopup="true"
                onClick={() => setActiveDropdown(isOpen ? null : item.label)}
              >
                <span>{item.label}</span>
                <ChevronDown size={13} className={`nav-chevron ${isOpen ? "is-open" : ""}`} />
              </button>
              {isOpen && <div className="nav-mega-dropdown">
                {item.dropdown.map(group => <div key={group.label} className="nav-mega-group">
                  <span className="nav-mega-group-label">{group.label}</span>
                  {group.items.map(sub => <Link
                    key={sub.href}
                    href={sub.href}
                    className={`nav-mega-link ${isActive(sub.href) ? "is-active" : ""}`}
                  >
                    {sub.label}
                  </Link>)}
                </div>)}
              </div>}
            </div>;
          }
          return <Link key={item.href} href={item.href} className={isActive(item.href) ? "nav-link active" : "nav-link"} aria-current={isActive(item.href) ? "page" : undefined}><span>{item.label}</span></Link>;
        })}
      </div>
      <div className="nav-actions">
        <Link href="/site-olustur" className="nav-cta"><span><small>Dromocob Sites</small>Site Oluştur</span><i><ArrowUpRight size={16}/></i></Link>
        <AccountMenu/>
      </div>
    </nav>
    <button className="mobile-menu" type="button" onClick={() => setOpen(!open)} aria-label={open ? "Menüyü kapat" : "Menüyü aç"} aria-expanded={open} aria-controls="mobile-site-navigation"><span>{open ? <X/> : <Menu/>}</span></button>
    {open && <div className="mobile-nav" id="mobile-site-navigation">
      <div className="mobile-nav-intro"><span>MENU</span><p>Film, web ve büyüme sistemleri için bütünleşik üretim.</p></div>
      <div className="mobile-nav-links">{navItems.map(item => {
        if (item.dropdown) {
          const expanded = mobileExpanded === item.label;
          const active = isDropdownActive(item as NavItem & { dropdown: NavDropdownGroup[] });
          return <div key={item.label} className="mobile-accordion">
            <button
              type="button"
              className={`nav-link mobile-accordion-trigger ${active ? "active" : ""}`}
              aria-expanded={expanded}
              onClick={() => setMobileExpanded(expanded ? null : item.label)}
            >
              <span>0{flatIndex()}</span>
              {item.label}
              <ChevronDown size={18} className={`mobile-accordion-chevron ${expanded ? "is-open" : ""}`} />
            </button>
            {expanded && <div className="mobile-accordion-panel">
              {item.dropdown.map(group => <div key={group.label} className="mobile-accordion-group">
                <span className="mobile-accordion-group-label">{group.label}</span>
                {group.items.map(sub => <Link
                  key={sub.href}
                  href={sub.href}
                  className={`mobile-accordion-link ${isActive(sub.href) ? "is-active" : ""}`}
                  onClick={() => setOpen(false)}
                >
                  {sub.label}
                  <ArrowUpRight size={14} />
                </Link>)}
              </div>)}
            </div>}
          </div>;
        }
        return <Link key={item.href} href={item.href} className={isActive(item.href) ? "nav-link active" : "nav-link"} onClick={() => setOpen(false)}>
          <span>0{flatIndex()}</span>{item.label}<ArrowUpRight size={18}/>
        </Link>;
      })}</div>
      <div className="mobile-nav-footer"><Link href="/site-olustur" className="nav-cta" onClick={() => setOpen(false)}><span><small>Dromocob Sites</small>Site Oluştur</span><i><ArrowUpRight size={17}/></i></Link><AccountMenu/></div>
    </div>}
  </header>;
}
