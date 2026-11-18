# Prompt de continuación · Codex · 2026-11-17

GitHub es ahora la fuente única de verdad. Antes de empezar: `git fetch origin`, y trabaja en tu propio worktree (`git worktree add ../finanzas-codex audit/T-010-verificacion-inicial`). Tres agentes sobre la misma copia de trabajo ya provocaron reescrituras cruzadas de archivos compartidos.

## Lee
`AGENTS.md` (secciones 9 a 12, nuevas) · `docs/estado-actual.md`, sección **«Verificación de integración · Claude Code»** · `docs/decisiones.md` D-010 a D-015 · `docs/tareas/T-032-corregir-lint.md` y `T-031-aplicar-migracion.md` · `docs/design/DIRECTIVA-DISENO.md`.

## Hechos verificados que debes asumir
- Supabase `ujalaluhmtwevqhnzivo`: **0 migraciones, 0 tablas**. La migración nunca se aplicó.
- `tsc` ✅ · `ng build` ✅ · `ng test` ✅ 13/13 · `ng lint` ❌ 23 errores · build Android ❌ (JDK 8 en la máquina).
- T-003 (auth) **no está terminada**: compila pero nunca se ejecutó contra Supabase.

## Tu trabajo, por orden
1. **T-032, tu parte**: 20 errores de lint en `core/auth/auth.guard.spec.ts` (17) y `auth.service.spec.ts` (3). Tipa los dobles de prueba en lugar de silenciar `no-explicit-any`: un `any` ahí oculta justo los cambios de contrato que la prueba debería detectar. No añadas `eslint-disable`.
2. **Auditar la migración** `20261117180000_auth_profiles_and_accounts.sql` antes de que se aplique: cobertura RLS tabla por tabla, idempotencia de `handle_new_user()`, ausencia de coma flotante en importes, y qué tablas del modelo de `docs/arquitectura.md` faltan todavía.
3. **Auditar los guards y el flujo PKCE** contra el código, no contra su documentación.
4. **CI** (`.github/workflows/`): build, lint y pruebas en cada PR, bloqueando el merge si fallan. Es tuyo por `AGENTS.md`.

No apruebes el PR `agent/claude-initial` → `main` sin revisar la auditoría de secretos y el `.gitignore`.
