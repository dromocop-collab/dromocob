export type WheelRewardKind = "percent" | "fixed" | "gift" | "none";

export type WheelReward = {
  id: string;
  label: string;
  shortLabel: string;
  color: string;
  textColor: string;
  kind: WheelRewardKind;
  value: number;
  weight: number;
  active: boolean;
  validityDays: number;
  description: string;
};

export type WheelConfig = {
  active: boolean;
  title: string;
  subtitle: string;
  triggerLabel: string;
  rewards: WheelReward[];
};

export type MemberCoupon = {
  id: string;
  code: string;
  label: string;
  description: string;
  kind: Exclude<WheelRewardKind, "none">;
  value: number;
  status: "active" | "used" | "expired";
  expiresAt: string;
  createdAt: string;
  usedAt?: string;
  quoteId?: string;
};

export const DEFAULT_WHEEL_CONFIG: WheelConfig = {
  active: true,
  title: "Şansını çevir, projene avantaj kat.",
  subtitle: "Dromocob çarkında teklifine özel bir avantaj seni bekliyor.",
  triggerLabel: "Hediye çarkı",
  rewards: [
    { id: "discount-5", label: "%5 Proje İndirimi", shortLabel: "%5 İNDİRİM", color: "#ff4fd8", textColor: "#160617", kind: "percent", value: 5, weight: 24, active: true, validityDays: 30, description: "Teklifindeki proje bedeline %5 indirim." },
    { id: "discount-10", label: "%10 Proje İndirimi", shortLabel: "%10 İNDİRİM", color: "#d9ff43", textColor: "#10140f", kind: "percent", value: 10, weight: 12, active: true, validityDays: 21, description: "Teklifindeki proje bedeline %10 indirim." },
    { id: "fixed-1000", label: "1.000 TL Proje Kredisi", shortLabel: "₺1K KREDİ", color: "#49ddff", textColor: "#071116", kind: "fixed", value: 1000, weight: 18, active: true, validityDays: 30, description: "Proje teklifinde kullanabileceğin 1.000 TL Dromocob kredisi." },
    { id: "strategy", label: "Strateji Seansı", shortLabel: "STRATEJİ", color: "#ff7a45", textColor: "#190a05", kind: "gift", value: 0, weight: 15, active: true, validityDays: 30, description: "Proje öncesi 30 dakikalık birebir strateji seansı hediye." },
    { id: "brand-audit", label: "Mini Marka Analizi", shortLabel: "MARKA ANALİZİ", color: "#8b7cff", textColor: "#0b071b", kind: "gift", value: 0, weight: 11, active: true, validityDays: 30, description: "Web, sosyal medya ve marka sunumun için hızlı fırsat analizi." },
    { id: "fast-lane", label: "Priority Fast Lane", shortLabel: "FAST LANE", color: "#ffe04b", textColor: "#181205", kind: "gift", value: 0, weight: 8, active: true, validityDays: 21, description: "Teklif talebin öncelikli değerlendirme kuyruğuna alınır." },
    { id: "creative-pack", label: "3 Kreatif Fikir", shortLabel: "3 FİKİR", color: "#4dffb8", textColor: "#06150e", kind: "gift", value: 0, weight: 10, active: true, validityDays: 30, description: "Markana özel üç yaratıcı içerik veya kampanya fikri." },
    { id: "mystery", label: "Gizemli Drop", shortLabel: "MYSTERY", color: "#15151d", textColor: "#f6f2ff", kind: "gift", value: 0, weight: 2, active: true, validityDays: 14, description: "Ekibimizin projen için seçeceği sürpriz yaratıcı avantaj." },
  ],
};

export function normalizeWheelConfig(value: unknown): WheelConfig {
  const raw = value && typeof value === "object" ? value as Partial<WheelConfig> : {};
  const rewards = Array.isArray(raw.rewards) ? raw.rewards.map((reward, index) => {
    const item = reward as Partial<WheelReward>;
    const kind: WheelRewardKind = ["percent", "fixed", "gift", "none"].includes(String(item.kind)) ? item.kind as WheelRewardKind : "none";
    return {
      id: String(item.id || `reward-${index + 1}`).trim().slice(0, 80),
      label: String(item.label || "Ödül").trim().slice(0, 100),
      shortLabel: String(item.shortLabel || item.label || "ÖDÜL").trim().slice(0, 20),
      color: /^#[0-9a-f]{6}$/i.test(String(item.color)) ? String(item.color) : "#d9ff43",
      textColor: /^#[0-9a-f]{6}$/i.test(String(item.textColor)) ? String(item.textColor) : "#10140f",
      kind,
      value: Math.max(0, Number(item.value) || 0),
      weight: Math.max(0, Number(item.weight) || 0),
      active: item.active !== false,
      validityDays: Math.max(1, Math.min(365, Number(item.validityDays) || 30)),
      description: String(item.description || "").trim().slice(0, 240),
    };
  }).filter(item => item.id && item.label) : [];

  return {
    active: raw.active !== false,
    title: String(raw.title || DEFAULT_WHEEL_CONFIG.title).trim().slice(0, 160),
    subtitle: String(raw.subtitle || DEFAULT_WHEEL_CONFIG.subtitle).trim().slice(0, 300),
    triggerLabel: String(raw.triggerLabel || DEFAULT_WHEEL_CONFIG.triggerLabel).trim().slice(0, 40),
    rewards: rewards.length >= 2 ? rewards : DEFAULT_WHEEL_CONFIG.rewards,
  };
}
