import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sitelerim | Dromocob",
  robots: { index: false, follow: false },
};

export default function MySitesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
