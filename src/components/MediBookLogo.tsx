"use client";

import { useId } from "react";

export function MediBookLogo({
  size = 40,
  className = "",
  showBackground = true,
}: {
  size?: number;
  className?: string;
  showBackground?: boolean;
}) {
  const uid = useId().replace(/:/g, "");
  const bgId = `mb-bg-${uid}`;
  const bookId = `mb-book-${uid}`;
  const pulseId = `mb-pulse-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`medibook-logo ${className}`}
      role="img"
      aria-label="MediBook Clinic logo"
    >
      {showBackground && (
        <>
          <defs>
            <linearGradient id={bgId} x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
              <stop stopColor="var(--logo-stop-a, #c4a574)" />
              <stop offset="1" stopColor="var(--logo-stop-b, #a88542)" />
            </linearGradient>
            <linearGradient id={bookId} x1="20" y1="18" x2="44" y2="46" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff" stopOpacity="0.98" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0.88" />
            </linearGradient>
            <linearGradient id={pulseId} x1="16" y1="40" x2="48" y2="40" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.7" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0.95" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="56" height="56" rx="16" fill={`url(#${bgId})`} />
          <rect
            x="4"
            y="4"
            width="56"
            height="56"
            rx="16"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="1.5"
          />
        </>
      )}

      <path
        d="M32 17C26.5 17 22 19.2 22 22v22c0 0 4.5-2.5 10-2.5s10 2.5 10 2.5V22c0-2.8-4.5-5-10-5Z"
        fill={showBackground ? `url(#${bookId})` : "currentColor"}
        fillOpacity={showBackground ? 1 : 0.2}
      />
      <path
        d="M32 17v27"
        stroke={showBackground ? "rgba(255,255,255,0.45)" : "currentColor"}
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      <circle cx="27" cy="26" r="1.6" fill={showBackground ? "var(--cr-accent, #a88542)" : "currentColor"} />
      <circle cx="32" cy="26" r="1.6" fill={showBackground ? "var(--cr-accent, #a88542)" : "currentColor"} />
      <circle cx="37" cy="26" r="1.6" fill={showBackground ? "var(--cr-accent, #a88542)" : "currentColor"} />

      <path
        d="M18 42h8l2.5-5 3 10 2.5-5H46"
        stroke={showBackground ? `url(#${pulseId})` : "currentColor"}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M48 20v5M45.5 22.5H50.5"
        stroke={showBackground ? "rgba(255,255,255,0.9)" : "currentColor"}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
