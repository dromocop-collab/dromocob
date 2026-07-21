import ContactPageClient from "@/components/contact-page-client";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Proje İletişimi ve Kurumsal Teklif",
  description:
    "Web, özel yazılım, e-ticaret, film prodüksiyonu ve dijital büyüme projeleri için Dromocob proje masasına ulaşın veya akıllı teklif oluşturun.",
  path: "/iletisim",
  keywords: ["web sitesi teklifi", "kurumsal web sitesi teklifi", "web tasarım fiyat teklifi", "tanıtım filmi teklifi", "video prodüksiyon teklifi", "kurumsal tanıtım videosu fiyat", "proje başlat"],
});

export default function ContactPage() {
  return <ContactPageClient />;
}
