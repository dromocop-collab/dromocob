"use client";

import { useEffect, useRef } from "react";

export default function ScrollProgress() {
  const rootRef = useRef<HTMLElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);
  const lineRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (window.matchMedia("(max-width: 900px), (pointer: coarse), (prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? window.scrollY / max : 0;
      const markers = Array.from(document.querySelectorAll<HTMLElement>("[data-motion-section]"));
      const center = window.innerHeight * .48;
      let closest = 0;
      let distance = Infinity;
      markers.forEach((marker, index) => {
        const next = Math.abs(marker.getBoundingClientRect().top - center);
        if (next < distance) { distance = next; closest = index; }
      });
      const active = Math.min(closest, markers.length - 1);
      const label = markers[active]?.dataset.motionSection || "HERO";
      if (lineRef.current) lineRef.current.style.transform = `scaleY(${progress})`;
      if (numberRef.current) numberRef.current.textContent = String(active + 1).padStart(2, "0");
      if (labelRef.current) labelRef.current.textContent = label;
    };
    const requestUpdate = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", requestUpdate); };
  }, []);
  return <aside ref={rootRef} className="scroll-progress" aria-hidden="true"><span ref={numberRef}>01</span><div><i ref={lineRef}/></div><small ref={labelRef}>HERO</small><b>/ 06</b></aside>;
}
