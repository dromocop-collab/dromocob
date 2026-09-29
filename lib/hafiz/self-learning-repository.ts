import "server-only";

import { createHash } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";

import { HafizAuthorizationError, type HafizContext } from "@/lib/hafiz/authorization";
import { adminDb } from "@/lib/firebase-admin";
import {
  buildSelfLearningLeague,
  mergeSelfLearningProgress,
  normalizeSelfLearningProgress,
  type SelfLearningProgress,
} from "@/lib/hafiz/self-learning-schema";

const collection = adminDb.collection("hafiz_self_learning_progress");

export async function syncSelfLearningProgress(
  context: HafizContext,
  incoming: unknown,
): Promise<SelfLearningProgress> {
  const reference = collection.doc(context.userID);
  return adminDb.runTransaction(async transaction => {
    const snapshot = await transaction.get(reference);
    const stored = snapshot.exists ? snapshot.data()?.progress : null;
    let progress: SelfLearningProgress;
    try {
      progress = mergeSelfLearningProgress(stored, incoming);
    } catch (error) {
      throw new HafizAuthorizationError(
        400,
        "INVALID_SELF_LEARNING_PROGRESS",
        error instanceof Error ? error.message : "İlerleme verisi geçersiz.",
      );
    }
    transaction.set(reference, {
      ownerUserId: context.userID,
      currentInstitutionId: context.institutionID,
      currentRole: context.role,
      curriculumVersion: progress.curriculumVersion,
      progress,
      serverUpdatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    return progress;
  });
}

export type SelfLearningLeagueScope = "INSTITUTION" | "GLOBAL";

export async function loadSelfLearningLeague(
  context: HafizContext,
  scope: SelfLearningLeagueScope,
) {
  const ownDocument = await collection.doc(context.userID).get();
  const ownProgress = safeProgress(ownDocument.data()?.progress);
  if (ownProgress?.mode === "CHILD" || ownProgress?.ageBand !== "ADULT_18_PLUS") {
    return {
      scope,
      seasonTitle: seasonTitle(new Date()),
      privacyMode: ownProgress?.mode === "CHILD" ? "CHILD" as const : "PRIVATE" as const,
      participantCount: 0,
      user: null,
      entries: [],
      generatedAt: new Date().toISOString(),
    };
  }

  const snapshot = scope === "INSTITUTION"
    ? await collection.where("currentInstitutionId", "==", context.institutionID).limit(250).get()
    : await collection.limit(500).get();
  const candidates = snapshot.docs.flatMap(document => {
    const data = document.data();
    if (data.currentRole !== "STUDENT") return [];
    const progress = safeProgress(data.progress);
    if (!progress) return [];
    return [{
      userID: document.id,
      alias: anonymousAlias(document.id),
      progress,
    }];
  });
  const league = buildSelfLearningLeague(candidates, context.userID);

  return {
    scope,
    seasonTitle: seasonTitle(new Date()),
    privacyMode: "STANDARD" as const,
    ...league,
    generatedAt: new Date().toISOString(),
  };
}

function safeProgress(value: unknown): SelfLearningProgress | null {
  try {
    return normalizeSelfLearningProgress(value);
  } catch {
    return null;
  }
}

function anonymousAlias(userID: string): string {
  const token = createHash("sha256").update(`hafiz-league:${userID}`).digest("hex")
    .slice(0, 5).toUpperCase();
  return `Hafız ${token}`;
}

function seasonTitle(date: Date): string {
  const month = new Intl.DateTimeFormat("tr-TR", { month: "long" }).format(date);
  return `${month.charAt(0).toUpperCase()}${month.slice(1)} Ligi`;
}
