import { createHash } from "node:crypto";

export const LEARNING_VOICE_PROFILES = ["MURSHID_TR", "QURAN_AR"] as const;
export type LearningVoiceProfile = (typeof LEARNING_VOICE_PROFILES)[number];
export const LEARNING_VOICE_DELIVERIES = [
  "COACH",
  "LETTER_NAME",
  "VOWEL_SOUND",
  "QURAN_RECITATION",
] as const;
export type LearningVoiceDelivery = (typeof LEARNING_VOICE_DELIVERIES)[number];
export const LEARNING_VOICE_PACES = ["SLOW", "LEARNING", "NATURAL"] as const;
export type LearningVoicePace = (typeof LEARNING_VOICE_PACES)[number];
export type LearningVoice = string | { id: string };

export type LearningVoiceRequest = {
  profile: LearningVoiceProfile;
  delivery: LearningVoiceDelivery;
  pace: LearningVoicePace;
  text: string;
  model: string;
  voice: LearningVoice;
  instructions: string;
  cacheKey: string;
};

const TURKISH_MAX_LENGTH = 280;
const ARABIC_MAX_LENGTH = 80;
const ARABIC_TEXT = /^[\p{Script=Arabic}\p{M}\s.,،؛؟!ـ]+$/u;

export function buildLearningVoiceRequest(
  profileValue: unknown,
  textValue: unknown,
  deliveryValue: unknown,
  paceValue: unknown,
  environment: Record<string, string | undefined> = process.env,
): LearningVoiceRequest {
  if (!LEARNING_VOICE_PROFILES.includes(profileValue as LearningVoiceProfile)) {
    throw new Error("INVALID_VOICE_PROFILE");
  }
  if (typeof textValue !== "string") throw new Error("INVALID_VOICE_TEXT");

  const profile = profileValue as LearningVoiceProfile;
  const delivery = (deliveryValue
    ?? (profile === "MURSHID_TR" ? "COACH" : "QURAN_RECITATION")) as LearningVoiceDelivery;
  const pace = (paceValue
    ?? (profile === "MURSHID_TR" ? "NATURAL" : "LEARNING")) as LearningVoicePace;
  if (!LEARNING_VOICE_DELIVERIES.includes(delivery)) throw new Error("INVALID_VOICE_DELIVERY");
  if (!LEARNING_VOICE_PACES.includes(pace)) throw new Error("INVALID_VOICE_PACE");
  if (profile === "MURSHID_TR" && delivery !== "COACH") {
    throw new Error("INVALID_VOICE_DELIVERY");
  }
  if (profile === "QURAN_AR" && delivery === "COACH") {
    throw new Error("INVALID_VOICE_DELIVERY");
  }

  const text = textValue.trim().replace(/\s+/g, " ");
  const maxLength = profile === "MURSHID_TR" ? TURKISH_MAX_LENGTH : ARABIC_MAX_LENGTH;
  if (!text || text.length > maxLength || /[\u0000-\u001F\u007F]/u.test(text)) {
    throw new Error("INVALID_VOICE_TEXT");
  }
  if (/https?:\/\/|www\./iu.test(text)) throw new Error("INVALID_VOICE_TEXT");
  if (profile === "QURAN_AR" && (!ARABIC_TEXT.test(text) || !/\p{Script=Arabic}/u.test(text))) {
    throw new Error("INVALID_VOICE_TEXT");
  }

  const model = environment.HAFIZ_TTS_MODEL?.trim() || "gpt-4o-mini-tts-2025-12-15";
  const voice = resolveVoice(profile, environment);
  const instructions = buildInstructions(profile, delivery, pace);
  const voiceIdentity = typeof voice === "string" ? voice : voice.id;
  const cacheKey = createHash("sha256")
    .update(JSON.stringify({
      version: 3,
      model,
      voice: voiceIdentity,
      profile,
      delivery,
      pace,
      instructions,
      text,
    }), "utf8")
    .digest("hex");

  return { profile, delivery, pace, text, model, voice, instructions, cacheKey };
}

function resolveVoice(
  profile: LearningVoiceProfile,
  environment: Record<string, string | undefined>,
): LearningVoice {
  const customVoiceID = profile === "MURSHID_TR"
    ? environment.HAFIZ_MURSHID_CUSTOM_VOICE_ID?.trim()
    : environment.HAFIZ_QURAN_CUSTOM_VOICE_ID?.trim();
  if (customVoiceID) return { id: customVoiceID };
  return profile === "MURSHID_TR"
    ? environment.HAFIZ_MURSHID_VOICE?.trim() || "marin"
    : environment.HAFIZ_QURAN_VOICE?.trim() || "cedar";
}

function buildInstructions(
  profile: LearningVoiceProfile,
  delivery: LearningVoiceDelivery,
  pace: LearningVoicePace,
): string {
  if (profile === "MURSHID_TR") {
    return [
      "Speak as Mürşid, a warm, experienced Turkish teacher talking naturally to one learner.",
      "Use contemporary Istanbul Turkish, studio-clean diction, gentle confidence, and sincere warmth.",
      "Sound like a real human educator, not an announcer, cartoon, assistant, or synthetic voice.",
      "Use small natural variations in emphasis and breathing; avoid sing-song rhythm and exaggerated cheerfulness.",
      "Keep sentences conversational with short meaningful pauses and pronounce Arabic words carefully when present.",
      "Read exactly the supplied text without adding an introduction, explanation, sound effect, or repetition.",
    ].join(" ");
  }

  const deliveryInstruction: Record<Exclude<LearningVoiceDelivery, "COACH">, string> = {
    LETTER_NAME: [
      "This is an isolated Arabic letter name for an Elif-Ba lesson.",
      "Say the complete letter name once, clearly and naturally, preserving every written vowel and final consonant.",
    ].join(" "),
    VOWEL_SOUND: [
      "This is a single Arabic letter with a vowel mark.",
      "Produce only its short target sound once; do not turn it into the full name of the letter and do not lengthen a short vowel.",
    ].join(" "),
    QURAN_RECITATION: [
      "This is a Qur'anic reading example for a learner.",
      "Use a calm educational murattal delivery, joining and stopping naturally while preserving the supplied vowel marks.",
    ].join(" "),
  };
  const paceInstruction: Record<LearningVoicePace, string> = {
    SLOW: "Use a deliberately slow teaching tempo with clean articulation, but never digitally stretch vowels or consonants.",
    LEARNING: "Use a measured teacher tempo: clear enough to imitate while remaining fully natural.",
    NATURAL: "Use a fluent natural recitation tempo with precise articulation.",
  };
  return [
    "Speak as a qualified native Arabic Qur'an and Elif-Ba teacher demonstrating one exact target.",
    "Use precise makharij and sifaat, a stable adult voice, clean studio diction, and no synthetic cadence.",
    deliveryInstruction[delivery as Exclude<LearningVoiceDelivery, "COACH">],
    paceInstruction[pace],
    "Read only the supplied Arabic text. Do not translate, explain, spell, add words, add music, chant theatrically, or repeat.",
  ].join(" ");
}
