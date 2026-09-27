import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import {
  calculateQuranDatasetChecksum,
  type QuranAyahInput,
  type QuranDataset,
} from "../../lib/hafiz/quran-schema.ts";

const TEXT_URL = "https://tanzil.net/pub/download/index.php?quranType=uthmani&outType=xml&agree=true";
const METADATA_URL = "https://tanzil.net/res/text/metadata/quran-data.xml";
const DEFAULT_OUTPUT = resolve(process.cwd(), "hafiz-quran-tanzil-uthmani-1.1.json");

const outputPath = resolve(process.argv[2] || DEFAULT_OUTPUT);
const approvalReference = process.env.HAFIZ_QURAN_APPROVAL_REFERENCE?.trim()
  || "DROMOCOB-HAFIZ-QURAN-OWNER-APPROVAL-2026-09-27";

const [textXML, metadataXML] = await Promise.all([
  download(TEXT_URL),
  download(METADATA_URL),
]);

assertSourceVersion(textXML, "Tanzil Quran Text (Uthmani, Version 1.1)");
assertSourceVersion(metadataXML, '<quran type="metadata" version="1.0"');

const ayahs = parseAyahs(textXML);
const metadata = parseMetadata(metadataXML);
const globalIndexByID = new Map(ayahs.map((ayah, index) => [ayah.id, index]));
const pageMarkers = markersWithIndexes(metadata.pages, globalIndexByID, "sayfa");
const juzMarkers = markersWithIndexes(metadata.juzs, globalIndexByID, "cüz");

assignLocation(ayahs, pageMarkers, "pageNumber");
assignLocation(ayahs, juzMarkers, "juzNumber");

const pages = Array.from({ length: 604 }, (_, offset) => {
  const pageNumber = offset + 1;
  const members = ayahs.filter(ayah => ayah.pageNumber === pageNumber);
  if (members.length === 0) throw new Error(`Tanzil metadata'sında ${pageNumber}. sayfa boş.`);
  return {
    pageNumber,
    juzNumbers: [...new Set(members.map(ayah => ayah.juzNumber))].sort((left, right) => left - right),
    ayahIds: members.map(ayah => ayah.id),
  };
});

const surahs = metadata.surahs.map(surah => {
  const members = ayahs.filter(ayah => ayah.surahNumber === surah.number);
  return {
    number: surah.number,
    name: surah.name,
    ayahCount: surah.ayahCount,
    startPage: Math.min(...members.map(ayah => ayah.pageNumber)),
    endPage: Math.max(...members.map(ayah => ayah.pageNumber)),
  };
});

const juzs = Array.from({ length: 30 }, (_, offset) => {
  const number = offset + 1;
  const members = ayahs.filter(ayah => ayah.juzNumber === number);
  if (members.length === 0) throw new Error(`Tanzil metadata'sında ${number}. cüz boş.`);
  return {
    number,
    startAyahId: members[0].id,
    endAyahId: members.at(-1)!.id,
    startPage: Math.min(...members.map(ayah => ayah.pageNumber)),
    endPage: Math.max(...members.map(ayah => ayah.pageNumber)),
  };
});

const dataset: QuranDataset = {
  schemaVersion: 1,
  edition: {
    id: "tanzil-uthmani-hafs-1.1-2026-09-27",
    name: "Medine Mushafı — Uthmani Hafs",
    language: "ar",
    script: "Uthmani",
    expectedPageCount: 604,
    expectedSurahCount: 114,
    expectedJuzCount: 30,
    contentChecksum: "",
    source: {
      publisher: "Tanzil Project",
      sourceUrl: "https://tanzil.net/download/",
      license: "Creative Commons Attribution 3.0; verbatim text, Tanzil attribution required",
      version: "Uthmani 1.1 + Quran metadata 1.0",
      verificationAuthority: "Tanzil Project Quran specialists; verified against Medina Mushaf",
      verificationDate: "2026-09-27",
      approvalReference,
    },
  },
  juzs,
  surahs,
  pages,
  ayahs,
};

