import "server-only";

import { FieldValue } from "firebase-admin/firestore";

import {
  HafizAuthorizationError,
  type HafizContext,
} from "@/lib/hafiz/authorization";
import {
  studentMayResolveAssignmentQuran,
  type AssignmentQuranGrant,
} from "@/lib/hafiz/quran-policy";
import {
  type QuranDataset,
  type QuranValidationReport,
  validateQuranDataset,
} from "@/lib/hafiz/quran-schema";
import { adminDb } from "@/lib/firebase-admin";

type QuranNavigationMode = "page" | "surah" | "juz";
type QuranSelectionKind = "SINGLE_PAGE" | "PAGE_RANGE" | "SURAH" | "JUZ" | "AYAH_RANGE";

export async function listQuranEditions(context: HafizContext) {
  requireCatalogRole(context);
  const snapshot = await adminDb.collection("hafiz_quran_editions")
    .where("status", "==", "ACTIVE")
    .get();
  return {
    items: snapshot.docs.map(document => publicEdition(document)),
    nextCursor: null,
  };
}

export async function listAdminQuranEditions(context: HafizContext) {
  requirePlatformAdmin(context);
  const snapshot = await adminDb.collection("hafiz_quran_editions").get();
  return {
    items: snapshot.docs
      .filter(document => ["ACTIVE", "INACTIVE"].includes(String(document.data().status)))
      .map(document => publicEdition(document)),
    nextCursor: null,
  };
}

export async function validateQuranImport(
  context: HafizContext,
  input: unknown,
): Promise<QuranValidationReport> {
  requirePlatformAdmin(context);
  return publicValidationReport(validateQuranDataset(input));
}

export async function importApprovedQuranDataset(context: HafizContext, input: unknown) {
  requirePlatformAdmin(context);
  const report = validateQuranDataset(input);
  if (!report.valid || !report.dataset) {
    throw new HafizAuthorizationError(403, "QURAN_DATASET_INVALID", "Kur'an veri kümesi doğrulanamadı.");
  }
  const dataset = report.dataset;
  const editionReference = adminDb.collection("hafiz_quran_editions").doc(dataset.edition.id);
  const importReference = adminDb.collection("hafiz_quran_imports").doc();

  await adminDb.runTransaction(async transaction => {
    const existing = await transaction.get(editionReference);
    if (existing.exists) {
      throw new HafizAuthorizationError(403, "QURAN_EDITION_EXISTS", "Bu edition kimliği zaten kayıtlı.");
    }
    transaction.create(importReference, {
      editionId: dataset.edition.id,
      status: "IMPORTING",
      checksum: report.calculatedChecksum,
      source: dataset.edition.source,
      stats: report.stats,
      createdAt: FieldValue.serverTimestamp(),
      createdBy: context.membershipID,
    });
    transaction.create(editionReference, {
      ...dataset.edition,
      status: "IMPORTING",
      importedAt: FieldValue.serverTimestamp(),
      importedBy: context.membershipID,
      importId: importReference.id,
    });
  });

  try {
    await writeDataset(dataset);
    await adminDb.runTransaction(async transaction => {
      transaction.update(editionReference, {
        status: "ACTIVE",
        activatedAt: FieldValue.serverTimestamp(),
      });
      transaction.update(importReference, {
        status: "COMPLETED",
        completedAt: FieldValue.serverTimestamp(),
      });
      writeAudit(transaction, context, "QURAN_DATASET_IMPORTED", "quranEdition", dataset.edition.id);
    });
  } catch (error) {
    await Promise.all([
      editionReference.set({ status: "FAILED", failedAt: FieldValue.serverTimestamp() }, { merge: true }),
      importReference.set({ status: "FAILED", failedAt: FieldValue.serverTimestamp() }, { merge: true }),
    ]);
    throw error;
  }
  return {
    id: dataset.edition.id,
    importId: importReference.id,
    report: publicValidationReport(report),
  };
}

export async function updateQuranEditionStatus(
  context: HafizContext,
  editionID: string,
  status: "ACTIVE" | "INACTIVE",
) {
  requirePlatformAdmin(context);
  const reference = adminDb.collection("hafiz_quran_editions").doc(editionID);
  await adminDb.runTransaction(async transaction => {
    const snapshot = await transaction.get(reference);
    if (!snapshot.exists || !["ACTIVE", "INACTIVE"].includes(String(snapshot.data()?.status))) {
      throw notFound();
    }
    transaction.update(reference, {
      status,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: context.membershipID,
    });
    writeAudit(transaction, context, `QURAN_EDITION_${status}`, "quranEdition", editionID);
  });
  return { ok: true };
}

export async function getQuranContent(
  context: HafizContext,
  editionID: string,
  mode: QuranNavigationMode,
  value: number,
) {
  requireCatalogRole(context);
  const pageNumbers = await resolveNavigationPages(editionID, mode, value);
  return loadQuranPages(editionID, pageNumbers);
}

