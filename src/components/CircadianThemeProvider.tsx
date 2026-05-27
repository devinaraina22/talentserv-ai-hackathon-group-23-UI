"use client";

import { useEffect, useState } from "react";
import { getCircadianPhase, msUntilNextPhaseChange, type CircadianPhase } from "@/lib/circadian";

export function CircadianThemeProvider({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<CircadianPhase>("morning");

  useEffect(() => {
    const apply = () => {
      const next = getCircadianPhase();
      setPhase(next);
      document.documentElement.setAttribute("data-circadian", next);
    };

    apply();

    let timeoutId = window.setTimeout(function tick() {
      apply();
      timeoutId = window.setTimeout(tick, msUntilNextPhaseChange());
    }, msUntilNextPhaseChange());

    const intervalId = window.setInterval(apply, 60_000);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, []);

  return <div data-circadian-phase={phase}>{children}</div>;
}
