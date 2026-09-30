import "server-only";

import { createHash } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";

import { HafizAuthorizationError, type HafizContext } from "@/lib/hafiz/authorization";
import {
  ensurePlanAssignmentDraft,
  getTeacherAssignment,
  publishAssignment,
} from "@/lib/hafiz/assignment-repository";
import { adminDb } from "@/lib/firebase-admin";
import { enqueueHafizNotification } from "@/lib/hafiz/notification-repository";
import { resolveJuzEndPages } from "@/lib/hafiz/quran-repository";
import {
  buildFirstStepPlan,
  FIRST_STEP_PLAN_TEMPLATE,
  PLAN_DELIVERY_MODES,
  type FirstStepPlanDefinition,
  type FirstStepPlanPreview,
  type PlanDeliveryMode,
} from "@/lib/hafiz/weekly-assignment-plan";

type ParsedRequest = FirstStepPlanDefinition & {
  clientRequestId: string;
  target: Record<string, unknown>;
};

export async function previewFirstStepPlan(context: HafizContext, body: unknown) {
  requireTeacher(context);
  const request = parseRequest(body, false);
  return preview(request);
}

export async function createFirstStepPlan(context: HafizContext, body: unknown) {
  requireTeacher(context);
  const request = parseRequest(body, true);
  const planID = planDocumentID(context, request.clientRequestId);
  const planReference = adminDb.collection("hafiz_assignment_plans").doc(planID);
  const planPreview = await preview(request);
  const assignmentIDs = planPreview.tracks.map(track => `${planID}_track_${track.trackIndex + 1}`);
  const requestFingerprint = fingerprintRequest(request);
  const now = new Date().toISOString();

  await adminDb.runTransaction(async transaction => {
    const existing = await transaction.get(planReference);
    if (existing.exists) {
      const data = existing.data() || {};
      if (data.institutionId !== context.institutionID
        || data.ownerTeacherMembershipId !== context.membershipID
        || data.clientRequestId !== request.clientRequestId) throw notFound();
      if (data.requestFingerprint !== requestFingerprint) {
        throw invalid("Aynı işlem kimliği farklı bir plan için kullanılamaz.");
      }
      return;
    }
    transaction.create(planReference, {
      template: FIRST_STEP_PLAN_TEMPLATE,
      title: planPreview.title,
      institutionId: context.institutionID,
      ownerTeacherMembershipId: context.membershipID,
      clientRequestId: request.clientRequestId,
      requestFingerprint,
      status: "BUILDING",
      editionId: request.editionId,
      startJuz: request.startJuz,
      pageCount: request.pageCount,
      startAt: request.startAt,
      completesAt: planPreview.completesAt,
      timeZone: request.timeZone,
      skipWeekends: request.skipWeekends,
      deliveryMode: request.deliveryMode,
      teacherNote: request.teacherNote,
      target: request.target,
      assignmentIds: assignmentIDs,
      createdAt: now,
      createdBy: context.membershipID,
      updatedAt: now,
      updatedBy: context.membershipID,
    });
    transaction.create(adminDb.collection("hafiz_audit_events").doc(), {
      institutionId: context.institutionID,
      actorMembershipId: context.membershipID,
      action: "ASSIGNMENT_PLAN_CREATED",
      resourceType: "assignment_plan",
      resourceId: planID,
      metadata: {
        template: FIRST_STEP_PLAN_TEMPLATE,
        assignmentCount: assignmentIDs.length,
        startJuz: request.startJuz,
        pageCount: request.pageCount,
      },
      createdAt: FieldValue.serverTimestamp(),
    });
  });

  try {
    for (const track of planPreview.tracks) {
      const assignmentID = assignmentIDs[track.trackIndex];
      const requestBody = {
        assignmentType: "NEW_MEMORIZATION",
        sequentialSteps: true,
        repetitionTarget: 1,
        deadlineAt: track.deadlineAt,
        teacherNote: request.teacherNote,
        quranSelection: {
          editionId: request.editionId,
          kind: "SINGLE_PAGE",
          startPage: track.pageNumber,
        },
        quranHighlights: [],
        workflowSteps: track.workflowSteps,
        target: request.target,
      };
      const assignment = await ensurePlanAssignmentDraft(context, assignmentID, requestBody, {
        id: planID,
        title: planPreview.title,
        trackIndex: track.trackIndex,
        juzNumber: track.juzNumber,
        pageNumber: track.pageNumber,
      });
      if (assignment.status === "DRAFT") await publishAssignment(context, assignmentID, true, false);
    }
    const finishedAt = new Date().toISOString();
    await planReference.update({ status: "ACTIVE", updatedAt: finishedAt, updatedBy: context.membershipID });
    const first = await getTeacherAssignment(context, assignmentIDs[0]);
    const recipients = first.revision?.target.studentMembershipIds || [];
    await Promise.allSettled(recipients.map(studentID => enqueueHafizNotification({
      institutionID: context.institutionID,
      targetMembershipID: studentID,
      event: "NEW_ASSIGNMENT",
      sourceID: planID,
      title: "Hafızlık yolculuğun hazır",
      body: request.teacherNote || "Öğretmenin cüz sonu çalışma planını hazırladı.",
      deepLink: "hafiz://today",
      metadata: { planId: planID, assignmentCount: assignmentIDs.length },
    })));
    return { id: planID, status: "ACTIVE", assignmentIds: assignmentIDs, preview: planPreview };
  } catch (error) {
    await planReference.set({
      status: "PARTIAL_FAILURE",
      updatedAt: new Date().toISOString(),
      updatedBy: context.membershipID,
    }, { merge: true });
    throw error;
  }
}

