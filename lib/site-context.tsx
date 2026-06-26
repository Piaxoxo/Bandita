"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type SiteContextValue = {
  introDone: boolean;
  setIntroDone: (v: boolean) => void;
  reducedMotion: boolean;
  setReducedMotionPref: (v: boolean | null) => void;
};

const SiteContext = createContext<SiteContextValue | null>(null);

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [introDone, setIntroDone] = useState(false);
  // null = follow system preference; true/false = manual override
  const [reducedPref, setReducedPref] = useState<boolean | null>(null);
  const [systemReduced, setSystemReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setSystemReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const reducedMotion = reducedPref ?? systemReduced;

  useEffect(() => {
    document.documentElement.dataset.reducedMotion = String(reducedMotion);
  }, [reducedMotion]);

  const value = useMemo<SiteContextValue>(
    () => ({
      introDone,
      setIntroDone,
      reducedMotion,
      setReducedMotionPref: setReducedPref,
    }),
    [introDone, reducedMotion],
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used within SiteProvider");
  return ctx;
}
