import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hesap Doğrulama",
  robots: {
    index: false,
    follow: false,
  },
};

export default function VerificationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