export async function previewQuranSelection(context: HafizContext, body: unknown) {
  requireCatalogRole(context);
  const payload = asObject(body);
  const editionID = requiredString(payload.editionId, "Edition kimliği gerekli.");
  const kind = parseSelectionKind(payload.kind);
  let pageNumbers: number[];
  let exactAyahIDs: string[] | null = null;
  if (kind === "SINGLE_PAGE") {
    pageNumbers = await resolveNavigationPages(editionID, "page", requiredPositiveInteger(payload.startPage));
  } else if (kind === "PAGE_RANGE") {
    const start = requiredPositiveInteger(payload.startPage);
    const end = requiredPositiveInteger(payload.endPage);
    if (end < start || end - start > 49) throw invalidInput("Sayfa aralığı 1–50 sayfa olmalıdır.");
    pageNumbers = Array.from({ length: end - start + 1 }, (_, index) => start + index);
    await assertPagesExist(editionID, pageNumbers);
  } else if (kind === "SURAH") {
    pageNumbers = await resolveNavigationPages(editionID, "surah", requiredPositiveInteger(payload.surahNumber));
  } else if (kind === "JUZ") {
    pageNumbers = await resolveNavigationPages(editionID, "juz", requiredPositiveInteger(payload.juzNumber));
  } else {
    const start = parseAyahID(payload.startAyahId);
    const end = parseAyahID(payload.endAyahId);
    if (start.surah !== end.surah || end.ayah < start.ayah || end.ayah - start.ayah > 299) {
      throw invalidInput("Ayet aralığı aynı surede, sıralı ve en fazla 300 ayet olmalıdır.");
    }
    const ayahSnapshots = await adminDb.getAll(...Array.from(
      { length: end.ayah - start.ayah + 1 },
      (_, index) => adminDb.collection("hafiz_quran_ayahs")
        .doc(`${editionID}_${start.surah}_${start.ayah + index}`),
    ));
    if (ayahSnapshots.some(snapshot => !snapshot.exists)) throw notFound();
    const ayahs = ayahSnapshots.map(snapshot => snapshot.data() || {});
    exactAyahIDs = ayahs.map(ayah => requiredString(ayah.id, "Ayet kimliği geçersiz."));
    pageNumbers = [...new Set(ayahs.map(ayah => requiredPositiveInteger(ayah.pageNumber)))]
      .sort((left, right) => left - right);
    await assertPagesExist(editionID, pageNumbers);
  }
  const scopedAyahIDs = exactAyahIDs || (kind === "SURAH" || kind === "JUZ"
    ? (await loadQuranPages(editionID, pageNumbers)).pages
      .flatMap(page => page.ayahs)
      .filter(ayah => kind === "SURAH"
        ? ayah.surahNumber === requiredPositiveInteger(payload.surahNumber)
        : ayah.juzNumber === requiredPositiveInteger(payload.juzNumber))
      .map(ayah => ayah.id)
    : null);
  const edition = await requireActiveEdition(editionID);
  const editionData = edition.data() || {};
  return {
    kind,
    editionId: editionID,
    pageNumbers,
    ayahIds: scopedAyahIDs,
    startPage: pageNumbers[0],
    endPage: pageNumbers.at(-1),
    editionChecksum: requiredString(editionData.contentChecksum, "Edition checksum geçersiz."),
    sourceVersion: requiredString(editionData.source?.version, "Edition kaynak sürümü geçersiz."),
  };
}

