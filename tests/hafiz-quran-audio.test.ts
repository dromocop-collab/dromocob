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
