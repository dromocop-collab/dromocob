"use client";

import { useEffect } from "react";

const clamp = (value: number) => Math.min(1, Math.max(0, value));

export default function HomeMotionController() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".home-page");
    if (!root) return;
    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktopQuery = window.matchMedia("(min-width: 901px)");
    const coarseQuery = window.matchMedia("(pointer: coarse)");
    let frame = 0;
    const readyTimer = window.setTimeout(() => root.classList.add("is-motion-ready"), 1300);

    // The mobile layout is already static. Avoid doing dozens of layout reads on
    // every touch scroll; this directly protects INP and battery usage.
    if (!desktopQuery.matches || coarseQuery.matches || reducedQuery.matches) {
      root.classList.add("is-motion-ready");
      return () => {
        window.clearTimeout(readyTimer);
        root.classList.remove("is-motion-ready");
      };
    }

    const update = () => {
      frame = 0;
      const viewport = window.innerHeight;
      const hero = root.querySelector<HTMLElement>(".hero");
      if (hero) {
        const rect = hero.getBoundingClientRect();
        hero.style.setProperty("--hero-progress", clamp(-rect.top / Math.max(rect.height - viewport * .15, 1)).toFixed(4));
      }

      root.querySelectorAll<HTMLElement>("[data-cinematic]").forEach(section => {
        const rect = section.getBoundingClientRect();
        const progress = clamp((viewport - rect.top) / (viewport + rect.height));
        section.style.setProperty("--section-progress", progress.toFixed(4));
        const reveal = clamp((progress - .08) / .62);
        const exit = clamp((progress - .78) / .22);
        section.style.setProperty("--scene-reveal", reveal.toFixed(4));
        section.style.setProperty("--scene-exit", exit.toFixed(4));
        section.querySelectorAll<HTMLElement>(":scope > *").forEach((child, index) => {
          child.style.setProperty("--scene-order", String(Math.min(index, 8)));
        });
      });

      const services = root.querySelector<HTMLElement>(".pinned-services");
      if (services) {
        const rect = services.getBoundingClientRect();
        const progress = clamp(-rect.top / Math.max(services.offsetHeight - viewport, 1));
        const phase = Math.min(progress * 6, 5.999);
        const current = Math.floor(phase);
        const withinStep = phase - current;
        const transition = current === 5 ? 0 : clamp((withinStep - .72) / .28);
        const easedTransition = transition * transition * (3 - 2 * transition);
        const active = Math.min(5, current + (easedTransition >= .5 ? 1 : 0));
        services.style.setProperty("--services-progress", progress.toFixed(4));
        services.style.setProperty("--service-phase", withinStep.toFixed(4));
        services.style.setProperty("--service-step", String(current + 1));
        services.querySelectorAll<HTMLElement>(".service-frame").forEach((frameElement, index) => {
          const visibility = index === current ? 1 - easedTransition : index === current + 1 ? easedTransition : 0;
          frameElement.style.setProperty("--frame-visibility", visibility.toFixed(4));
          frameElement.style.setProperty("--frame-offset", `${(index - current - easedTransition) * 36}px`);
          frameElement.toggleAttribute("data-active", index === active);
          frameElement.style.setProperty("--active-phase", index === current ? withinStep.toFixed(4) : index === current + 1 ? transition.toFixed(4) : "0");
        });
      }

      root.querySelectorAll<HTMLElement>("[data-parallax]").forEach(media => {
        const rect = media.getBoundingClientRect();
        const progress = clamp((viewport - rect.top) / (viewport + rect.height));
        media.style.setProperty("--media-progress", progress.toFixed(4));
      });

      const projects = root.querySelector<HTMLElement>("[data-horizontal-projects]");
      const track = projects?.querySelector<HTMLElement>(".project-grid");
      if (projects && track && desktopQuery.matches) {
        const rect = projects.getBoundingClientRect();
        const progress = clamp(-rect.top / Math.max(projects.offsetHeight - viewport, 1));
        const distance = Math.max(0, track.scrollWidth - projects.clientWidth + 96);
        track.style.setProperty("--projects-x", `${-distance * progress}px`);
      }
    };
    const requestUpdate = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    const observer = new ResizeObserver(requestUpdate);
    observer.observe(root);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(readyTimer);
      root.classList.remove("is-motion-ready");
      observer.disconnect();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  return null;
}
