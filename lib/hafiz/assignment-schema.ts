export const ASSIGNMENT_TYPES = [
  "NEW_MEMORIZATION",
  "RECENT_REVISION",
  "OLD_REVISION",
  "READING",
  "LISTENING",
  "CUSTOM",
] as const;

export type AssignmentType = (typeof ASSIGNMENT_TYPES)[number];

export const WORKFLOW_STEP_TYPES = [
  "LISTEN",
  "READ_FROM_PAGE",
  "MEMORIZE",
  "REPEAT",
  "VIDEO_LESSON",
  "AUDIO_SUBMISSION",
  "RECITE_TO_TEACHER",
  "STUDENT_COMPLETE",
  "TEACHER_REVIEW",
] as const;

export type WorkflowStepType = (typeof WORKFLOW_STEP_TYPES)[number];
export type CompletionPolicy = "STUDENT_CONFIRM" | "UPLOAD_REQUIRED" | "TEACHER_APPROVAL" | "AUTOMATIC";

export type AssignmentWorkflowStep = {
  id: string;
  type: WorkflowStepType;
  order: number;
  required: boolean;
  enabled: boolean;
  configuration: Record<string, unknown>;
  completionPolicy: CompletionPolicy;
};

export type QuranScopeSnapshot = {
  kind: "SINGLE_PAGE" | "PAGE_RANGE" | "SURAH" | "JUZ" | "AYAH_RANGE";
  editionId: string;
  editionChecksum: string;
  sourceVersion: string;
  pageNumbers: number[];
  ayahIds: string[] | null;
  startPage: number;
  endPage: number;
};

export const QURAN_HIGHLIGHT_COLORS = [
  "YELLOW", "GREEN", "BLUE", "ORANGE", "PINK", "PURPLE",
] as const;
export type QuranHighlightColor = (typeof QURAN_HIGHLIGHT_COLORS)[number];
export type QuranHighlight = { ayahId: string; color: QuranHighlightColor };

export type AssignmentTarget =
  | { type: "CLASS"; classId: string; studentMembershipIds: string[] }
  | { type: "STUDENTS"; classId: null; studentMembershipIds: string[] };

export type AssignmentSnapshotInput = {
  assignmentType: AssignmentType;
  sequentialSteps: boolean;
  repetitionTarget: number;
  deadlineAt: string;
  teacherNote: string;
  quranScope: QuranScopeSnapshot;
  quranHighlights: QuranHighlight[];
  workflowSteps: AssignmentWorkflowStep[];
  target: AssignmentTarget;
};

export type AssignmentValidationResult =
  | { valid: true; value: AssignmentSnapshotInput }
  | { valid: false; errors: string[] };

const COMPLETION_POLICIES: Record<WorkflowStepType, readonly CompletionPolicy[]> = {
  LISTEN: ["STUDENT_CONFIRM", "AUTOMATIC"],
  READ_FROM_PAGE: ["STUDENT_CONFIRM"],
  MEMORIZE: ["STUDENT_CONFIRM"],
  REPEAT: ["STUDENT_CONFIRM", "AUTOMATIC"],
  VIDEO_LESSON: ["STUDENT_CONFIRM", "AUTOMATIC"],
  AUDIO_SUBMISSION: ["UPLOAD_REQUIRED"],
  RECITE_TO_TEACHER: ["TEACHER_APPROVAL"],
  STUDENT_COMPLETE: ["STUDENT_CONFIRM"],
  TEACHER_REVIEW: ["TEACHER_APPROVAL"],
};

const PRESET_TYPES: Record<Exclude<AssignmentType, "CUSTOM">, WorkflowStepType[]> = {
  NEW_MEMORIZATION: ["LISTEN", "READ_FROM_PAGE", "MEMORIZE", "REPEAT", "AUDIO_SUBMISSION", "TEACHER_REVIEW"],
  RECENT_REVISION: ["READ_FROM_PAGE", "REPEAT", "AUDIO_SUBMISSION", "TEACHER_REVIEW"],
  OLD_REVISION: ["READ_FROM_PAGE", "REPEAT", "RECITE_TO_TEACHER", "TEACHER_REVIEW"],
  READING: ["READ_FROM_PAGE", "STUDENT_COMPLETE"],
  LISTENING: ["LISTEN", "STUDENT_COMPLETE"],
};

export function assignmentPreset(type: AssignmentType): AssignmentWorkflowStep[] {
  const types: readonly WorkflowStepType[] = type === "CUSTOM"
    ? ["STUDENT_COMPLETE"]
    : PRESET_TYPES[type];
  return types.map((stepType, index) => ({
    id: `step-${index + 1}-${stepType.toLowerCase().replaceAll("_", "-")}`,
    type: stepType,
    order: index + 1,
    required: true,
    enabled: true,
    configuration: {},
    completionPolicy: defaultCompletionPolicy(stepType),
  }));
}

