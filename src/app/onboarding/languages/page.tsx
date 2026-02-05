import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma/client";
import { LanguagesForm } from "./languages-form";

export default async function OnboardingLanguagesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // Fetch user profile for country prioritization
    const profile = await prisma.userProfile.findUnique({
        where: { id: user.id },
        select: { region: true }
    });

    // Fetch available languages
    let languages = await prisma.language.findMany({
        orderBy: { nameEnglish: 'asc' }
    });

    // Auto-seed/Update to ensure all 60+ supported languages are present
    if (languages.length < 60) {
        const defaults = [
            // European
            { locale: "en", nameEnglish: "English", nativeName: "English", countryCode: "US" },
            { locale: "en-GB", nameEnglish: "English (UK)", nativeName: "English (UK)", countryCode: "GB" },
            { locale: "es", nameEnglish: "Spanish", nativeName: "Español", countryCode: "ES" },
            { locale: "fr", nameEnglish: "French", nativeName: "Français", countryCode: "FR" },
            { locale: "de", nameEnglish: "German", nativeName: "Deutsch", countryCode: "DE" },
            { locale: "it", nameEnglish: "Italian", nativeName: "Italiano", countryCode: "IT" },
            { locale: "pt", nameEnglish: "Portuguese", nativeName: "Português", countryCode: "PT" },
            { locale: "pt-BR", nameEnglish: "Portuguese (Brazil)", nativeName: "Português (Brasil)", countryCode: "BR" },
            { locale: "ru", nameEnglish: "Russian", nativeName: "Русский", countryCode: "RU" },
            { locale: "pl", nameEnglish: "Polish", nativeName: "Polski", countryCode: "PL" },
            { locale: "nl", nameEnglish: "Dutch", nativeName: "Nederlands", countryCode: "NL" },
            { locale: "sv", nameEnglish: "Swedish", nativeName: "Svenska", countryCode: "SE" },
            { locale: "no", nameEnglish: "Norwegian", nativeName: "Norsk", countryCode: "NO" },
            { locale: "da", nameEnglish: "Danish", nativeName: "Dansk", countryCode: "DK" },
            { locale: "fi", nameEnglish: "Finnish", nativeName: "Suomi", countryCode: "FI" },
            { locale: "cs", nameEnglish: "Czech", nativeName: "Čeština", countryCode: "CZ" },
            { locale: "hu", nameEnglish: "Hungarian", nativeName: "Magyar", countryCode: "HU" },
            { locale: "ro", nameEnglish: "Romanian", nativeName: "Română", countryCode: "RO" },
            { locale: "bg", nameEnglish: "Bulgarian", nativeName: "Български", countryCode: "BG" },
            { locale: "el", nameEnglish: "Greek", nativeName: "Ελληνικά", countryCode: "GR" },
            { locale: "tr", nameEnglish: "Turkish", nativeName: "Türkçe", countryCode: "TR" },
            { locale: "uk", nameEnglish: "Ukrainian", nativeName: "Українська", countryCode: "UA" },
            { locale: "sq", nameEnglish: "Albanian", nativeName: "Shqip", countryCode: "AL" },
            { locale: "be", nameEnglish: "Belarusian", nativeName: "Беларуская", countryCode: "BY" },
            { locale: "hr", nameEnglish: "Croatian", nativeName: "Hrvatski", countryCode: "HR" },
            { locale: "sr", nameEnglish: "Serbian", nativeName: "Српски", countryCode: "RS" },
            { locale: "sk", nameEnglish: "Slovak", nativeName: "Slovenčina", countryCode: "SK" },
            { locale: "sl", nameEnglish: "Slovenian", nativeName: "Slovenščina", countryCode: "SI" },
            { locale: "et", nameEnglish: "Estonian", nativeName: "Eesti", countryCode: "EE" },
            { locale: "lv", nameEnglish: "Latvian", nativeName: "Latviešu", countryCode: "LV" },
            { locale: "lt", nameEnglish: "Lithuanian", nativeName: "Lietuvių", countryCode: "LT" },
            { locale: "is", nameEnglish: "Icelandic", nativeName: "Íslenska", countryCode: "IS" },
            { locale: "ga", nameEnglish: "Irish", nativeName: "Gaeilge", countryCode: "IE" },
            { locale: "mt", nameEnglish: "Maltese", nativeName: "Malti", countryCode: "MT" },
            // Asian
            { locale: "ja", nameEnglish: "Japanese", nativeName: "日本語", countryCode: "JP" },
            { locale: "ko", nameEnglish: "Korean", nativeName: "한국어", countryCode: "KR" },
            { locale: "zh-CN", nameEnglish: "Chinese (Simplified)", nativeName: "简体中文", countryCode: "CN" },
            { locale: "zh-TW", nameEnglish: "Chinese (Traditional)", nativeName: "繁體中文", countryCode: "TW" },
            { locale: "vi", nameEnglish: "Vietnamese", nativeName: "Tiếng Việt", countryCode: "VN" },
            { locale: "th", nameEnglish: "Thai", nativeName: "ไทย", countryCode: "TH" },
            { locale: "id", nameEnglish: "Indonesian", nativeName: "Bahasa Indonesia", countryCode: "ID" },
            { locale: "ms", nameEnglish: "Malay", nativeName: "Bahasa Melayu", countryCode: "MY" },
            { locale: "fil", nameEnglish: "Filipino", nativeName: "Filipino", countryCode: "PH" },
            { locale: "hi", nameEnglish: "Hindi", nativeName: "हिन्दी", countryCode: "IN" },
            { locale: "bn", nameEnglish: "Bengali", nativeName: "বাংলা", countryCode: "IN" },
            { locale: "te", nameEnglish: "Telugu", nativeName: "తెలుగు", countryCode: "IN" },
            { locale: "mr", nameEnglish: "Marathi", nativeName: "मराठी", countryCode: "IN" },
            { locale: "ta", nameEnglish: "Tamil", nativeName: "தமிழ்", countryCode: "IN" },
            { locale: "gu", nameEnglish: "Gujarati", nativeName: "ગુજરાતી", countryCode: "IN" },
            { locale: "kn", nameEnglish: "Kannada", nativeName: "കನ್ನಡ", countryCode: "IN" },
            { locale: "ml", nameEnglish: "Malayalam", nativeName: "മലയാളം", countryCode: "IN" },
            { locale: "pa", nameEnglish: "Punjabi", nativeName: "ਪੰਜਾਬੀ", countryCode: "IN" },
            { locale: "ur", nameEnglish: "Urdu", nativeName: "اردو", countryCode: "PK" },
            { locale: "ne", nameEnglish: "Nepali", nativeName: "नेपाली", countryCode: "NP" },
            { locale: "si", nameEnglish: "Sinhala", nativeName: "සිංහල", countryCode: "LK" },
            { locale: "km", nameEnglish: "Khmer", nativeName: "ខ្មែរ", countryCode: "KH" },
            { locale: "lo", nameEnglish: "Lao", nativeName: "ລາວ", countryCode: "LA" },
            { locale: "my", nameEnglish: "Burmese", nativeName: "မြန်မာ", countryCode: "MM" },
            // Middle East & Africa
            { locale: "ar", nameEnglish: "Arabic", nativeName: "العربية", countryCode: "SA" },
            { locale: "he", nameEnglish: "Hebrew", nativeName: "עברית", countryCode: "IL" },
            { locale: "fa", nameEnglish: "Persian", nativeName: "فارسی", countryCode: "IR" },
            { locale: "am", nameEnglish: "Amharic", nativeName: "አማርኛ", countryCode: "ET" },
            { locale: "sw", nameEnglish: "Swahili", nativeName: "Kiswahili", countryCode: "KE" },
            { locale: "yo", nameEnglish: "Yoruba", nativeName: "Yorùbá", countryCode: "NG" },
            { locale: "ig", nameEnglish: "Igbo", nativeName: "Asụsụ Igbo", countryCode: "NG" },
            { locale: "zu", nameEnglish: "Zulu", nativeName: "isiZulu", countryCode: "ZA" },
            { locale: "af", nameEnglish: "Afrikaans", nativeName: "Afrikaans", countryCode: "ZA" },
            // Other
            { locale: "hy", nameEnglish: "Armenian", nativeName: "Հայերեն", countryCode: "AM" },
            { locale: "ka", nameEnglish: "Georgian", nativeName: "ქართული", countryCode: "GE" },
            { locale: "az", nameEnglish: "Azerbaijani", nativeName: "Azərbaycanca", countryCode: "AZ" },
        ];

        await Promise.all(defaults.map(lang =>
            prisma.language.upsert({
                where: { locale: lang.locale },
                update: { countryCode: lang.countryCode },
                create: lang
            })
        ));

        languages = await prisma.language.findMany({
            orderBy: { nameEnglish: 'asc' }
        });
    }

    // Prioritize languages from the user's country
    const sortedLanguages = [...languages].sort((a, b) => {
        if (a.countryCode === profile?.region && b.countryCode !== profile?.region) return -1;
        if (a.countryCode !== profile?.region && b.countryCode === profile?.region) return 1;
        return a.nameEnglish.localeCompare(b.nameEnglish);
    });

    return (
        <div className="space-y-6">
            <div className="space-y-2 text-center pb-2">
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Select Languages</h1>
                <p className="text-muted-foreground text-sm max-w-[300px] mx-auto">Choose languages you are interested in communicating with.</p>
            </div>

            <LanguagesForm languages={sortedLanguages} />
        </div>
    );
}
