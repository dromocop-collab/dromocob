import assert from "node:assert/strict";
import test from "node:test";

import {
  bundledLetterRecordingPath,
  bundledVowelRecordingPath,
  humanLetterRecordingURL,
  learningVoiceCachePath,
  parseLearningVoiceRequest,
  quranSearchURL,
  quranWordAudioURL,
} from "../lib/hafiz/learning-voice-policy.ts";

test("letter lessons resolve to bundled real-teacher recordings", () => {
  const request = parseLearningVoiceRequest({ profile: "QURAN_AR", text: "أَلِفْ",
    delivery: "LETTER_NAME", pace: "SLOW" });
  assert.equal(bundledLetterRecordingPath(request),
    "public/hafiz/qaida-audio/letter_alif.mp3");
});

test("Quran words resolve to Quran Foundation word-by-word human audio", () => {
  const request = parseLearningVoiceRequest({ profile: "QURAN_AR", text: "كَتَبَ",
    delivery: "QURAN_RECITATION", pace: "LEARNING" });
  const payload = { search: { results: [{ verse_key: "58:21", words: [
    { char_type: "word", text: "كَتَبَ", highlight: true },
    { char_type: "word", text: "ٱللَّهُ" },
  ] }] } };
  assert.equal(quranWordAudioURL(request, payload)?.href,
    "https://audio.qurancdn.com/wbw/058_021_001.mp3");
});

test("isolated vowel sounds resolve to bundled real-teacher recordings", () => {
  const request = parseLearningVoiceRequest({ profile: "QURAN_AR", text: "بِ",
    delivery: "VOWEL_SOUND", pace: "SLOW" });
  assert.equal(bundledVowelRecordingPath(request),
    "public/hafiz/qaida-audio/kasra_bi.mp3");
  assert.equal(quranWordAudioURL(request, { search: { results: [] } }), null);
  assert.equal(humanLetterRecordingURL(request), null);
});

test("unsupported vowel sounds never fall back to a wrong recording", () => {
  const request = parseLearningVoiceRequest({ profile: "QURAN_AR", text: "جِ",
    delivery: "VOWEL_SOUND", pace: "SLOW" });
  assert.equal(bundledVowelRecordingPath(request), null);
});

test("search URL encodes Arabic and uses the public Quran word index", () => {
  assert.equal(quranSearchURL("بِسْمِ").searchParams.get("q"), "بِسْمِ");
});

test("learning voice rejects cross-profile delivery and oversized text", () => {
  assert.throws(() => parseLearningVoiceRequest({ profile: "MURSHID_TR", text: "أَلِف",
    delivery: "LETTER_NAME", pace: "SLOW" }));
  assert.throws(() => parseLearningVoiceRequest({ profile: "QURAN_AR", text: "x".repeat(121),
    delivery: "QURAN_RECITATION", pace: "NATURAL" }));
});

test("cache identity changes by text, voice role and pace", () => {
  const base = parseLearningVoiceRequest({ profile: "QURAN_AR", text: "بَاء",
    delivery: "LETTER_NAME", pace: "LEARNING" });
  const same = learningVoiceCachePath(base);
  assert.equal(same, learningVoiceCachePath({ ...base }));
  assert.notEqual(same, learningVoiceCachePath({ ...base, text: "تَاء" }));
  assert.notEqual(same, learningVoiceCachePath({ ...base, pace: "SLOW" }));
});
