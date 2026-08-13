export function reportLeadConversion(input: { id: string; type: "quote_submit" | "contact_submit"; value: number; service?: string }) {
  if (typeof window === "undefined" || !input.id) return;
  window.dispatchEvent(new CustomEvent("dromocob:conversion", { detail: { ...input, currency: "TRY" } }));
}
