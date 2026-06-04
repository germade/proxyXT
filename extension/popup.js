const api = globalThis.browser ?? globalThis.chrome;

const ui = {
  headerSubtitle: document.getElementById("headerSubtitle"),
  toggleViewButton: document.getElementById("toggleViewButton"),
  listPanel: document.getElementById("listPanel"),
  formPanel: document.getElementById("formPanel"),
  appFooter: document.getElementById("appFooter"),
  activeFooter: document.getElementById("activeFooter"),
  toggleLogs: document.getElementById("toggleLogs"),
  logsPanel: document.getElementById("logsPanel"),
  logsContent: document.getElementById("logsContent"),
  serverList: document.getElementById("serverList"),
  emptyState: document.getElementById("emptyState"),
  proxyForm: document.getElementById("proxyForm"),
  serverId: document.getElementById("serverId"),
  name: document.getElementById("name"),
  scheme: document.getElementById("scheme"),
  host: document.getElementById("host"),
  port: document.getElementById("port"),
  bypassList: document.getElementById("bypassList"),
  submitButton: document.getElementById("submitButton"),
  deleteServer: document.getElementById("deleteServer"),
  feedback: document.getElementById("feedback")
};

let state = {
  activeServerId: null,
  servers: []
};

let currentView = "list";
let currentFormMode = "new";

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

async function callBackground(type, payload = {}) {
  const response = await sendMessage({ type, payload });
  if (!response?.ok) {
    throw new Error(response?.error || "Error desconocido");
  }
  if (response.state) {
    state = response.state;
    render();
  }

  return response;
}

function setFeedback(message, isError = true) {
  ui.feedback.style.color = isError ? "#b03838" : "#206b35";
  ui.feedback.textContent = message || "";
}

function getServerDisplayName(server) {
  const alias = String(server?.name || "").trim();
  if (alias) {
    return alias;
  }

  return `${server.host}:${server.port}`;
}

function updateHeaderSubtitle() {
  if (currentView === "list") {
    ui.headerSubtitle.textContent = "Selecciona un servidor";
    return;
  }

  ui.headerSubtitle.textContent =
    currentFormMode === "edit" ? "Editar servidor proxy" : "Añadir servidor proxy";
}

function hideLogsPanel() {
  ui.logsPanel.classList.add("hidden");
  ui.toggleLogs.classList.remove("is-active");
  ui.toggleLogs.setAttribute("aria-label", "Mostrar logs de backend");
}

function formatLogLine(log) {
  const level = String(log.level || "info").toUpperCase();
  const message = String(log.message || "Sin mensaje");
  const when = String(log.time || "");
  const context = log.context ? ` | ${JSON.stringify(log.context)}` : "";
  return `[${when}] ${level}: ${message}${context}`;
}

async function refreshLogsPanel() {
  const response = await callBackground("proxyxt/getLogs");
  const logs = Array.isArray(response.logs) ? response.logs : [];
  if (!logs.length) {
    ui.logsContent.textContent = "Sin logs.";
    return;
  }

  ui.logsContent.textContent = logs.map((log) => formatLogLine(log)).join("\n");
}

function showListView() {
  currentView = "list";
  ui.listPanel.classList.remove("hidden");
  ui.formPanel.classList.add("hidden");
  ui.appFooter.classList.remove("hidden");
  ui.toggleViewButton.textContent = "+";
  ui.toggleViewButton.setAttribute("aria-label", "Agregar servidor");
  updateHeaderSubtitle();
}

function showFormView() {
  currentView = "form";
  ui.listPanel.classList.add("hidden");
  ui.formPanel.classList.remove("hidden");
  ui.appFooter.classList.add("hidden");
  hideLogsPanel();
  ui.toggleViewButton.textContent = "←";
  ui.toggleViewButton.setAttribute("aria-label", "Volver al listado");
  updateHeaderSubtitle();
}

function resetForm() {
  ui.serverId.value = "";
  ui.proxyForm.reset();
  ui.scheme.value = "http";
  ui.submitButton.textContent = "Guardar servidor";
  ui.deleteServer.classList.add("hidden");
}

function fillForm(server) {
  ui.serverId.value = server.id;
  ui.name.value = server.name;
  ui.scheme.value = server.scheme;
  ui.host.value = server.host;
  ui.port.value = server.port;
  ui.bypassList.value = server.bypassList || "";
  ui.submitButton.textContent = "Guardar cambios";
  ui.deleteServer.classList.remove("hidden");
}

