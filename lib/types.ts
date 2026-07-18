export type Project = {
  id: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  description: string;
  coverUrl?: string;
  videoUrl?: string;
  client?: string;
  year?: number;
  featured?: boolean;
  active?: boolean;
  order?: number;
};

export type ServicePackage = {
  id: string;
  title: string;
  subtitle: string;
  image?: string;
  promoVideo?: string;
  priceFrom: number;
  priceLabel?: string;
  description: string;
  features: string[];
  idealFor?: string[];
  kpiFocus?: string[];
  deliveryTime?: string;
  supportWindow?: string;
  maxRevision?: number;
  guarantee?: string;
  theme?: "dark" | "light" | "neon" | "graphite" | "royal";
  badge?: string;
  cta?: string;
  active?: boolean;
  featured?: boolean;
  order?: number;
  quoteService?: "web" | "software" | "video" | "social" | "hybrid";
};

export type QuoteQuestion = {
  id: string;
  key: string;
  title: string;
  subtitle?: string;
  type: "single" | "multi" | "number";
  options?: { label: string; value: string; priceDelta?: number }[];
  min?: number;
  max?: number;
  active?: boolean;
  order?: number;
  serviceTypes?: string[];
};

export type QuoteRule = {
  id: string;
  name: string;
  enabled: boolean;
  priority: number;
  conditions: { key: string; operator: "eq" | "includes" | "gte" | "lte"; value: string | number }[];
  priceType: "add" | "multiply" | "fixed";
  value: number;
  note?: string;
};

export type ManagedSite = {
  id: string;
  name: string;
  domain: string;
  status: "active" | "maintenance" | "disabled";
  controlEndpoint?: string;
  healthEndpoint?: string;
  controlUrl?: string;
  healthUrl?: string;
  lastHealth?: "online" | "offline" | "unknown";
  lastCheckedAt?: string;
  notes?: string;
};
