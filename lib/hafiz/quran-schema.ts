import { createHash } from "node:crypto";

export type QuranSourceMetadata = {
  publisher: string;
  sourceUrl: string;
  license: string;
  version: string;
  verificationAuthority: string;
  verificationDate: string;
  approvalReference: string;
};

export type QuranEditionInput = {
  id: string;
  name: string;
  language: string;
  script: string;
  expectedPageCount: number;
  expectedSurahCount: number;
  expectedJuzCount: number;
  contentChecksum: string;
  source: QuranSourceMetadata;
};

export type QuranJuzInput = {
  number: number;
  startAyahId: string;
  endAyahId: string;
  startPage: number;
  endPage: number;
};

export type QuranSurahInput = {
  number: number;
  name: string;
  ayahCount: number;
  startPage: number;
  endPage: number;
};

export type QuranPageInput = {
  pageNumber: number;
  juzNumbers: number[];
  ayahIds: string[];
};

export type QuranAyahInput = {
  id: string;
  surahNumber: number;
  ayahNumber: number;
  juzNumber: number;
  pageNumber: number;
  text: string;
};

export type QuranDataset = {
  schemaVersion: 1;
  edition: QuranEditionInput;
  juzs: QuranJuzInput[];
  surahs: QuranSurahInput[];
  pages: QuranPageInput[];
  ayahs: QuranAyahInput[];
};

export type QuranValidationReport = {
  valid: boolean;
  errors: string[];
  warnings: string[];
  calculatedChecksum: string | null;
  stats: {
    juzs: number;
    surahs: number;
    pages: number;
    ayahs: number;
  };
  dataset?: QuranDataset;
};

