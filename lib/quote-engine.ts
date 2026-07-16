import type { QuoteQuestion, QuoteRule } from "@/lib/types";

type Answers = Record<string, string | string[] | number>;

function conditionMatches(
  condition: QuoteRule["conditions"][number],
  answers: Answers
) {
  const current = answers[condition.key];
  if (current === undefined) return false;

  switch (condition.operator) {
    case "eq":
      return String(current) === String(condition.value);
    case "includes":
      return Array.isArray(current) && current.map(String).includes(String(condition.value));
    case "gte":
      return Number(current) >= Number(condition.value);
    case "lte":
      return Number(current) <= Number(condition.value);
    default:
      return false;
  }
}

export function calculateQuote(
  questions: QuoteQuestion[],
  rules: QuoteRule[],
  answers: Answers,
  basePrice = 15000
) {
  let price = basePrice;
  const notes: string[] = [];

  for (const question of questions) {
    const answer = answers[question.key];
    if (Array.isArray(answer)) {
      for (const value of answer) {
        const option = question.options?.find(o => o.value === value);
        price += option?.priceDelta || 0;
      }
    } else {
      const option = question.options?.find(o => o.value === String(answer));
      price += option?.priceDelta || 0;
    }
  }

  for (const rule of [...rules].sort((a, b) => a.priority - b.priority)) {
    const matched = rule.conditions.every(c => conditionMatches(c, answers));
    if (!matched) continue;

    if (rule.priceType === "add") price += rule.value;
    if (rule.priceType === "multiply") price *= rule.value;
    if (rule.priceType === "fixed") price = rule.value;
    if (rule.note) notes.push(rule.note);
  }

  return {
    price: Math.max(0, Math.round(price / 500) * 500),
    notes
  };
}
