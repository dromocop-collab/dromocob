import type { AssignmentWorkflowStep } from "./assignment-schema";

export const FIRST_STEP_PLAN_TEMPLATE = "FIRST_STEP_JUZ_END" as const;
export const PLAN_DELIVERY_MODES = ["TEACHER_RECITATION", "AUDIO", "BOTH"] as const;

export type PlanDeliveryMode = (typeof PLAN_DELIVERY_MODES)[number];

export type FirstStepPlanDefinition = {
  editionId: string;
  startJuz: number;
  pageCount: number;
  startAt: string;
  timeZone: string;
  skipWeekends: boolean;
  deliveryMode: PlanDeliveryMode;
  teacherNote: string;
};

export type FirstStepPlanTrack = {
  trackIndex: number;
  juzNumber: number;
  pageNumber: number;
  startsAt: string;
  deadlineAt: string;
  workflowSteps: AssignmentWorkflowStep[];
};

export type FirstStepPlanDayItem = {
  trackIndex: number;
  juzNumber: number;
  pageNumber: number;
  stage: "PREPARE" | "AYAH_BY_AYAH" | "HALF_PAGE" | "FULL_PAGE" | "DELIVERY";
  title: string;
};

export type FirstStepPlanDay = {
  dayIndex: number;
  scheduledAt: string;
  items: FirstStepPlanDayItem[];
};

export type FirstStepPlanPreview = {
  template: typeof FIRST_STEP_PLAN_TEMPLATE;
  title: string;
  assignmentCount: number;
  firstWeekTaskCount: number;
  startsAt: string;
  completesAt: string;
  days: FirstStepPlanDay[];
  tracks: FirstStepPlanTrack[];
};

const STAGE_TITLES = [
  "3 kez dinle + 33 kez yüzüne oku",
  "Ayet ayet ezberle",
  "Yarım sayfa halinde ezberle",
  "Tam sayfa ezberle",
] as const;

export function buildFirstStepPlan(
  definition: FirstStepPlanDefinition,
  juzEndPages: Map<number, number>,
): FirstStepPlanPreview {
  const start = new Date(definition.startAt);
  if (Number.isNaN(start.getTime())) throw new Error("Plan başlangıç tarihi geçersiz.");
  const tracks: FirstStepPlanTrack[] = [];
  for (let trackIndex = 0; trackIndex < definition.pageCount; trackIndex += 1) {
    const juzNumber = definition.startJuz + trackIndex;
    const pageNumber = juzEndPages.get(juzNumber);
    if (!pageNumber) throw new Error(`${juzNumber}. cüzün son sayfası bulunamadı.`);
    const schedule = Array.from({ length: 5 }, (_, stageIndex) =>
      studyDay(start, trackIndex + stageIndex, definition.skipWeekends, definition.timeZone)
    );
    tracks.push({
      trackIndex,
      juzNumber,
      pageNumber,
      startsAt: schedule[0].toISOString(),
      deadlineAt: schedule[4].toISOString(),
      workflowSteps: firstStepWorkflow(trackIndex, schedule, definition.deliveryMode),
    });
  }

  const days: FirstStepPlanDay[] = Array.from({ length: definition.pageCount }, (_, dayIndex) => ({
    dayIndex,
    scheduledAt: studyDay(start, dayIndex, definition.skipWeekends, definition.timeZone).toISOString(),
    items: tracks.slice(0, dayIndex + 1).map(track => {
      const stageIndex = dayIndex - track.trackIndex;
      return {
        trackIndex: track.trackIndex,
        juzNumber: track.juzNumber,
        pageNumber: track.pageNumber,
        stage: (["PREPARE", "AYAH_BY_AYAH", "HALF_PAGE", "FULL_PAGE", "DELIVERY"] as const)[stageIndex],
        title: stageIndex < 4 ? STAGE_TITLES[stageIndex] : deliveryTitle(definition.deliveryMode),
      };
    }),
  }));

  return {
    template: FIRST_STEP_PLAN_TEMPLATE,
    title: "Hafızlıkta İlk Adım – Cüz Sonu Merdiveni",
    assignmentCount: tracks.length,
    firstWeekTaskCount: days.reduce((total, day) => total + day.items.length, 0),
    startsAt: tracks[0]?.startsAt || definition.startAt,
    completesAt: tracks.at(-1)?.deadlineAt || definition.startAt,
    days,
    tracks,
  };
}

