"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

// The server cannot know, so it renders the still version.
const prefersReducedMotion = () => window.matchMedia(REDUCED_MOTION).matches;

/**
 * The builder demo (recorded by `npm run demo:media`), looping without
 * sound. It starts from script rather than the autoplay attribute, which
 * would play before the motion preference can be read: with reduced motion
 * only the poster shows and the video is never downloaded. A button pauses
 * it (WCAG 2.2.2); the caption next to it describes what it shows, so the
 * video itself is hidden from screen readers.
 */
export function DemoVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = useSyncExternalStore(
    subscribe,
    prefersReducedMotion,
    () => true,
  );
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (reducedMotion || paused) video.pause();
    // Muted inline video may autoplay; if a browser still refuses, the
    // poster stays and the button offers to play.
    else video.play().catch(() => setPaused(true));
  }, [reducedMotion, paused]);

  return (
    <div className="relative overflow-hidden rounded-panel border border-line bg-surface">
      <video
        ref={videoRef}
        aria-hidden="true"
        width={1280}
        height={800}
        poster="/demo/builder-poster.webp"
        preload="none"
        muted
        loop
        playsInline
        className="block aspect-[8/5] h-auto w-full"
      >
        <source src="/demo/builder.webm" type="video/webm" />
        <source src="/demo/builder.mp4" type="video/mp4" />
      </video>
      {!reducedMotion && (
        <button
          type="button"
          onClick={() => setPaused((value) => !value)}
          className="absolute right-3 bottom-3 rounded-panel border border-line-strong bg-bg/90 px-3 py-1.5 text-sm font-medium hover:border-accent hover:text-accent"
        >
          {paused ? "Reproduzir demonstração" : "Pausar demonstração"}
        </button>
      )}
    </div>
  );
}
