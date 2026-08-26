import { adminDb } from "@/lib/firebase-admin";

const DEFAULT_ARTIST_ID = "1866196278";
const STORE_COUNTRY = "tr";
const CHECK_INTERVAL_MS = 15 * 60 * 1000;

export type StoreApp = {
  trackId: number;
  name: string;
  version: string;
  icon: string;
  url: string;
  genre: string;
  minimumOsVersion: string;
  releaseDate: string;
  versionReleaseDate: string;
  releaseNotes: string;
  rating: number;
  ratingCount: number;
};

export type StoreEvent = {
  id: string;
  type: "new_app" | "new_version" | "store_sync";
  appId: number;
  appName: string;
  version: string;
  title: string;
  detail: string;
  eventAt: string;
  url: string;
};

export type StorePulse = {
  ok: boolean;
  artistId: string;
  artistName: string;
  artistUrl: string;
  checkedAt: string;
  nextCheckAt: string;
  apps: StoreApp[];
  events: StoreEvent[];
  cached: boolean;
};

type AppleResult = {
  wrapperType?: string;
  artistName?: string;
  artistLinkUrl?: string;
  artistViewUrl?: string;
  trackId?: number;
  trackName?: string;
  version?: string;
  artworkUrl512?: string;
  artworkUrl100?: string;
  trackViewUrl?: string;
  primaryGenreName?: string;
  minimumOsVersion?: string;
  releaseDate?: string;
  currentVersionReleaseDate?: string;
  releaseNotes?: string;
  averageUserRating?: number;
  userRatingCount?: number;
};

function iso(value: unknown, fallback = new Date(0).toISOString()) {
  const date = new Date(String(value || ""));
  return Number.isNaN(date.getTime()) ? fallback : date.toISOString();
}

function normalizeApp(result: AppleResult): StoreApp | null {
  if (!result.trackId || !result.trackName) return null;
  return {
    trackId: result.trackId,
    name: result.trackName,
    version: String(result.version || "—"),
    icon: String(result.artworkUrl512 || result.artworkUrl100 || ""),
    url: String(result.trackViewUrl || ""),
    genre: String(result.primaryGenreName || "App Store"),
    minimumOsVersion: String(result.minimumOsVersion || "—"),
    releaseDate: iso(result.releaseDate),
    versionReleaseDate: iso(result.currentVersionReleaseDate || result.releaseDate),
    releaseNotes: String(result.releaseNotes || "Yeni sürüm App Store’da yayında."),
    rating: Number(result.averageUserRating || 0),
    ratingCount: Number(result.userRatingCount || 0),
  };
}

function eventFor(app: StoreApp, previous?: StoreApp): StoreEvent {
  const isNew = !previous;
  return {
    id: `${app.trackId}-${app.version.replace(/[^a-zA-Z0-9.-]/g, "-")}`,
    type: isNew ? "new_app" : "new_version",
    appId: app.trackId,
    appName: app.name,
    version: app.version,
    title: isNew ? `${app.name} mağazada keşfedildi` : `${app.name} ${app.version} yayında`,
    detail: app.releaseNotes,
    eventAt: isNew ? app.releaseDate : app.versionReleaseDate,
    url: app.url,
  };
}

function fallbackEvents(apps: StoreApp[]) {
  return apps
    .map(app => {
      const hasVersionUpdate = new Date(app.versionReleaseDate).getTime() - new Date(app.releaseDate).getTime() > 60 * 60 * 1000;
      return eventFor(app, hasVersionUpdate ? { ...app, version: "previous" } : undefined);
    })
    .sort((a, b) => Date.parse(b.eventAt) - Date.parse(a.eventAt));
}

