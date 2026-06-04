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