async function preview(request: ParsedRequest): Promise<FirstStepPlanPreview> {
  const juzNumbers = Array.from({ length: request.pageCount }, (_, index) => request.startJuz + index);
  const endPages = await resolveJuzEndPages(request.editionId, juzNumbers);
  return buildFirstStepPlan(request, endPages);
}

function parseRequest(body: unknown, requireClientID: boolean): ParsedRequest {
  const payload = asObject(body);
  if (payload.template != null && payload.template !== FIRST_STEP_PLAN_TEMPLATE) {
    throw invalid("Plan şablonu geçersiz.");
  }
  const editionId = requiredString(payload.editionId, "Mushaf seçimi gerekli.");
  const startJuz = integer(payload.startJuz, 1, 30, "Başlangıç cüzü geçersiz.");
  const pageCount = integer(payload.pageCount, 1, 10, "Sayfa sayısı 1 ile 10 arasında olmalıdır.");
  if (startJuz + pageCount - 1 > 30) throw invalid("Plan 30. cüzü aşamaz.");
  const startAt = requiredString(payload.startAt, "Başlangıç tarihi gerekli.");
  const start = new Date(startAt);
  if (Number.isNaN(start.getTime()) || start.getTime() < Date.now() - 5 * 60 * 1000
    || start.getTime() > Date.now() + 366 * 24 * 60 * 60 * 1000) {
    throw invalid("Plan başlangıç tarihi geçersiz.");
  }
  const timeZone = requiredString(payload.timeZone, "Saat dilimi gerekli.");
  try { new Intl.DateTimeFormat("tr-TR", { timeZone }).format(start); } catch {
    throw invalid("Saat dilimi geçersiz.");
  }
  const deliveryMode = String(payload.deliveryMode || "TEACHER_RECITATION") as PlanDeliveryMode;
  if (!PLAN_DELIVERY_MODES.includes(deliveryMode)) throw invalid("Teslim biçimi geçersiz.");
  const clientRequestId = requireClientID
    ? requiredString(payload.clientRequestId, "İşlem kimliği gerekli.")
    : optionalString(payload.clientRequestId) || "preview";
  if (clientRequestId.length > 100 || !/^[A-Za-z0-9_-]+$/.test(clientRequestId)) {
    throw invalid("İşlem kimliği geçersiz.");
  }
  const target = asObject(payload.target);
  if (target.type !== "CLASS" && target.type !== "STUDENTS") throw invalid("Plan hedefi geçersiz.");
  return {
    editionId,
    startJuz,
    pageCount,
    startAt: start.toISOString(),
    timeZone,
    skipWeekends: payload.skipWeekends !== false,
    deliveryMode,
    teacherNote: optionalString(payload.teacherNote).slice(0, 2000),
    clientRequestId,
    target,
  };
}

function planDocumentID(context: HafizContext, clientRequestID: string) {
  const digest = createHash("sha256")
    .update(`${context.institutionID}:${context.membershipID}:${clientRequestID}`)
    .digest("hex").slice(0, 32);
  return `first_step_${digest}`;
}

function fingerprintRequest(request: ParsedRequest) {
  return createHash("sha256").update(stableJSON({
    editionId: request.editionId,
    startJuz: request.startJuz,
    pageCount: request.pageCount,
    startAt: request.startAt,
    timeZone: request.timeZone,
    skipWeekends: request.skipWeekends,
    deliveryMode: request.deliveryMode,
    teacherNote: request.teacherNote,
    target: request.target,
  })).digest("hex");
}

function stableJSON(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJSON).join(",")}]`;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record).sort().map(key =>
      `${JSON.stringify(key)}:${stableJSON(record[key])}`
    ).join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

function asObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw invalid("Geçersiz istek.");
  return value as Record<string, unknown>;
}

function requiredString(value: unknown, message: string) {
  if (typeof value !== "string" || !value.trim()) throw invalid(message);
  return value.trim();
}

function optionalString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function integer(value: unknown, minimum: number, maximum: number, message: string) {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < minimum || parsed > maximum) throw invalid(message);
  return parsed;
}

function requireTeacher(context: HafizContext) {
  if (context.role !== "TEACHER") throw new HafizAuthorizationError(403, "PLAN_FORBIDDEN", "Plan için yetkiniz yok.");
}

function invalid(message: string) {
  return new HafizAuthorizationError(400, "INVALID_ASSIGNMENT_PLAN", message);
}

function notFound() {
  return new HafizAuthorizationError(403, "ASSIGNMENT_PLAN_NOT_FOUND", "Plan bulunamadı.");
}