export async function getAssignmentQuranContent(
  context: HafizContext,
  assignmentID: string,
) {
  if (context.role !== "STUDENT") throw forbidden();
  const [recipientSnapshot, assignmentSnapshot] = await Promise.all([
    adminDb.collection("hafiz_assignment_recipients")
      .doc(`${assignmentID}_${context.membershipID}`).get(),
    adminDb.collection("hafiz_assignments").doc(assignmentID).get(),
  ]);
  if (!recipientSnapshot.exists
    || !assignmentSnapshot.exists
    || !["PUBLISHED", "ACTIVE", "COMPLETED"].includes(String(assignmentSnapshot.data()?.status))
    || assignmentSnapshot.data()?.institutionId !== context.institutionID
    || recipientSnapshot.data()?.institutionId !== context.institutionID
    || recipientSnapshot.data()?.studentMembershipId !== context.membershipID
    || recipientSnapshot.data()?.status === "CANCELLED") {
    throw new HafizAuthorizationError(403, "ASSIGNMENT_QURAN_NOT_FOUND", "Yetkili Kur'an içeriği bulunamadı.");
  }
  const revisionNumber = requiredPositiveInteger(recipientSnapshot.data()?.assignedRevisionNumber);
  const grantSnapshot = await adminDb.collection("hafiz_assignment_quran_grants")
    .doc(`${assignmentID}_${revisionNumber}_${context.membershipID}`).get();
  const grant = grantSnapshot.exists ? grantSnapshot.data() as AssignmentQuranGrant : null;
  if (!studentMayResolveAssignmentQuran(context, grant, assignmentID) || !grant) {
    throw new HafizAuthorizationError(403, "ASSIGNMENT_QURAN_NOT_FOUND", "Yetkili Kur'an içeriği bulunamadı.");
  }
  const content = await loadQuranPages(grant.editionId, grant.pageNumbers);
  const allowedAyahIDs = grant.ayahIds == null ? null : new Set(grant.ayahIds);
  const pages = content.pages.map(page => ({
    ...page,
    ayahs: allowedAyahIDs == null
      ? page.ayahs
      : page.ayahs.filter(ayah => allowedAyahIDs.has(ayah.id)),
  })).filter(page => page.ayahs.length > 0);
  if (allowedAyahIDs !== null) {
    const resolved = new Set(pages.flatMap(page => page.ayahs.map(ayah => ayah.id)));
    if (resolved.size !== allowedAyahIDs.size) throw notFound();
  }
  return {
    assignmentId: assignmentID,
    revisionNumber,
    scope: {
      editionId: grant.editionId,
      pageNumbers: grant.pageNumbers,
      ayahIds: grant.ayahIds || null,
    },
    pages,
  };
}

async function writeDataset(dataset: QuranDataset) {
  const writer = adminDb.bulkWriter();
  writer.onWriteError(error => error.failedAttempts < 3);
  const editionID = dataset.edition.id;
  dataset.juzs.forEach(juz => writer.create(
    adminDb.collection("hafiz_quran_juzs").doc(`${editionID}_${juz.number}`),
    { ...juz, editionId: editionID },
  ));
  dataset.surahs.forEach(surah => writer.create(
    adminDb.collection("hafiz_quran_surahs").doc(`${editionID}_${surah.number}`),
    { ...surah, editionId: editionID },
  ));
  dataset.pages.forEach(page => writer.create(
    adminDb.collection("hafiz_quran_pages").doc(`${editionID}_${page.pageNumber}`),
    { ...page, editionId: editionID },
  ));
  dataset.ayahs.forEach(ayah => writer.create(
    adminDb.collection("hafiz_quran_ayahs").doc(`${editionID}_${ayah.surahNumber}_${ayah.ayahNumber}`),
    { ...ayah, editionId: editionID },
  ));
  await writer.close();
}

async function resolveNavigationPages(
  editionID: string,
  mode: QuranNavigationMode,
  value: number,
): Promise<number[]> {
  await requireActiveEdition(editionID);
  if (!Number.isSafeInteger(value) || value < 1) throw invalidInput("Navigasyon değeri geçersiz.");
  if (mode === "page") {
    await assertPagesExist(editionID, [value]);
    return [value];
  }
  const collection = mode === "surah" ? "hafiz_quran_surahs" : "hafiz_quran_juzs";
  const snapshot = await adminDb.collection(collection).doc(`${editionID}_${value}`).get();
  if (!snapshot.exists) throw notFound();
  const start = requiredPositiveInteger(snapshot.data()?.startPage);
  const end = requiredPositiveInteger(snapshot.data()?.endPage);
  const pages = Array.from({ length: end - start + 1 }, (_, index) => start + index);
  await assertPagesExist(editionID, pages);
  return pages;
}

async function loadQuranPages(editionID: string, pageNumbers: number[]) {
  const edition = await requireActiveEdition(editionID);
  const uniquePages = [...new Set(pageNumbers)].sort((left, right) => left - right);
  const pageSnapshots = await adminDb.getAll(...uniquePages.map(number =>
    adminDb.collection("hafiz_quran_pages").doc(`${editionID}_${number}`)
  ));
  if (pageSnapshots.some(snapshot => !snapshot.exists)) throw notFound();
  const ayahIDs = pageSnapshots.flatMap(snapshot => stringArray(snapshot.data()?.ayahIds));
  const ayahSnapshots = await adminDb.getAll(...ayahIDs.map(id => {
    const [surah, ayah] = id.split(":");
    return adminDb.collection("hafiz_quran_ayahs").doc(`${editionID}_${surah}_${ayah}`);
  }));
  if (ayahSnapshots.some(snapshot => !snapshot.exists)) throw notFound();
  const ayahByID = new Map(ayahSnapshots.map(snapshot => {
    const data = snapshot.data();
    if (!data) throw notFound();
    return [requiredString(data.id, "Ayet kimliği geçersiz."), publicAyah(data)] as const;
  }));
  return {
    edition: publicEdition(edition),
    pages: pageSnapshots.map(snapshot => {
      const data = snapshot.data() || {};
      return {
        pageNumber: data.pageNumber,
        juzNumbers: data.juzNumbers,
        ayahs: stringArray(data.ayahIds).map(id => {
          const ayah = ayahByID.get(id);
          if (!ayah) throw notFound();
          return ayah;
        }),
      };
    }),
  };
}

