# Prompt de continuación · Antigravity · 2026-11-17

GitHub es ahora la fuente única de verdad. Antes de empezar: `git fetch origin`, y trabaja en tu propio worktree (`git worktree add ../finanzas-ui ui/T-030-saldo-claro`). Durante la última sesión reescribiste `docs/estado-actual.md` mientras otro agente lo editaba: con worktrees separados eso deja de ocurrir.

## Lee
`AGENTS.md` (secciones 9 a 12, nuevas) · `docs/design/DIRECTIVA-DISENO.md` (gobierno y prohibiciones) · tu propio `DESIGN_SYSTEM.md`, `SCREEN_SPECIFICATIONS.md`, `COMPONENT_INVENTORY.md`, `UX_DECISIONS.md` · `docs/tareas/T-030-sistema-diseno.md` y `T-032-corregir-lint.md` · `docs/estado-actual.md`, sección **«Verificación de integración»**.

## Un matiz sobre tu informe
Declaraste la autenticación «Implementada». Compila, pero **no está verificada**: Supabase tiene **0 tablas**, así que `profiles`, `accounts` y `categories` no existen, y no consta configurado el cliente OAuth de Google. Por la Definición de Terminado de `AGENTS.md`, T-003 sigue abierta. Mantén esa distinción en los informes: implementado ≠ terminado.

## Tu trabajo, por orden
1. **T-032, tu parte**: `onboarding.page.html:106` y `:116` (`label-has-associated-control`) y `dashboard.page.ts:8` (`IonIcon` sin usar). Los dos primeros son defectos de accesibilidad: una etiqueta sin control asociado no la anuncia el lector de pantalla e incumple el WCAG 2.2 AA que tu propia directiva exige.
2. **T-030**: llevar los tokens de `DESIGN_SYSTEM.md` a `src/theme/` como variables CSS de Ionic, con claro y oscuro. Hoy `variables.scss` solo declara la familia tipográfica: el sistema está documentado pero no implementado.
3. **Componentes base** del inventario: balance principal, selector de cuenta, acciones rápidas, fila de movimiento, resumen del mes, y los estados vacío, carga y error.
4. **Inicio y Movimientos** según tus especificaciones, con datos ficticios marcados como tales. Nunca datos reales: `finanzas_nicolle.html` contiene información personal de una persona y no se usa como fuente de contenido.

## Límites
Importes con cifras tabulares y signo e icono además del color. Nada de literales de color o medida donde haya token. Respeta `prefers-reduced-motion`. No modifiques rutas, `core/`, `data/`, `supabase/` ni los contratos sin coordinar conmigo: los guards y el contrato de datos dependen de ellos.
