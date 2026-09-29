import "server-only";

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
      currentMembershipId: context.membershipID,
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
      membershipID: typeof data.currentMembershipId === "string"
        ? data.currentMembershipId
        : null,
      institutionID: typeof data.currentInstitutionId === "string"
        ? data.currentInstitutionId
        : null,
      progress,
    }];
  });
  const displayNames = await loadStudentNames(candidates, scope, context.institutionID);
  const league = buildSelfLearningLeague(candidates.map(candidate => ({
    userID: candidate.userID,
    alias: displayNames.get(candidate.userID) || "Öğrenci",
    progress: candidate.progress,
  })), context.userID);

  return {
    scope,
    seasonTitle: seasonTitle(new Date()),
    privacyMode: "STANDARD" as const,
    ...league,
    generatedAt: new Date().toISOString(),
  };
}

async function loadStudentNames(
  candidates: Array<{
    userID: string;
    membershipID: string | null;
    institutionID: string | null;
  }>,
  scope: SelfLearningLeagueScope,
  institutionID: string,
): Promise<Map<string, string>> {
  const membershipByUser = new Map(
    candidates.flatMap(candidate => candidate.membershipID
      ? [[candidate.userID, candidate.membershipID] as const]
      : []),
  );
  const missing = candidates.filter(candidate => !candidate.membershipID);
  if (missing.length) {
    const scopes = await adminDb.getAll(...missing.map(candidate =>
      adminDb.collection("hafiz_user_scopes").doc(candidate.userID)));
    scopes.forEach((scope, index) => {
      const membershipID = scope.data()?.activeMembershipId;
      if (scope.exists && typeof membershipID === "string" && membershipID) {
        membershipByUser.set(missing[index].userID, membershipID);
      }
    });
  }

  const membershipIDs = [...new Set(membershipByUser.values())];
  if (!membershipIDs.length) return new Map();
  const profiles = await adminDb.getAll(...membershipIDs.map(membershipID =>
    adminDb.collection("hafiz_student_profiles").doc(membershipID)));
  const candidateByMembership = new Map(
    [...membershipByUser].map(([userID, membershipID]) => [membershipID, userID] as const),
  );
  const candidateByUser = new Map(candidates.map(candidate => [candidate.userID, candidate]));
  const nameByMembership = new Map(profiles.flatMap(profile => {
    const data = profile.data();
    const displayName = typeof data?.displayName === "string" ? data.displayName.trim() : "";
    const userID = candidateByMembership.get(profile.id);
    const expectedInstitutionID = userID
      ? candidateByUser.get(userID)?.institutionID
      : null;
    const isAuthorizedInstitution = scope === "INSTITUTION"
      ? data?.institutionId === institutionID
      : typeof expectedInstitutionID === "string"
        && data?.institutionId === expectedInstitutionID;
    return profile.exists && data?.status === "ACTIVE"
      && isAuthorizedInstitution && displayName
      ? [[profile.id, scope === "INSTITUTION" ? displayName : publicStudentName(displayName)] as const]
      : [];
  }));

  return new Map([...membershipByUser].flatMap(([userID, membershipID]) => {
    const displayName = nameByMembership.get(membershipID);
    return displayName ? [[userID, displayName] as const] : [];
  }));
}

function publicStudentName(displayName: string): string {
  const parts = displayName.split(/\s+/).filter(Boolean);
  if (parts.length < 2) return parts[0] || "Öğrenci";
  const surname = parts.pop()!;
  return `${parts.join(" ")} ${surname.charAt(0).toLocaleUpperCase("tr-TR")}.`;
}

function safeProgress(value: unknown): SelfLearningProgress | null {
  try {
    return normalizeSelfLearningProgress(value);
  } catch {
    return null;
  }
}

function seasonTitle(date: Date): string {
  const month = new Intl.DateTimeFormat("tr-TR", { month: "long" }).format(date);
  return `${month.charAt(0).toUpperCase()}${month.slice(1)} Ligi`;
}
