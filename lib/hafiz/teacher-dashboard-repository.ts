import "server-only";

import { FieldValue, Timestamp } from "firebase-admin/firestore";

import {
  assignmentPreset,
  validateAssignmentSnapshot,
  type AssignmentSnapshotInput,
} from "@/lib/hafiz/assignment-schema";
import { HafizAuthorizationError, type HafizContext } from "@/lib/hafiz/authorization";
import {
  attentionReasons,
  boundedOperationalWindow,
  chunkDashboardIDs,
  classifyOperationalStatus,
  compareReviewQueuePriority,
  DASHBOARD_LIMITS,
  reviewPriorityReasons,
  validateDashboardRange,
  type ReviewQueuePriority,
} from "@/lib/hafiz/teacher-dashboard-policy";
import { adminDb } from "@/lib/firebase-admin";

type DashboardOptions = { classID: string | null; start: string | null; end: string | null };

export async function getTeacherOperationalDashboard(
  context: HafizContext,
  options: DashboardOptions,
) {
  requireTeacher(context);
  const range = safeRange(options.start, options.end);
  const scope = await authorizedScope(context, options.classID);
  const studentIDs = [...scope.students.keys()];
  if (studentIDs.length === 0) return emptyDashboard(scope, range, options.classID);
  const startTimestamp = Timestamp.fromDate(new Date(range.startAt));
  const endTimestamp = Timestamp.fromDate(new Date(range.endAtExclusive));
  const studentChunks = chunkDashboardIDs(studentIDs);

  const [recipients, helpDocuments, audioDocuments, reviewDocuments, eventDocuments] = await Promise.all([
    scopedStudentDocuments("hafiz_assignment_recipients", context.institutionID, studentChunks,
      "lastActivityAt", DASHBOARD_LIMITS.recipients),
    scopedStudentDocuments("hafiz_help_requests", context.institutionID, studentChunks,
      "createdAt", DASHBOARD_LIMITS.helpRequests),
    scopedStudentDocuments("hafiz_audio_assets", context.institutionID, studentChunks,
      "createdAt", DASHBOARD_LIMITS.audioAssets),
    scopedStudentDocuments("hafiz_assignment_reviews", context.institutionID, studentChunks,
      "createdAt", DASHBOARD_LIMITS.reviews),
    scopedStudentDocuments("hafiz_progress_events", context.institutionID, studentChunks,
      "receivedAt", DASHBOARD_LIMITS.events, query => query
        .where("receivedAt", ">=", startTimestamp).where("receivedAt", "<", endTimestamp)),
  ]);
  const assignmentIDs = [...new Set(recipients.map(doc => String(doc.data().assignmentId)))];
  const roots = assignmentIDs.length ? await adminDb.getAll(...assignmentIDs.map(id =>
    adminDb.collection("hafiz_assignments").doc(id))) : [];
  const rootByID = new Map(roots.filter(root => root.exists
    && root.data()?.institutionId === context.institutionID
    && root.data()?.ownerTeacherMembershipId === context.membershipID).map(root => [root.id, root.data()!]));
  const ownedRecipients = recipients.filter(doc => rootByID.has(String(doc.data().assignmentId)));
  const revisionIDs = [...new Set(ownedRecipients.map(doc =>
    `${doc.data().assignmentId}_${doc.data().assignedRevisionNumber}`))];
  const revisions = revisionIDs.length ? await adminDb.getAll(...revisionIDs.map(id =>
    adminDb.collection("hafiz_assignment_revisions").doc(id))) : [];
  const revisionByID = new Map(revisions.filter(doc => doc.exists
    && doc.data()?.institutionId === context.institutionID).map(doc => [doc.id, doc.data()!]));
  const helps = helpDocuments.filter(doc => doc.data().state === "OPEN");
  const audio = audioDocuments.filter(doc => doc.data().submissionStatus === "SUBMITTED");
  const reviews = reviewDocuments;
  const events = eventDocuments;
  const recipientsByStudent = groupBy(ownedRecipients, doc => String(doc.data().studentMembershipId));
  const helpByStudent = groupBy(helps, doc => String(doc.data().studentMembershipId));
  const audioByRecipient = groupBy(audio, doc => String(doc.data().assignmentRecipientId));
  const reviewByStudent = groupBy(reviews, doc => String(doc.data().studentMembershipId));

  const rows = studentIDs.map(studentID => {
    const profile = scope.students.get(studentID)!;
    const history = (recipientsByStudent.get(studentID) || []).sort((a, b) =>
      timestampText(b.data().lastActivityAt || b.data().createdAt)
        .localeCompare(timestampText(a.data().lastActivityAt || a.data().createdAt)));
    const current = history.find(doc => {
      const root = rootByID.get(String(doc.data().assignmentId));
      return root && ["ACTIVE", "PUBLISHED"].includes(String(root.status));
    }) || history[0] || null;
    const data = current?.data();
    const revision = data ? revisionByID.get(`${data.assignmentId}_${data.assignedRevisionNumber}`) : null;
    const currentHelp = (helpByStudent.get(studentID) || [])[0];
    const currentAudio = current ? (audioByRecipient.get(current.id) || [])[0] : null;
    const currentStep = resolveCurrentStep(revision, data);
    const meaningful = [data?.lastActivityAt, data?.studentWorkCompletedAt,
      currentHelp?.data().createdAt, currentAudio?.data().submittedAt,
      (reviewByStudent.get(studentID) || [])[0]?.data().createdAt]
      .map(timestampText).filter(Boolean).sort().at(-1) || null;
    return {
      studentMembershipId: studentID,
      studentName: String(profile.displayName || "Öğrenci"),
      classIds: scope.studentClassIDs.get(studentID) || [],
      operationalStatus: classifyOperationalStatus({
        recipientStatus: data ? String(data.status || "") : null,
        completionPercent: Number(data?.completionPercent || 0),
        lastActivityAt: timestampText(data?.lastActivityAt),
      }),
      currentAssignment: data ? {
        id: String(data.assignmentId),
        type: String(revision?.assignmentType || "CUSTOM"),
        title: assignmentTitle(String(revision?.assignmentType || "CUSTOM")),
        pageRange: minimalScope(revision?.quranScope),
        deadlineAt: String(revision?.deadlineAt || ""),
      } : null,
      currentWorkflowStep: currentStep,
      completionPercent: Number(data?.completionPercent || 0),
      helpRequest: currentHelp ? {
        id: currentHelp.id,
        message: String(currentHelp.data().message || ""),
        createdAt: timestampText(currentHelp.data().createdAt),
      } : null,
      difficulty: typeof data?.difficulty === "string" ? data.difficulty : null,
      pendingSubmission: Boolean(currentAudio) || data?.status === "STUDENT_WORK_COMPLETE",
      lastMeaningfulActivity: meaningful,
      recipientId: current?.id || null,
      teacherPriority: data?.teacherPriority === "HIGH" ? "HIGH" : "NORMAL",
    };
  });

  const rowByStudent = new Map(rows.map(row => [row.studentMembershipId, row]));
  const reviewQueue = ownedRecipients.filter(doc => doc.data().status === "STUDENT_WORK_COMPLETE")
    .map(doc => {
      const data = doc.data();
      const studentID = String(data.studentMembershipId);
      const revision = revisionByID.get(`${data.assignmentId}_${data.assignedRevisionNumber}`);
      const priority: ReviewQueuePriority = {
        id: doc.id,
        explicitPriority: data.teacherPriority === "HIGH" ? "HIGH" : "NORMAL",
        waitingSince: timestampText(data.studentWorkCompletedAt || data.lastActivityAt || data.createdAt),
        deadlineAt: String(revision?.deadlineAt || ""),
        submissionState: (audioByRecipient.get(doc.id) || []).length ? "SUBMITTED" : "NO_SUBMISSION",
      };
      return {
        ...priority,
        studentMembershipId: studentID,
        studentName: rowByStudent.get(studentID)?.studentName || "Öğrenci",
        assignmentId: String(data.assignmentId),
        assignmentTitle: assignmentTitle(String(revision?.assignmentType || "CUSTOM")),
        completionPercent: Number(data.completionPercent || 0),
        reasons: reviewPriorityReasons(priority),
      };
    }).sort(compareReviewQueuePriority).slice(0, 100);

  const attention = rows.flatMap(row => {
    const recent = (recipientsByStudent.get(row.studentMembershipId) || []).slice(0, 3);
    const recentReviews = reviewByStudent.get(row.studentMembershipId) || [];
    const incomplete = recent.filter(doc => {
      const data = doc.data();
      const revision = revisionByID.get(`${data.assignmentId}_${data.assignedRevisionNumber}`);
      const overdue = dateValue(String(revision?.deadlineAt || "")) < Date.now();
      return data.lastReviewDecision === "INCOMPLETE" || (overdue && data.status !== "APPROVED");
    }).length;
    const revisionRequests = recentReviews.filter(doc =>
      ["REVISION_REQUIRED", "INCOMPLETE"].includes(String(doc.data().decision))).length;
    const reasons = attentionReasons({
      recentTaskCount: recent.length,
      recentIncompleteCount: incomplete,
      recentRevisionRequestCount: revisionRequests,
      difficulty: row.difficulty,
      hasOpenHelpRequest: Boolean(row.helpRequest),
    });
    return reasons.length ? [{
      studentMembershipId: row.studentMembershipId,
      studentName: row.studentName,
      reasons,
      currentAssignment: row.currentAssignment,
      lastMeaningfulActivity: row.lastMeaningfulActivity,
    }] : [];
  });

  const analytics = buildAnalytics(range.dayKeys, rows, ownedRecipients, reviews, events, revisionByID);
  const classOverview = scope.classes.map(value => {
    const classRows = rows.filter(row => row.classIds.includes(value.id));
    return { id: value.id, name: value.name, ...statusCounts(classRows) };
  });
  const bulkSuggestions = buildBulkSuggestions(attention, recipientsByStudent, revisionByID);
  const studentHistory = rows.map(row => ({
    studentMembershipId: row.studentMembershipId,
    studentName: row.studentName,
    items: (recipientsByStudent.get(row.studentMembershipId) || [])
      .slice(0, DASHBOARD_LIMITS.historyPerStudent).map(doc => {
        const data = doc.data();
        const revision = revisionByID.get(`${data.assignmentId}_${data.assignedRevisionNumber}`);
        return { assignmentId: data.assignmentId, assignmentTitle: assignmentTitle(String(revision?.assignmentType || "CUSTOM")),
          status: data.status, completionPercent: Number(data.completionPercent || 0),
          reviewDecision: data.lastReviewDecision || null,
          lastActivityAt: timestampText(data.lastActivityAt || data.createdAt) };
      }),
  }));
  return {
    range: { startAt: range.startAt, endAtExclusive: range.endAtExclusive },
    selectedClassId: options.classID,
    classes: scope.classes,
    summary: statusCounts(rows),
    students: rows,
    reviewQueue,
    attention,
    analytics: { ...analytics, classOverview, studentHistory },
    bulkSuggestions,
    queryMeta: {
      truncated: recipients.length === DASHBOARD_LIMITS.recipients
        || reviews.length === DASHBOARD_LIMITS.reviews
        || events.length === DASHBOARD_LIMITS.events,
      limits: DASHBOARD_LIMITS,
    },
  };
}

