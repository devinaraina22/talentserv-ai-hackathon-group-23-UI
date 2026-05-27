"use client";

import { useEffect, useState } from "react";
import { Phone, PhoneOff, X } from "lucide-react";
import { CLINIC } from "@/lib/constants";

type CallState = "idle" | "connecting" | "connected" | "ended";

export function SupportCallWidget({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [callState, setCallState] = useState<CallState>("idle");

  useEffect(() => {
    if (!open) setCallState("idle");
  }, [open]);

  const startCall = () => {
    setCallState("connecting");
    setTimeout(() => setCallState("connected"), 1800);
  };

  const endCall = () => {
    setCallState("ended");
    setTimeout(() => {
      setCallState("idle");
      onClose();
    }, 1200);
  };

  if (!open) return null;

  return (
    <div className="assist-panel assist-panel-call no-print" data-testid="ai-call-support">
      <header className="assist-panel-header">
        <div className="flex items-center gap-2">
          <span className="assist-avatar assist-avatar-call">
            <Phone className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-bold text-[var(--cute-text)]">Care Line 📞</p>
            <p className="text-[11px] text-[var(--cute-text-muted)]">AI voice help — tap to connect</p>
          </div>
        </div>
        <button type="button" className="assist-panel-close" onClick={onClose} aria-label="Close">
          <X className="h-4 w-4" />
        </button>
      </header>

      <div className="assist-call-body">
        <div className={`assist-call-ring ${callState === "connecting" ? "assist-call-pulse" : ""}`}>
          <div className="assist-call-avatar-lg">
            <Phone className="h-8 w-8" />
          </div>
        </div>

        {callState === "idle" && (
          <>
            <p className="text-center text-sm text-[var(--pro-secondary)]">
              Talk to our AI scheduling assistant for help booking, rescheduling, or clinic
              information.
            </p>
            <p className="mt-2 text-center text-xs text-[var(--pro-tertiary)]">
              Demo: voice is simulated in this MVP
            </p>
            <button type="button" className="btn-primary mt-6 w-full" onClick={startCall}>
              Start AI Call
            </button>
            <p className="mt-4 text-center text-xs text-[var(--pro-tertiary)]">
              Prefer a human? Call {CLINIC.phoneDisplay}
            </p>
          </>
        )}

        {callState === "connecting" && (
          <p className="text-center text-sm font-medium text-[var(--pro-accent)]">
            Connecting to AI assistant<span className="loading-dots" />
          </p>
        )}

        {callState === "connected" && (
          <>
            <div className="assist-waveform" aria-hidden>
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <span key={i} className="assist-wave-bar" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
            <p className="mt-4 text-center text-sm text-[var(--pro-label)]">
              &quot;Hello! I can help you book an appointment. Which department are you
              looking for?&quot;
            </p>
            <p className="mt-2 text-center text-xs text-[var(--pro-tertiary)]">
              Use the chat assistant for full booking, or call {CLINIC.phoneDisplay}
            </p>
            <button type="button" className="btn-secondary mt-6 w-full gap-2" onClick={endCall}>
              <PhoneOff className="h-4 w-4" /> End Call
            </button>
          </>
        )}

        {callState === "ended" && (
          <p className="text-center text-sm text-[var(--pro-secondary)]">Call ended. Thank you!</p>
        )}
      </div>
    </div>
  );
}

export function CallFab({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className={`assist-fab assist-fab-call ${active ? "assist-fab-active" : ""}`}
      onClick={onClick}
      aria-label="Open AI call support"
      data-testid="call-fab"
    >
      <Phone className="h-5 w-5" />
      <span className="assist-fab-label">Call 📞</span>
    </button>
  );
}
