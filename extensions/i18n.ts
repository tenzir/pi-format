import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

type Locale = "en" | "es" | "fr" | "pt-BR";
type Params = Record<string, string | number>;

const translations: Record<Exclude<Locale, "en">, Record<string, string>> = {
  es: {
    "formatter.failedToFormat": "No se pudo formatear {file}: {message}",
    "formatter.failedFlush": "No se pudieron procesar los formatos pendientes: {message}",
    "formatter.failedSave": "No se pudo guardar la configuración: {message}",
    "formatter.requiresTui": "/formatter requiere el modo interactivo de la UI",
  },
  fr: {
    "formatter.failedToFormat": "Impossible de formater {file} : {message}",
    "formatter.failedFlush": "Impossible de traiter les formats en attente : {message}",
    "formatter.failedSave": "Impossible d’enregistrer la configuration : {message}",
    "formatter.requiresTui": "/formatter nécessite le mode UI interactif",
  },
  "pt-BR": {
    "formatter.failedToFormat": "Falha ao formatar {file}: {message}",
    "formatter.failedFlush": "Falha ao processar formatações pendentes: {message}",
    "formatter.failedSave": "Falha ao salvar a configuração: {message}",
    "formatter.requiresTui": "/formatter requer o modo de UI interativo",
  },
};

let currentLocale: Locale = "en";

export function initI18n(pi: ExtensionAPI): void {
  pi.events?.emit?.("pi-core/i18n/registerBundle", {
    namespace: "pi-formatter",
    defaultLocale: "en",
    locales: translations,
  });

  pi.events?.emit?.("pi-core/i18n/requestApi", {
    onReady: (api: { getLocale?: () => string; onLocaleChange?: (cb: (locale: string) => void) => void }) => {
      const next = api.getLocale?.();
      if (isLocale(next)) currentLocale = next;
      api.onLocaleChange?.((locale) => {
        if (isLocale(locale)) currentLocale = locale;
      });
    },
  });
}

export function t(key: string, fallback: string, params: Params = {}): string {
  const template = currentLocale === "en" ? fallback : translations[currentLocale]?.[key] ?? fallback;
  return template.replace(/\{(\w+)\}/g, (_, name) => String(params[name] ?? `{${name}}`));
}

function isLocale(locale: string | undefined): locale is Locale {
  return locale === "en" || locale === "es" || locale === "fr" || locale === "pt-BR";
}
