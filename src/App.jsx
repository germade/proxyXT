import { Fragment, h } from "preact";
import { AddBackButton } from "./components/AddBackButton.jsx";
import { LanguageBadge } from "./components/LanguageBadge.jsx";
import { useProxyApp } from "./hooks/useProxyApp.js";
import { getServerDisplayName } from "./lib/state.js";
import { LogsView } from "./views/LogsView.jsx";
import { ListView } from "./views/ListView.jsx";
import { FormView } from "./views/FormView.jsx";
import { PreferencesView } from "./views/PreferencesView.jsx";

export function App() {
  const {
    t,
    view,
    formMode,
    formData,
    setFormData,
    subtitle,
    footerMessage,
    footerStyle,
    logs,
    hasErrorLogs,
    servers,
    activeServerId,
    autoFailoverEnabled,
    languagePreference,
    effectiveLanguage,
    handlePrimaryAction,
    handleTogglePreferences,
    handleToggleLogs,
    handleToggleServer,
    openFormForEdit,
    handleSubmitForm,
    handleDeleteServer,
    handleAutoFailoverChange,
    handleLanguageChange
  } = useProxyApp();

  return (
    <Fragment>
      <LogsView t={t} view={view} logs={logs} />

      <main className={`app${view === "logs" ? " hidden" : ""}`}>
        <header className="app-header">
          <div>
            <h1>{t("app.title")}</h1>
            <p id="headerSubtitle">{subtitle}</p>
          </div>
          <div className="header-actions">
            <AddBackButton
              variant="icon"
              className="header-option-btn"
              active={view === "preferences"}
              ariaLabel={view === "preferences" ? t("buttons.preferences.hide") : t("buttons.preferences.show")}
              title={t("preferences.title")}
              onClick={handleTogglePreferences}
            >
              ⚙
            </AddBackButton>

            <AddBackButton
              variant="plusToggle"
              view={view}
              onClick={handlePrimaryAction}
              ariaLabel={view === "list" ? t("buttons.server.add") : t("buttons.server.backToList")}
            />
          </div>
        </header>

        <ListView
          t={t}
          view={view}
          servers={servers}
          activeServerId={activeServerId}
          onToggle={handleToggleServer}
          onEdit={openFormForEdit}
          getServerDisplayName={getServerDisplayName}
        />

        <FormView
          t={t}
          view={view}
          formMode={formMode}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmitForm}
          onDelete={handleDeleteServer}
        />

        <PreferencesView
          t={t}
          view={view}
          autoFailoverEnabled={autoFailoverEnabled}
          language={languagePreference}
          onAutoFailoverChange={handleAutoFailoverChange}
          onLanguageChange={handleLanguageChange}
        />
      </main>

      <footer className={`app-footer${view === "form" ? " hidden" : ""}`}>
        <span id="activeFooter" style={footerStyle}>
          {footerMessage}
        </span>

        <div className="footer-actions">
          <LanguageBadge preference={languagePreference} effectiveLanguage={effectiveLanguage} t={t} />

          <AddBackButton
            variant="icon"
            className="footer-btn"
            active={view === "logs"}
            hasError={hasErrorLogs}
            ariaLabel={view === "logs" ? t("buttons.logs.hide") : t("buttons.logs.show")}
            title={t("buttons.logs.title")}
            onClick={handleToggleLogs}
          >
            🐞
          </AddBackButton>
        </div>
      </footer>
    </Fragment>
  );
}