export async function updateTeacherRecipientPriority(
  context: HafizContext,
  recipientID: string,
  priorityValue: unknown,
) {
  requireTeacher(context);
  const priority = String(priorityValue);
  if (!['HIGH', 'NORMAL'].includes(priority)) throw invalid("Öncelik geçersiz.");
  const reference = adminDb.collection("hafiz_assignment_recipients").doc(recipientID);
  await adminDb.runTransaction(async transaction => {
    const recipient = await transaction.get(reference);
    const data = recipient.data();
    if (!recipient.exists || data?.institutionId !== context.institutionID) throw notFound();
    const root = await transaction.get(adminDb.collection("hafiz_assignments").doc(String(data.assignmentId)));
    if (!root.exists || root.data()?.ownerTeacherMembershipId !== context.membershipID
      || root.data()?.institutionId !== context.institutionID) throw notFound();
    transaction.update(reference, { teacherPriority: priority, teacherPriorityUpdatedAt: FieldValue.serverTimestamp(),
      teacherPriorityUpdatedBy: context.membershipID });
    transaction.create(adminDb.collection("hafiz_audit_events").doc(), {
      institutionId: context.institutionID, actorMembershipId: context.membershipID,
      actorUserId: context.userID, action: "REVIEW_PRIORITY_UPDATED",
      resourceType: "assignmentRecipient", resourceId: recipientID,
      metadata: { priority }, createdAt: FieldValue.serverTimestamp(),
    });
  });
  return { ok: true, priority };
}

