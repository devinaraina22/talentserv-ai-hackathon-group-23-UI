export type CircadianPhase = "morning" | "day" | "evening" | "night";

export const CIRCADIAN_PHASES: Record<
  CircadianPhase,
  {
    label: string;
    emoji: string;
    hours: string;
    tagline: string;
    description: string;
  }
> = {
  morning: {
    label: "Warm Sand",
    emoji: "🌅",
    hours: "6:00 – 12:00",
    tagline: "Morning · gentle start",
    description:
      "Low blue-light warmth to ease into planning and light work without shocking your circadian rhythm.",
  },
  day: {
    label: "Soft Charcoal",
    emoji: "☀️",
    hours: "12:00 – 18:00",
    tagline: "Day · peak focus",
    description:
      "High 12:1 contrast for maximum readability under bright office lights — ideal for intense work.",
  },
  evening: {
    label: "Moonlight Blue",
    emoji: "🌙",
    hours: "18:00 – 22:00",
    tagline: "Evening · wind down",
    description:
      "15% softer brightness with calming lavender-blue accents — great for reviews and documentation.",
  },
  night: {
    label: "Twilight Gray",
    emoji: "🌑",
    hours: "22:00 – 6:00",
    tagline: "Night · protect sleep",
    description:
      "Very warm ~2200K tones with minimal blue light so late-night fixes disrupt melatonin less.",
  },
};

export function getCircadianPhase(date = new Date()): CircadianPhase {
  const hour = date.getHours();
  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "day";
  if (hour >= 18 && hour < 22) return "evening";
  return "night";
}

export function msUntilNextPhaseChange(date = new Date()): number {
  const hour = date.getHours();
  const nextHour =
    hour < 6 ? 6 : hour < 12 ? 12 : hour < 18 ? 18 : hour < 22 ? 22 : 30;
  const next = new Date(date);
  if (nextHour === 30) {
    next.setDate(next.getDate() + 1);
    next.setHours(6, 0, 0, 0);
  } else {
    next.setHours(nextHour, 0, 0, 0);
  }
  return Math.max(next.getTime() - date.getTime(), 60_000);
}
