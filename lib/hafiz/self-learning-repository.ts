import "server-only";

import { FieldValue } from "firebase-admin/firestore";

import { HafizAuthorizationError, type HafizContext } from "@/lib/hafiz/authorization";
import { adminDb } from "@/lib/firebase-admin";
import {
  mergeSelfLearningProgress,
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
