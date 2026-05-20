import type { VoiceOption } from "@/types/voice";

export const MAX_CHARACTERS =
  Number(process.env.NEXT_PUBLIC_MAX_TEXT_LENGTH) || 5000;

export const FREE_PLAN_CREDITS = 10000;

export const VOICE_OPTIONS: VoiceOption[] = [
  {
    id: "male_bavarian",
    label: "Male Bavarian",
    accent: "Bavarian Accent",
    traits: ["Warm", "Friendly", "Munich"],
  },
  {
    id: "female_bavarian",
    label: "Female Bavarian",
    accent: "Bavarian Accent",
    traits: ["Soft", "Natural", "Local"],
  },
  {
    id: "male_hochdeutsch",
    label: "Male Hochdeutsch",
    accent: "Hannover German",
    traits: ["Clear", "Neutral", "Professional"],
  },
];
