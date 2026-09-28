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

const AUDIO_BASE_URL = "https://verses.quran.foundation/Alafasy/mp3";

export function buildAssignmentRecitation(
  ayahs: readonly QuranAudioAyah[],
): QuranAssignmentRecitation {
  return {
    reciterId: "ALAFASY",
    reciterName: "Mishari Rashid al-Afasy",
    provider: "Quran Foundation",
    tracks: ayahs.map(ayah => ({
      ayahId: ayah.id,
      url: `${AUDIO_BASE_URL}/${pad(ayah.surahNumber)}${pad(ayah.ayahNumber)}.mp3`,
    })),
  };
}

function pad(value: number): string {
  if (!Number.isSafeInteger(value) || value < 1 || value > 999) {
    throw new Error("Kur'an ses ayeti kimliği geçersiz.");
  }
  return String(value).padStart(3, "0");
}
