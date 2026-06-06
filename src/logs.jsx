import { h, render } from "preact";
import { useEffect, useMemo, useState } from "preact/hooks";
import { setup } from "goober";
import { sendMessage } from "./lib/runtime.js";
import { createTranslator, resolveLanguage } from "./lib/i18n.js";
import { LogsView } from "./views/logs/LogsView.jsx";

setup(h);

function LogsWindowApp() {
  const [logs, setLogs] = useState([]);
  const [languagePreference, setLanguagePreference] = useState("auto");
  const [feedback, setFeedback] = useState(null);

  const effectiveLanguage = resolveLanguage(languagePreference, globalThis.navigator?.language);
  const t = useMemo(() => createTranslator(effectiveLanguage), [effectiveLanguage]);

  async function callBackground(type, payload = {}) {
    const response = await sendMessage({ type, payload });
    if (!response?.ok) {
      throw new Error(response?.error || "Unknown error");
    }
    return response;
  }

  async function refreshStateAndLogs() {
    const stateResponse = await callBackground("proxyxt/getState");
    const preference = stateResponse?.state?.preferences?.language || "auto";
    setLanguagePreference(preference);

    const logsResponse = await callBackground("proxyxt/getLogs");
    setLogs(Array.isArray(logsResponse.logs) ? logsResponse.logs : []);
  }

  async function handleClearLogs() {
    try {
      const response = await callBackground("proxyxt/clearLogs");
      const nextLogs = Array.isArray(response.logs) ? response.logs : [];
      setLogs(nextLogs);
      setFeedback({ message: t("messages.logsCleared"), isError: false, durationMs: 1500 });
      return response;
    } catch (error) {
      setFeedback({
        message: t("messages.logsClearError", { error: error.message || "Unknown error" }),
        isError: true,
        durationMs: 2500
      });
      throw error;
    }
  }

  function handleFeedback(message, isError = false, durationMs = 1500) {
    setFeedback({
      message: String(message || ""),
      isError: Boolean(isError),
      durationMs: Number.isFinite(durationMs) ? durationMs : 1500
    });
  }

  useEffect(() => {
    if (!feedback?.message) {
      return undefined;
    }

    const timer = globalThis.setTimeout(() => {
      setFeedback(null);
    }, Number.isFinite(feedback.durationMs) ? feedback.durationMs : 1500);

    return () => {
      globalThis.clearTimeout(timer);
    };
  }, [feedback]);

  useEffect(() => {
    let isMounted = true;

    const safeRefresh = async () => {
      try {
        await refreshStateAndLogs();
      } catch (_error) {
        if (isMounted) {
          setLogs([]);
        }
      }
    };

    safeRefresh();

    const intervalId = globalThis.setInterval(safeRefresh, 3000);
    const onFocus = () => {
      safeRefresh();
    };
    globalThis.addEventListener("focus", onFocus);

    return () => {
      isMounted = false;
      globalThis.clearInterval(intervalId);
      globalThis.removeEventListener("focus", onFocus);
    };
  }, []);

  return (
    <div className="logs-window-shell">
      {feedback?.message ? (
        <div className={`logs-window-feedback ${feedback.isError ? "is-error" : "is-success"}`} role="status" aria-live="polite">
          {feedback.message}
        </div>
      ) : null}
      <LogsView
        t={t}
        logs={logs}
        onClearLogs={handleClearLogs}
        onFeedback={handleFeedback}
        showOpenWindowButton={false}
      />
    </div>
  );
}

render(h(LogsWindowApp, null), document.getElementById("logsRoot"));
