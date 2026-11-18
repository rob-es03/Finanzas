# T-032 · Dejar el lint en verde
- **Responsables**: Codex (sus specs) y Antigravity (sus pantallas)
- **Dependencias**: ninguna
- **Estado**: propuesta

## Fallos reales (`npx ng lint`, 2026-11-17): **23 errores**

### Codex — 20 errores
- `core/auth/auth.guard.spec.ts` — 17: `@typescript-eslint/no-explicit-any` (dobles de prueba tipados como `any`) y `UrlTree` importado sin usar.
- `core/auth/auth.service.spec.ts` — 3: `@typescript-eslint/no-explicit-any`.

Tipar los dobles en lugar de silenciar la regla: un `any` en una prueba de guards oculta justo los cambios de contrato que la prueba debería detectar.

### Antigravity — 3 errores
- `features/auth/onboarding/onboarding.page.html:106` y `:116` — `label-has-associated-control`. Es además un defecto de accesibilidad: una etiqueta sin control asociado no la anuncia el lector de pantalla, e incumple el WCAG 2.2 AA que exige la directiva de diseño.
- `features/dashboard/dashboard.page.ts:8` — `IonIcon` importado y no usado.

## Criterios de aceptación
`npx ng lint` termina con `All files pass linting`, sin desactivar reglas ni añadir `eslint-disable`.
