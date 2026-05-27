"use client";

import { CIRCADIAN_PHASES, getCircadianPhase } from "@/lib/circadian";
import { useEffect, useState } from "react";

export function CircadianBadge() {
  const [phase, setPhase] = useState(getCircadianPhase());

  useEffect(() => {
    const sync = () => setPhase(getCircadianPhase());
    sync();
    const id = window.setInterval(sync, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const info = CIRCADIAN_PHASES[phase];

  return (
    <div
      className="circadian-badge no-print"
      title={info.description}
      data-testid="circadian-badge"
    >
      <span className="circadian-badge-emoji" aria-hidden>
        {info.emoji}
      </span>
      <span className="circadian-badge-text">
        <span className="circadian-badge-label">{info.label}</span>
        <span className="circadian-badge-hours">{info.hours}</span>
      </span>
    </div>
  );
}
