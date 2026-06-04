import { Fragment, h, render } from "./vendor/preact/preact.module.js";
import { useMemo, useState, useEffect } from "./vendor/preact/hooks.module.js";
import { InputField } from "./components/InputField.jsx";
import { SelectField } from "./components/SelectField.jsx";
import { CheckboxField } from "./components/CheckboxField.jsx";

const api = globalThis.browser ?? globalThis.chrome;
const e = h;

const defaultState = {
  activeServerId: null,
  servers: [],
  preferences: {
    autoFailoverEnabled: false
  }
};

const initialFormState = {
  id: "",
  name: "",
  scheme: "http",
  host: "",
  port: "",
  bypassList: ""
};

function normalizeState(state) {
  return {
    ...defaultState,
    ...(state || {}),
    servers: Array.isArray(state?.servers) ? state.servers : [],
    preferences: {
      ...defaultState.preferences,
      ...(state?.preferences || {})
    }
  };
}

function sendMessage(message) {
  if (api.runtime.sendMessage.length <= 1) {
    return api.runtime.sendMessage(message);
  }

  return new Promise((resolve, reject) => {
    api.runtime.sendMessage(message, (response) => {
      if (api.runtime.lastError) {
        reject(new Error(api.runtime.lastError.message));
        return;
      }
      resolve(response);
    });
  });
}

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

function getServerDisplayName(server) {
  const alias = String(server?.name || "").trim();
  if (alias) {
    return alias;
  }
  return `${server.host}:${server.port}`;
}

function LogEntry({ log }) {
  const level = String(log.level || "info").toUpperCase();
  const message = String(log.message || "Sin mensaje");
  const rawTime = log.time ? new Date(log.time) : null;
  const time = rawTime && !Number.isNaN(rawTime.getTime()) ? rawTime.toLocaleString() : String(log.time || "");

  return e(
    "div",
    { className: "log-entry" },
    e("span", { className: "log-time" }, time),
    e("span", { className: "log-main" }, `${level}: ${message}`),
    log.context ? e("pre", { className: "log-context" }, toYaml(log.context, 0)) : null
  );
}

function ServerItem({ server, activeServerId, onToggle, onEdit }) {
  const alias = String(server?.name || "").trim();
  const endpoint = `${server.scheme}://${server.host}:${server.port}`;
  const isActive = server.id === activeServerId;

  return e(
    "li",
    {
      className: `server-item${isActive ? " is-active" : ""}`
    },
    e(
      "button",
      {
        type: "button",
        className: `server-main${alias ? "" : " no-meta"}`,
        onClick: () => onToggle(server)
      },
      e("span", { className: "server-name" }, alias || `${server.host}:${server.port}`),
      alias ? e("span", { className: "server-meta" }, endpoint) : null
    ),
    e(
      "button",
      {
        type: "button",
        className: "server-edit-btn",
        title: "Editar servidor",
        "aria-label": `Editar ${getServerDisplayName(server)}`,
        onClick: () => onEdit(server)
      },
      "✎"
    )
  );
}

