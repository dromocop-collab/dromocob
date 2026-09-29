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

export type SelfLearningLeagueCandidate = {
  userID: string;
  alias: string;
  progress: SelfLearningProgress;
};

export type SelfLearningLeagueRow = {
  rank: number;
  alias: string;
  xp: number;
  level: number;
  completedLessons: number;
  isYou: boolean;
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
  // A fresh install or a signed-out client starts with null onboarding fields.
  // Null must never erase an already verified age/placement choice merely because
  // the new device timestamp is newer.
  const ageBand = preference.ageBand ?? stored.ageBand ?? incoming.ageBand;
  const startingLevel = ageBand === "ADULT_18_PLUS"
    ? (preference.startingLevel ?? stored.startingLevel ?? incoming.startingLevel)
    : ageBand == null ? null : "BEGINNER";
  return {
    ...preference,
    curriculumVersion: SELF_LEARNING_CURRICULUM_VERSION,
    mode: ageBand === "ADULT_18_PLUS" ? "STANDARD" : ageBand == null ? preference.mode : "CHILD",
    ageBand,
    startingLevel,
    completedLessonIDs: union(stored.completedLessonIDs, incoming.completedLessonIDs),
    rewardUnlockedLessonIDs: union(stored.rewardUnlockedLessonIDs, incoming.rewardUnlockedLessonIDs),
    updatedAt: now.toISOString(),
  };
}

export function selfLearningXP(progress: SelfLearningProgress): number {
  return progress.completedLessonIDs.reduce((total, lessonID) => {
    const match = /^elifba-(\d+)-(\d+)$/.exec(lessonID);
    if (!match) return total;
    return total + 25 + (Number(match[1]) * 5);
  }, 0);
}

export function buildSelfLearningLeague(
  candidates: SelfLearningLeagueCandidate[],
  currentUserID: string,
  visibleLimit = 25,
): { entries: SelfLearningLeagueRow[]; user: SelfLearningLeagueRow | null; participantCount: number } {
  const ordered = candidates
    .filter(candidate => candidate.progress.mode === "STANDARD"
      && candidate.progress.ageBand === "ADULT_18_PLUS")
    .map(candidate => ({
      ...candidate,
      xp: selfLearningXP(candidate.progress),
      completedLessons: candidate.progress.completedLessonIDs.length,
    }))
    .sort((left, right) => right.xp - left.xp
      || right.completedLessons - left.completedLessons
      || left.alias.localeCompare(right.alias, "tr"));

  let previousXP: number | null = null;
  let previousCompleted: number | null = null;
  let previousRank = 0;
  const ranked = ordered.map((candidate, index): SelfLearningLeagueRow => {
    const rank = candidate.xp === previousXP && candidate.completedLessons === previousCompleted
      ? previousRank
      : index + 1;
    previousXP = candidate.xp;
    previousCompleted = candidate.completedLessons;
    previousRank = rank;
    return {
      rank,
      alias: candidate.alias,
      xp: candidate.xp,
      level: Math.max(1, Math.floor(candidate.xp / 250) + 1),
      completedLessons: candidate.completedLessons,
      isYou: candidate.userID === currentUserID,
    };
  });

  return {
    entries: ranked.slice(0, Math.max(1, Math.min(visibleLimit, 50))),
    user: ranked.find(row => row.isYou) ?? null,
    participantCount: ranked.length,
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