dataset.edition.contentChecksum = calculateQuranDatasetChecksum(dataset);
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(dataset)}\n`, "utf8");

console.log(JSON.stringify({
  outputPath,
  checksum: dataset.edition.contentChecksum,
  stats: {
    juzs: dataset.juzs.length,
    surahs: dataset.surahs.length,
    pages: dataset.pages.length,
    ayahs: dataset.ayahs.length,
  },
  provenance: dataset.edition.source,
}, null, 2));

async function download(url: string): Promise<string> {
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) throw new Error(`${url} indirilemedi: HTTP ${response.status}`);
  return response.text();
}

function assertSourceVersion(source: string, marker: string) {
  if (!source.includes(marker)) throw new Error(`Beklenen Tanzil kaynak sürümü bulunamadı: ${marker}`);
}

function parseAyahs(xml: string): QuranAyahInput[] {
  const values: QuranAyahInput[] = [];
  const surahPattern = /<sura\s+([^>]*)>([\s\S]*?)<\/sura>/g;
  for (const match of xml.matchAll(surahPattern)) {
    const surahAttributes = attributes(match[1]);
    const surahNumber = requiredInteger(surahAttributes.index, "sura.index");
    const ayahPattern = /<aya\s+([^>]*)\/>/g;
    for (const ayahMatch of match[2].matchAll(ayahPattern)) {
      const ayahAttributes = attributes(ayahMatch[1]);
      const ayahNumber = requiredInteger(ayahAttributes.index, "aya.index");
      const text = requiredText(ayahAttributes.text, `aya ${surahNumber}:${ayahNumber} text`);
      values.push({
        id: `${surahNumber}:${ayahNumber}`,
        surahNumber,
        ayahNumber,
        juzNumber: 0,
        pageNumber: 0,
        text,
      });
    }
  }
  if (values.length !== 6236) throw new Error(`Tanzil metninde 6236 yerine ${values.length} ayet bulundu.`);
  return values;
}

function parseMetadata(xml: string) {
  const surahSection = requiredSection(xml, "suras");
  const juzSection = requiredSection(xml, "juzs");
  const pageSection = requiredSection(xml, "pages");
  const surahs = [...surahSection.matchAll(/<sura\s+([^>]*)\/>/g)].map(match => {
    const value = attributes(match[1]);
    return {
      number: requiredInteger(value.index, "metadata sura.index"),
      name: requiredText(value.name, "metadata sura.name"),
      ayahCount: requiredInteger(value.ayas, "metadata sura.ayas"),
    };
  });
  const juzs = parseMarkers(juzSection, "juz");
  const pages = parseMarkers(pageSection, "page");
  if (surahs.length !== 114 || juzs.length !== 30 || pages.length !== 604) {
    throw new Error(`Tanzil metadata sayıları geçersiz: ${surahs.length} sure, ${juzs.length} cüz, ${pages.length} sayfa.`);
  }
  return { surahs, juzs, pages };
}

function parseMarkers(section: string, tag: "juz" | "page") {
  return [...section.matchAll(new RegExp(`<${tag}\\s+([^>]*)\\/>`, "g"))].map(match => {
    const value = attributes(match[1]);
    return {
      number: requiredInteger(value.index, `${tag}.index`),
      ayahID: `${requiredInteger(value.sura, `${tag}.sura`)}:${requiredInteger(value.aya, `${tag}.aya`)}`,
    };
  });
}

function markersWithIndexes(
  markers: Array<{ number: number; ayahID: string }>,
  globalIndexByID: Map<string, number>,
  label: string,
) {
  return markers.map(marker => {
    const globalIndex = globalIndexByID.get(marker.ayahID);
    if (globalIndex === undefined) throw new Error(`${label} başlangıç ayeti bulunamadı: ${marker.ayahID}`);
    return { ...marker, globalIndex };
  }).sort((left, right) => left.globalIndex - right.globalIndex);
}

function assignLocation(
  ayahs: QuranAyahInput[],
  markers: Array<{ number: number; globalIndex: number }>,
  field: "pageNumber" | "juzNumber",
) {
  let markerIndex = 0;
  ayahs.forEach((ayah, globalIndex) => {
    while (markerIndex + 1 < markers.length && markers[markerIndex + 1].globalIndex <= globalIndex) markerIndex += 1;
    ayah[field] = markers[markerIndex].number;
  });
}

function requiredSection(xml: string, tag: string) {
  const match = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`));
  if (!match) throw new Error(`Tanzil metadata bölümü bulunamadı: ${tag}`);
  return match[1];
}

function attributes(raw: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const match of raw.matchAll(/([\w-]+)="([^"]*)"/g)) result[match[1]] = decodeXML(match[2]);
  return result;
}

function decodeXML(value: string) {
  return value.replace(/&(#x[0-9a-f]+|#\d+|amp|quot|apos|lt|gt);/gi, (_, entity: string) => {
    if (entity.startsWith("#x")) return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
    if (entity.startsWith("#")) return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
    return ({ amp: "&", quot: '"', apos: "'", lt: "<", gt: ">" } as Record<string, string>)[entity.toLowerCase()];
  });
}

function requiredInteger(value: string | undefined, label: string) {
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 1) throw new Error(`${label} pozitif tam sayı olmalıdır.`);
  return number;
}

function requiredText(value: string | undefined, label: string) {
  if (!value) throw new Error(`${label} boş olamaz.`);
  return value;
}