async function fetchAppleStore(artistId: string) {
  const endpoint = `https://itunes.apple.com/lookup?id=${encodeURIComponent(artistId)}&entity=software&country=${STORE_COUNTRY}&limit=200`;
  const response = await fetch(endpoint, { cache: "no-store", headers: { accept: "application/json" } });
  if (!response.ok) throw new Error(`APPLE_LOOKUP_${response.status}`);
  const payload = await response.json() as { results?: AppleResult[] };
  const results = Array.isArray(payload.results) ? payload.results : [];
  const artist = results.find(item => item.wrapperType === "artist");
  const artistName = artist?.artistName || results.find(item => item.artistName)?.artistName || "Dromocob Apps";
  const apps = results.map(normalizeApp).filter((app): app is StoreApp => Boolean(app)).sort((a, b) => Date.parse(b.versionReleaseDate) - Date.parse(a.versionReleaseDate));
  return {
    artistName: String(artistName),
    artistUrl: String(artist?.artistLinkUrl || results.find(item => item.artistViewUrl)?.artistViewUrl || ""),
    apps,
  };
}

function pulseFromData(data: Record<string, unknown>, events: StoreEvent[], cached: boolean): StorePulse {
  const checkedAt = iso(data.checkedAt, new Date().toISOString());
  return {
    ok: true,
    artistId: String(data.artistId || DEFAULT_ARTIST_ID),
    artistName: String(data.artistName || "Dromocob Apps"),
    artistUrl: String(data.artistUrl || ""),
    checkedAt,
    nextCheckAt: new Date(Date.parse(checkedAt) + CHECK_INTERVAL_MS).toISOString(),
    apps: Array.isArray(data.apps) ? data.apps as StoreApp[] : [],
    events,
    cached,
  };
}

async function recentEvents() {
  const snapshot = await adminDb.collection("app_store_events").orderBy("eventAt", "desc").limit(12).get();
  return snapshot.docs.map(doc => doc.data() as StoreEvent);
}

export async function syncAppStore(force = false): Promise<StorePulse> {
  const artistId = process.env.APP_STORE_ARTIST_ID || DEFAULT_ARTIST_ID;
  const monitorRef = adminDb.collection("integrations").doc("app_store_monitor");
  let previousData: Record<string, unknown> = {};

  try {
    const previous = await monitorRef.get();
    previousData = previous.data() || {};
    const lastCheck = Date.parse(String(previousData.checkedAt || ""));
    if (!force && Number.isFinite(lastCheck) && Date.now() - lastCheck < CHECK_INTERVAL_MS) {
      return pulseFromData(previousData, await recentEvents(), true);
    }
  } catch (error) {
    console.warn("[APP STORE MONITOR] Snapshot unavailable, continuing with live lookup", error);
  }

  const current = await fetchAppleStore(artistId);
  const checkedAt = new Date().toISOString();
  const oldApps = new Map((Array.isArray(previousData.apps) ? previousData.apps as StoreApp[] : []).map(app => [app.trackId, app]));
  const detected = current.apps
    .filter(app => !oldApps.has(app.trackId) || oldApps.get(app.trackId)?.version !== app.version)
    .map(app => eventFor(app, oldApps.get(app.trackId)));

  const data: Record<string, unknown> = {
    artistId,
    artistName: current.artistName,
    artistUrl: current.artistUrl,
    apps: current.apps,
    checkedAt,
    lastSuccessfulAt: checkedAt,
    intervalMinutes: CHECK_INTERVAL_MS / 60_000,
    source: "Apple Lookup API",
  };

  try {
    const batch = adminDb.batch();
    batch.set(monitorRef, data, { merge: true });
    const eventsToSave = detected.length ? detected : (oldApps.size ? [] : fallbackEvents(current.apps));
    eventsToSave.forEach(event => batch.set(adminDb.collection("app_store_events").doc(event.id), { ...event, detectedAt: checkedAt }, { merge: true }));
    await batch.commit();
    return pulseFromData(data, await recentEvents(), false);
  } catch (error) {
    console.warn("[APP STORE MONITOR] Persistence unavailable", error);
    return pulseFromData(data, detected.length ? detected : fallbackEvents(current.apps), false);
  }
}