async function requireActiveEdition(editionID: string) {
  const snapshot = await adminDb.collection("hafiz_quran_editions").doc(editionID).get();
  if (!snapshot.exists || snapshot.data()?.status !== "ACTIVE") throw notFound();
  return snapshot;
}

async function assertPagesExist(editionID: string, pageNumbers: number[]) {
  await requireActiveEdition(editionID);
  const snapshots = await adminDb.getAll(...pageNumbers.map(number =>
    adminDb.collection("hafiz_quran_pages").doc(`${editionID}_${number}`)
  ));
  if (snapshots.some(snapshot => !snapshot.exists)) throw notFound();
}

function publicEdition(snapshot: FirebaseFirestore.DocumentSnapshot) {
  const data = snapshot.data() || {};
  return {
    id: snapshot.id,
    name: data.name,
    language: data.language,
    script: data.script,
    pageCount: data.expectedPageCount,
    surahCount: data.expectedSurahCount,
    juzCount: data.expectedJuzCount,
    checksum: data.contentChecksum,
    source: data.source,
    status: data.status,
  };
}

function publicAyah(data: FirebaseFirestore.DocumentData) {
  return {
    id: requiredString(data.id, "Ayet kimliği geçersiz."),
    surahNumber: requiredPositiveInteger(data.surahNumber),
    ayahNumber: requiredPositiveInteger(data.ayahNumber),
    juzNumber: requiredPositiveInteger(data.juzNumber),
    pageNumber: requiredPositiveInteger(data.pageNumber),
    text: requiredString(data.text, "Ayet metni geçersiz."),
  };
}

function publicValidationReport(report: QuranValidationReport): QuranValidationReport {
  return {
    valid: report.valid,
    errors: report.errors,
    warnings: report.warnings,
    calculatedChecksum: report.calculatedChecksum,
    stats: report.stats,
  };
}

function requireCatalogRole(context: HafizContext) {
  if (context.role !== "TEACHER" && context.role !== "ADMIN") throw forbidden();
}

function requirePlatformAdmin(context: HafizContext) {
  if (context.role !== "ADMIN" || !context.isPlatformAdmin) {
    throw new HafizAuthorizationError(403, "PLATFORM_ADMIN_REQUIRED", "Kur'an veri kümesi yönetimi için platform yöneticisi gerekli.");
  }
}

function parseSelectionKind(value: unknown): QuranSelectionKind {
  if (["SINGLE_PAGE", "PAGE_RANGE", "SURAH", "JUZ", "AYAH_RANGE"].includes(String(value))) {
    return value as QuranSelectionKind;
  }
  throw invalidInput("Seçim türü geçersiz.");
}

function parseAyahID(value: unknown): { surah: number; ayah: number } {
  const match = typeof value === "string" ? /^(\d{1,3}):(\d{1,3})$/.exec(value.trim()) : null;
  if (!match) throw invalidInput("Ayet kimliği sure:ayet biçiminde olmalıdır.");
  return { surah: Number(match[1]), ayah: Number(match[2]) };
}

function asObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw invalidInput("Geçersiz istek.");
  return value as Record<string, unknown>;
}

function requiredString(value: unknown, message: string): string {
  if (typeof value !== "string" || !value.trim()) throw invalidInput(message);
  return value.trim();
}

function requiredPositiveInteger(value: unknown): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 1) {
    throw invalidInput("Pozitif tam sayı gerekli.");
  }
  return value;
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value) || !value.every(item => typeof item === "string")) throw notFound();
  return value;
}

function writeAudit(
  transaction: FirebaseFirestore.Transaction,
  context: HafizContext,
  action: string,
  resourceType: string,
  resourceID: string,
) {
  transaction.create(adminDb.collection("hafiz_audit_events").doc(), {
    institutionId: context.institutionID,
    actorMembershipId: context.membershipID,
    actorUserId: context.userID,
    action,
    resourceType,
    resourceId: resourceID,
    createdAt: FieldValue.serverTimestamp(),
  });
}

function forbidden() {
  return new HafizAuthorizationError(403, "QURAN_CATALOG_FORBIDDEN", "Kur'an kataloğuna erişim yetkisi yok.");
}

function invalidInput(message: string) {
  return new HafizAuthorizationError(403, "INVALID_INPUT", message);
}

function notFound() {
  return new HafizAuthorizationError(403, "QURAN_CONTENT_NOT_FOUND", "Kur'an içeriği bulunamadı.");
}
