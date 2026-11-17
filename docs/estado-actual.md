# Estado actual

## Avance de Antigravity (UX/UI, OAuth & Android) · 2026-11-17

- **Rama**: `feat/T-003-auth-google`
- **Scaffold**: Integrado y verificado en `master` (Angular 22 + Ionic 9 + Capacitor 8 + Android).
- **Autenticación Google y Sesiones**: Implementada arquitectura completa con Supabase Auth (`AuthService`, `authGuard`, `publicOnlyGuard`, `onboardingGuard`), almacenamiento seguro vía `@capacitor/preferences` en Android nativo y `localStorage` en web, y listener de deep links para el esquema `ec.finanzas.app://auth/callback`.
- **Pantallas construidas y estilizadas**:
  1. `WelcomePage` (`/auth/welcome`): Introducción clara, beneficios clave y CTA accesible.
  2. `LoginPage` (`/auth/login`): Botón oficial «Continuar con Google» (branding Google Identity), aviso de datos mínimos y feedback háptico.
  3. `AuthCallbackPage` (`/auth/callback`): Animación de verificación segura, intercambio de código PKCE y sincronización de perfil.
  4. `AuthErrorPage` (`/auth/error`): Diagnóstico amigable, sugerencias y reintento con 1 toque.
  5. `OnboardingPage` (`/auth/onboarding`): Asistente de configuración inicial en 2 pasos: confirmación de nombre/moneda principal (USD, EUR, etc.) y cuentas con saldos iniciales en centavos enteros.
  6. `DashboardPage` (`/dashboard`): Vista inicial protegida con saludo personalizado y botón de cierre de sesión seguro.
- **Contratos Compartidos**: Creado `@finanzas/contracts` con tipos estrictos para perfiles, monedas soportadas y saldos enteros en centavos.
- **Base de Datos y RLS**: Creada migración `supabase/migrations/20261117180000_auth_profiles_and_accounts.sql` con políticas RLS sobre `auth.uid()`, trigger idempotente `handle_new_user()` y prueba de aislamiento en `supabase/tests/rls_isolation_test.sql`.
- **Evaluación Android**: Documentación y diseño de AppWidgets (Jetpack Glance) y análisis de restricciones del sistema (Wi-Fi Settings Panel vs Linterna) en `docs/ux-ui/android-widgets-evaluation.md`.
- **Pruebas**: 13 pruebas unitarias superadas (`ng test --watch=false`), chequeo TypeScript limpio y build de producción web exitoso.

Actualizado: 2026-11-17 · por Antigravity.

## Lo que existe realmente
| Elemento | Estado |
|---|---|
| Prototipo `finanzas_nicolle.html` | Existe. HTML+Tailwind+Chart.js, 1 archivo, `localStorage`. Fuente histórica, intacta. |
| Repositorio Git | Local con ramas `master`, `audit/T-010-verificacion-inicial`, `feat/T-003-auth-google`. |
| Proyecto Angular/Ionic/Capacitor | **Existe y compila.** Angular 22.2, Ionic 9.0, Capacitor 8.6 con Android configurado. |
| Contratos compartidos | **Existe.** `@finanzas/contracts` en `packages/contracts/`. |
| Autenticación Google + Supabase | **Implementada.** Web (OAuth redirect) y Android (Deep links + Browser + Secure Storage). |
| Pantallas Auth & Onboarding | **Implementadas.** Bienvenida, Login, Callback, Error, Configuración Inicial y Dashboard. |
| Proyecto Supabase | Identificado: `ujalaluhmtwevqhnzivo`. Migración SQL y pruebas RLS preparadas. |
| Proyecto Firebase (FCM) | Pendiente de credenciales remotas (solo para push). |
| Pruebas unitarias | **13 pruebas ejecutadas y superadas.** |
| CI/CD | Pendiente de creación de repositorio remoto en GitHub. |
