import ContactPageClient from "@/components/contact-page-client";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "İletişim",
  description:
    "Film prodüksiyonu, web sitesi, özel yazılım veya dijital büyüme projen için Dromocob ile iletişime geç.",
  path: "/iletisim",
  keywords: ["iletişim", "teklif al", "proje başlat"],
});

export default function ContactPage() {
  return <ContactPageClient />;
}
