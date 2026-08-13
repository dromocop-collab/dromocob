export type FethiyeNewsItem = {
  title: string;
  url: string;
  publishedAt: string;
  summary: string;
  source: string;
};

const FETHIYE_RSS = "https://www.haber48.com.tr/rss/haberler/fethiye/";

function decodeXml(value: string) {
  return value
    .replace(/^<!\[CDATA\[|\]\]>$/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function tag(block: string, name: string) {
  const match = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "i"));
  return match ? decodeXml(match[1]) : "";
}

function safeNewsUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && /(^|\.)haber48\.com\.tr$/i.test(url.hostname) ? url.toString() : "";
  } catch {
    return "";
  }
}

export async function getFethiyeNews(): Promise<FethiyeNewsItem[]> {
  try {
    const response = await fetch(FETHIYE_RSS, {
      headers: { Accept: "application/rss+xml, application/xml, text/xml" },
      next: { revalidate: 900 },
      signal: AbortSignal.timeout(6000),
    });
    if (!response.ok) return [];
    const xml = await response.text();
    return [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)]
      .map(match => {
        const block = match[1];
        const url = safeNewsUrl(tag(block, "link"));
        const rawDate = tag(block, "pubDate") || tag(block, "dc:date");
        const date = new Date(rawDate);
        return {
          title: tag(block, "title").slice(0, 180),
          url,
          publishedAt: Number.isNaN(date.getTime()) ? "" : date.toISOString(),
          summary: (tag(block, "description") || "Haberin ayrıntıları için kaynağa gidin.").slice(0, 260),
          source: "Haber48",
        };
      })
      .filter(item => item.title && item.url)
      .slice(0, 9);
  } catch {
    return [];
  }
}
