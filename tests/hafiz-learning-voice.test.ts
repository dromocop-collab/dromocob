import assert from "node:assert/strict";
import test from "node:test";

import { buildLearningVoiceRequest } from "../lib/hafiz/learning-voice-policy.ts";

test("Mürşid uses a locked natural Turkish profile", () => {
  const request = buildLearningVoiceRequest(
    "MURSHID_TR",
    "  Harika!   Bir daha deneyelim.  ",
    "COACH",
    "NATURAL",
    {},
  );
  assert.equal(request.text, "Harika! Bir daha deneyelim.");
  assert.equal(request.model, "gpt-4o-mini-tts-2025-12-15");
  assert.equal(request.voice, "marin");
  assert.match(request.instructions, /real human educator/);
});

test("Quran letters use a separate precise Arabic profile", () => {
  const request = buildLearningVoiceRequest("QURAN_AR", "بِ", "VOWEL_SOUND", "SLOW", {});
  assert.equal(request.voice, "cedar");
  assert.match(request.instructions, /makharij/);
  assert.match(request.instructions, /do not turn it into the full name/);
  assert.match(request.instructions, /never digitally stretch/);
  assert.notEqual(
    request.cacheKey,
    buildLearningVoiceRequest("QURAN_AR", "بِ", "VOWEL_SOUND", "NATURAL", {}).cacheKey,
  );
});

test("consented studio teacher voices can replace built-in voices", () => {
  const request = buildLearningVoiceRequest(
    "QURAN_AR",
    "بَاءْ",
    "LETTER_NAME",
    "LEARNING",
    { HAFIZ_QURAN_CUSTOM_VOICE_ID: "voice_quran_teacher" },
  );
  assert.deepEqual(request.voice, { id: "voice_quran_teacher" });
  assert.match(request.instructions, /complete letter name once/);
});

test("invalid or abusive voice input is rejected", () => {
  assert.throws(() => buildLearningVoiceRequest("QURAN_AR", "hello", "VOWEL_SOUND", "SLOW", {}));
  assert.throws(() => buildLearningVoiceRequest("MURSHID_TR", "https://example.test", "COACH", "NATURAL", {}));
  assert.throws(() => buildLearningVoiceRequest("OTHER", "Merhaba", "COACH", "NATURAL", {}));
  assert.throws(() => buildLearningVoiceRequest("QURAN_AR", "بِ", "COACH", "LEARNING", {}));
  assert.throws(() => buildLearningVoiceRequest("QURAN_AR", "بِ", "VOWEL_SOUND", "TURBO", {}));
});
