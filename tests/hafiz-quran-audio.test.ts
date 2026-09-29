import assert from "node:assert/strict";
import test from "node:test";

import { buildAssignmentRecitation } from "../lib/hafiz/quran-audio.ts";

test("assignment recitation follows the exact authorized ayah order", () => {
  const value = buildAssignmentRecitation([
    { id: "2:62", surahNumber: 2, ayahNumber: 62 },
    { id: "2:63", surahNumber: 2, ayahNumber: 63 },
  ]);
  assert.equal(value.reciterId, "ALAFASY");
  assert.deepEqual(value.tracks, [
    {
      ayahId: "2:62",
      url: "https://verses.quran.foundation/Alafasy/mp3/002062.mp3",
    },
    {
      ayahId: "2:63",
      url: "https://verses.quran.foundation/Alafasy/mp3/002063.mp3",
    },
  ]);
});

test("invalid canonical Quran identifiers cannot produce an audio URL", () => {
  assert.throws(() => buildAssignmentRecitation([
    { id: "0:1", surahNumber: 0, ayahNumber: 1 },
  ]));
});

test("licensed custom Quran audio CDN can replace the default provider path", () => {
  const previous = process.env.HAFIZ_QURAN_AUDIO_BASE_URL;
  process.env.HAFIZ_QURAN_AUDIO_BASE_URL = "https://audio.example.test/hafiz/";
  try {
    const value = buildAssignmentRecitation([
      { id: "1:1", surahNumber: 1, ayahNumber: 1 },
    ]);
    assert.equal(value.tracks[0].url, "https://audio.example.test/hafiz/001001.mp3");
  } finally {
    if (previous === undefined) delete process.env.HAFIZ_QURAN_AUDIO_BASE_URL;
    else process.env.HAFIZ_QURAN_AUDIO_BASE_URL = previous;
  }
});