export async function prepareBulkAssignmentDraft(context: HafizContext, body: unknown) {
  requireTeacher(context);
  const payload = asObject(body);
  const sourceAssignmentID = requiredString(payload.sourceAssignmentId);
  const requestedStudents = stringArray(payload.studentMembershipIds);
  if (requestedStudents.length < 1 || requestedStudents.length > 200) throw invalid("Hedef öğrenci sayısı geçersiz.");
  const scope = await authorizedScope(context, null);
  if (requestedStudents.some(id => !scope.students.has(id))) throw notFound();
  const root = await adminDb.collection("hafiz_assignments").doc(sourceAssignmentID).get();
  const rootData = root.data();
  if (!root.exists || rootData?.institutionId !== context.institutionID
    || rootData.ownerTeacherMembershipId !== context.membershipID) throw notFound();
  const revisionNumber = Number(rootData.publishedRevisionNumber || rootData.latestRevisionNumber);
  const sourceRevision = await adminDb.collection("hafiz_assignment_revisions")
    .doc(`${sourceAssignmentID}_${revisionNumber}`).get();
  const source = sourceRevision.data();
  if (!sourceRevision.exists || source?.institutionId !== context.institutionID) throw notFound();
  const sourceRecipients = await adminDb.collection("hafiz_assignment_recipients")
    .where("institutionId", "==", context.institutionID)
    .where("assignmentId", "==", sourceAssignmentID).get();
  const eligible = new Set(sourceRecipients.docs.filter(doc => {
    const data = doc.data();
    return ["REVISION_REQUIRED", "INCOMPLETE"].includes(String(data.lastReviewDecision))
      || data.difficulty === "VERY_DIFFICULT";
  }).map(doc => String(doc.data().studentMembershipId)));
  if (requestedStudents.some(id => !eligible.has(id))) throw invalid("Öneri kapsamı güncel değil.");
  const deadline = new Date(); deadline.setUTCDate(deadline.getUTCDate() + 2);
  const snapshot: AssignmentSnapshotInput = {
    assignmentType: "RECENT_REVISION",
    sequentialSteps: true,
    repetitionTarget: Number(source.repetitionTarget || 10),
    deadlineAt: deadline.toISOString(),
    teacherNote: "Operasyon panelindeki açıklanabilir sinyallerden hazırlanan tekrar taslağı.",
    quranScope: source.quranScope,
    quranHighlights: Array.isArray(source.quranHighlights) ? source.quranHighlights : [],
    workflowSteps: assignmentPreset("RECENT_REVISION"),
    target: { type: "STUDENTS", classId: null, studentMembershipIds: requestedStudents },
  };
  const validation = validateAssignmentSnapshot(snapshot);
  if (!validation.valid) throw invalid(validation.errors.join(" "));
  const assignmentReference = adminDb.collection("hafiz_assignments").doc();
  const now = new Date().toISOString();
  await adminDb.runTransaction(async transaction => {
    transaction.create(assignmentReference, {
      institutionId: context.institutionID, ownerTeacherMembershipId: context.membershipID,
      status: "DRAFT", currentDraftRevisionNumber: 1, publishedRevisionNumber: null,
      latestRevisionNumber: 1, sourceOperationalSuggestionAssignmentId: sourceAssignmentID,
      createdAt: now, createdBy: context.membershipID, updatedAt: now, updatedBy: context.membershipID,
    });
    transaction.create(adminDb.collection("hafiz_assignment_revisions").doc(`${assignmentReference.id}_1`), {
      ...validation.value, assignmentId: assignmentReference.id, institutionId: context.institutionID,
      ownerTeacherMembershipId: context.membershipID, revisionNumber: 1, status: "DRAFT",
      sourceOperationalSuggestionAssignmentId: sourceAssignmentID,
      createdAt: now, createdBy: context.membershipID, updatedAt: now,
    });
    transaction.create(adminDb.collection("hafiz_audit_events").doc(), {
      institutionId: context.institutionID, actorMembershipId: context.membershipID,
      actorUserId: context.userID, action: "OPERATIONAL_BULK_DRAFT_PREPARED",
      resourceType: "assignment", resourceId: assignmentReference.id,
      metadata: { sourceAssignmentId: sourceAssignmentID, targetCount: requestedStudents.length },
      createdAt: FieldValue.serverTimestamp(),
    });
  });
  return { ok: true, assignmentId: assignmentReference.id, status: "DRAFT", requiresPreview: true };
}

