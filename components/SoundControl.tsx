"use client";

import { useEffect, useRef, useState } from "react";
import { audioState } from "@/lib/audio-store";

/*
  Bandita soundtrack + live audio analysis.

  Browsers block autoplay-with-sound until the visitor interacts, so we try to
  start with the intro and otherwise arm a one-shot "start on first gesture".
  A Web Audio AnalyserNode measures the track's loudness every frame and writes
  it to audioState.level, which the WebGL background reads to pulse in time.
  UI: an always-visible pill with a mute toggle + a volume slider.
*/

export default function SoundControl() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const rafRef = useRef(0);
  const playingRef = useRef(false);

  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.55);

  // build the analyser graph once (needs a user gesture to resume the context)
  const ensureGraph = () => {
    const a = audioRef.current;
    if (!a || ctxRef.current) return;
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    const src = ctx.createMediaElementSource(a);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;
    src.connect(analyser);
    analyser.connect(ctx.destination);
    ctxRef.current = ctx;
    analyserRef.current = analyser;
    dataRef.current = new Uint8Array(new ArrayBuffer(analyser.fftSize));

    const tick = () => {
      const an = analyserRef.current;
      const buf = dataRef.current;
      if (an && buf) {
        an.getByteTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) {
          const v = (buf[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / buf.length); // ~0..0.5
        const target = Math.min(1, rms * 2.4);
        audioState.level += (target - audioState.level) * 0.25;
      } else {
        audioState.level += (0 - audioState.level) * 0.1;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    audioState.active = true;
    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = volume;

    const start = () => {
      a.play()
        .then(() => {
          ensureGraph();
          ctxRef.current?.resume?.();
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
    start(); // try to begin with the intro

    const onVis = () => {
      if (document.hidden) a.pause();
      else if (playingRef.current) a.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      detach();
      document.removeEventListener("visibilitychange", onVis);
      cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play()
        .then(() => {
          ensureGraph();
          ctxRef.current?.resume?.();
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

  const onVolume = (v: number) => {
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  };

  return (
    <>
      <audio ref={audioRef} src="/audio/bandita.mp3" loop preload="auto" crossOrigin="anonymous" />
      <div className="fixed bottom-6 right-6 z-[70] flex items-center gap-3 rounded-full border border-ink/15 bg-creme/70 px-4 py-2.5 backdrop-blur-md">
        <button
          onClick={toggle}
          aria-label={playing ? "Sound ausschalten" : "Sound einschalten"}
          aria-pressed={playing}
          data-cursor="link"
          className="flex items-center gap-2"
        >
          <span className="flex h-4 items-end gap-[3px]">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="w-[3px] rounded-full bg-pink"
                style={{
                  height: playing ? undefined : "4px",
                  animation: playing ? `soundbar 0.9s ease-in-out ${i * 0.12}s infinite` : "none",
                }}
              />
            ))}
          </span>
          <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-ink/70">
            {playing ? "Sound" : "Muted"}
          </span>
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => onVolume(parseFloat(e.target.value))}
          aria-label="Lautstärke"
          className="w-16 cursor-pointer accent-pink"
        />
      </div>
    </>
  );
}
