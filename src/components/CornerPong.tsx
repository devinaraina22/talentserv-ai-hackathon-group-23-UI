"use client";

import { Gamepad2, Minimize2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const W = 280;
const H = 180;
const PADDLE_H = 44;
const PADDLE_W = 8;
const BALL = 7;

export function CornerPong() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const runningRef = useRef(false);
  const stateRef = useRef({
    ballX: W / 2,
    ballY: H / 2,
    vx: 2.2,
    vy: 1.6,
    playerY: H / 2 - PADDLE_H / 2,
    aiY: H / 2 - PADDLE_H / 2,
    playerScore: 0,
    aiScore: 0,
  });

  const resetBall = useCallback((towardPlayer = false) => {
    const s = stateRef.current;
    s.ballX = W / 2;
    s.ballY = H / 2;
    s.vx = (towardPlayer ? -1 : 1) * (2 + Math.random());
    s.vy = (Math.random() > 0.5 ? 1 : -1) * (1.2 + Math.random());
  }, []);

  const tick = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const s = stateRef.current;

    s.ballX += s.vx;
    s.ballY += s.vy;

    if (s.ballY <= BALL || s.ballY >= H - BALL) s.vy *= -1;

    // Player paddle (left)
    if (
      s.ballX - BALL <= PADDLE_W + 12 &&
      s.ballY >= s.playerY &&
      s.ballY <= s.playerY + PADDLE_H &&
      s.vx < 0
    ) {
      s.vx = Math.abs(s.vx) * 1.04;
      s.vy += (s.ballY - (s.playerY + PADDLE_H / 2)) * 0.08;
    }

    // AI paddle (right)
    const aiCenter = s.aiY + PADDLE_H / 2;
    s.aiY += (s.ballY - aiCenter) * 0.09;
    s.aiY = Math.max(4, Math.min(H - PADDLE_H - 4, s.aiY));

    if (
      s.ballX + BALL >= W - PADDLE_W - 12 &&
      s.ballY >= s.aiY &&
      s.ballY <= s.aiY + PADDLE_H &&
      s.vx > 0
    ) {
      s.vx = -Math.abs(s.vx) * 1.04;
      s.vy += (s.ballY - (s.aiY + PADDLE_H / 2)) * 0.08;
    }

    if (s.ballX < 0) {
      s.aiScore += 1;
      resetBall(true);
    }
    if (s.ballX > W) {
      s.playerScore += 1;
      resetBall(false);
    }

    ctx.clearRect(0, 0, W, H);

    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "rgba(232, 224, 240, 0.95)");
    grad.addColorStop(1, "rgba(212, 228, 217, 0.9)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    ctx.setLineDash([4, 8]);
    ctx.strokeStyle = "rgba(155, 139, 180, 0.25)";
    ctx.beginPath();
    ctx.moveTo(W / 2, 0);
    ctx.lineTo(W / 2, H);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "rgba(123, 163, 136, 0.95)";
    ctx.shadowColor = "rgba(123, 163, 136, 0.5)";
    ctx.shadowBlur = 8;
    ctx.fillRect(12, s.playerY, PADDLE_W, PADDLE_H);

    ctx.fillStyle = "rgba(155, 139, 180, 0.95)";
    ctx.shadowColor = "rgba(155, 139, 180, 0.5)";
    ctx.fillRect(W - 12 - PADDLE_W, s.aiY, PADDLE_W, PADDLE_H);

    ctx.beginPath();
    ctx.arc(s.ballX, s.ballY, BALL, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.shadowBlur = 10;
    ctx.shadowColor = "rgba(155, 139, 180, 0.6)";
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = "rgba(61, 53, 72, 0.65)";
    ctx.font = "11px system-ui, sans-serif";
    ctx.fillText(`${s.playerScore}  ·  ${s.aiScore}`, W / 2 - 18, 16);
  }, [resetBall]);

  useEffect(() => {
    if (!open || minimized) {
      runningRef.current = false;
      return;
    }
    runningRef.current = true;
    let id = 0;
    const loop = () => {
      if (!runningRef.current) return;
      tick();
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => {
      runningRef.current = false;
      cancelAnimationFrame(id);
    };
  }, [open, minimized, tick]);

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    stateRef.current.playerY = Math.max(
      4,
      Math.min(H - PADDLE_H - 4, e.clientY - rect.top - PADDLE_H / 2)
    );
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="pong-fab no-print"
        aria-label="Open clinic break — Pong game"
        title="Clinic Break — Pong"
      >
        <Gamepad2 className="h-5 w-5" />
        <span className="pong-fab-ring" />
      </button>
    );
  }

  return (
    <div className={`pong-panel no-print ${minimized ? "pong-panel-min" : ""}`}>
      <div className="pong-panel-header">
        <span className="text-xs font-semibold text-[var(--wellness-secondary)]">Clinic Break · Pong</span>
        <div className="flex gap-1">
          <button
            type="button"
            className="pong-panel-btn"
            onClick={() => setMinimized((m) => !m)}
            aria-label={minimized ? "Expand game" : "Minimize game"}
          >
            <Minimize2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="pong-panel-btn"
            onClick={() => {
              setOpen(false);
              setMinimized(false);
            }}
            aria-label="Close game"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {!minimized && (
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="pong-canvas"
          onMouseMove={onMouseMove}
        />
      )}
    </div>
  );
}
