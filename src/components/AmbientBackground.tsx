"use client";

export function AmbientBackground() {
  return (
    <div className="ambient-bg no-print" aria-hidden>
      <div className="circadian-ambient-base" />
      <div className="circadian-ambient-glow circadian-ambient-glow-a" />
      <div className="circadian-ambient-glow circadian-ambient-glow-b" />
      <div className="circadian-ambient-grain" />
    </div>
  );
}