async function authorizedScope(context: HafizContext, classFilter: string | null) {
  const assignments = await adminDb.collection("hafiz_teacher_class_assignments")
    .where("institutionId", "==", context.institutionID)
    .where("teacherMembershipId", "==", context.membershipID)
    .where("status", "==", "ACTIVE").get();
  const authorizedClassIDs = new Set(assignments.docs.map(doc => String(doc.data().classId)));
  if (classFilter && !authorizedClassIDs.has(classFilter)) throw notFound();
  const selectedClassIDs = classFilter ? [classFilter] : [...authorizedClassIDs];
  if (!selectedClassIDs.length) return { classes: [], students: new Map<string, FirebaseFirestore.DocumentData>(),
    studentClassIDs: new Map<string, string[]>() };
  const membershipSnapshots = await Promise.all(chunkDashboardIDs(selectedClassIDs).map(classIDs =>
    adminDb.collection("hafiz_class_memberships")
      .where("institutionId", "==", context.institutionID)
      .where("classId", "in", classIDs).where("status", "==", "ACTIVE").get()));
  const scopedMemberships = membershipSnapshots.flatMap(snapshot => snapshot.docs);
  const studentClassIDs = new Map<string, string[]>();
  scopedMemberships.forEach(doc => {
    const studentID = String(doc.data().studentMembershipId); const classID = String(doc.data().classId);
    studentClassIDs.set(studentID, [...(studentClassIDs.get(studentID) || []), classID]);
  });
  const [profiles, classes] = await Promise.all([
    studentClassIDs.size ? adminDb.getAll(...[...studentClassIDs.keys()].map(id =>
      adminDb.collection("hafiz_student_profiles").doc(id))) : [],
    selectedClassIDs.length ? adminDb.getAll(...selectedClassIDs.map(id =>
      adminDb.collection("hafiz_classes").doc(id))) : [],
  ]);
  return {
    classes: classes.filter(doc => doc.exists && doc.data()?.status === "ACTIVE"
      && doc.data()?.institutionId === context.institutionID)
      .map(doc => ({ id: doc.id, name: String(doc.data()?.name || "Sınıf") })),
    students: new Map(profiles.filter(doc => doc.exists && doc.data()?.status === "ACTIVE"
      && doc.data()?.institutionId === context.institutionID).map(doc => [doc.id, doc.data()!])),
    studentClassIDs,
  };
}

