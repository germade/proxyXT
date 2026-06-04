import { h } from "preact";
import { CheckboxField } from "../components/CheckboxField.jsx";
import { SelectField } from "../components/SelectField.jsx";

export function PreferencesView({
  t,
  view,
  autoFailoverEnabled,
  language,
  onAutoFailoverChange,
  onLanguageChange
}) {
  return (
    <section className={`view-panel${view === "preferences" ? "" : " hidden"}`}>
      <div className="preferences-card">
        <h2>{t("preferences.title")}</h2>
        <SelectField
          id="language"
          label={t("labels.language")}
          value={language || "auto"}
          onChange={onLanguageChange}
          options={[
            { value: "auto", label: t("language.auto") },
            { value: "en", label: t("language.en") },
            { value: "es", label: t("language.es") },
            { value: "fr", label: t("language.fr") },
            { value: "pt", label: t("language.pt") }
          ]}
        />
        <CheckboxField
          id="autoFailoverEnabled"
          className="preferences-toggle"
          checked={Boolean(autoFailoverEnabled)}
          onChange={onAutoFailoverChange}
          label={t("labels.autoFailover")}
        />
        <p className="preferences-help">{t("preferences.help")}</p>
      </div>
    </section>
  );
}
