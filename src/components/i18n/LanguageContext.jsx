import { createContext, useContext, useState, useEffect } from "react";
import { translations, rtlLanguages } from "./translations";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem("petsit_lang") || "en";
  });

  const t = (key) => translations[lang]?.[key] ?? translations["en"]?.[key] ?? key;
  const isRTL = rtlLanguages.includes(lang);

  const switchLang = (l) => {
    setLang(l);
    localStorage.setItem("petsit_lang", l);
  };

  useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang, isRTL]);

  return (
    <LanguageContext.Provider value={{ lang, t, isRTL, switchLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}