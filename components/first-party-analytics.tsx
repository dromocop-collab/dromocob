"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { CONSENT_STORAGE_KEY } from "@/lib/google-consent";

type EventName = "page_view" | "heartbeat" | "click" | "scroll" | "page_exit";

const SESSION_KEY = "dc_analytics_session";
const VISITOR_KEY = "dc_analytics_visitor";

function id(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replaceAll("-", "")}`;
}

function storedId(key: string, prefix: string) {
  const existing = sessionStorage.getItem(key) || localStorage.getItem(key);
  if (existing) return existing;
  const next = id(prefix);
  if (key === SESSION_KEY) sessionStorage.setItem(key, next);
  else localStorage.setItem(key, next);
  return next;
}

function analyticsAllowed() {
  try {
    const consent = JSON.parse(localStorage.getItem(CONSENT_STORAGE_KEY) || "null");
    return consent?.analytics === true;
  } catch {
    return false;
  }
}

function captureAdAttribution(searchParams: URLSearchParams) {
  try {
    const consent = JSON.parse(localStorage.getItem(CONSENT_STORAGE_KEY) || "null");
    if (consent?.advertising !== true) return;
    const keys = ["gclid", "gbraid", "wbraid", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
    const incoming = Object.fromEntries(keys.map(key => [key, searchParams.get(key) || ""]).filter(([, value]) => value));
    if (!Object.keys(incoming).length) return;
    const payload = { ...incoming, landingPage: location.pathname, capturedAt: new Date().toISOString() };
    document.cookie = `dc_ad_attribution=${encodeURIComponent(JSON.stringify(payload))}; Path=/; Max-Age=7776000; SameSite=Lax; Secure`;
  } catch {}
}

function AnalyticsRuntime() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pageStartedAt = useRef(0);
  const maxScroll = useRef(0);
  const lastScrollBucket = useRef(0);
  const queue = useRef<Record<string, unknown>[]>([]);
  const flushing = useRef(false);

  useEffect(() => {
    const capture = () => captureAdAttribution(searchParams);
    capture();
    window.addEventListener("dromocob:consent", capture);
    return () => window.removeEventListener("dromocob:consent", capture);
  }, [searchParams]);

  useEffect(() => {
    if (pathname.startsWith("/admin") || !analyticsAllowed()) return;

    const sessionId = storedId(SESSION_KEY, "s");
    const visitorId = storedId(VISITOR_KEY, "v");
    const page = pathname + (searchParams.toString() ? `?${searchParams}` : "");
    pageStartedAt.current = Date.now();
    maxScroll.current = 0;
    lastScrollBucket.current = 0;

    const flush = async (useBeacon = false) => {
      if (!queue.current.length || flushing.current) return;
      const events = queue.current.splice(0, 20);
      const body = JSON.stringify({ sessionId, visitorId, events });
      if (useBeacon && navigator.sendBeacon) {
        navigator.sendBeacon("/api/analytics/collect", new Blob([body], { type: "application/json" }));
        return;
      }
      flushing.current = true;
      try {
        await fetch("/api/analytics/collect", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body,
          keepalive: true,
        });
      } catch {
        queue.current.unshift(...events);
      } finally {
        flushing.current = false;
      }
    };

    const push = (name: EventName, extra: Record<string, unknown> = {}) => {
      queue.current.push({
        name,
        page,
        title: document.title.slice(0, 160),
        at: new Date().toISOString(),
        ...extra,
      });
      if (name !== "heartbeat") void flush();
    };

    push("page_view", {
      referrer: document.referrer.slice(0, 500),
      screen: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language,
    });

    const heartbeat = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        push("heartbeat", { duration: Math.round((Date.now() - pageStartedAt.current) / 1000), scrollDepth: maxScroll.current });
        void flush();
      }
    }, 15_000);

    const onClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement).closest<HTMLElement>("a,button,[role='button']");
      if (!target) return;
      const label = (target.getAttribute("aria-label") || target.textContent || "").trim().replace(/\s+/g, " ").slice(0, 100);
      const href = target instanceof HTMLAnchorElement ? target.href : "";
      push("click", { label: label || "İsimsiz öğe", target: href ? new URL(href, location.href).pathname : target.tagName.toLowerCase() });
    };

    const onScroll = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const depth = height > 0 ? Math.min(100, Math.round((window.scrollY / height) * 100)) : 100;
      maxScroll.current = Math.max(maxScroll.current, depth);
      const bucket = [25, 50, 75, 100].find(value => depth >= value && lastScrollBucket.current < value);
      if (bucket) {
        lastScrollBucket.current = bucket;
        push("scroll", { scrollDepth: bucket });
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        push("page_exit", { duration: Math.round((Date.now() - pageStartedAt.current) / 1000), scrollDepth: maxScroll.current });
        void flush(true);
      }
    };

    document.addEventListener("click", onClick, true);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(heartbeat);
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      push("page_exit", { duration: Math.round((Date.now() - pageStartedAt.current) / 1000), scrollDepth: maxScroll.current });
      void flush(true);
    };
  }, [pathname, searchParams]);

  return null;
}

export default function FirstPartyAnalytics() {
  return <Suspense fallback={null}><AnalyticsRuntime /></Suspense>;
}
