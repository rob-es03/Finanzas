# T-033 · Validación de acceso por correo

Fecha: 17 de noviembre de 2026. Rama `fix/T-033-auth-correo`, basada en `agent/claude-initial` (`438e62f`).

## Validación web

Angular en `127.0.0.1:4200`; Supabase Auth en `127.0.0.1:54321`. Navegador Playwright con Chrome, alias de prueba de Gmail y entrega real por Resend. El navegador bloqueó peticiones a proyectos alojados de Supabase. Se mantuvo el mismo contexto de navegador al completar ambos enlaces PKCE.

Salida del recorrido, con el alias omitido:

```
Google presente; registro web HTTP 200; esperando confirmación en Gmail
Confirmación Gmail en navegador: Angular abrió onboarding
Solicitud de recuperación web HTTP 200; esperando segundo correo
Recuperación web HTTP 200; contraseña anterior rechazada; nueva permite entrar
```

El primer intento devolvió `429 over_email_send_rate_limit`. Se elevó únicamente el límite de correo del stack local a ocho por hora y se reinició conservando su base. No se tocaron los servicios de producción. La prueba verificó el botón Google; su flujo OAuth no se ejecutó.

`npm run build` compiló. `npm test -- --watch=false` superó 15 pruebas en 3 archivos, incluidas las pruebas nuevas del evento de recuperación y rechazo de cambio sin sesión de recuperación. `npm run lint` reportó 23 errores preexistentes en dos specs de Auth, onboarding y dashboard. `npm audit --omit=dev` reportó cero hallazgos en dependencias de runtime para esta resolución.

## Validación Android

Emulador Finanzas_QA_API_36, SDK 36 y Microsoft OpenJDK 21. Se compiló un APK de depuración desde una copia aislada, con HTTP de loopback solo en esa copia y ADB reverse hacia el puerto local 54321. Los callbacks de correo se abrieron mediante Android ACTION_VIEW en la misma instalación que solicitó el enlace. Los mensajes se recibieron realmente en Gmail. La prueba entregó al emulador el callback devuelto por Supabase local y verificó la interfaz nativa mediante su WebView.

La primera corrida completó la confirmación y actualizó la contraseña, pero detectó dos campos con el mismo ID en vistas que Ionic conserva al navegar. Se asignó un ID específico a la nueva contraseña y se repitió el recorrido completo.

Salida de la segunda corrida, con el alias omitido:

```
BUILD SUCCESSFUL
Performing Streamed Install
Success
Google presente; registro Android HTTP 200; esperando confirmación en Gmail
Confirmación Gmail: Android abrió onboarding
Solicitud de recuperación Android HTTP 200; esperando segundo correo
Recuperación Android HTTP 200; contraseña anterior rechazada; nueva permite entrar
```

Se verificó que la opción Google sigue visible. El inicio OAuth de Google y la apertura desde una app de correo dentro del emulador quedaron fuera de esta corrida. Se modificó únicamente el allowlist de redirecciones del Supabase local. No se accedió al proyecto de producción.