function firstStepWorkflow(
  trackIndex: number,
  schedule: Date[],
  deliveryMode: PlanDeliveryMode,
): AssignmentWorkflowStep[] {
  const prefix = `first-step-${trackIndex + 1}`;
  const steps: AssignmentWorkflowStep[] = [
    step(`${prefix}-listen`, "LISTEN", 1, "3 Kez Dinle", schedule[0], "STUDENT_CONFIRM", {
      targetCount: "3",
      planStage: "PREPARE",
    }),
    step(`${prefix}-read`, "READ_FROM_PAGE", 2, "33 Kez Yüzüne Oku", schedule[0], "STUDENT_CONFIRM", {
      targetCount: "33",
      planStage: "PREPARE",
    }),
    step(`${prefix}-ayah`, "MEMORIZE", 3, "Ayet Ayet Ezberle", schedule[1], "STUDENT_CONFIRM", {
      targetCount: "1",
      studyMode: "AYAH_BY_AYAH",
      planStage: "AYAH_BY_AYAH",
    }),
    step(`${prefix}-half`, "MEMORIZE", 4, "Yarım Yarım Ezberle", schedule[2], "STUDENT_CONFIRM", {
      targetCount: "2",
      studyMode: "HALF_PAGE",
      planStage: "HALF_PAGE",
    }),
    step(`${prefix}-full`, "MEMORIZE", 5, "Sayfa Ezberi", schedule[3], "STUDENT_CONFIRM", {
      targetCount: "1",
      studyMode: "FULL_PAGE",
      planStage: "FULL_PAGE",
    }),
  ];
  if (deliveryMode === "AUDIO" || deliveryMode === "BOTH") {
    steps.push(step(`${prefix}-audio`, "AUDIO_SUBMISSION", steps.length + 1,
      "Ses Kaydı Gönder", schedule[4], "UPLOAD_REQUIRED", { planStage: "DELIVERY" }));
  }
  if (deliveryMode === "TEACHER_RECITATION" || deliveryMode === "BOTH") {
    steps.push(step(`${prefix}-recite`, "RECITE_TO_TEACHER", steps.length + 1,
      "Ders Olarak Hocaya Ver", schedule[4], "TEACHER_APPROVAL", { planStage: "DELIVERY" }));
  } else {
    steps.push(step(`${prefix}-review`, "TEACHER_REVIEW", steps.length + 1,
      "Öğretmen Kontrolü", schedule[4], "TEACHER_APPROVAL", { planStage: "DELIVERY" }));
  }
  return steps;
}

function step(
  id: string,
  type: AssignmentWorkflowStep["type"],
  order: number,
  displayTitle: string,
  availableAt: Date,
  completionPolicy: AssignmentWorkflowStep["completionPolicy"],
  extra: Record<string, string>,
): AssignmentWorkflowStep {
  return {
    id,
    type,
    order,
    required: true,
    enabled: true,
    configuration: { ...extra, displayTitle, availableAt: availableAt.toISOString() },
    completionPolicy,
  };
}

function studyDay(start: Date, offset: number, skipWeekends: boolean, timeZone: string): Date {
  let candidate = new Date(start);
  while (skipWeekends && isWeekend(candidate, timeZone)) candidate = addDay(candidate);
  let remaining = offset;
  while (remaining > 0) {
    candidate = addDay(candidate);
    if (!skipWeekends || !isWeekend(candidate, timeZone)) remaining -= 1;
  }
  return candidate;
}

function addDay(date: Date) {
  return new Date(date.getTime() + 24 * 60 * 60 * 1000);
}

function isWeekend(date: Date, timeZone: string) {
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone }).format(date);
  return weekday === "Sat" || weekday === "Sun";
}

function deliveryTitle(mode: PlanDeliveryMode) {
  if (mode === "AUDIO") return "Ses kaydı gönder ve öğretmen kontrolü";
  if (mode === "BOTH") return "Ses kaydı gönder ve hocaya ders ver";
  return "Ders olarak hocaya ver";
}
