import { createHash } from "node:crypto";

export const LEARNING_VOICE_PROFILES = ["MURSHID_TR", "QURAN_AR"] as const;
export type LearningVoiceProfile = (typeof LEARNING_VOICE_PROFILES)[number];

export type LearningVoiceRequest = {
  profile: LearningVoiceProfile;
  text: string;
  model: string;
  voice: string;
  instructions: string;
  cacheKey: string;
};

const TURKISH_MAX_LENGTH = 280;
const ARABIC_MAX_LENGTH = 80;
const ARABIC_TEXT = /^[\p{Script=Arabic}\p{M}\s.,،؛؟!ـ]+$/u;

export function buildLearningVoiceRequest(
  profileValue: unknown,
  textValue: unknown,
  environment: Record<string, string | undefined> = process.env,
): LearningVoiceRequest {
  if (!LEARNING_VOICE_PROFILES.includes(profileValue as LearningVoiceProfile)) {
    throw new Error("INVALID_VOICE_PROFILE");
  }
  if (typeof textValue !== "string") throw new Error("INVALID_VOICE_TEXT");

  const profile = profileValue as LearningVoiceProfile;
  const text = textValue.trim().replace(/\s+/g, " ");
  const maxLength = profile === "MURSHID_TR" ? TURKISH_MAX_LENGTH : ARABIC_MAX_LENGTH;
  if (!text || text.length > maxLength || /[\u0000-\u001F\u007F]/u.test(text)) {
    throw new Error("INVALID_VOICE_TEXT");
  }
  if (/https?:\/\/|www\./iu.test(text)) throw new Error("INVALID_VOICE_TEXT");
  if (profile === "QURAN_AR" && (!ARABIC_TEXT.test(text) || !/\p{Script=Arabic}/u.test(text))) {
    throw new Error("INVALID_VOICE_TEXT");
  }

  const model = environment.HAFIZ_TTS_MODEL?.trim() || "gpt-4o-mini-tts";
  const voice = profile === "MURSHID_TR"
    ? environment.HAFIZ_MURSHID_VOICE?.trim() || "marin"
    : environment.HAFIZ_QURAN_VOICE?.trim() || "cedar";
  const instructions = profile === "MURSHID_TR"
    ? [
        "Speak in natural Istanbul Turkish as Mürşid, a kind and reassuring owl teacher for children.",
        "Use a warm, lively, premium audiobook tone with clear diction and gentle encouragement.",
        "Keep the pace calm and conversational; never sound robotic, theatrical, or exaggerated.",
      ].join(" ")
    : [
        "Pronounce only the supplied Arabic text as an expert Qur'an and Elif-Ba teacher.",
        "Use precise Modern Standard Arabic articulation, clear makharij, and a calm natural teaching voice.",
        "Do not translate, explain, sing, add words, or repeat the text.",
      ].join(" ");
  const cacheKey = createHash("sha256")
    .update(JSON.stringify({ version: 1, model, voice, profile, instructions, text }), "utf8")
    .digest("hex");

  return { profile, text, model, voice, instructions, cacheKey };
}
