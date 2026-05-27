"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MessageCircle, Send, X } from "lucide-react";
import { useAppAuth } from "@/hooks/useAppAuth";
import { clientApiFetch } from "@/lib/api-client";
import { APPOINTMENT_TYPES, DEPARTMENTS } from "@/lib/constants";
import { useRole } from "./RoleProvider";
import type { Patient } from "@/lib/types";

type ChatOption = { label: string; value: string };

type ChatMessage = {
  id: string;
  role: "bot" | "user";
  text: string;
  options?: ChatOption[];
  input?: "date" | "text";
};

type BookingDraft = {
  patient_id: string;
  doctor_or_department: string;
  appointment_date: string;
  appointment_time: string;
  appointment_type: "In-person" | "Online";
  notes: string;
};

type Step =
  | "welcome"
  | "patient"
  | "department"
  | "date"
  | "time"
  | "type"
  | "notes"
  | "confirm"
  | "done";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function BookingChatbot({
  open,
  onClose,
  authenticated,
}: {
  open: boolean;
  onClose: () => void;
  authenticated: boolean;
}) {
  const { getToken } = useAppAuth();
  const { profile } = useRole();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [step, setStep] = useState<Step>("welcome");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [draft, setDraft] = useState<Partial<BookingDraft>>({
    appointment_type: "In-person",
    notes: "",
  });
  const [textInput, setTextInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const pushBot = useCallback((text: string, options?: ChatOption[], input?: ChatMessage["input"]) => {
    setMessages((m) => [...m, { id: uid(), role: "bot", text, options, input }]);
  }, []);

  const pushUser = useCallback((text: string) => {
    setMessages((m) => [...m, { id: uid(), role: "user", text }]);
  }, []);

  const resetChat = useCallback(() => {
    setMessages([]);
    setStep("welcome");
    setDraft({ appointment_type: "In-person", notes: "" });
    setTimeSlots([]);
    setTextInput("");
    pushBot(
      authenticated
        ? `Hello${profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}! I'm your MediBook assistant. I can help you book an appointment step by step.`
        : "Hello! I'm the MediBook booking assistant. Sign in to book an appointment with our clinic.",
      authenticated
        ? [{ label: "Book an appointment", value: "book" }, { label: "Not now", value: "cancel" }]
        : [
            { label: "Sign in to book", value: "signin" },
            { label: "Create account", value: "signup" },
          ]
    );
  }, [authenticated, profile?.name, pushBot]);

  useEffect(() => {
    if (open) resetChat();
  }, [open, resetChat]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!open || !authenticated) return;
    clientApiFetch(getToken, "/api/patients")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load patients");
        return r.json();
      })
      .then((list: Patient[]) => {
        let filtered = list;
        if (profile?.role === "Patient") {
          filtered = list.filter(
            (p) => p.email.toLowerCase() === profile.email.toLowerCase()
          );
        }
        setPatients(filtered);
      })
      .catch(() => setPatients([]));
  }, [open, authenticated, getToken, profile?.email, profile?.role]);

  const loadSlots = async (department: string, date: string) => {
    setLoading(true);
    try {
      const res = await clientApiFetch(
        getToken,
        `/api/availability?department=${encodeURIComponent(department)}&date=${date}`
      );
      const data = await res.json();
      const slots: string[] = data.slots ?? [];
      setTimeSlots(slots);
      setLoading(false);
      if (slots.length === 0) {
        pushBot(
          "No slots are available on that date. Please choose another date.",
          undefined,
          "date"
        );
        setStep("date");
        return;
      }
      pushBot("Great! Here are the available times:", slots.map((s) => ({ label: s, value: s })));
      setStep("time");
    } catch {
      setLoading(false);
      pushBot("I couldn't load availability. Please try again or use the booking form.");
    }
  };

  const submitBooking = async (finalDraft: BookingDraft) => {
    setLoading(true);
    pushUser("Confirm booking");
    try {
      const res = await clientApiFetch(getToken, "/api/appointments", {
        method: "POST",
        body: JSON.stringify(finalDraft),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        pushBot(data.error ?? "Booking failed. Please try again or use the appointments page.");
        return;
      }
      setStep("done");
      pushBot(
        `Your appointment is confirmed! Reference: ${data.appointment_id}. A confirmation email will be sent shortly.`,
        [{ label: "View receipt", value: `receipt:${data.appointment_id}` }]
      );
    } catch {
      setLoading(false);
      pushBot("Something went wrong. Please try again later.");
    }
  };

  const handleOption = async (value: string) => {
    if (value === "signin") {
      pushUser("Sign in to book");
      pushBot("Please sign in to continue.", [{ label: "Go to Sign In", value: "link:/sign-in" }]);
      return;
    }
    if (value === "signup") {
      pushUser("Create account");
      pushBot("Create a free account to get started.", [
        { label: "Go to Sign Up", value: "link:/sign-up" },
      ]);
      return;
    }
    if (value.startsWith("link:")) {
      window.location.href = value.replace("link:", "");
      return;
    }
    if (value.startsWith("receipt:")) {
      window.location.href = `/appointments/${value.replace("receipt:", "")}/receipt`;
      return;
    }
    if (value === "cancel") {
      pushUser("Not now");
      pushBot("No problem. I'm here whenever you need help booking.");
      return;
    }
    if (value === "book") {
      pushUser("Book an appointment");
      if (patients.length === 0) {
        pushBot(
          "You need a patient profile first.",
          [{ label: "Register patient", value: "link:/patients/new" }]
        );
        return;
      }
      if (patients.length === 1) {
        setDraft((d) => ({ ...d, patient_id: patients[0].patient_id }));
        pushBot("Which department would you like to visit?", DEPARTMENTS.map((d) => ({ label: d, value: d })));
        setStep("department");
        return;
      }
      pushBot(
        "Who is this appointment for?",
        patients.map((p) => ({ label: `${p.full_name} (${p.patient_id})`, value: p.patient_id }))
      );
      setStep("patient");
      return;
    }

    if (step === "patient") {
      const p = patients.find((x) => x.patient_id === value);
      pushUser(p?.full_name ?? value);
      setDraft((d) => ({ ...d, patient_id: value }));
      pushBot("Which department would you like to visit?", DEPARTMENTS.map((d) => ({ label: d, value: d })));
      setStep("department");
      return;
    }

    if (step === "department") {
      pushUser(value);
      setDraft((d) => ({ ...d, doctor_or_department: value }));
      pushBot("What date works for you? (Pick a date below)", undefined, "date");
      setStep("date");
      return;
    }

    if (step === "time") {
      pushUser(value);
      setDraft((d) => ({ ...d, appointment_time: value }));
      pushBot("Would you prefer in-person or online?", APPOINTMENT_TYPES.map((t) => ({ label: t, value: t })));
      setStep("type");
      return;
    }

    if (step === "type") {
      pushUser(value);
      setDraft((d) => ({
        ...d,
        appointment_type: value as "In-person" | "Online",
      }));
      pushBot(
        "Any notes for the care team? Type a message or tap Skip.",
        [{ label: "Skip", value: "skip-notes" }],
        "text"
      );
      setStep("notes");
      return;
    }

    if (value === "skip-notes") {
      pushUser("No notes");
      const next = { ...draft, notes: "" } as BookingDraft;
      setDraft(next);
      pushBot(
        `Please confirm:\n• ${next.doctor_or_department}\n• ${next.appointment_date} at ${next.appointment_time}\n• ${next.appointment_type}`,
        [{ label: "Confirm booking", value: "confirm" }, { label: "Start over", value: "restart" }]
      );
      setStep("confirm");
      return;
    }

    if (value === "confirm") {
      await submitBooking(draft as BookingDraft);
      return;
    }

    if (value === "restart") {
      pushUser("Start over");
      setMessages([]);
      setStep("welcome");
      setDraft({ appointment_type: "In-person", notes: "" });
      setTimeSlots([]);
      pushBot(
        "Let's start fresh. Would you like to book an appointment?",
        [{ label: "Book an appointment", value: "book" }, { label: "Not now", value: "cancel" }]
      );
      return;
    }
  };

  const handleDate = (date: string) => {
    const dept = draft.doctor_or_department;
    if (!date || !dept) return;
    pushUser(date);
    setDraft((d) => ({ ...d, appointment_date: date, appointment_time: "" }));
    loadSlots(dept, date);
  };

  const handleTextSubmit = () => {
    const t = textInput.trim();
    if (!t) return;
    pushUser(t);
    setTextInput("");
    if (step === "notes") {
      const next = { ...draft, notes: t } as BookingDraft;
      setDraft(next);
      pushBot(
        `Please confirm:\n• ${next.doctor_or_department}\n• ${next.appointment_date} at ${next.appointment_time}\n• ${next.appointment_type}${t ? `\n• Notes: ${t}` : ""}`,
        [{ label: "Confirm booking", value: "confirm" }, { label: "Start over", value: "restart" }]
      );
      setStep("confirm");
    }
  };

  if (!open) return null;

  return (
    <div className="assist-panel assist-panel-chat no-print" data-testid="booking-chatbot">
      <header className="assist-panel-header">
        <div className="flex items-center gap-2">
          <span className="assist-avatar assist-avatar-chat">
            <MessageCircle className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-bold text-[var(--cute-text)]">Booking Buddy 💬</p>
            <p className="text-[11px] text-[var(--cute-text-muted)]">Ask me anything — I&apos;ll guide you to book!</p>
          </div>
        </div>
        <button type="button" className="assist-panel-close" onClick={onClose} aria-label="Close chat">
          <X className="h-4 w-4" />
        </button>
      </header>

      <div className="assist-chat-messages" ref={scrollRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`assist-bubble assist-bubble-${msg.role}`}>
            <p className="whitespace-pre-wrap text-sm">{msg.text}</p>
            {msg.options && (
              <div className="assist-options">
                {msg.options.map((opt) =>
                  opt.value.startsWith("link:") ? (
                    <Link
                      key={opt.value}
                      href={opt.value.replace("link:", "")}
                      className="assist-option-btn"
                    >
                      {opt.label}
                    </Link>
                  ) : (
                    <button
                      key={opt.value}
                      type="button"
                      className="assist-option-btn"
                      onClick={() => handleOption(opt.value)}
                      disabled={loading || step === "done"}
                    >
                      {opt.label}
                    </button>
                  )
                )}
              </div>
            )}
            {msg.input === "date" && authenticated && (
              <input
                type="date"
                className="assist-date-input"
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => handleDate(e.target.value)}
              />
            )}
          </div>
        ))}
        {loading && (
          <div className="assist-bubble assist-bubble-bot">
            <p className="text-sm text-[var(--pro-secondary)]">
              Thinking<span className="loading-dots" />
            </p>
          </div>
        )}
      </div>

      {authenticated && step === "notes" && (
        <footer className="assist-chat-input">
          <input
            type="text"
            className="input-field flex-1 py-2 text-sm"
            placeholder="Optional notes..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleTextSubmit()}
          />
          <button type="button" className="assist-send-btn" onClick={handleTextSubmit} aria-label="Send">
            <Send className="h-4 w-4" />
          </button>
        </footer>
      )}
    </div>
  );
}

export function ChatFab({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className={`assist-fab assist-fab-chat ${active ? "assist-fab-active" : ""}`}
      onClick={onClick}
      aria-label="Open booking assistant chat"
      data-testid="chat-fab"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="assist-fab-label">Chat 💬</span>
    </button>
  );
}
