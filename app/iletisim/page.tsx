import ContactPageClient from "@/components/contact-page-client";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Proje İletişimi ve Kurumsal Teklif",
  description:
    "Web, özel yazılım, e-ticaret, film prodüksiyonu ve dijital büyüme projeleri için Dromocob proje masasına ulaşın veya akıllı teklif oluşturun.",
  path: "/iletisim",
  keywords: ["Dromocob iletişim", "kurumsal teklif al", "web tasarım teklifi", "film prodüksiyon teklifi", "proje başlat"],
});

export default function ContactPage() {
  return <ContactPageClient />;
}
