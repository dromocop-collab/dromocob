import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateQuranDatasetChecksum,
  type QuranDataset,
  validateQuranDataset,
} from "../lib/hafiz/quran-schema.ts";

function verifiedFixture(): QuranDataset {
  const dataset: QuranDataset = {
    schemaVersion: 1,
    edition: {
      id: "test-verified-edition",
      name: "Test doğrulama edition'ı",
      language: "ar",
      script: "uthmani-test",
      expectedPageCount: 3,
      expectedSurahCount: 1,
      expectedJuzCount: 1,
      contentChecksum: "0".repeat(64),
      source: {
        publisher: "Test Publisher",
        sourceUrl: "https://example.test/quran-dataset",
        license: "TEST-ONLY",
        version: "1.0.0",
        verificationAuthority: "Test Authority",
        verificationDate: "2026-09-27",
        approvalReference: "TEST-APPROVAL-1",
      },
    },
    juzs: [{ number: 1, startAyahId: "1:1", endAyahId: "1:3", startPage: 1, endPage: 3 }],
    surahs: [{ number: 1, name: "Test", ayahCount: 3, startPage: 1, endPage: 3 }],
    pages: [
      { pageNumber: 1, juzNumbers: [1], ayahIds: ["1:1"] },
      { pageNumber: 2, juzNumbers: [1], ayahIds: ["1:2"] },
      { pageNumber: 3, juzNumbers: [1], ayahIds: ["1:3"] },
    ],
    ayahs: [
      { id: "1:1", surahNumber: 1, ayahNumber: 1, juzNumber: 1, pageNumber: 1, text: "TEST ONLY 1" },
      { id: "1:2", surahNumber: 1, ayahNumber: 2, juzNumber: 1, pageNumber: 2, text: "TEST ONLY 2" },
      { id: "1:3", surahNumber: 1, ayahNumber: 3, juzNumber: 1, pageNumber: 3, text: "TEST ONLY 3" },
    ],
  };
  dataset.edition.contentChecksum = calculateQuranDatasetChecksum(dataset);
  return dataset;
}

test("approved structurally consistent dataset validates", () => {
  const report = validateQuranDataset(verifiedFixture());
  assert.equal(report.valid, true);
  assert.deepEqual(report.errors, []);
  assert.equal(report.stats.pages, 3);
});

test("missing page and duplicate canonical ayah are detected", () => {
  const dataset = verifiedFixture();
  dataset.pages = [dataset.pages[0], dataset.pages[2]];
  dataset.ayahs[2] = { ...dataset.ayahs[2], id: "1:2" };
  dataset.edition.contentChecksum = calculateQuranDatasetChecksum(dataset);
  const report = validateQuranDataset(dataset);
  assert.equal(report.valid, false);
  assert.ok(report.errors.some(error => error.includes("Eksik sayfa: 2")));
  assert.ok(report.errors.some(error => error.includes("tekrar")));
});

test("checksum mismatch blocks import validation", () => {
  const dataset = verifiedFixture();
  dataset.ayahs[0].text = "CHANGED TEST TEXT";
  const report = validateQuranDataset(dataset);
  assert.equal(report.valid, false);
  assert.ok(report.errors.some(error => error.includes("contentChecksum")));
});
