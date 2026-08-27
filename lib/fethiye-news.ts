export type FethiyeNewsItem = {
  title: string;
  url: string;
  publishedAt: string;
  summary: string;
  source: string;
  image: string;
  ageHours: number;
  freshness: "live" | "recent" | "archive";
};

type FeedSource = { name: string; url: string; host: RegExp };

const FEEDS: FeedSource[] = [
  { name: "Google Haberler", url: "https://news.google.com/rss/search?q=Fethiye%20when%3A7d&hl=tr&gl=TR&ceid=TR%3Atr", host: /(^|\.)news\.google\.com$/i },
  { name: "Haber48", url: "https://www.haber48.com.tr/rss/haberler/fethiye/", host: /(^|\.)haber48\.com\.tr$/i },
];

const fallbackImages = [
  "/images/fethiye/oludeniz-cinematic.jpg",
  "/images/fethiye/faralya-cinematic.jpg",
  "/images/fethiye/kabak-koyu-cinematic.jpg",
  "/images/fethiye/kayakoy-cinematic.jpg",
];

function decodeXml(value: string) {
  return value
    .replace(/^<!\[CDATA\[|\]\]>$/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tag(block: string, name: string) {
  const match = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "i"));
  return match ? decodeXml(match[1]) : "";
}

function attr(block: string, element: string, attribute: string) {
  const match = block.match(new RegExp(`<${element}[^>]*\\s${attribute}=["']([^"']+)["'][^>]*>`, "i"));
  return match ? decodeXml(match[1]) : "";
}

function safeUrl(value: string, allowedHost?: RegExp) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || (allowedHost && !allowedHost.test(url.hostname))) return "";
    return url.toString();
  } catch {
    return "";
  }
}

function normalizeTitle(value: string) {
  return value.toLocaleLowerCase("tr-TR").replace(/[^a-z0-9çğıöşü]+/gi, " ").trim();
}

function imageFor(title: string, index: number) {
  let hash = index;
  for (let character = 0; character < title.length; character += 1) hash = (hash * 31 + title.charCodeAt(character)) >>> 0;
  return fallbackImages[hash % fallbackImages.length];
}

async function readFeed(feed: FeedSource): Promise<Omit<FethiyeNewsItem, "ageHours" | "freshness">[]> {
  try {
    const response = await fetch(feed.url, {
      headers: { Accept: "application/rss+xml, application/xml, text/xml" },
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(6500),
    });
    if (!response.ok) return [];
    const xml = await response.text();
    return [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)]
      .map((match, index) => {
        const block = match[1];
        const url = safeUrl(tag(block, "link"), feed.host);
        const rawDate = tag(block, "pubDate") || tag(block, "dc:date") || tag(block, "published");
        const date = new Date(rawDate);
        const title = tag(block, "title").replace(/\s+-\s+[^-]{2,50}$/, "").slice(0, 180);
        const media = safeUrl(attr(block, "media:content", "url")) || safeUrl(attr(block, "enclosure", "url"));
        return {
          title,
          url,
          publishedAt: Number.isNaN(date.getTime()) ? "" : date.toISOString(),
          summary: (tag(block, "description") || "Haberin ayrıntıları için doğrulanmış kaynağa gidin.").slice(0, 260),
          source: tag(block, "source") || feed.name,
          image: media || imageFor(title, index),
        };
      })
      .filter(item => item.title && item.url && item.publishedAt);
  } catch {
    return [];
  }
}

export async function getFethiyeNews(): Promise<FethiyeNewsItem[]> {
  const now = Date.now();
  const merged = (await Promise.all(FEEDS.map(readFeed))).flat();
  const seen = new Set<string>();

  return merged
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .filter(item => {
      const key = normalizeTitle(item.title);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map(item => {
      const ageHours = Math.max(0, Math.floor((now - Date.parse(item.publishedAt)) / 3_600_000));
      return { ...item, ageHours, freshness: ageHours <= 24 ? "live" as const : ageHours <= 72 ? "recent" as const : "archive" as const };
    })
    .slice(0, 12);
}