export function validateQuranDataset(input: unknown): QuranValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const root = record(input);
  if (!root) return invalidReport(["Veri kümesi bir JSON nesnesi olmalıdır."]);

  const edition = parseEdition(root.edition, errors);
  const juzs = parseArray<QuranJuzInput>(root.juzs, "juzs", errors, parseJuz);
  const surahs = parseArray<QuranSurahInput>(root.surahs, "surahs", errors, parseSurah);
  const pages = parseArray<QuranPageInput>(root.pages, "pages", errors, parsePage);
  const ayahs = parseArray<QuranAyahInput>(root.ayahs, "ayahs", errors, parseAyah);
  if (root.schemaVersion !== 1) errors.push("schemaVersion yalnızca 1 olabilir.");

  if (!edition || !juzs || !surahs || !pages || !ayahs) {
    return invalidReport(errors, { juzs, surahs, pages, ayahs });
  }

  validateEditionSource(edition, errors);
  validateUniqueNumbers("Cüz", juzs.map(item => item.number), errors);
  validateUniqueNumbers("Sure", surahs.map(item => item.number), errors);
  validateUniqueNumbers("Sayfa", pages.map(item => item.pageNumber), errors);
  validateUniqueStrings("Ayet", ayahs.map(item => item.id), errors);
  validateExpectedSequence("Cüz", juzs.map(item => item.number), edition.expectedJuzCount, errors);
  validateExpectedSequence("Sure", surahs.map(item => item.number), edition.expectedSurahCount, errors);

  if (juzs.length !== edition.expectedJuzCount) {
    errors.push(`Cüz sayısı ${edition.expectedJuzCount} yerine ${juzs.length}.`);
  }
  if (surahs.length !== edition.expectedSurahCount) {
    errors.push(`Sure sayısı ${edition.expectedSurahCount} yerine ${surahs.length}.`);
  }
  if (pages.length !== edition.expectedPageCount) {
    errors.push(`Sayfa sayısı ${edition.expectedPageCount} yerine ${pages.length}.`);
  }

  const pageByNumber = new Map(pages.map(page => [page.pageNumber, page]));
  for (let number = 1; number <= edition.expectedPageCount; number += 1) {
    if (!pageByNumber.has(number)) errors.push(`Eksik sayfa: ${number}.`);
  }

  const ayahByID = new Map(ayahs.map(ayah => [ayah.id, ayah]));
  const pageReferences = new Map<string, number>();
  for (const page of pages) {
    validateUniqueStrings(`Sayfa ${page.pageNumber} ayet`, page.ayahIds, errors);
    for (const ayahID of page.ayahIds) {
      const ayah = ayahByID.get(ayahID);
      if (!ayah) {
        errors.push(`Sayfa ${page.pageNumber} bilinmeyen ayete referans veriyor: ${ayahID}.`);
        continue;
      }
      if (ayah.pageNumber !== page.pageNumber) {
        errors.push(`${ayahID} ayeti sayfa ${ayah.pageNumber} kaydında, fakat ${page.pageNumber} sayfasında listelenmiş.`);
      }
      pageReferences.set(ayahID, (pageReferences.get(ayahID) || 0) + 1);
    }
    const actualJuzs = [...new Set(page.ayahIds.map(id => ayahByID.get(id)?.juzNumber).filter(
      (number): number is number => number !== undefined,
    ))].sort((left, right) => left - right);
    const declaredJuzs = [...new Set(page.juzNumbers)].sort((left, right) => left - right);
    if (JSON.stringify(actualJuzs) !== JSON.stringify(declaredJuzs)) {
      errors.push(`Sayfa ${page.pageNumber} cüz bilgisi ayetlerle eşleşmiyor.`);
    }
  }
  for (const ayah of ayahs) {
    if (ayah.id !== `${ayah.surahNumber}:${ayah.ayahNumber}`) {
      errors.push(`Kararsız ayet kimliği: ${ayah.id}; beklenen ${ayah.surahNumber}:${ayah.ayahNumber}.`);
    }
    if (!pageByNumber.has(ayah.pageNumber)) errors.push(`${ayah.id} eksik sayfa ${ayah.pageNumber} değerine bağlı.`);
    if ((pageReferences.get(ayah.id) || 0) !== 1) {
      errors.push(`${ayah.id} tam olarak bir sayfada listelenmelidir.`);
    }
  }

  for (const surah of surahs) {
    const members = ayahs
      .filter(ayah => ayah.surahNumber === surah.number)
      .sort((left, right) => left.ayahNumber - right.ayahNumber);
    if (members.length !== surah.ayahCount) {
      errors.push(`${surah.number}. sure ayet sayısı ${surah.ayahCount} yerine ${members.length}.`);
    }
    members.forEach((ayah, index) => {
      if (ayah.ayahNumber !== index + 1) errors.push(`${surah.number}. surede eksik veya sırasız ayet var.`);
    });
    if (members.length > 0) {
      const memberPages = members.map(ayah => ayah.pageNumber);
      if (Math.min(...memberPages) !== surah.startPage || Math.max(...memberPages) !== surah.endPage) {
        errors.push(`${surah.number}. sure sayfa aralığı ayetlerle eşleşmiyor.`);
      }
    }
  }

  for (const juz of juzs) {
    const members = ayahs.filter(ayah => ayah.juzNumber === juz.number);
    if (members.length === 0) {
      errors.push(`${juz.number}. cüzde ayet bulunamadı.`);
      continue;
    }
    if (!ayahByID.has(juz.startAyahId) || !ayahByID.has(juz.endAyahId)) {
      errors.push(`${juz.number}. cüz başlangıç/bitiş ayet kimliği geçersiz.`);
    }
    const ordered = [...members].sort((left, right) =>
      left.surahNumber - right.surahNumber || left.ayahNumber - right.ayahNumber
    );
    if (ordered[0]?.id !== juz.startAyahId || ordered.at(-1)?.id !== juz.endAyahId) {
      errors.push(`${juz.number}. cüz başlangıç/bitiş ayetleri içerikle eşleşmiyor.`);
    }
    const memberPages = members.map(ayah => ayah.pageNumber);
    if (Math.min(...memberPages) !== juz.startPage || Math.max(...memberPages) !== juz.endPage) {
      errors.push(`${juz.number}. cüz sayfa aralığı ayetlerle eşleşmiyor.`);
    }
  }

  const dataset: QuranDataset = {
    schemaVersion: 1,
    edition,
    juzs,
    surahs,
    pages,
    ayahs,
  };
  const calculatedChecksum = calculateQuranDatasetChecksum(dataset);
  if (edition.contentChecksum.toLowerCase() !== calculatedChecksum) {
    errors.push("contentChecksum doğrulanmış veri kümesiyle eşleşmiyor.");
  }
  if (!edition.source.sourceUrl.startsWith("https://")) errors.push("Kaynak URL'si HTTPS olmalıdır.");

  return {
    valid: errors.length === 0,
    errors: unique(errors),
    warnings: unique(warnings),
    calculatedChecksum,
    stats: { juzs: juzs.length, surahs: surahs.length, pages: pages.length, ayahs: ayahs.length },
    dataset: errors.length === 0 ? dataset : undefined,
  };
}

