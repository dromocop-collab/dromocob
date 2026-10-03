import "server-only";

import { adminStorage } from "@/lib/firebase-admin";
import {
  HumanVoiceUnavailableError,
  humanLetterRecordingURL,
  learningVoiceCachePath,
  quranSearchURL,
  quranWordAudioURL,
  type LearningVoiceRequest,
} from "@/lib/hafiz/learning-voice-policy";

const MAX_AUDIO_BYTES = 3 * 1024 * 1024;

export async function renderLearningVoice(request: LearningVoiceRequest): Promise<Buffer> {
  if (request.profile !== "QURAN_AR") {
    throw new HumanVoiceUnavailableError(
      "Türkçe Mürşid anlatımı için gerçek öğretmen kaydı gereklidir.",
    );
  }
  const cachePath = learningVoiceCachePath(request);
  const cached = await readCachedAudio(cachePath);
  if (cached) return cached;

  const directRecording = humanLetterRecordingURL(request);
  const sourceURL = directRecording ?? await resolveQuranWordRecording(request);
  if (!sourceURL) {
    throw new HumanVoiceUnavailableError(
      "Bu alıştırma için doğrulanmış gerçek insan kaydı henüz bulunmuyor.",
    );
  }
  const audio = await fetchAudio(sourceURL);
  await writeCachedAudio(cachePath, audio,
    directRecording ? "github-human" : "quran-foundation-wbw");
  return audio;
}

async function resolveQuranWordRecording(request: LearningVoiceRequest): Promise<URL | null> {
  const response = await fetch(quranSearchURL(request.text), {
    cache: "no-store",
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) return null;
  return quranWordAudioURL(request, await response.json());
}

async function fetchAudio(url: URL): Promise<Buffer> {
  const response = await fetch(url, {
    cache: "no-store",
    headers: { accept: "audio/mpeg,audio/*;q=0.9" },
    signal: AbortSignal.timeout(18_000),
  });
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  if (!response.ok || !contentType.startsWith("audio/")) {
    throw new HumanVoiceUnavailableError("Gerçek insan ses kaynağına ulaşılamadı.");
  }
  const audio = Buffer.from(await response.arrayBuffer());
  if (audio.length < 512 || audio.length > MAX_AUDIO_BYTES) {
    throw new HumanVoiceUnavailableError("Ses kaydı doğrulanamadı.");
  }
  return audio;
}

async function readCachedAudio(path: string): Promise<Buffer | null> {
  try {
    const [audio] = await adminStorage.bucket().file(path).download();
    return audio.length > 0 ? audio : null;
  } catch { return null; }
}

async function writeCachedAudio(
  path: string,
  audio: Buffer,
  source: "github-human" | "quran-foundation-wbw",
): Promise<void> {
  try {
    await adminStorage.bucket().file(path).save(audio, {
      resumable: false,
      contentType: "audio/mpeg",
      metadata: {
        cacheControl: "private, max-age=31536000, immutable",
        metadata: { source },
      },
    });
  } catch {
    // Cache failures must not prevent a verified human recording from playing.
  }
}
