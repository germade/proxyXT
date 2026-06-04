# ProxyXT Extension (Chrome + Firefox)

Extension WebExtensions para administrar varios servidores proxy y activar uno desde el popup.

## Funcionalidades

- Guardar multiples servidores proxy.
- Editar y eliminar servidores guardados.
- Activar/desactivar rapidamente el servidor activo.
- Persistencia local con `storage.local`.
- Aplicacion de proxy con la API `proxy.settings`.

## Cargar en Chrome

1. Abre `chrome://extensions`.
2. Activa `Developer mode`.
3. Click en `Load unpacked`.
4. Selecciona la carpeta `extension`.

## Cargar en Firefox

1. Abre `about:debugging#/runtime/this-firefox`.
2. Click en `Load Temporary Add-on...`.
3. Selecciona el archivo `manifest.json` dentro de `extension`.

## Notas

- Cambiar el proxy de navegador requiere permiso `proxy`.
- Si no hay servidor activo, se usa `mode: system`.