export function calculateQuranDatasetChecksum(dataset: QuranDataset): string {
  const checksumInput = {
    ...dataset,
    edition: { ...dataset.edition, contentChecksum: "" },
  };
  return createHash("sha256").update(stableStringify(checksumInput), "utf8").digest("hex");
}

function parseEdition(value: unknown, errors: string[]): QuranEditionInput | null {
  const data = record(value);
  if (!data) {
    errors.push("edition nesnesi gerekli.");
    return null;
  }
  const source = record(data.source);
  if (!source) errors.push("edition.source nesnesi gerekli.");
  const result: QuranEditionInput = {
    id: stringValue(data.id),
    name: stringValue(data.name),
    language: stringValue(data.language),
    script: stringValue(data.script),
    expectedPageCount: integerValue(data.expectedPageCount),
    expectedSurahCount: integerValue(data.expectedSurahCount),
    expectedJuzCount: integerValue(data.expectedJuzCount),
    contentChecksum: stringValue(data.contentChecksum),
    source: {
      publisher: stringValue(source?.publisher),
      sourceUrl: stringValue(source?.sourceUrl),
      license: stringValue(source?.license),
      version: stringValue(source?.version),
      verificationAuthority: stringValue(source?.verificationAuthority),
      verificationDate: stringValue(source?.verificationDate),
      approvalReference: stringValue(source?.approvalReference),
    },
  };
  if (!/^[a-z0-9][a-z0-9._-]{2,79}$/.test(result.id)) errors.push("edition.id kararlı ve URL güvenli olmalıdır.");
  for (const [label, text] of Object.entries({ name: result.name, language: result.language, script: result.script })) {
    if (!text) errors.push(`edition.${label} gerekli.`);
  }
  if (result.expectedPageCount < 1 || result.expectedSurahCount < 1 || result.expectedJuzCount < 1) {
    errors.push("Edition beklenen yapısal sayıları pozitif olmalıdır.");
  }
  if (!/^[a-f0-9]{64}$/i.test(result.contentChecksum)) errors.push("contentChecksum SHA-256 olmalıdır.");
  return result;
}

function validateEditionSource(edition: QuranEditionInput, errors: string[]) {
  const required: Array<[string, string]> = [
    ["publisher", edition.source.publisher],
    ["sourceUrl", edition.source.sourceUrl],
    ["license", edition.source.license],
    ["version", edition.source.version],
    ["verificationAuthority", edition.source.verificationAuthority],
    ["verificationDate", edition.source.verificationDate],
    ["approvalReference", edition.source.approvalReference],
  ];
  required.forEach(([field, value]) => { if (!value) errors.push(`edition.source.${field} gerekli.`); });
  if (edition.source.verificationDate && Number.isNaN(Date.parse(edition.source.verificationDate))) {
    errors.push("edition.source.verificationDate ISO tarih olmalıdır.");
  }
}

function parseJuz(value: unknown, index: number, errors: string[]): QuranJuzInput | null {
  const data = record(value);
  if (!data) return invalidItem("juzs", index, errors);
  const item = {
    number: integerValue(data.number),
    startAyahId: stringValue(data.startAyahId),
    endAyahId: stringValue(data.endAyahId),
    startPage: integerValue(data.startPage),
    endPage: integerValue(data.endPage),
  };
  if (item.number < 1 || !item.startAyahId || !item.endAyahId || item.startPage < 1 || item.endPage < item.startPage) {
    errors.push(`juzs[${index}] yapısı geçersiz.`);
  }
  return item;
}

