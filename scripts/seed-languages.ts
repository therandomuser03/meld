import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const languages = [
    { locale: "en", nameEnglish: "English", nativeName: "English" },
    { locale: "hi", nameEnglish: "Hindi", nativeName: "हिन्दी" },
    { locale: "es", nameEnglish: "Spanish", nativeName: "Español" },
    { locale: "fr", nameEnglish: "French", nativeName: "Français" },
    { locale: "de", nameEnglish: "German", nativeName: "Deutsch" },
    { locale: "ja", nameEnglish: "Japanese", nativeName: "日本語" },
    { locale: "zh", nameEnglish: "Chinese", nativeName: "中文" },
    { locale: "pt", nameEnglish: "Portuguese", nativeName: "Português" },
    { locale: "ru", nameEnglish: "Russian", nativeName: "Русский" },
    { locale: "ko", nameEnglish: "Korean", nativeName: "한국어" },
];

async function main() {
    console.log("Seeding languages...");
    for (const lang of languages) {
        await prisma.language.upsert({
            where: { locale: lang.locale },
            update: {},
            create: lang,
        });
    }
    console.log("Seeding finished.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
