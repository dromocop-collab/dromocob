export type QuranAudioAyah = {
  id: string;
  surahNumber: number;
  ayahNumber: number;
};

export type QuranRecitationTrack = {
  ayahId: string;
  url: string;
};

export type QuranAssignmentRecitation = {
  reciterId: "ALAFASY";
  reciterName: "Mishari Rashid al-Afasy";
  provider: "Quran Foundation";
  tracks: QuranRecitationTrack[];
};

const DEFAULT_AUDIO_BASE_URL = "https://verses.quran.foundation/Alafasy/mp3";

/**
 * Kurumun lisanslı kendi ayet seslerini kullanabilmesi için aynı dosya düzenine
 * sahip HTTPS CDN kökü HAFIZ_QURAN_AUDIO_BASE_URL ile değiştirilebilir.
 * Beklenen adlandırma: 001001.mp3, 001002.mp3 … 114006.mp3.
 */
export function quranAudioBaseURL() {
  const configured = String(process.env.HAFIZ_QURAN_AUDIO_BASE_URL || "").trim();
  if (!configured) return DEFAULT_AUDIO_BASE_URL;
  let url: URL;
  try { url = new URL(configured); } catch { throw new Error("HAFIZ_QURAN_AUDIO_BASE_URL geçersiz."); }
  if (url.protocol !== "https:") throw new Error("Kur'an ses CDN adresi HTTPS olmalıdır.");
  return configured.replace(/\/+$/, "");
}

export function buildAssignmentRecitation(
  ayahs: readonly QuranAudioAyah[],
): QuranAssignmentRecitation {
  const audioBaseURL = quranAudioBaseURL();
  return {
    reciterId: "ALAFASY",
    reciterName: "Mishari Rashid al-Afasy",
    provider: "Quran Foundation",
    tracks: ayahs.map(ayah => ({
      ayahId: ayah.id,
      url: `${audioBaseURL}/${pad(ayah.surahNumber)}${pad(ayah.ayahNumber)}.mp3`,
    })),
  };
}

function pad(value: number): string {
  if (!Number.isSafeInteger(value) || value < 1 || value > 999) {
    throw new Error("Kur'an ses ayeti kimliği geçersiz.");
  }
  return String(value).padStart(3, "0");
}
