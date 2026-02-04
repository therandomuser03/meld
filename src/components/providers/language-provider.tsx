"use client";

import { ReactNode, useEffect, useState, createContext, useContext } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n";

type LanguageContextType = {
    locale: string;
    setLocale: (locale: string) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({
    children,
    initialLocale = "en"
}: {
    children: ReactNode;
    initialLocale?: string;
}) {
    const [locale, setLocaleState] = useState(initialLocale);

    useEffect(() => {
        if (initialLocale && i18n.language !== initialLocale) {
            i18n.changeLanguage(initialLocale);
            setLocaleState(initialLocale);
        }
    }, [initialLocale]);

    const setLocale = (newLocale: string) => {
        i18n.changeLanguage(newLocale);
        setLocaleState(newLocale);
    };

    return (
        <LanguageContext.Provider value={{ locale, setLocale }}>
            <I18nextProvider i18n={i18n}>
                {children}
            </I18nextProvider>
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
};
