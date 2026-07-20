import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Web Sitesi Oluştur | Dromocob Sites",
  description: "Markanı seç, içeriğini düzenle ve Dromocob alan adı altında siteni dakikalar içinde yayına hazırla.",
};

export default function SiteBuilderLayout({ children }: { children: React.ReactNode }) {
  return children;
}
