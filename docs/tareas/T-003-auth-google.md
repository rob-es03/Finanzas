# T-003 · Google Sign-In con Supabase Auth (web + Android)
- **Responsable**: Claude Code
- **Dependencias**: T-001, T-002
- **Archivos permitidos**: `apps/mobile/src/app/core/auth/**`, `apps/mobile/src/app/features/auth/**` (lógica; la capa visual la define Antigravity), `android/**` (configuración), `docs/arquitectura.md`
- **Estado**: propuesta

## Descripción
Implementar el inicio de sesión con Google sobre Supabase Auth, en web y en Android con Capacitor. Verificar contra la documentación oficial: clientes OAuth, huellas SHA-1/SHA-256, redirect URIs, manejo y renovación de tokens, almacenamiento seguro en el dispositivo y cierre de sesión. Tras autenticar, crear o recuperar el perfil (idempotente) y pedir solo lo imprescindible. No usar Firebase Authentication.

## Criterios de aceptación
1. Login con Google funciona en web y en un dispositivo o emulador Android real.
2. Un usuario nuevo obtiene perfil, cuentas y categorías por defecto; un usuario que vuelve recupera los suyos sin duplicados.
3. La sesión persiste tras reiniciar la app; el token se guarda en almacenamiento seguro en Android.
4. El cierre de sesión limpia sesión, caché local y token de FCM.
5. Las rutas protegidas son inaccesibles sin sesión.
6. Ningún secreto ni `service_role` key en el cliente.

## Pruebas requeridas
Evidencia real: capturas o grabación del flujo en web y Android, más pruebas automatizadas del guard y del servicio de sesión.

## Riesgos
Configuración OAuth incorrecta (SHA, package name, redirect URI); diferencias de comportamiento del plugin entre web y nativo.

## Bloqueo
Requiere proyecto Supabase y cliente OAuth de Google creados (P-05).
