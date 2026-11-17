# T-030 · Implementar el sistema de diseño «Saldo claro»
- **Responsable**: Antigravity
- **Dependencias**: `docs/design/` (sistema ya aprobado y especificado)
- **Archivos permitidos**: `apps/mobile/src/theme/**`, `**/*.scss`, plantillas `.html` de `features/**`, `docs/design/COMPONENT_INVENTORY.md`
- **Estado**: propuesta · absorbe T-020 y T-021

## Contexto
La dirección visual **ya está decidida y documentada**: `DESIGN_SYSTEM.md` (tokens de color claro/oscuro, tipografía, espaciado, radios, elevación, estados), `SCREEN_SPECIFICATIONS.md` (Inicio, Movimientos, registro), `COMPONENT_INVENTORY.md` y `UX_DECISIONS.md`. Lo que falta es **llevarla al código**: hoy `src/theme/variables.scss` solo declara la familia tipográfica.

## Descripción
Traducir los tokens de `DESIGN_SYSTEM.md` a variables CSS de Ionic en `src/theme/`, con modo claro y oscuro, e implementar los componentes base del inventario (balance principal, selector de cuenta, acciones rápidas, fila de movimiento, resumen del mes, estados vacío/carga/error). Aplicarlos a Inicio y Movimientos según las especificaciones, con datos ficticios marcados como tales.

## Criterios de aceptación
1. Ningún color, margen, radio o tamaño literal en los componentes: todo por token.
2. Contraste AA verificado en claro y oscuro, con los valores documentados.
3. El significado nunca depende solo del color: ingreso y gasto llevan además signo e icono.
4. Importes con cifras tabulares, alineados para comparar en columna.
5. Inicio distingue explícitamente saldo en cuentas, flujo del mes y pagos próximos, como fija `UX_DECISIONS.md`.
6. `npx ng lint` en verde y `npx ng build` sin errores.
7. Se respeta `prefers-reduced-motion`.
8. No se modifican rutas, `core/`, `data/`, `supabase/` ni los contratos sin coordinar con Claude Code.
