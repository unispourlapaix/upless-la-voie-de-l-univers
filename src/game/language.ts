import { loadSave, writeSave, type Language } from "./types";

export function getLanguage(): Language {
  const urlLanguage = new URLSearchParams(window.location.search).get("lang");
  if (urlLanguage === "en" || urlLanguage === "fr") {
    const save = loadSave();
    writeSave({ ...save, language: urlLanguage });
    return urlLanguage;
  }
  return loadSave().language ?? "fr";
}

export function setLanguage(language: Language): void {
  const save = loadSave();
  writeSave({ ...save, language });
}

export function toggleLanguage(): Language {
  const next = getLanguage() === "fr" ? "en" : "fr";
  setLanguage(next);
  return next;
}

export function t(fr: string, en: string): string {
  return getLanguage() === "fr" ? fr : en;
}

export function icon(symbol: string, fr: string, en: string): string {
  return `${symbol} ${t(fr, en)}`;
}
