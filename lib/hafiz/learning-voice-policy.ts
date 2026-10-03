import { createHash } from "node:crypto";

export const LEARNING_VOICE_PROFILES = ["MURSHID_TR", "QURAN_AR"] as const;
export const LEARNING_VOICE_DELIVERIES = [
  "COACH", "LETTER_NAME", "VOWEL_SOUND", "QURAN_RECITATION",
] as const;
export const LEARNING_VOICE_PACES = ["SLOW", "LEARNING", "NATURAL"] as const;

export type LearningVoiceProfile = (typeof LEARNING_VOICE_PROFILES)[number];
export type LearningVoiceDelivery = (typeof LEARNING_VOICE_DELIVERIES)[number];
export type LearningVoicePace = (typeof LEARNING_VOICE_PACES)[number];
export type LearningVoiceRequest = {
  profile: LearningVoiceProfile;
  text: string;
  delivery: LearningVoiceDelivery;
  pace: LearningVoicePace;
};

export class LearningVoiceRequestError extends Error {
  readonly code = "INVALID_LEARNING_VOICE_REQUEST";
}

export class HumanVoiceUnavailableError extends Error {
  readonly code = "HUMAN_VOICE_UNAVAILABLE";
}

const MAX_TEXT_LENGTH = 120;
const CACHE_VERSION = "v3-qaida-human-recordings";
const ARABIC_ALPHABET_AUDIO_BASE =
  "https://raw.githubusercontent.com/razunatmohammed88-cyber/arabic-alphabet-audio/main";

const LETTER_RECORDINGS: Readonly<Record<string, string>> = {
  "أَلِف": "alif.mp3", "بَاء": "baa.mp3", "تَاء": "taa.mp3",
  "ثَاء": "thaa.mp3", "جِيم": "jiim.mp3", "حَاء": "haa.mp3",
  "خَاء": "khaa.mp3", "دَال": "daal.mp3", "ذَال": "thaal.mp3",
  "رَاء": "raa.mp3", "زَاي": "zaay.mp3", "سِين": "siin.mp3",
  "شِين": "shiin.mp3", "صَاد": "saad.mp3", "ضَاد": "daad.mp3",
  "طَاء": "taa'.mp3", "ظَاء": "thaa'.mp3", "عَين": "àyn.mp3",
  "غَين": "ghayn.mp3", "فَاء": "faa.mp3", "قَاف": "qaaf.mp3",
  "كَاف": "kaaf.mp3", "لَام": "laam.mp3", "مِيم": "miim.mp3",
  "نُون": "nuun.mp3", "وَاو": "waaw.mp3", "هَاء": "haa'.mp3",
  "يَاء": "yaa.mp3", "هَمْزَة": "hamzah.mp3",
};

const VOWEL_RECORDINGS: Readonly<Record<string, string>> = {
  "بَ": "fatha_ba.mp3", "تَ": "fatha_ta.mp3",
  "مَ": "fatha_ma.mp3", "سَ": "fatha_sa.mp3",
  "بِ": "kasra_bi.mp3", "تِ": "kasra_ti.mp3",
  "مِ": "kasra_mi.mp3", "سِ": "kasra_si.mp3",
  "بُ": "damma_bu.mp3", "تُ": "damma_tu.mp3",
  "مُ": "damma_mu.mp3", "سُ": "damma_su.mp3",
};

export function parseLearningVoiceRequest(payload: unknown): LearningVoiceRequest {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw invalidVoiceRequest();
  }
  const candidate = payload as Record<string, unknown>;
  const profile = enumValue(candidate.profile, LEARNING_VOICE_PROFILES);
  const delivery = enumValue(candidate.delivery, LEARNING_VOICE_DELIVERIES);
  const pace = enumValue(candidate.pace, LEARNING_VOICE_PACES);
  const text = typeof candidate.text === "string" ? candidate.text.trim() : "";
  if (!profile || !delivery || !pace || !text || text.length > MAX_TEXT_LENGTH) {
    throw invalidVoiceRequest();
  }
  if (/\p{Cc}/u.test(text.replace(/[\n\r\t]/g, ""))) throw invalidVoiceRequest();
  if (profile === "MURSHID_TR" && delivery !== "COACH") throw invalidVoiceRequest();
  if (profile === "QURAN_AR" && delivery === "COACH") throw invalidVoiceRequest();
  return { profile, text, delivery, pace };
}