function App() {
  const [state, setState] = useState(defaultState);
  const [view, setView] = useState("list");
  const [formMode, setFormMode] = useState("new");
  const [formData, setFormData] = useState(initialFormState);
  const [feedback, setFeedback] = useState(null);
  const [logs, setLogs] = useState([]);
  const [hasErrorLogs, setHasErrorLogs] = useState(false);

  const activeServer = useMemo(() => {
    return state.servers.find((server) => server.id === state.activeServerId) || null;
  }, [state.servers, state.activeServerId]);

  const subtitle =
    view === "form"
      ? formMode === "edit"
        ? "Editar servidor proxy"
        : "Añadir servidor proxy"
      : view === "preferences"
        ? "Ajustes de comportamiento"
        : "Selecciona un servidor";

  const footerMessage = feedback?.message || `Activo: ${activeServer ? getServerDisplayName(activeServer) : "Sistema"}`;
  const footerStyle = feedback ? { color: feedback.isError ? "#b03838" : "#206b35" } : {};

  async function callBackground(type, payload = {}) {
    const response = await sendMessage({ type, payload });
    if (!response?.ok) {
      throw new Error(response?.error || "Error desconocido");
    }

    if (response.state) {
      setState(normalizeState(response.state));
    }

    return response;
  }

  async function refreshLogs() {
    const response = await callBackground("proxyxt/getLogs");
    const data = Array.isArray(response.logs) ? response.logs : [];
    setLogs(data);
    setHasErrorLogs(data.some((log) => log.level === "error"));
  }

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const response = await callBackground("proxyxt/getState");
        if (isMounted && response.state) {
          setState(normalizeState(response.state));
        }
        if (isMounted) {
          await refreshLogs();
        }
      } catch (error) {
        if (isMounted) {
          setFeedback({ message: error.message, isError: true });
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  function clearFeedback() {
    setFeedback(null);
  }

  function openFormForNewServer() {
    setFormMode("new");
    setFormData({ ...initialFormState });
    setView("form");
    clearFeedback();
  }

  function openFormForEdit(server) {
    setFormMode("edit");
    setFormData({
      id: server.id,
      name: server.name,
      scheme: server.scheme,
      host: server.host,
      port: server.port,
      bypassList: server.bypassList || ""
    });
    setView("form");
    clearFeedback();
  }

  function closeForm() {
    setFormMode("new");
    setFormData({ ...initialFormState });
    setView("list");
  }

  async function handleToggleServer(server) {
    const nextServerId = server.id === state.activeServerId ? null : server.id;
    try {
      await callBackground("proxyxt/activateServer", { serverId: nextServerId });
      if (nextServerId) {
        setFeedback({ message: `Proxy activo: ${getServerDisplayName(server)}`, isError: false });
      } else {
        setFeedback({ message: "Proxy desactivado", isError: false });
      }
    } catch (error) {
      setFeedback({ message: error.message, isError: true });
    }
  }

  async function handleSubmitForm(event) {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) {
      return;
    }

    const payload = {
      server: {
        id: formData.id || undefined,
        name: formData.name,
        scheme: formData.scheme,
        host: formData.host,
        port: formData.port,
        bypassList: formData.bypassList
      }
    };

    try {
      const isEdit = Boolean(formData.id);
      await callBackground("proxyxt/saveServer", payload);
      setFeedback({ message: isEdit ? "Servidor actualizado" : "Servidor guardado", isError: false });
      closeForm();
    } catch (error) {
      setFeedback({ message: error.message, isError: true });
    }
  }

  async function handleDeleteServer() {
    if (!formData.id) {
      return;
    }

    try {
      await callBackground("proxyxt/deleteServer", { serverId: formData.id });
      setFeedback({ message: "Servidor eliminado", isError: false });
      closeForm();
    } catch (error) {
      setFeedback({ message: error.message, isError: true });
    }
  }

  async function handleTogglePreferences() {
    if (view === "preferences") {
      setView("list");
      return;
    }

    setView("preferences");
    clearFeedback();
  }

  async function handleToggleLogs() {
    if (view === "logs") {
      setView("list");
      return;
    }

    try {
      await refreshLogs();
      setView("logs");
    } catch (error) {
      setFeedback({ message: `No se pudieron cargar logs: ${error.message}`, isError: true });
    }
  }

  async function handlePreferenceChange(enabled) {
    const previous = Boolean(state.preferences?.autoFailoverEnabled);
    setState((current) => ({
      ...current,
      preferences: {
        ...current.preferences,
        autoFailoverEnabled: enabled
      }
    }));

    try {
      await callBackground("proxyxt/updatePreferences", {
        preferences: {
          autoFailoverEnabled: enabled
        }
      });
      setFeedback({ message: "Preferencias guardadas", isError: false });
    } catch (error) {
      setState((current) => ({
        ...current,
        preferences: {
          ...current.preferences,
          autoFailoverEnabled: previous
        }
      }));
      setFeedback({ message: error.message, isError: true });
    }
  }

  const logsPanel = e(
    "section",
    { className: `logs-panel${view === "logs" ? "" : " hidden"}` },
    e("div", { className: "logs-toolbar" }, e("strong", null, "Logs de backend")),
    e(
      "div",
      { className: "logs-content" },
      logs.length
        ? logs.map((log, index) => e(LogEntry, { key: `${log.time || index}-${index}`, log }))
        : "Sin logs."
    )
  );

  const listView = e(
    "section",
    { className: `view-panel${view === "list" ? "" : " hidden"}` },
    e(
      "ul",
      { className: "server-list" },
      state.servers.map((server) =>
        e(ServerItem, {
          key: server.id,
          server,
          activeServerId: state.activeServerId,
          onToggle: handleToggleServer,
          onEdit: openFormForEdit
        })
      )
    ),
    e(
      "div",
      { className: `empty-state-card${state.servers.length ? " hidden" : ""}` },
      "No hay proxies guardados"
    )
  );

  const formView = e(
    "section",
    { className: `view-panel${view === "form" ? "" : " hidden"}` },
    e(
      "form",
      { className: "proxy-form", onSubmit: handleSubmitForm },
      e("div", { className: "row" },
        e(SelectField, {
          label: "Esquema",
          id: "scheme",
          value: formData.scheme,
          onChange: (value) => setFormData((current) => ({ ...current, scheme: value })),
          options: [
            { value: "http", label: "http" },
            { value: "https", label: "https" },
            { value: "socks4", label: "socks4" },
            { value: "socks5", label: "socks5" }
          ]
        }),
        e(InputField, {
          label: "Puerto",
          id: "port",
          type: "number",
          value: formData.port,
          min: 1,
          max: 65535,
          required: true,
          onInput: (value) => setFormData((current) => ({ ...current, port: value }))
        })
      ),
      e(InputField, {
        label: "Host/IP",
        id: "host",
        type: "text",
        value: formData.host,
        required: true,
        onInput: (value) => setFormData((current) => ({ ...current, host: value }))
      }),
      e(InputField, {
        label: "Bypass (coma separado)",
        id: "bypassList",
        type: "text",
        value: formData.bypassList,
        placeholder: "localhost, *.internal.local",
        onInput: (value) => setFormData((current) => ({ ...current, bypassList: value }))
      }),
      e(InputField, {
        label: "Alias (opcional)",
        id: "name",
        type: "text",
        value: formData.name,
        maxLength: 80,
        onInput: (value) => setFormData((current) => ({ ...current, name: value }))
      }),
      e(
        "div",
        { className: "actions" },
        e("button", { type: "submit" }, formMode === "edit" ? "Guardar cambios" : "Guardar servidor"),
        e(
          "button",
          {
            id: "deleteServer",
            type: "button",
            className: `ghost${formData.id ? "" : " hidden"}`,
            onClick: handleDeleteServer
          },
          "Eliminar"
        )
      )
    )
  );

  const preferencesView = e(
    "section",
    { className: `view-panel${view === "preferences" ? "" : " hidden"}` },
    e(
      "div",
      { className: "preferences-card" },
      e("h2", null, "Preferencias"),
      e(CheckboxField, {
        id: "autoFailoverEnabled",
        className: "preferences-toggle",
        checked: Boolean(state.preferences?.autoFailoverEnabled),
        onChange: handlePreferenceChange,
        label: "Failover automático (round-robin)"
      }),
      e(
        "p",
        { className: "preferences-help" },
        "Si el proxy activo falla, la extensión cambiará automáticamente al siguiente servidor guardado."
      )
    )
  );

  const app = e(
    "main",
    { className: `app${view === "logs" ? " hidden" : ""}` },
    e(
      "header",
      { className: "app-header" },
      e("div", null, e("h1", null, "ProxyXT"), e("p", { id: "headerSubtitle" }, subtitle)),
      e(
        "div",
        { className: "header-actions" },
        e(
          "button",
          {
            type: "button",
            className: `ghost icon-btn header-option-btn${view === "preferences" ? " is-active" : ""}`,
            "aria-label": view === "preferences" ? "Ocultar preferencias" : "Mostrar preferencias",
            title: "Preferencias",
            onClick: handleTogglePreferences
          },
          "⚙"
        ),
        e(
          "button",
          {
            type: "button",
            className: "plus-button",
            "aria-label": view === "list" ? "Agregar servidor" : "Volver al listado",
            onClick: () => {
              if (view === "list") {
                openFormForNewServer();
                return;
              }
              closeForm();
              clearFeedback();
            }
          },
          view === "list" ? "+" : "←"
        )
      )
    ),
    listView,
    formView,
    preferencesView
  );

  const footer = e(
    "footer",
    { className: `app-footer${view === "form" ? " hidden" : ""}` },
    e("span", { id: "activeFooter", style: footerStyle }, footerMessage),
    e(
      Fragment,
      null,
      e(
        "button",
        {
          type: "button",
          className: `ghost footer-btn icon-btn${view === "logs" ? " is-active" : ""}${hasErrorLogs ? " has-error" : ""}`,
          "aria-label": view === "logs" ? "Ocultar logs de backend" : "Mostrar logs de backend",
          title: "Logs de backend",
          onClick: handleToggleLogs
        },
        "🐞"
      )
    )
  );

  return e(Fragment, null, logsPanel, app, footer);
}

render(e(App), document.getElementById("appRoot"));
