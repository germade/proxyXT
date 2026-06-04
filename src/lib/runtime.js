const api = globalThis.browser ?? globalThis.chrome;

export function sendMessage(message) {
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

export function containsPermissions(permissions) {
  if (!api.permissions?.contains) {
    return Promise.resolve(false);
  }

  const payload = { permissions };
  if (api.permissions.contains.length <= 1) {
    return api.permissions.contains(payload);
  }

  return new Promise((resolve, reject) => {
    api.permissions.contains(payload, (result) => {
      if (api.runtime.lastError) {
        reject(new Error(api.runtime.lastError.message));
        return;
      }
      resolve(Boolean(result));
    });
  });
}

export function requestPermissions(permissions) {
  if (!api.permissions?.request) {
    return Promise.resolve(false);
  }

  const payload = { permissions };
  if (api.permissions.request.length <= 1) {
    return api.permissions.request(payload);
  }

  return new Promise((resolve, reject) => {
    api.permissions.request(payload, (result) => {
      if (api.runtime.lastError) {
        reject(new Error(api.runtime.lastError.message));
        return;
      }
      resolve(Boolean(result));
    });
  });
}