export function humanLetterRecordingURL(request: LearningVoiceRequest): URL | null {
  if (request.profile !== "QURAN_AR" || request.delivery !== "LETTER_NAME") return null;
  const fileName = LETTER_RECORDINGS[normalizeArabic(request.text)];
  return fileName
    ? new URL(`${ARABIC_ALPHABET_AUDIO_BASE}/${encodeURIComponent(fileName)}`)
    : null;
}

export function bundledVowelRecordingPath(request: LearningVoiceRequest): string | null {
  if (request.profile !== "QURAN_AR" || request.delivery !== "VOWEL_SOUND") return null;
  const fileName = VOWEL_RECORDINGS[normalizeArabic(request.text)];
  return fileName ? `public/hafiz/qaida-audio/${fileName}` : null;
}

export function quranWordAudioURL(
  request: LearningVoiceRequest,
  searchPayload: unknown,
): URL | null {
  if (request.profile !== "QURAN_AR" || request.delivery === "LETTER_NAME") return null;
  const expected = normalizeArabic(request.text);
  if (arabicLetterCount(expected) < 2 || /\s/u.test(expected)) return null;
  if (!searchPayload || typeof searchPayload !== "object") return null;
  const search = (searchPayload as { search?: unknown }).search;
  if (!search || typeof search !== "object") return null;
  const results = (search as { results?: unknown }).results;
  if (!Array.isArray(results)) return null;

  for (const result of results) {
    if (!result || typeof result !== "object") continue;
    const verseKey = (result as { verse_key?: unknown }).verse_key;
    const words = (result as { words?: unknown }).words;
    if (typeof verseKey !== "string" || !Array.isArray(words)) continue;
    const [chapter, verse] = verseKey.split(":").map(Number);
    if (!validReferencePart(chapter, 114) || !validReferencePart(verse, 286)) continue;

    let position = 0;
    for (const word of words) {
      if (!word || typeof word !== "object") continue;
      const candidate = word as { char_type?: unknown; text?: unknown; highlight?: unknown };
      if (candidate.char_type !== "word") continue;
      position += 1;
      if (candidate.highlight !== true || typeof candidate.text !== "string") continue;
      if (normalizeArabic(candidate.text) !== expected) continue;
      const path = [chapter, verse, position]
        .map((value) => String(value).padStart(3, "0"))
        .join("_");
      return new URL(`https://audio.qurancdn.com/wbw/${path}.mp3`);
    }
  }
  return null;
}

export function quranSearchURL(text: string): URL {
  const url = new URL("https://api.quran.com/api/v4/search");
  url.searchParams.set("q", text.trim());
  url.searchParams.set("size", "20");
  url.searchParams.set("language", "en");
  return url;
}

export function learningVoiceCachePath(request: LearningVoiceRequest): string {
  const identity = [CACHE_VERSION, request.profile, request.delivery, request.pace,
    normalizeArabic(request.text)].join("|");
  const digest = createHash("sha256").update(identity, "utf8").digest("hex");
  return `hafiz-learning-voice/${CACHE_VERSION}/${digest}.mp3`;
}

export function normalizeArabic(value: string): string {
  return value.normalize("NFC").replace(/ـ/gu, "").replace(/[ۖ-ٰۭ]/gu, "")
    .replace(/[ْۡ]/gu, "").trim();
}

function arabicLetterCount(value: string): number {
  return [...value].filter((character) => /\p{Script=Arabic}/u.test(character)
    && /\p{Letter}/u.test(character)).length;
}

function validReferencePart(value: number, maximum: number): boolean {
  return Number.isInteger(value) && value >= 1 && value <= maximum;
}

function enumValue<T extends string>(value: unknown, values: readonly T[]): T | null {
  return typeof value === "string" && values.includes(value as T) ? value as T : null;
}

function invalidVoiceRequest(): LearningVoiceRequestError {
  return new LearningVoiceRequestError("Seslendirme isteği geçersiz.");
}
