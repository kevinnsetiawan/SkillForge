/**
 * Explicit output language for the generated roadmap. "auto" follows the
 * language of the learner's own text, which is the least surprising default.
 *
 * Kept free of zod/server-only imports so the form can use it client-side.
 */
export const ROADMAP_LANGUAGES = [
  { value: "auto", label: "Same as my question", englishName: "" },
  { value: "en", label: "English", englishName: "English" },
  { value: "id", label: "Bahasa Indonesia", englishName: "Indonesian" },
  { value: "es", label: "Español", englishName: "Spanish" },
  { value: "pt", label: "Português", englishName: "Portuguese" },
  { value: "fr", label: "Français", englishName: "French" },
  { value: "de", label: "Deutsch", englishName: "German" },
  { value: "ar", label: "العربية", englishName: "Arabic" },
  { value: "hi", label: "हिन्दी", englishName: "Hindi" },
  { value: "ja", label: "日本語", englishName: "Japanese" },
  { value: "ko", label: "한국어", englishName: "Korean" },
  { value: "zh", label: "中文", englishName: "Chinese" },
  { value: "ru", label: "Русский", englishName: "Russian" },
  { value: "tr", label: "Türkçe", englishName: "Turkish" },
  { value: "vi", label: "Tiếng Việt", englishName: "Vietnamese" },
  { value: "th", label: "ไทย", englishName: "Thai" },
] as const;

export type RoadmapLanguage = (typeof ROADMAP_LANGUAGES)[number]["value"];

export const ROADMAP_LANGUAGE_VALUES = ROADMAP_LANGUAGES.map((language) => language.value) as [
  RoadmapLanguage,
  ...RoadmapLanguage[],
];

export function roadmapLanguageName(value: RoadmapLanguage): string {
  return ROADMAP_LANGUAGES.find((language) => language.value === value)?.englishName ?? "";
}