function buildAnalytics(dayKeys: string[], rows: Array<{ studentMembershipId: string }>,
  recipients: FirebaseFirestore.QueryDocumentSnapshot[], reviews: FirebaseFirestore.QueryDocumentSnapshot[],
  events: FirebaseFirestore.QueryDocumentSnapshot[], revisions: Map<string, FirebaseFirestore.DocumentData>) {
  const rowSet = new Set(rows.map(row => row.studentMembershipId));
  const trends = dayKeys.map(date => {
    const dayRecipients = recipients.filter(doc => dayKey(doc.data().studentWorkCompletedAt) === date);
    const dayReviews = reviews.filter(doc => dayKey(doc.data().createdAt) === date);
    const dayEvents = events.filter(doc => dayKey(doc.data().occurredAt || doc.data().receivedAt) === date);
    return { date, completedWork: dayRecipients.length,
      approvedWork: dayReviews.filter(doc => doc.data().decision === "APPROVED").length,
      revisionRequests: dayReviews.filter(doc => ["REVISION_REQUIRED", "INCOMPLETE"].includes(String(doc.data().decision))).length,
      activeStudents: new Set(dayEvents.map(doc => String(doc.data().studentMembershipId)).filter(id => rowSet.has(id))).size };
  });
  const activeStudentDays = trends.reduce((sum, day) => sum + day.activeStudents, 0);
  const possibleStudentDays = Math.max(rows.length * dayKeys.length, 1);
  return {
    completionTrends: trends,
    approvedWork: trends.reduce((sum, day) => sum + day.approvedWork, 0),
    revisionWorkload: trends.reduce((sum, day) => sum + day.revisionRequests, 0),
    studyConsistencyPercent: Math.round((activeStudentDays / possibleStudentDays) * 100),
    trackedAssignments: new Set(recipients.map(doc => String(doc.data().assignmentId))).size,
    trackedQuranScopes: new Set(recipients.map(doc => {
      const data = doc.data(); const revision = revisions.get(`${data.assignmentId}_${data.assignedRevisionNumber}`);
      return `${revision?.quranScope?.editionId || ""}:${revision?.quranScope?.startPage || 0}-${revision?.quranScope?.endPage || 0}`;
    })).size,
  };
}

