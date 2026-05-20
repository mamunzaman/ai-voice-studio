export type VoiceOption = {
  id:
    | "male_bavarian"
    | "female_bavarian"
    | "male_hochdeutsch";
  label: string;
  accent: string;
  traits: string[];
};
