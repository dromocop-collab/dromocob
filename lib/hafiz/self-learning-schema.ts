export const SELF_LEARNING_CURRICULUM_VERSION = 1;

export type SelfLearningProgress = {
  curriculumVersion: number;
  mode: "STANDARD" | "CHILD";
  ageBand: "CHILD_6_8" | "CHILD_9_12" | "TEEN_13_17" | "ADULT_18_PLUS" | null;
  startingLevel: "BEGINNER" | "RECOGNIZES_LETTERS" | "READS_WITH_MARKS" | "READS_QURAN" | null;
  completedLessonIDs: string[];
  rewardUnlockedLessonIDs: string[];
  updatedAt: string;
};

const modes = new Set(["STANDARD", "CHILD"]);
const ageBands = new Set(["CHILD_6_8", "CHILD_9_12", "TEEN_13_17", "ADULT_18_PLUS"]);
const startingLevels = new Set(["BEGINNER", "RECOGNIZES_LETTERS", "READS_WITH_MARKS", "READS_QURAN"]);
const lessonIDs = new Set(Array.from({ length: 7 }, (_, stage) =>
  Array.from({ length: 10 }, (_, lesson) => `elifba-${stage + 1}-${lesson + 1}`),
).flat());

export function normalizeSelfLearningProgress(value: unknown): SelfLearningProgress {
  if (!value || typeof value !== "object") throw new Error("İlerleme verisi geçersiz.");
  const input = value as Record<string, unknown>;
  if (input.curriculumVersion !== SELF_LEARNING_CURRICULUM_VERSION) {
    throw new Error("Öğrenme programı sürümü desteklenmiyor.");
  }

  const mode = String(input.mode || "");
  if (!modes.has(mode)) throw new Error("Öğrenme modu geçersiz.");
  const ageBand = nullableEnum(input.ageBand, ageBands, "Yaş grubu geçersiz.");
  const startingLevel = nullableEnum(input.startingLevel, startingLevels, "Başlangıç seviyesi geçersiz.");
  if (ageBand !== "ADULT_18_PLUS" && startingLevel != null && startingLevel !== "BEGINNER") {
    throw new Error("Yaş grubu ile başlangıç seviyesi uyuşmuyor.");
  }

  const updatedAt = new Date(String(input.updatedAt || ""));
  if (!Number.isFinite(updatedAt.getTime())) throw new Error("İlerleme tarihi geçersiz.");

  return {
    curriculumVersion: SELF_LEARNING_CURRICULUM_VERSION,
    mode: mode as SelfLearningProgress["mode"],
    ageBand: ageBand as SelfLearningProgress["ageBand"],
    startingLevel: startingLevel as SelfLearningProgress["startingLevel"],
    completedLessonIDs: normalizedLessonIDs(input.completedLessonIDs),
    rewardUnlockedLessonIDs: normalizedLessonIDs(input.rewardUnlockedLessonIDs),
    updatedAt: updatedAt.toISOString(),
  };
}

export function mergeSelfLearningProgress(
  storedValue: unknown,
  incomingValue: unknown,
  now = new Date(),
): SelfLearningProgress {
  const incoming = normalizeSelfLearningProgress(incomingValue);
  let stored: SelfLearningProgress | null = null;
  try {
    stored = storedValue ? normalizeSelfLearningProgress(storedValue) : null;
  } catch {
    stored = null;
  }
  if (!stored) return { ...incoming, updatedAt: now.toISOString() };

  const incomingIsNewer = Date.parse(incoming.updatedAt) >= Date.parse(stored.updatedAt);
  const preference = incomingIsNewer ? incoming : stored;
  return {
    ...preference,
    curriculumVersion: SELF_LEARNING_CURRICULUM_VERSION,
    completedLessonIDs: union(stored.completedLessonIDs, incoming.completedLessonIDs),
    rewardUnlockedLessonIDs: union(stored.rewardUnlockedLessonIDs, incoming.rewardUnlockedLessonIDs),
    updatedAt: now.toISOString(),
  };
}

function nullableEnum(value: unknown, allowed: Set<string>, message: string): string | null {
  if (value == null) return null;
  const normalized = String(value);
  if (!allowed.has(normalized)) throw new Error(message);
  return normalized;
}

function normalizedLessonIDs(value: unknown): string[] {
  if (!Array.isArray(value) || value.length > lessonIDs.size) {
    throw new Error("Ders ilerlemesi geçersiz.");
  }
  const result = [...new Set(value.map(String))];
  if (result.some(id => !lessonIDs.has(id))) throw new Error("Bilinmeyen ders kimliği.");
  return result.sort(naturalLessonOrder);
}

function union(left: string[], right: string[]): string[] {
  return [...new Set([...left, ...right])].sort(naturalLessonOrder);
}

function naturalLessonOrder(left: string, right: string): number {
  return left.localeCompare(right, "en", { numeric: true });
}
