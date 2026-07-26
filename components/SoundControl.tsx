"use client";

import { useEffect, useRef, useState } from "react";

/*
  Bandita soundtrack. Browsers block autoplay-with-sound until the visitor
  interacts, so we arm a one-shot "start on first gesture" and expose an
  always-visible mute/unmute pill. Pauses when the tab is hidden.
*/

export default function SoundControl() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const playingRef = useRef(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = 0.55;

    const start = () => {
      a.play()
        .then(() => {
          playingRef.current = true;
          setPlaying(true);
          detach();
        })
        .catch(() => {});
    };
    const detach = () => {
      ["pointerdown", "keydown", "touchstart", "wheel"].forEach((e) =>
        window.removeEventListener(e, start),
      );
    };
    ["pointerdown", "keydown", "touchstart", "wheel"].forEach((e) =>
      window.addEventListener(e, start, { passive: true }),
    );

    const onVis = () => {
      if (document.hidden) a.pause();
      else if (playingRef.current) a.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      detach();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play()
        .then(() => {
          playingRef.current = true;
          setPlaying(true);
        })
        .catch(() => {});
    } else {
      a.pause();
      playingRef.current = false;
      setPlaying(false);
    }
  };

  return (
    <>
      <audio ref={audioRef} src="/audio/bandita.mp3" loop preload="auto" />
      <button
        onClick={toggle}
        aria-label={playing ? "Sound ausschalten" : "Sound einschalten"}
        aria-pressed={playing}
        className="group fixed bottom-6 right-6 z-[70] flex items-center gap-2 rounded-full border border-ink/15 bg-creme/70 px-4 py-2.5 backdrop-blur-md transition-colors hover:border-pink"
      >
        <span className="flex h-4 items-end gap-[3px]">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="w-[3px] rounded-full bg-pink"
              style={{
                height: playing ? undefined : "4px",
                animation: playing
                  ? `soundbar 0.9s ease-in-out ${i * 0.12}s infinite`
                  : "none",
              }}
            />
          ))}
        </span>
        <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-ink/70">
          {playing ? "Sound" : "Muted"}
        </span>
      </button>
    </>
  );
}
