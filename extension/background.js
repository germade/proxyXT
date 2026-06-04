const api = globalThis.browser ?? globalThis.chrome;

const STORAGE_KEY = "proxyxt-state";
const LOGS_KEY = "proxyxt-logs";
const MAX_LOGS = 200;

const defaultState = {
  activeServerId: null,
  servers: []
};

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function storageGet(key) {
  if (api.storage?.local?.get.length <= 1) {
    return api.storage.local.get(key);
  }

  return new Promise((resolve, reject) => {
    api.storage.local.get(key, (result) => {
      if (api.runtime.lastError) {
        reject(new Error(api.runtime.lastError.message));
        return;
      }
      resolve(result);
    });
  });
}

function storageSet(value) {
  if (api.storage?.local?.set.length <= 1) {
    return api.storage.local.set(value);
  }

  return new Promise((resolve, reject) => {
    api.storage.local.set(value, () => {
      if (api.runtime.lastError) {
        reject(new Error(api.runtime.lastError.message));
        return;
      }
      resolve();
    });
  });
}

function proxySettingsSet(config) {
  if (api.proxy?.settings?.set.length <= 1) {
    return api.proxy.settings.set(config);
  }

  return new Promise((resolve, reject) => {
    api.proxy.settings.set(config, () => {
      if (api.runtime.lastError) {
        reject(new Error(api.runtime.lastError.message));
        return;
      }
      resolve();
    });
  });
}

async function loadState() {
  const result = await storageGet(STORAGE_KEY);
  const state = result?.[STORAGE_KEY];
  if (!state) {
    return { ...defaultState };
  }

  return {
    ...defaultState,
    ...state,
    servers: Array.isArray(state.servers) ? state.servers : []
  };
}

async function saveState(state) {
  await storageSet({ [STORAGE_KEY]: state });
}

async function loadLogs() {
  const result = await storageGet(LOGS_KEY);
  const logs = result?.[LOGS_KEY];
  return Array.isArray(logs) ? logs : [];
}

async function saveLogs(logs) {
  await storageSet({ [LOGS_KEY]: logs.slice(-MAX_LOGS) });
}

async function addLog(level, message, context) {
  const logs = await loadLogs();
  logs.push({
    time: new Date().toISOString(),
    level,
    message,
    context: context || null
  });
  await saveLogs(logs);
}

function getLogContext(payload) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  return { ...payload };
}

function mapServerToProxyRules(server) {
  const port = Number.parseInt(server.port, 10);
  if (!server.host || Number.isNaN(port)) {
    throw new Error("Servidor proxy invalido");
  }

  return {
    mode: "fixed_servers",
    rules: {
      singleProxy: {
        scheme: server.scheme,
        host: server.host,
        port
      },
      bypassList: (server.bypassList || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    }
  };
}

async function applyActiveProxy(state) {
  const activeServer = state.servers.find((server) => server.id === state.activeServerId);

  if (!activeServer) {
    await proxySettingsSet({ value: { mode: "system" }, scope: "regular" });
    return;
  }

  const value = mapServerToProxyRules(activeServer);
  await proxySettingsSet({ value, scope: "regular" });
}

function sanitizeServer(rawServer) {
  const server = {
    id: rawServer.id || generateId(),
    name: String(rawServer.name || "").trim(),
    scheme: String(rawServer.scheme || "http").trim().toLowerCase(),
    host: String(rawServer.host || "").trim(),
    port: String(rawServer.port || "").trim(),
    bypassList: String(rawServer.bypassList || "").trim()
  };

  if (!server.host || !server.port) {
    throw new Error("Host y puerto son obligatorios");
  }

  if (!["http", "https", "socks4", "socks5"].includes(server.scheme)) {
    throw new Error("Esquema no soportado");
  }

  const port = Number.parseInt(server.port, 10);
  if (Number.isNaN(port) || port < 1 || port > 65535) {
    throw new Error("Puerto invalido");
  }

  return server;
}

async function handleGetState() {
  return loadState();
}

async function handleGetLogs() {
  return loadLogs();
}

async function handleSaveServer(payload) {
  const incoming = sanitizeServer(payload.server || {});
  const state = await loadState();

  const index = state.servers.findIndex((server) => server.id === incoming.id);
  if (index >= 0) {
    state.servers[index] = incoming;
  } else {
    state.servers.push(incoming);
  }

  await saveState(state);
  return state;
}

async function handleDeleteServer(payload) {
  const serverId = payload.serverId;
  const state = await loadState();

  state.servers = state.servers.filter((server) => server.id !== serverId);
  if (state.activeServerId === serverId) {
    state.activeServerId = null;
  }

  await saveState(state);
  await applyActiveProxy(state);
  return state;
}

async function handleActivateServer(payload) {
  const state = await loadState();
  const serverId = payload.serverId;

  if (serverId === null) {
    state.activeServerId = null;
  } else {
    const exists = state.servers.some((server) => server.id === serverId);
    if (!exists) {
      throw new Error("Servidor no encontrado");
    }
    state.activeServerId = serverId;
  }

  await saveState(state);
  await applyActiveProxy(state);
  return state;
}

api.runtime.onInstalled.addListener(async () => {
  try {
    const state = await loadState();
    await saveState(state);
    await applyActiveProxy(state);
    await addLog("info", "Extension instalada", null);
  } catch (error) {
    await addLog("error", "Fallo al inicializar instalacion", { error: error.message });
  }
});

api.runtime.onStartup?.addListener(async () => {
  try {
    const state = await loadState();
    await applyActiveProxy(state);
    await addLog("info", "Extension iniciada", null);
  } catch (error) {
    await addLog("error", "Fallo al iniciar extension", { error: error.message });
  }
});

api.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const actionType = message?.type;

  const run = async () => {
    if (actionType === "proxyxt/getState") {
      const state = await handleGetState();
      return { state };
    }

    if (actionType === "proxyxt/getLogs") {
      const logs = await handleGetLogs();
      return { logs };
    }

    if (actionType === "proxyxt/saveServer") {
      const state = await handleSaveServer(message.payload || {});
      await addLog("info", "Servidor guardado", getLogContext(message.payload));
      return { state };
    }

    if (actionType === "proxyxt/deleteServer") {
      const state = await handleDeleteServer(message.payload || {});
      await addLog("info", "Servidor eliminado", getLogContext(message.payload));
      return { state };
    }

    if (actionType === "proxyxt/activateServer") {
      const state = await handleActivateServer(message.payload || {});
      await addLog("info", "Servidor activado/desactivado", getLogContext(message.payload));
      return { state };
    }

    throw new Error("Accion no soportada");
  };

  run()
    .then((result) => sendResponse({ ok: true, ...result }))
    .catch(async (error) => {
      await addLog("error", `Error en accion: ${actionType || "sin tipo"}`, {
        payload: getLogContext(message?.payload),
        error: error.message
      });
      sendResponse({ ok: false, error: error.message });
    });

  return true;
});
