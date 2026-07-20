import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";

import { db } from "@/lib/firebase";

export type CustomerSiteTemplate = "studio" | "restaurant" | "portfolio";

export type CustomerSiteDraft = {
  template: CustomerSiteTemplate;
  accent: string;
  businessName: string;
  headline: string;
  subdomain: string;
  pages?: CustomerSitePage[];
  siteSettings?: CustomerSiteSettings;
};

export type CustomerSitePage = {
  id: string;
  title: string;
  slug: string;
  type: "home" | "standard" | "contact";
  visible: boolean;
  sections: string[];
};

export type CustomerSiteSettings = {
  seoTitle: string;
  seoDescription: string;
  cookieBanner: boolean;
  analytics: boolean;
  maintenance: boolean;
};

export type CustomerSiteRecord = CustomerSiteDraft & {
  id: string;
  ownerId: string;
  status: "draft" | "published";
  createdAt?: { toMillis?: () => number } | null;
  updatedAt?: { toMillis?: () => number } | null;
};

const PENDING_SITE_KEY = "dromocob.pending-customer-site.v1";

export function storePendingSite(draft: CustomerSiteDraft): void {
  window.localStorage.setItem(PENDING_SITE_KEY, JSON.stringify(draft));
}

export function readPendingSite(): CustomerSiteDraft | null {
  try {
    const raw = window.localStorage.getItem(PENDING_SITE_KEY);
    return raw ? JSON.parse(raw) as CustomerSiteDraft : null;
  } catch {
    return null;
  }
}

export function clearPendingSite(): void {
  window.localStorage.removeItem(PENDING_SITE_KEY);
}

export async function saveCustomerSite(ownerId: string, draft: CustomerSiteDraft, existingId?: string | null): Promise<string> {
  const siteRef = existingId ? doc(db, "customer_sites", existingId) : doc(collection(db, "customer_sites"));
  await setDoc(siteRef, {
    ...draft,
    ownerId,
    status: "published",
    ...(existingId ? {} : { createdAt: serverTimestamp() }),
    updatedAt: serverTimestamp(),
  }, { merge: Boolean(existingId) });
  return siteRef.id;
}

export async function importPendingSite(ownerId: string): Promise<string | null> {
  const draft = readPendingSite();
  if (!draft) return null;
  const id = await saveCustomerSite(ownerId, draft);
  clearPendingSite();
  return id;
}