function parseSurah(value: unknown, index: number, errors: string[]): QuranSurahInput | null {
  const data = record(value);
  if (!data) return invalidItem("surahs", index, errors);
  const item = {
    number: integerValue(data.number),
    name: stringValue(data.name),
    ayahCount: integerValue(data.ayahCount),
    startPage: integerValue(data.startPage),
    endPage: integerValue(data.endPage),
  };
  if (item.number < 1 || !item.name || item.ayahCount < 1 || item.startPage < 1 || item.endPage < item.startPage) {
    errors.push(`surahs[${index}] yapısı geçersiz.`);
  }
  return item;
}

function parsePage(value: unknown, index: number, errors: string[]): QuranPageInput | null {
  const data = record(value);
  if (!data) return invalidItem("pages", index, errors);
  const juzNumbers = numberArray(data.juzNumbers);
  const ayahIds = stringArray(data.ayahIds);
  const item = { pageNumber: integerValue(data.pageNumber), juzNumbers, ayahIds };
  if (item.pageNumber < 1 || juzNumbers.length === 0 || ayahIds.length === 0) {
    errors.push(`pages[${index}] yapısı geçersiz.`);
  }
  return item;
}

function parseAyah(value: unknown, index: number, errors: string[]): QuranAyahInput | null {
  const data = record(value);
  if (!data) return invalidItem("ayahs", index, errors);
  const item = {
    id: stringValue(data.id),
    surahNumber: integerValue(data.surahNumber),
    ayahNumber: integerValue(data.ayahNumber),
    juzNumber: integerValue(data.juzNumber),
    pageNumber: integerValue(data.pageNumber),
    text: stringValue(data.text),
  };
  if (!item.id || item.surahNumber < 1 || item.ayahNumber < 1 || item.juzNumber < 1 || item.pageNumber < 1 || !item.text) {
    errors.push(`ayahs[${index}] yapısı geçersiz.`);
  }
  return item;
}

function parseArray<T>(
  value: unknown,
  label: string,
  errors: string[],
  parser: (item: unknown, index: number, errors: string[]) => T | null,
): T[] | null {
  if (!Array.isArray(value)) {
    errors.push(`${label} dizisi gerekli.`);
    return null;
  }
  return value.map((item, index) => parser(item, index, errors)).filter((item): item is T => item !== null);
}

function validateUniqueNumbers(label: string, values: number[], errors: string[]) {
  if (new Set(values).size !== values.length) errors.push(`${label} numaralarında tekrar var.`);
}

function validateUniqueStrings(label: string, values: string[], errors: string[]) {
  if (new Set(values).size !== values.length) errors.push(`${label} kimliklerinde tekrar var.`);
}

function validateExpectedSequence(label: string, values: number[], expected: number, errors: string[]) {
  const actual = new Set(values);
  for (let number = 1; number <= expected; number += 1) {
    if (!actual.has(number)) errors.push(`Eksik ${label.toLocaleLowerCase("tr-TR")}: ${number}.`);
  }
}

function invalidReport(
  errors: string[],
  values: { juzs?: QuranJuzInput[] | null; surahs?: QuranSurahInput[] | null; pages?: QuranPageInput[] | null; ayahs?: QuranAyahInput[] | null } = {},
): QuranValidationReport {
  return {
    valid: false,
    errors: unique(errors),
    warnings: [],
    calculatedChecksum: null,
    stats: {
      juzs: values.juzs?.length || 0,
      surahs: values.surahs?.length || 0,
      pages: values.pages?.length || 0,
      ayahs: values.ayahs?.length || 0,
    },
  };
}

function invalidItem<T>(label: string, index: number, errors: string[]): T | null {
  errors.push(`${label}[${index}] nesne olmalıdır.`);
  return null;
}

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function integerValue(value: unknown): number {
  return typeof value === "number" && Number.isSafeInteger(value) ? value : 0;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) && value.every(item => typeof item === "string") ? value : [];
}

function numberArray(value: unknown): number[] {
  return Array.isArray(value) && value.every(item => Number.isSafeInteger(item)) ? value : [];
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    const object = value as Record<string, unknown>;
    return `{${Object.keys(object).sort().map(key => `${JSON.stringify(key)}:${stableStringify(object[key])}`).join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}
