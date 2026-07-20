import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Site Studio | Dromocob",
  robots: { index: false, follow: false },
};

export default function SiteEditorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