function buildBulkSuggestions(attention: Array<{ studentMembershipId: string; reasons: string[] }>,
  recipientsByStudent: Map<string, FirebaseFirestore.QueryDocumentSnapshot[]>,
  revisions: Map<string, FirebaseFirestore.DocumentData>) {
  const groups = new Map<string, { sourceAssignmentId: string; studentMembershipIds: string[];
    reasons: Set<string>; pageRange: { startPage: number; endPage: number } }>();
  for (const item of attention) {
    const source = (recipientsByStudent.get(item.studentMembershipId) || []).find(doc => {
      const data = doc.data(); return ["REVISION_REQUIRED", "INCOMPLETE"].includes(String(data.lastReviewDecision))
        || data.difficulty === "VERY_DIFFICULT";
    });
    if (!source) continue;
    const data = source.data(); const assignmentID = String(data.assignmentId);
    const revision = revisions.get(`${assignmentID}_${data.assignedRevisionNumber}`);
    if (!revision) continue;
    const current = groups.get(assignmentID) || { sourceAssignmentId: assignmentID,
      studentMembershipIds: [], reasons: new Set<string>(), pageRange: minimalScope(revision.quranScope) };
    current.studentMembershipIds.push(item.studentMembershipId); item.reasons.forEach(reason => current.reasons.add(reason));
    groups.set(assignmentID, current);
  }
  return [...groups.values()].map((item, index) => ({ id: `bulk-${index + 1}-${item.sourceAssignmentId}`,
    sourceAssignmentId: item.sourceAssignmentId, studentMembershipIds: [...new Set(item.studentMembershipIds)],
    studentCount: new Set(item.studentMembershipIds).size, reasons: [...item.reasons], pageRange: item.pageRange,
    requiresPreview: true }));
}

function statusCounts(rows: Array<{ operationalStatus: string }>) {
  return { totalStudents: rows.length,
    completed: rows.filter(row => row.operationalStatus === "COMPLETED").length,
    working: rows.filter(row => row.operationalStatus === "WORKING").length,
    awaitingReview: rows.filter(row => row.operationalStatus === "AWAITING_REVIEW").length,
    notStarted: rows.filter(row => row.operationalStatus === "NOT_STARTED").length };
}
function resolveCurrentStep(revision: FirebaseFirestore.DocumentData | null | undefined,
  recipient: FirebaseFirestore.DocumentData | null | undefined) {
  if (!revision || !recipient) return null;
  const steps = Array.isArray(revision.workflowSteps) ? revision.workflowSteps : [];
  const id = String(recipient.lastActiveStepId || ""); const step = steps.find((item: Record<string, unknown>) => item.id === id);
  return step ? { id, type: step.type, title: workflowTitle(String(step.type || "")) } : null;
}
function minimalScope(value: unknown) { const scope = asSafeObject(value); return {
  startPage: Number(scope.startPage || 0), endPage: Number(scope.endPage || 0) }; }
function assignmentTitle(value: string) { return ({ NEW_MEMORIZATION: "Yeni Ezber", RECENT_REVISION: "Yakın Tekrar",
  OLD_REVISION: "Eski Tekrar", READING: "Yüzünden Okuma", LISTENING: "Dinleme", CUSTOM: "Özel Çalışma" } as Record<string, string>)[value] || "Görev"; }
