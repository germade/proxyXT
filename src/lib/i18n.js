import { load as parseYaml } from "js-yaml";
import enRaw from "../../messages/en.yml";
import esRaw from "../../messages/es.yml";
import frRaw from "../../messages/fr.yml";
import ptRaw from "../../messages/pt.yml";

const dictionaries = {
  en: parseYaml(enRaw) || {},
  es: parseYaml(esRaw) || {},
  fr: parseYaml(frRaw) || {},
  pt: parseYaml(ptRaw) || {}
};

const supportedLanguages = ["en", "es", "fr", "pt"];

function getByPath(obj, path) {
  const segments = String(path || "").split(".");
  let current = obj;
  for (const segment of segments) {
    if (!current || typeof current !== "object" || !(segment in current)) {
      return null;
    }
    current = current[segment];
  }
  return current;
}

function interpolate(template, vars = {}) {
  return String(template).replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_, key) => {
    const value = vars[key];
    return value === undefined || value === null ? "" : String(value);
  });
}

export function resolveLanguage(preference, browserLanguage) {
  const preferred = String(preference || "auto").toLowerCase();
  if (supportedLanguages.includes(preferred)) {
    return preferred;
  }

  const browser = String(browserLanguage || "").toLowerCase();
  if (browser.startsWith("pt")) {
    return "pt";
  }
  if (browser.startsWith("fr")) {
    return "fr";
  }
  if (browser.startsWith("es")) {
    return "es";
  }

  return "en";
}

export function createTranslator(language) {
  const selected = dictionaries[language] || dictionaries.en;

  return function t(key, vars) {
    const value = getByPath(selected, key) ?? getByPath(dictionaries.en, key);
    if (typeof value !== "string") {
      return key;
    }
    return interpolate(value, vars);
  };
}
