"use client";

import { CIRCADIAN_PHASES, getCircadianPhase } from "@/lib/circadian";
import { useEffect, useState } from "react";

export function CircadianInfoBanner() {
  const [phase, setPhase] = useState(getCircadianPhase());

  useEffect(() => {
    const sync = () => setPhase(getCircadianPhase());
    sync();
    const id = window.setInterval(sync, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const info = CIRCADIAN_PHASES[phase];

  return (
    <div className="circadian-info-card" data-testid="circadian-info">
      <p>
        <strong>
          {info.emoji} {info.label} phase
        </strong>{" "}
        ({info.hours}) — {info.description}
      </p>
    </div>
  );
}
