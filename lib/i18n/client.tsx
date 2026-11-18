"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_LOCALE, translator, type Locale, type T } from "./locale";

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

export function useT(): T {
  return translator(useLocale());
}