function workflowTitle(value: string) { return ({ LISTEN: "Dinle", READ_FROM_PAGE: "Sayfadan Oku", MEMORIZE: "Ezberle",
  REPEAT: "Tekrar Et", VIDEO_LESSON: "Görüntülü Ders", AUDIO_SUBMISSION: "Sesli Teslim",
  RECITE_TO_TEACHER: "Öğretmene Oku", STUDENT_COMPLETE: "Tamamla", TEACHER_REVIEW: "Öğretmen Kontrolü" } as Record<string, string>)[value] || "Çalışma"; }
function groupBy<T>(items: T[], key: (item: T) => string) { const result = new Map<string, T[]>(); items.forEach(item => {
  const value = key(item); result.set(value, [...(result.get(value) || []), item]); }); return result; }
function timestampText(value: unknown) { if (typeof value === "string") return value;
  if (value && typeof value === "object" && "toDate" in value) return (value as { toDate(): Date }).toDate().toISOString(); return ""; }
function dayKey(value: unknown) { return timestampText(value).slice(0, 10); }
function dateValue(value: string) { const result = new Date(value).getTime(); return Number.isNaN(result) ? Number.MAX_SAFE_INTEGER : result; }
function safeRange(start: string | null, end: string | null) { try { return validateDashboardRange(start, end); }
  catch { throw invalid("Tarih aralığı geçersiz veya 366 günden uzun."); } }
function emptyDashboard(scope: Awaited<ReturnType<typeof authorizedScope>>, range: ReturnType<typeof validateDashboardRange>,
  selectedClassID: string | null) {
  return { range: { startAt: range.startAt, endAtExclusive: range.endAtExclusive }, selectedClassId: selectedClassID,
    classes: scope.classes, summary: statusCounts([]), students: [], reviewQueue: [], attention: [],
    analytics: { completionTrends: range.dayKeys.map(date => ({ date, completedWork: 0, approvedWork: 0,
      revisionRequests: 0, activeStudents: 0 })), approvedWork: 0, revisionWorkload: 0,
      studyConsistencyPercent: 0, trackedAssignments: 0, trackedQuranScopes: 0,
      classOverview: [], studentHistory: [] }, bulkSuggestions: [],
    queryMeta: { truncated: false, limits: DASHBOARD_LIMITS } };
}
function asObject(value: unknown): Record<string, unknown> { if (!value || typeof value !== "object" || Array.isArray(value))
  throw invalid("Geçersiz istek."); return value as Record<string, unknown>; }
function asSafeObject(value: unknown): Record<string, unknown> { return value && typeof value === "object" && !Array.isArray(value)
  ? value as Record<string, unknown> : {}; }
function requiredString(value: unknown) { if (typeof value !== "string" || !value.trim()) throw invalid("Zorunlu alan eksik."); return value.trim(); }
function stringArray(value: unknown) { if (!Array.isArray(value) || !value.every(item => typeof item === "string" && item.trim()))
  throw invalid("Öğrenci listesi geçersiz."); return [...new Set(value.map(item => String(item).trim()))]; }
function requireTeacher(context: HafizContext) { if (context.role !== "TEACHER") throw notFound(); }
function invalid(message: string) { return new HafizAuthorizationError(403, "INVALID_TEACHER_DASHBOARD", message); }
function notFound() { return new HafizAuthorizationError(403, "TEACHER_DASHBOARD_NOT_FOUND", "Kayıt bulunamadı."); }

async function scopedStudentDocuments(
  collection: string,
  institutionID: string,
  studentChunks: string[][],
  orderField: string,
  limit: number,
  configure: (query: FirebaseFirestore.Query) => FirebaseFirestore.Query = query => query,
) {
  const snapshots = await Promise.all(studentChunks.map(studentIDs => {
    let query: FirebaseFirestore.Query = adminDb.collection(collection)
      .where("institutionId", "==", institutionID)
      .where("studentMembershipId", "in", studentIDs);
    query = configure(query).orderBy(orderField, "desc").limit(limit);
    return query.get();
  }));
  return boundedOperationalWindow(
    snapshots.flatMap(snapshot => snapshot.docs).sort((left, right) =>
      timestampText(right.data()[orderField]).localeCompare(timestampText(left.data()[orderField]))),
    limit,
  );
}