function openFormForNewServer() {
  currentFormMode = "new";
  resetForm();
  showFormView();
}

function openFormForEdit(server) {
  currentFormMode = "edit";
  fillForm(server);
  showFormView();
}

function closeFormView() {
  currentFormMode = "new";
  showListView();
  resetForm();
}

function createServerItem(server) {
  const li = document.createElement("li");
  li.className = "server-item";

  const toggleBtn = document.createElement("button");
  toggleBtn.type = "button";
  toggleBtn.className = "server-main";

  const name = document.createElement("span");
  name.className = "server-name";
  name.textContent = getServerDisplayName(server);

  const badge = document.createElement("span");
  badge.textContent = server.id === state.activeServerId ? "Activo" : "Inactivo";
  badge.style.fontSize = "0.75rem";
  badge.style.color = server.id === state.activeServerId ? "#1f7a3c" : "#607286";

  toggleBtn.append(name, badge);
  toggleBtn.addEventListener("click", async () => {
    const nextServerId = server.id === state.activeServerId ? null : server.id;
    try {
      await callBackground("proxyxt/activateServer", { serverId: nextServerId });
      if (nextServerId) {
        setFeedback(`Proxy activo: ${getServerDisplayName(server)}`, false);
      } else {
        setFeedback("Proxy desactivado", false);
      }
    } catch (error) {
      setFeedback(error.message);
    }
  });

  const meta = document.createElement("div");
  meta.className = "server-meta";
  meta.textContent = `${server.scheme}://${server.host}:${server.port}`;

  const actions = document.createElement("div");
  actions.className = "server-actions";

  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.className = "ghost";
  editBtn.textContent = "Editar";
  editBtn.addEventListener("click", () => {
    openFormForEdit(server);
    setFeedback("");
  });

  actions.append(editBtn);
  li.append(toggleBtn, meta, actions);

  return li;
}

function render() {
  const active = state.servers.find((server) => server.id === state.activeServerId);
  ui.activeFooter.textContent = `Activo: ${active ? getServerDisplayName(active) : "Sistema"}`;

  ui.serverList.innerHTML = "";
  if (!state.servers.length) {
    ui.emptyState.classList.remove("hidden");
    return;
  }

  ui.emptyState.classList.add("hidden");
  state.servers.forEach((server) => {
    ui.serverList.appendChild(createServerItem(server));
  });
}

ui.proxyForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    server: {
      id: ui.serverId.value || undefined,
      name: ui.name.value,
      scheme: ui.scheme.value,
      host: ui.host.value,
      port: ui.port.value,
      bypassList: ui.bypassList.value
    }
  };

  try {
    const isEdit = Boolean(ui.serverId.value);
    await callBackground("proxyxt/saveServer", payload);
    setFeedback(isEdit ? "Servidor actualizado" : "Servidor guardado", false);
    closeFormView();
  } catch (error) {
    setFeedback(error.message);
  }
});

ui.deleteServer.addEventListener("click", async () => {
  const serverId = ui.serverId.value;
  if (!serverId) {
    return;
  }

  try {
    await callBackground("proxyxt/deleteServer", { serverId });
    setFeedback("Servidor eliminado", false);
    closeFormView();
  } catch (error) {
    setFeedback(error.message);
  }
});

ui.toggleViewButton.addEventListener("click", () => {
  if (currentView === "list") {
    openFormForNewServer();
    setFeedback("");
    return;
  }

  closeFormView();
  setFeedback("");
});

ui.toggleLogs.addEventListener("click", async () => {
  const isHidden = ui.logsPanel.classList.contains("hidden");
  if (!isHidden) {
    hideLogsPanel();
    return;
  }

  try {
    await refreshLogsPanel();
    ui.logsPanel.classList.remove("hidden");
    ui.toggleLogs.classList.add("is-active");
    ui.toggleLogs.setAttribute("aria-label", "Ocultar logs de backend");
  } catch (error) {
    setFeedback(`No se pudieron cargar logs: ${error.message}`);
  }
});

(async () => {
  try {
    await callBackground("proxyxt/getState");
    closeFormView();
  } catch (error) {
    setFeedback(error.message);
  }
})();
