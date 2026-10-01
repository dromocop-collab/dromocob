import assert from "node:assert/strict";
import test from "node:test";

import { buildLearningVoiceRequest } from "../lib/hafiz/learning-voice-policy.ts";

test("Mürşid uses a locked natural Turkish profile", () => {
  const request = buildLearningVoiceRequest("MURSHID_TR", "  Harika!   Bir daha deneyelim.  ", {});
  assert.equal(request.text, "Harika! Bir daha deneyelim.");
  assert.equal(request.model, "gpt-4o-mini-tts");
  assert.equal(request.voice, "marin");
  assert.match(request.instructions, /natural Istanbul Turkish/);
});

test("Quran letters use a separate precise Arabic profile", () => {
  const request = buildLearningVoiceRequest("QURAN_AR", "بِ", {});
  assert.equal(request.voice, "cedar");
  assert.match(request.instructions, /makharij/);
  assert.notEqual(
    request.cacheKey,
    buildLearningVoiceRequest("MURSHID_TR", "بِ", {}).cacheKey,
  );
});

test("invalid or abusive voice input is rejected", () => {
  assert.throws(() => buildLearningVoiceRequest("QURAN_AR", "hello", {}));
  assert.throws(() => buildLearningVoiceRequest("MURSHID_TR", "https://example.test", {}));
  assert.throws(() => buildLearningVoiceRequest("OTHER", "Merhaba", {}));
});
