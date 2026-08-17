"use client";

import Link from "next/link";
import { KeyRound } from "lucide-react";

export default function HeaderLicenseLink({ className = "" }: { className?: string }) {
  return (
    <Link href="/lisans" className={className}>
      <KeyRound size={15} aria-hidden="true" />
      <span>Lisanslar</span>
    </Link>
  );
}
