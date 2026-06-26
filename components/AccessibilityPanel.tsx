"use client";

import { useEffect, useState } from "react";
import { useSite } from "@/lib/site-context";
import type { Dictionary } from "@/i18n/types";

const A11Y_LABELS = {
  en: {
    title: "Accessibility",
    motion: "Reduce motion",
    contrast: "High contrast",
    brightness: "Brightness",
    textSize: "Text size",
    open: "Open accessibility settings",
    close: "Close",
    reset: "Reset",
  },
  de: {
    title: "Barrierefreiheit",
    motion: "Bewegung reduzieren",
    contrast: "Hoher Kontrast",
    brightness: "Helligkeit",
    textSize: "Schriftgröße",
    open: "Barrierefreiheit öffnen",
    close: "Schließen",
    reset: "Zurücksetzen",
  },
};

export default function AccessibilityPanel({
  lang,
}: {
  lang: keyof typeof A11Y_LABELS;
  dict?: Dictionary;
}) {
  const { reducedMotion, setReducedMotionPref } = useSite();
  const t = A11Y_LABELS[lang] ?? A11Y_LABELS.en;

  const [open, setOpen] = useState(false);
  const [contrast, setContrast] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [scale, setScale] = useState(100);

  useEffect(() => {
    document.documentElement.dataset.contrast = contrast ? "high" : "normal";
  }, [contrast]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--a11y-brightness",
      String(brightness / 100),
    );
  }, [brightness]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--a11y-scale",
      String(scale / 100),
    );
  }, [scale]);

  const reset = () => {
    setReducedMotionPref(null);
    setContrast(false);
    setBrightness(100);
    setScale(100);
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={t.open}
        aria-expanded={open}
        data-cursor="link"
        className="fixed bottom-5 left-5 z-[65] flex h-12 w-12 items-center justify-center rounded-full bg-ink text-creme shadow-lg transition-transform duration-300 ease-bandita hover:scale-110 md:bottom-7 md:left-7"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="4" r="2" fill="currentColor" />
          <path
            d="M4 8h16M12 8v9m0 0l-3 4m3-4l3 4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={t.title}
          className="glass fixed bottom-20 left-5 z-[66] w-72 rounded-2xl p-5 text-ink shadow-2xl md:bottom-24 md:left-7"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg">{t.title}</h2>
            <button
              onClick={() => setOpen(false)}
              aria-label={t.close}
              className="text-xs uppercase tracking-widest text-ink/50 hover:text-pink"
            >
              ✕
            </button>
          </div>

          <Toggle
            label={t.motion}
            checked={reducedMotion}
            onChange={(v) => setReducedMotionPref(v)}
          />
          <Toggle label={t.contrast} checked={contrast} onChange={setContrast} />

          <Slider
            label={t.brightness}
            value={brightness}
            min={70}
            max={120}
            onChange={setBrightness}
          />
          <Slider
            label={t.textSize}
            value={scale}
            min={90}
            max={130}
            onChange={setScale}
          />

          <button
            onClick={reset}
            className="mt-4 w-full rounded-full border border-ink/15 py-2 text-xs uppercase tracking-widest text-ink/60 transition-colors hover:border-pink hover:text-pink"
          >
            {t.reset}
          </button>
        </div>
      )}
    </>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="mb-3 flex cursor-pointer items-center justify-between">
      <span className="text-sm">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors duration-300 ${
          checked ? "bg-pink" : "bg-ink/20"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-creme transition-transform duration-300 ${
            checked ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </button>
    </label>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mb-3">
      <div className="mb-1 flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="tabular-nums text-ink/50">{value}%</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="h-1 w-full cursor-pointer appearance-none rounded-full bg-ink/15 accent-pink"
      />
    </div>
  );
}
