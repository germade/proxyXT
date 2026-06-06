# Mini guia de prueba: failover sin webRequest

Fecha: 2026-06-06
Alcance: validar que el failover funciona con proxy.onProxyError y sin permisos extra.

## Precondiciones

1. La extension esta instalada y recargada.
2. Existen al menos 2 servidores guardados en la lista.
3. El servidor activo inicial responde correctamente.
4. Build reciente en verde.

## Caso base (comun)

1. Abrir popup y activar Failover automatico.
2. Resultado esperado:
- No aparece prompt de permisos al activar failover.
- Se registra log de activacion indicando proxy.onProxyError y sin permisos adicionales.
3. Activar Mostrar notificaciones (opcional).
4. Resultado esperado:
- Si notificaciones ya estaban concedidas, no debe pedir nada nuevo.
- Si no estaban concedidas, solo puede pedir notifications.

## Prueba en Chrome

### Escenario A: cambio automatico por error de proxy

1. Mantener activo el Servidor A.
2. Forzar caida de A (apagar servicio, puerto cerrado o credenciales invalidas).
3. Navegar a una URL externa para provocar trafico.
4. Esperar hasta 10 segundos.
5. Resultado esperado:
- Se detecta error de proxy en background.
- Failover cambia de A a B en round-robin.
- Si notificaciones estan activas, aparece aviso de cambio.

### Escenario B: desactivacion de failover

1. Desactivar Failover automatico.
2. Volver a forzar error en el servidor activo.
3. Resultado esperado:
- No hay cambio automatico de servidor.
- Debe existir log de failover desactivado.

## Prueba en Firefox

### Escenario A: cambio automatico por error de proxy

1. Mantener activo el Servidor A.
2. Forzar caida de A.
3. Abrir una URL externa.
4. Esperar hasta 10 segundos.
5. Resultado esperado:
- Evento proxy.onProxyError detectado.
- Cambio automatico al siguiente servidor.
- Si notificaciones estan activas, se muestra aviso.

### Escenario B: validacion de no permisos extra

1. Activar y desactivar failover varias veces.
2. Resultado esperado:
- Ningun prompt relacionado con webRequest o all_urls.
- Solo puede aparecer prompt de notifications o tabs cuando se usan esas funciones.

## Tiempos esperados

1. Registro de log de activacion/desactivacion: inmediato (menos de 1 segundo).
2. Deteccion de error y cambio de servidor: normalmente entre 1 y 10 segundos, segun trafico y tipo de fallo.
3. Aviso de notificacion (si habilitado): inmediato tras cambio.

## Senales de exito

1. Failover cambia al siguiente servidor cuando el actual falla.
2. No existe solicitud de permisos webRequest o all_urls.
3. El flujo de notificaciones y tabs permanece independiente.
4. El estado final se mantiene consistente en popup y background.

## Senales de fallo

1. No cambia de servidor pese a errores repetidos de proxy.
2. Aparece prompt de webRequest o all_urls.
3. Cambia de servidor con failover desactivado.
4. Logs muestran errores continuos sin ejecucion de switch.

## Checklist rapido (2 minutos)

1. Activar failover.
2. Confirmar log de activacion.
3. Romper servidor activo.
4. Generar trafico web.
5. Confirmar switch al siguiente servidor.
6. Confirmar ausencia de permisos webRequest/all_urls.
7. Desactivar failover y verificar que no vuelve a cambiar automaticamente.
