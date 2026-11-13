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
  { value: "it", label: "Italiano", englishName: "Italian" },
  { value: "nl", label: "Nederlands", englishName: "Dutch" },
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
export type OutputLanguage = Exclude<RoadmapLanguage, "auto">;

export const ROADMAP_LANGUAGE_VALUES = ROADMAP_LANGUAGES.map((language) => language.value) as [
  RoadmapLanguage,
  ...RoadmapLanguage[],
];

export function roadmapLanguageName(value: RoadmapLanguage): string {
  return ROADMAP_LANGUAGES.find((language) => language.value === value)?.englishName ?? "";
}

/**
 * Small, dependency-free language hints. The model cannot be trusted to detect
 * the learner's language (it happily switches to Spanish on English topics),
 * so "auto" is resolved here instead of inside the prompt.
 */
const SCRIPT_HINTS: Array<{ value: OutputLanguage; pattern: RegExp }> = [
  { value: "ja", pattern: /[\u3040-\u30ff]/ },
  { value: "ko", pattern: /[\uac00-\ud7af]/ },
  { value: "zh", pattern: /[\u4e00-\u9fff]/ },
  { value: "ru", pattern: /[\u0400-\u04ff]/ },
  { value: "ar", pattern: /[\u0600-\u06ff]/ },
  { value: "hi", pattern: /[\u0900-\u097f]/ },
  { value: "th", pattern: /[\u0e00-\u0e7f]/ },
];

const WORD_HINTS: Partial<Record<OutputLanguage, readonly string[]>> = {
  en: [
    "the", "and", "with", "your", "how", "what", "from", "this", "that", "learn", "learning",
    "build", "create", "complete", "beginner", "advanced", "guide", "basics", "start",
  ],
  id: [
    "dan", "yang", "untuk", "dari", "dengan", "saya", "ingin", "bisa", "belajar", "membuat",
    "cara", "pemula", "sampai", "tentang", "aplikasi", "dasar", "lanjutan", "mulai", "menguasai",
    "website", "portofolio",
  ],
  es: [
    "el", "los", "las", "del", "para", "por", "como", "desde", "hasta", "aprender", "crear",
    "curso", "fundamentos", "cómo", "qué", "y", "una", "con", "más", "sin", "nivel", "búsqueda",
    "palabras", "clave", "página", "competencia", "público",
  ],
  pt: [
    "os", "das", "dos", "para", "por", "como", "desde", "até", "aprender", "criar", "curso",
    "fundamentos", "introdução", "pesquisa", "palavras", "chave", "página", "público", "com",
    "mais", "uma", "essenciais",
  ],
  fr: [
    "les", "des", "pour", "avec", "comment", "apprendre", "depuis", "créer", "cours",
    "fondamentaux", "introduction", "recherche", "mots", "clés", "page", "essentiels", "une",
    "dans", "plus",
  ],
  de: [
    "der", "die", "das", "und", "für", "mit", "wie", "lernen", "erstellen", "kurs", "grundlagen",
    "einführung", "suche", "zielgruppe", "seite", "ein", "eine", "im",
  ],
  it: [
    "gli", "della", "delle", "per", "con", "come", "imparare", "creare", "corso", "fondamenti",
    "introduzione", "ricerca", "parole", "chiave", "pubblico", "pagina", "essenziali", "una", "più",
  ],
  nl: [
    "het", "een", "en", "van", "voor", "met", "hoe", "leren", "cursus", "grondslagen",
    "inleiding", "zoeken", "trefwoorden", "doelgroep", "pagina", "essentiële",
  ],
  vi: [
    "và", "của", "cho", "với", "như", "thế", "nào", "học", "từ", "đến", "tạo", "khóa", "cơ",
    "bản", "giới", "thiệu", "tìm", "kiếm",
  ],
  tr: [
    "ve", "için", "ile", "nasıl", "öğrenmek", "öğren", "kadar", "oluştur", "kurs", "temeller",
    "giriş", "arama", "anahtar", "kelimeler", "hedef", "kitle", "sayfa",
  ],
};

/** Letters that strongly identify one language among the Latin-script ones. */
const LETTER_HINTS: Partial<Record<OutputLanguage, RegExp>> = {
  es: /[ñ¿¡]/i,
  pt: /[ãõ]/i,
  fr: /œ/i,
  de: /ß/i,
  vi: /[đơư]/i,
  tr: /[ğış]/i,
};

/**
 * Best-effort detection for the roadmap topic. Returns null when the text is
 * too short or ambiguous; callers then fall back to the browser locale.
 */
export function detectRoadmapLanguage(text: string): OutputLanguage | null {
  if (!text.trim()) return null;

  for (const hint of SCRIPT_HINTS) {
    if (hint.pattern.test(text)) return hint.value;
  }

  const tokens = text.toLowerCase().match(/\p{L}+/gu) ?? [];
  if (tokens.length === 0) return null;

  let best: OutputLanguage | null = null;
  let bestScore = 0;
  let tied = false;

  for (const [language, hints] of Object.entries(WORD_HINTS) as Array<
    [OutputLanguage, readonly string[]]
  >) {
    let score = tokens.reduce((total, token) => total + (hints.includes(token) ? 1 : 0), 0);

    if (LETTER_HINTS[language]?.test(text)) score += 2;

    if (score > bestScore) {
      best = language;
      bestScore = score;
      tied = false;
    } else if (score === bestScore && score > 0) {
      tied = true;
    }
  }

  return bestScore > 0 && !tied ? best : null;
}

const LOCALE_LANGUAGES: Record<string, OutputLanguage> = {
  en: "en",
  id: "id",
  in: "id",
  es: "es",
  pt: "pt",
  fr: "fr",
  de: "de",
  it: "it",
  nl: "nl",
  vi: "vi",
  tr: "tr",
  ar: "ar",
  hi: "hi",
  ja: "ja",
  ko: "ko",
  zh: "zh",
  ru: "ru",
  th: "th",
};

/** Map a browser locale such as `id-ID` to a supported roadmap language. */
export function roadmapLanguageFromLocale(locale: string | null | undefined): OutputLanguage | null {
  if (!locale) return null;
  const base = locale.toLowerCase().replace("_", "-").split("-")[0];
  return LOCALE_LANGUAGES[base] ?? null;
}

/**
 * Turn the requested language into a concrete one. For "auto" we detect the
 * topic language, then fall back to the browser locale, and finally English.
 */
export function resolveRoadmapLanguage(
  requested: RoadmapLanguage,
  topic: string,
  locale?: string | null,
): OutputLanguage {
  if (requested !== "auto") return requested;
  return detectRoadmapLanguage(topic) ?? roadmapLanguageFromLocale(locale) ?? "en";
}
