import "server-only";

import { adminDb, adminStorage } from "@/lib/firebase-admin";
import { HafizAuthorizationError, type HafizContext } from "@/lib/hafiz/authorization";
import {
  buildLearningVoiceRequest,
  type LearningVoiceDelivery,
  type LearningVoicePace,
  type LearningVoiceProfile,
} from "@/lib/hafiz/learning-voice-policy";

const MAX_AUDIO_BYTES = 3 * 1024 * 1024;

export async function learningVoiceAudio(
  context: HafizContext,
  profile: LearningVoiceProfile | unknown,
  text: unknown,
  delivery?: LearningVoiceDelivery | unknown,
  pace?: LearningVoicePace | unknown,
): Promise<{ bytes: Buffer; cacheKey: string }> {
  let speech;
  try {
    speech = buildLearningVoiceRequest(profile, text, delivery, pace);
  } catch {
    throw new HafizAuthorizationError(400, "INVALID_VOICE_REQUEST", "Seslendirme isteği geçersiz.");
  }

  const file = adminStorage.bucket().file(`hafiz-learning-voice/v3/${speech.cacheKey}.aac`);
  try {
    const [bytes] = await file.download();
    if (bytes.length > 0 && bytes.length <= MAX_AUDIO_BYTES) {
      return { bytes, cacheKey: speech.cacheKey };
    }
  } catch (error) {
    if (!isMissingObject(error)) throw error;
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
  await consumeGenerationQuota(context);

  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: speech.model,
      voice: speech.voice,
      input: speech.text,
      instructions: speech.instructions,
      response_format: "aac",
      speed: 1,
    }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) {
    const requestID = response.headers.get("x-request-id") || "unknown";
    console.error(`[HAFIZ LEARNING VOICE] OpenAI ${response.status}; request ${requestID}`);
    throw new Error("Learning voice generation failed");
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  if (!bytes.length || bytes.length > MAX_AUDIO_BYTES) {
    throw new Error("Learning voice response size is invalid");
  }
  await file.save(bytes, {
    resumable: false,
    contentType: "audio/aac",
    metadata: {
      cacheControl: "private, max-age=31536000, immutable",
      metadata: { profile: speech.profile, model: speech.model },
    },
  });
  return { bytes, cacheKey: speech.cacheKey };
}

async function consumeGenerationQuota(context: HafizContext): Promise<void> {
  const hour = Math.floor(Date.now() / 3_600_000);
  const reference = adminDb.collection("hafiz_learning_voice_quotas")
    .doc(context.membershipID);
  await adminDb.runTransaction(async transaction => {
    const snapshot = await transaction.get(reference);
    const data = snapshot.data();
    const count = Number(data?.hour) === hour ? Number(data?.count || 0) : 0;
    if (count >= 80) {
      throw new HafizAuthorizationError(
        403,
        "VOICE_RATE_LIMIT",
        "Saatlik yeni ses hazırlama sınırına ulaşıldı. Biraz sonra tekrar deneyin.",
      );
    }
    transaction.set(reference, {
      count: count + 1,
      institutionId: context.institutionID,
      membershipId: context.membershipID,
      hour,
      updatedAt: new Date(),
    }, { merge: true });
  });
}

function isMissingObject(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const code = "code" in error ? String(error.code) : "";
  return code === "404" || code === "storage/object-not-found";
}
