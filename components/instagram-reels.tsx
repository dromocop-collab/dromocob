"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Camera, Maximize2, Pause, Play, Volume2, VolumeX } from "lucide-react";

const reels = [
  { id: "DNnDzK4MZjE", label: "Reel / 01" },
  { id: "DR7VehgCmDM", label: "Reel / 02" },
  { id: "DN73cRpiqeP", label: "Reel / 03" },
  { id: "DKZ9lJFsHgK", label: "Reel / 04" },
  { id: "DKXTsKAMsk8", label: "Reel / 05" },
  { id: "DIbZKYkMeGV", label: "Reel / 06" },
];

function formatTime(value: number) {
  if (!Number.isFinite(value)) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function ReelPlayer({ id, index }: { id: string; index: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const pauseOtherPlayer = (event: Event) => {
      const activeId = (event as CustomEvent<string>).detail;
      if (activeId !== id) videoRef.current?.pause();
    };
    window.addEventListener("dromocob:reel-play", pauseOtherPlayer);
    return () => window.removeEventListener("dromocob:reel-play", pauseOtherPlayer);
  }, [id]);

  async function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      window.dispatchEvent(new CustomEvent("dromocob:reel-play", { detail: id }));
      await video.play();
    } else {
      video.pause();
    }
  }

  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }

  function seek(value: number) {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = value;
    setCurrentTime(value);
  }

  async function openFullscreen() {
    const target = frameRef.current;
    if (target?.requestFullscreen) await target.requestFullscreen();
  }

  return <div ref={frameRef} className={`instagram-reel-frame custom-reel-player ${playing ? "is-playing" : "is-paused"}`}>
    <video
      ref={videoRef}
      src={`/videos/reels/${id}.mp4`}
      poster={`/videos/reels/${id}.jpg`}
      aria-label={`Dromocob Instagram Reel ${index + 1}`}
      playsInline
      preload="metadata"
      onClick={togglePlayback}
      onPlay={() => setPlaying(true)}
      onPause={() => setPlaying(false)}
      onEnded={() => setPlaying(false)}
      onLoadedMetadata={event => setDuration(event.currentTarget.duration)}
      onTimeUpdate={event => setCurrentTime(event.currentTarget.currentTime)}
    />
    <div className="reel-player-shade" aria-hidden="true" />
    <button type="button" className="reel-player-main" onClick={togglePlayback} aria-label={playing ? "Videoyu duraklat" : "Videoyu oynat"}>{playing ? <Pause/> : <Play/>}<span>{playing ? "DURAKLAT" : "OYnat"}</span></button>
    <div className="reel-player-top"><span><i/> DROMOCOB ORIGINAL</span><b>{String(index + 1).padStart(2, "0")} / {String(reels.length).padStart(2, "0")}</b></div>
    <div className="reel-player-controls">
      <input type="range" min={0} max={duration || 0} step="0.05" value={currentTime} onChange={event => seek(Number(event.target.value))} aria-label="Video ilerleme çubuğu" style={{ "--reel-progress": `${duration ? (currentTime / duration) * 100 : 0}%` } as React.CSSProperties}/>
      <div><button type="button" onClick={togglePlayback} aria-label={playing ? "Duraklat" : "Oynat"}>{playing ? <Pause/> : <Play/>}</button><span>{formatTime(currentTime)} <i>/</i> {formatTime(duration)}</span><button type="button" onClick={toggleMute} aria-label={muted ? "Sesi aç" : "Sesi kapat"}>{muted ? <VolumeX/> : <Volume2/>}</button><button type="button" onClick={openFullscreen} aria-label="Tam ekran"><Maximize2/></button></div>
    </div>
  </div>;
}

export default function InstagramReels() {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ active: false, startX: 0, scrollLeft: 0 });
  const [canScrollBack, setCanScrollBack] = useState(false);
  const [canScrollForward, setCanScrollForward] = useState(true);

  function updateScrollState() {
    const track = trackRef.current;
    if (!track) return;
    setCanScrollBack(track.scrollLeft > 8);
    setCanScrollForward(track.scrollLeft < track.scrollWidth - track.clientWidth - 8);
  }

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    updateScrollState();
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(track);
    window.addEventListener("resize", updateScrollState);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  function scrollTrack(direction: -1 | 1) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * Math.max(340, track.clientWidth * 0.72), behavior: "smooth" });
  }

  function beginDrag(event: React.PointerEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("button, a, input, video")) return;
    const track = trackRef.current;
    if (!track) return;
    dragRef.current = { active: true, startX: event.clientX, scrollLeft: track.scrollLeft };
    track.classList.add("is-dragging");
    track.setPointerCapture(event.pointerId);
  }

  function moveDrag(event: React.PointerEvent<HTMLDivElement>) {
    const track = trackRef.current;
    if (!track || !dragRef.current.active) return;
    track.scrollLeft = dragRef.current.scrollLeft - (event.clientX - dragRef.current.startX) * 1.15;
  }

  function endDrag(event: React.PointerEvent<HTMLDivElement>) {
    const track = trackRef.current;
    if (!track || !dragRef.current.active) return;
    dragRef.current.active = false;
    track.classList.remove("is-dragging");
    if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);
    updateScrollState();
  }

  return <section className="instagram-reels section" aria-labelledby="instagram-reels-title">
    <div className="instagram-reels-head">
      <div><p className="eyebrow"><Camera /> @dromocob / Reels</p><h2 id="instagram-reels-title">Hareket halinde.<br/><em>Kadrajın içinde.</em></h2></div>
      <div><p>Prodüksiyonlardan, setlerden ve görsel hikâyelerden kısa kesitler. Videoyu seç ve doğrudan burada oynat.</p><a href="https://www.instagram.com/dromocob/" target="_blank" rel="noreferrer">Instagram&apos;da takip et <ArrowUpRight /></a></div>
    </div>
    <div className="instagram-reels-navigation">
      <div className="instagram-reels-guide" aria-hidden="true"><Play/><span>Oynat</span><i/><span>Kaydırarak keşfet</span><ArrowRight/></div>
      <div className="instagram-reels-arrows" aria-label="Reels gezinme kontrolleri"><button type="button" onClick={() => scrollTrack(-1)} disabled={!canScrollBack} aria-label="Önceki videolar"><ArrowLeft/></button><button type="button" onClick={() => scrollTrack(1)} disabled={!canScrollForward} aria-label="Sonraki videolar"><ArrowRight/></button></div>
    </div>
    <div ref={trackRef} className="instagram-reels-track" onScroll={updateScrollState} onPointerDown={beginDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}>
      {reels.map((reel, index) => <article className="instagram-reel-card" key={reel.id}>
        <header><span>{reel.label}</span><small>@dromocob</small></header>
        <ReelPlayer id={reel.id} index={index}/>
        <footer><span><i/> INSTAGRAM REELS</span><a href={`https://www.instagram.com/reel/${reel.id}/`} target="_blank" rel="noreferrer" aria-label={`${reel.label} videosunu Instagram'da aç`}><ArrowUpRight/></a></footer>
      </article>)}
      <a className="instagram-reels-end" href="https://www.instagram.com/dromocob/" target="_blank" rel="noreferrer"><Camera/><small>DAHA FAZLASI</small><strong>@dromocob</strong><span>Profili keşfet <ArrowUpRight/></span></a>
    </div>
  </section>;
}
