import { h } from "preact";
import { useMemo, useState } from "preact/hooks";
import { CrossSymbolSvg } from "../../components/icons/CrossSymbolSvg.jsx";
import { FilterSymbolSvg } from "../../components/icons/FilterSymbolSvg.jsx";
import { NewWindowSvg } from "../../components/icons/NewWindowSvg.jsx";
import {
  CloseWindowButton,
  FilterCheckbox,
  FilterLabel,
  FilterMenu,
  FilterMenuPanel,
  FilterToggleButton,
  LogContext,
  LogEntryContainer,
  LogMain,
  LogsContent,
  LogsPanel,
  LogsToolbar,
  LogTime,
  OpenWindowButton,
  ToolbarActions,
  ToolbarTitle
} from "./LogsView.styles.jsx";

const LOG_LEVELS = ["success", "info", "warning", "error", "debug"];

function toYaml(value, indent = 0) {
  const pad = "  ".repeat(indent);
  if (value === null || value === undefined) return "null";
  if (typeof value === "boolean" || typeof value === "number") return String(value);
  if (typeof value === "string") {
    const needsQuote =
      value === "" ||
      /^[\s'\"]|[\n:#\[\]{}|>&*!@%`]|\s$/.test(value) ||
      value === "true" ||
      value === "false" ||
      value === "null" ||
      !Number.isNaN(Number(value));
    return needsQuote ? JSON.stringify(value) : value;
  }
  if (Array.isArray(value)) {
    if (!value.length) return "[]";
    return value
      .map((item) => {
        const rendered = toYaml(item, indent + 1);
        return typeof item === "object" && item !== null
          ? `${pad}-\n${"  ".repeat(indent + 1)}${rendered.trimStart()}`
          : `${pad}- ${rendered}`;
      })
      .join("\n");
  }
  if (typeof value === "object") {
    const keys = Object.keys(value);
    if (!keys.length) return "{}";
    return keys
      .map((key) => {
        const nestedValue = value[key];
        if (nestedValue !== null && typeof nestedValue === "object") {
          return `${pad}${key}:\n${toYaml(nestedValue, indent + 1)}`;
        }
        return `${pad}${key}: ${toYaml(nestedValue, indent)}`;
      })
      .join("\n");
  }
  return String(value);
}

function LogEntry({ log, t }) {
  const rawLevel = String(log.level || "info").toLowerCase();
  const normalizedLevel = rawLevel === "warn" ? "warning" : rawLevel;
  const level = normalizedLevel.toUpperCase();
  const message = String(log.message || t("messages.noMessage"));
  const rawTime = log.time ? new Date(log.time) : null;
  const time = rawTime && !Number.isNaN(rawTime.getTime()) ? rawTime.toLocaleString() : String(log.time || "");

  return (
    <LogEntryContainer $level={normalizedLevel}>
      <LogTime>{time}</LogTime>
      <LogMain>{`${level}: ${message}`}</LogMain>
      {log.context ? <LogContext>{toYaml(log.context, 0)}</LogContext> : null}
    </LogEntryContainer>
  );
}

export function LogsView({ t, logs, onClose }) {
  const [levelFilters, setLevelFilters] = useState({
    success: true,
    info: true,
    warning: true,
    error: true,
    debug: true
  });

  function handleOpenInNewWindow() {
    const api = globalThis.browser ?? globalThis.chrome;
    const logsUrl = api?.runtime?.getURL ? api.runtime.getURL("logs.html") : "logs.html";
    globalThis.open(logsUrl, "_blank", "noopener,noreferrer,width=640,height=760");
  }

  const openInWindowLabel = t("buttons.logs.openInWindow");
  const closeWindowLabel = t("buttons.logs.closeWindow");
  const filtersLabel = t("buttons.logs.filters");

  function handleCloseWindow() {
    if (typeof onClose === "function") {
      onClose();
      return;
    }
    globalThis.close();
  }

  function toggleLevelFilter(level, checked) {
    setLevelFilters((current) => ({
      ...current,
      [level]: checked
    }));
  }

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const rawLevel = String(log.level || "info").toLowerCase();
      const normalizedLevel = rawLevel === "warn" ? "warning" : rawLevel;
      if (Object.prototype.hasOwnProperty.call(levelFilters, normalizedLevel)) {
        return Boolean(levelFilters[normalizedLevel]);
      }
      return Boolean(levelFilters.info);
    });
  }, [logs, levelFilters]);

  return (
    <LogsPanel>
      <LogsToolbar>
        <ToolbarTitle>{t("buttons.logs.title")}</ToolbarTitle>
        <ToolbarActions>
          <FilterMenu>
            <FilterToggleButton title={filtersLabel} aria-label={filtersLabel}>
              <FilterSymbolSvg size={16} />
            </FilterToggleButton>
            <FilterMenuPanel>
              {LOG_LEVELS.map((level) => (
                <FilterLabel key={level}>
                  <FilterCheckbox
                    type="checkbox"
                    checked={Boolean(levelFilters[level])}
                    onChange={(event) => toggleLevelFilter(level, event.currentTarget.checked)}
                  />
                  {level.toUpperCase()}
                </FilterLabel>
              ))}
            </FilterMenuPanel>
          </FilterMenu>
          <OpenWindowButton
            type="button"
            onClick={handleOpenInNewWindow}
            title={openInWindowLabel}
            aria-label={openInWindowLabel}
          >
            <NewWindowSvg size={12} />
          </OpenWindowButton>
          <CloseWindowButton
            type="button"
            onClick={handleCloseWindow}
            title={closeWindowLabel}
            aria-label={closeWindowLabel}
          >
            <CrossSymbolSvg width={14} height={14} />
          </CloseWindowButton>
        </ToolbarActions>
      </LogsToolbar>
      <LogsContent>
        {filteredLogs.length
          ? filteredLogs.map((log, index) => <LogEntry key={`${log.time || index}-${index}`} log={log} t={t} />)
          : t("messages.noLogs")}
      </LogsContent>
    </LogsPanel>
  );
}
