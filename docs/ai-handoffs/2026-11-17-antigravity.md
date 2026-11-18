# Handoff · 2026-11-17 · Antigravity · T-003 & T-020

## Tareas realizadas
- **T-003**: Autenticación completa con Google mediante Supabase Auth y Google OAuth/OpenID Connect para Web y Android. Flujos de redirección PKCE, deep linking (`ec.finanzas.app://auth/callback`), persistencia segura mediante `@capacitor/preferences` en Android nativo y `localStorage` en web, sincronización de perfil con datos mínimos autorizados, cierre de sesión y guards de rutas (`authGuard`, `publicOnlyGuard`, `onboardingGuard`).
- **T-020**: Design System accesible (WCAG AA) para tema claro y oscuro (`apps/mobile/src/theme/variables.scss`, `apps/mobile/src/styles.scss`, `docs/ux-ui/design-system.md`), respetando la identidad visual del prototipo histórico (Inter, tarjetas con borde izquierdo semántico verde/rojo/índigo/ámbar, toque mínimo de 48px y feedback háptico).
- **Pantallas construidas y funcionales**:
  1. `WelcomePage` (`apps/mobile/src/app/features/auth/welcome/`)
  2. `LoginPage` (`apps/mobile/src/app/features/auth/login/`) con botón oficial de Google Identity.
  3. `AuthCallbackPage` (`apps/mobile/src/app/features/auth/callback/`) con animación accesible de verificación.
  4. `AuthErrorPage` (`apps/mobile/src/app/features/auth/error/`) con diagnóstico claro y reintento.
  5. `OnboardingPage` (`apps/mobile/src/app/features/auth/onboarding/`) asistente en 2 pasos: confirmación de nombre/moneda principal (USD, EUR, COP, MXN, PEN) y cuentas con saldos iniciales en centavos enteros.
  6. `DashboardPage` (`apps/mobile/src/app/features/dashboard/`) pantalla inicial autenticada con cierre de sesión.
- **Contratos compartidos**: Creado `@finanzas/contracts` (`packages/contracts/`) mapeado en TypeScript para desacoplar capas.
- **Base de Datos y RLS**: Migración `supabase/migrations/20261117180000_auth_profiles_and_accounts.sql` con políticas RLS basadas en `auth.uid()`, trigger idempotente `handle_new_user()` y script de pruebas en `supabase/tests/rls_isolation_test.sql`.
- **Evaluación Android**: Documentación y diseño de AppWidgets (Jetpack Glance) y restricciones del sistema (Wi-Fi Settings Panel vs Linterna) en `docs/ux-ui/android-widgets-evaluation.md`.
- **Guía de configuración**: Instrucciones detalladas para Google Cloud Console y Supabase en `docs/auth-google-setup.md`.

## Archivos modificados y creados
- `packages/contracts/**`: tipos de autenticación, onboarding, perfiles y cuentas en centavos enteros.
- `apps/mobile/src/app/core/auth/**`: `auth.service.ts`, `auth.guard.ts`, `capacitor-storage.adapter.ts`, y pruebas unitarias `auth.service.spec.ts`, `auth.guard.spec.ts`.
- `apps/mobile/src/app/core/supabase/**`: `supabase.client.ts` configurado con almacenamiento seguro según plataforma.
- `apps/mobile/src/app/features/auth/**`: páginas `welcome`, `login`, `callback`, `error`, `onboarding` con sus componentes `.ts`, `.html` y `.scss`.
- `apps/mobile/src/app/features/dashboard/**`: integración de perfil y cierre de sesión.
- `apps/mobile/src/app/app.routes.ts`: configuración de rutas y guards.
- `apps/mobile/src/theme/variables.scss` & `src/styles.scss`: tokens del Design System y estilos de componentes.
- `apps/mobile/android/app/src/main/AndroidManifest.xml`: intent filter para deep link `ec.finanzas.app://auth/callback`.
- `supabase/migrations/20261117180000_auth_profiles_and_accounts.sql`: esquema y RLS.
- `supabase/tests/rls_isolation_test.sql`: pruebas de aislamiento RLS multiusuario.
- `docs/ux-ui/design-system.md`: especificación del Design System.
- `docs/ux-ui/android-widgets-evaluation.md`: evaluación de widgets y funciones Android.
- `docs/auth-google-setup.md`: configuración en Google Cloud y Supabase.
- `docs/estado-actual.md`: actualización de progreso y estado del proyecto.

## Decisiones tomadas
- **Almacenamiento de tokens en Android**: Uso de `@capacitor/preferences` como adapter de Supabase Auth en plataformas nativas para garantizar persistencia segura fuera del WebView no protegido.
- **Flujo Google OAuth en Android**: Uso de `@capacitor/browser` y listener `appUrlOpen` con esquema `ec.finanzas.app://auth/callback` para un flujo nativo fluido que no pierde el contexto de la aplicación.
- **Representación monetaria**: Cero floats en cuentas y perfiles; los saldos iniciales del onboarding se convierten a enteros estrictos en centavos (`Math.round(balance * 100)`).
- **Google Branding**: Botón alineado con las directrices de Google Identity (icono vectorial original de 4 colores, tipografía Inter/Roboto 15px, contraste adecuado y feedback táctil háptico).

## Pruebas ejecutadas y resultados reales
- `npm.cmd run build`: Compilación de producción exitosa en 5.3s. Generación correcta de chunks perezosos (`login-page`, `onboarding-page`, `welcome-page`, `callback-page`, `error-page`).
- `npm.cmd exec -- tsc --noEmit -p tsconfig.app.json`: Código de salida 0 (cero errores de tipos).
- `npm.cmd test -- --watch=false`: 3 archivos de pruebas ejecutados, **13 pruebas superadas (100% éxito)**:
  - `src/app/core/auth/auth.guard.spec.ts`: 7 pruebas pasadas.
  - `src/app/core/auth/auth.service.spec.ts`: 5 pruebas pasadas.
  - `src/app/app.spec.ts`: 1 prueba pasada.

## Próximos pasos
- Coordinar con Claude Code para la integración de las siguientes entidades financieras (movimientos, deudas, presupuestos) sobre las cuentas sembradas en esta etapa.
- Coordinar con Codex para auditoría de seguridad y pruebas de penetración / RLS automatizadas con pgTAP.
- Crear el repositorio remoto en GitHub para publicar la rama `feat/T-003-auth-google` y abrir el Pull Request correspondiente.