export function validateAssignmentSnapshot(
  value: AssignmentSnapshotInput,
  now = new Date(),
): AssignmentValidationResult {
  const errors: string[] = [];
  if (!ASSIGNMENT_TYPES.includes(value.assignmentType)) errors.push("Çalışma türü geçersiz.");
  if (!Number.isSafeInteger(value.repetitionTarget) || value.repetitionTarget < 1 || value.repetitionTarget > 1000) {
    errors.push("Tekrar hedefi 1 ile 1000 arasında olmalıdır.");
  }
  const deadline = new Date(value.deadlineAt);
  if (!value.deadlineAt || Number.isNaN(deadline.getTime()) || deadline.getTime() <= now.getTime()) {
    errors.push("Son tarih gelecekte geçerli bir tarih olmalıdır.");
  }
  if (!value.quranScope.editionId || !value.quranScope.editionChecksum || value.quranScope.pageNumbers.length === 0) {
    errors.push("Kur'an kapsamı boş bırakılamaz.");
  }
  if (!value.quranScope.pageNumbers.every(page => Number.isSafeInteger(page) && page > 0)) {
    errors.push("Kur'an sayfa kapsamı geçersiz.");
  }
  if (value.quranHighlights.length > 300
    || new Set(value.quranHighlights.map(highlight => highlight.ayahId)).size !== value.quranHighlights.length
    || value.quranHighlights.some(highlight => !highlight.ayahId
      || !QURAN_HIGHLIGHT_COLORS.includes(highlight.color))) {
    errors.push("Kur'an renklendirmesi geçersiz.");
  }
  if (value.target.studentMembershipIds.length === 0) errors.push("En az bir öğrenci seçilmelidir.");
  if (new Set(value.target.studentMembershipIds).size !== value.target.studentMembershipIds.length) {
    errors.push("Hedef öğrenci listesi tekrar içeremez.");
  }
  if (value.target.type === "CLASS" && !value.target.classId) errors.push("Sınıf hedefi geçersiz.");

  const enabled = value.workflowSteps.filter(step => step.enabled);
  if (enabled.length === 0) errors.push("En az bir çalışma adımı etkin olmalıdır.");
  if (new Set(value.workflowSteps.map(step => step.id)).size !== value.workflowSteps.length) {
    errors.push("Çalışma adımı kimlikleri benzersiz olmalıdır.");
  }
  const enabledOrders = enabled.map(step => step.order).sort((left, right) => left - right);
  if (enabledOrders.some((order, index) => order !== index + 1)) {
    errors.push("Etkin çalışma adımları kesintisiz ve sıralı olmalıdır.");
  }
  for (const step of value.workflowSteps) {
    if (!step.id.trim() || !WORKFLOW_STEP_TYPES.includes(step.type)) errors.push("Çalışma adımı geçersiz.");
    if (!step.enabled && step.required) errors.push("Devre dışı bir adım zorunlu olamaz.");
    if (!COMPLETION_POLICIES[step.type]?.includes(step.completionPolicy)) {
      errors.push(`${step.type} için tamamlama politikası geçersiz.`);
    }
    if (step.configuration.targetCount != null) {
      const target = Number(step.configuration.targetCount);
      if (!Number.isSafeInteger(target) || target < 1 || target > 1000
        || !["LISTEN", "READ_FROM_PAGE", "MEMORIZE", "REPEAT"].includes(step.type)) {
        errors.push(`${step.type} hedef adedi geçersiz.`);
      }
    }
    if (step.configuration.availableAt != null) {
      const availableAt = typeof step.configuration.availableAt === "string"
        ? new Date(step.configuration.availableAt) : null;
      if (!availableAt || Number.isNaN(availableAt.getTime())) {
        errors.push(`${step.type} açılış zamanı geçersiz.`);
      }
    }
  }
  const review = enabled.find(step => step.type === "TEACHER_REVIEW");
  if (review) {
    const evidence = enabled.find(step =>
      (step.type === "AUDIO_SUBMISSION" || step.type === "RECITE_TO_TEACHER") && step.order < review.order
    );
    if (!evidence) errors.push("Öğretmen kontrolünden önce ses gönderimi veya öğretmene okuma olmalıdır.");
  }
  return errors.length === 0 ? { valid: true, value } : { valid: false, errors: [...new Set(errors)] };
}

function defaultCompletionPolicy(type: WorkflowStepType): CompletionPolicy {
  if (type === "AUDIO_SUBMISSION") return "UPLOAD_REQUIRED";
  if (type === "RECITE_TO_TEACHER" || type === "TEACHER_REVIEW") return "TEACHER_APPROVAL";
  return "STUDENT_CONFIRM";
}
