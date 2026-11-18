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

## Validación Android pendiente

`gradlew.bat assembleDebug` falló al configurar el plugin de Android porque el equipo ejecutó Java 8. Tampoco se detectó SDK ni ADB. Para probar, instalar Android Studio compatible con Capacitor 8 y SDK API 36, usar el JDK incluido y preparar un emulador o dispositivo. El build de prueba debe usar solo el endpoint local mediante `adb reverse` y una configuración de transporte local de depuración. El allowlist de Supabase local debe incluir `ec.finanzas.app://auth/callback`. Validar registro, confirmación y recuperación con la misma instalación que solicitó cada enlace y cubrir apertura en frío y en caliente. [Entorno Android de Capacitor](https://capacitorjs.com/docs/getting-started/environment-setup)
