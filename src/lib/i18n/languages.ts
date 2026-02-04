export type LanguageOption = {
  code: string;
  name: string;
  nativeName: string;
  flag: string; // Emoji flag
  regionCodes?: string[]; // ISO country codes where this is dominant
};

export const LANGUAGES: LanguageOption[] = [
  // India (IN)
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳", regionCodes: ["IN"] },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", flag: "🇮🇳", regionCodes: ["IN", "BD"] },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳", regionCodes: ["IN"] },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", flag: "🇮🇳", regionCodes: ["IN", "LK", "SG"] },
  { code: "mr", name: "Marathi", nativeName: "मराठी", flag: "🇮🇳", regionCodes: ["IN"] },
  
  // English (Global)
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸", regionCodes: ["US", "UK", "CA", "AU", "IN"] },
  
  // East Asia
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵", regionCodes: ["JP"] },
  { code: "zh", name: "Chinese (Simplified)", nativeName: "简体中文", flag: "🇨🇳", regionCodes: ["CN", "SG"] },
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷", regionCodes: ["KR"] },
  
  // Europe
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸", regionCodes: ["ES", "MX", "US"] },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷", regionCodes: ["FR", "CA"] },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪", regionCodes: ["DE"] },
  { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹", regionCodes: ["IT"] },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇵🇹", regionCodes: ["PT", "BR"] },
  { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺", regionCodes: ["RU"] },
];

// Helper to sort languages: Region matches first, then common, then alphabetical
export function getSortedLanguages(userCountryCode?: string | null) {
  if (!userCountryCode) return LANGUAGES;

  return [...LANGUAGES].sort((a, b) => {
    const aMatch = a.regionCodes?.includes(userCountryCode) ? 1 : 0;
    const bMatch = b.regionCodes?.includes(userCountryCode) ? 1 : 0;
    return bMatch - aMatch; // Descending (matches first)
  });
}