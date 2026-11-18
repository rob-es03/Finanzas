# Handoff Codex · T-033 Auth por correo

- Se implementaron registro, acceso por contraseña y recuperación en Angular, con callback PKCE compartido con Google. Se reutilizó la ruta de acceso y se añadió una vista de nueva contraseña limitada al estado de recuperación.
- Se modificaron rutas de Auth, servicio, cliente Supabase, páginas de login y callback, pruebas de Auth y documentos de T-033.
- Se verificó el recorrido web con Supabase local, Resend y Gmail. La evidencia y el bloqueo de Android están en [la auditoría de T-033](../auditorias/2026-11-17-auth-correo.md).
- Git. Rama `fix/T-033-auth-correo`, base publicada `438e62f` de `agent/claude-initial`. Esa rama contiene la integración de Auth de la que depende T-033.
- Pendientes. Instalar SDK y usar el JDK compatible, probar Android y revisar el PR. La rama Saldo claro puede incorporar estos cambios tras integrar la base de Auth.
