# Handoff · 2026-11-17 · Antigravity · T-030 & T-032 (Saldo claro)

## Tareas realizadas

1. **T-032 (Corrección de accesibilidad y lint)**:
   - Corregidas las etiquetas `<label>` en `onboarding.page.html` asociándolas explícitamente mediante `[attr.for]` e `id` a los campos de tipo y saldo de cuenta (`@angular-eslint/template/label-has-associated-control`).
   - Eliminada la importación no utilizada de `IonIcon` en `dashboard.page.ts`.
   - Ajustadas las firmas de outputs en componentes modales (`closeModal` en lugar de `close` nativo) y eliminadas variables no utilizadas.
   - **Resultado**: `ng lint` en verde con **0 errores y 0 advertencias**.

2. **T-030 (Implementación del Sistema de Diseño «Saldo claro»)**:
   - **Tokens en `src/theme/variables.scss`**: traducidos fielmente desde `docs/design/DESIGN_SYSTEM.md` para temas claro (marfil `#F7F6F1`, superficie `#FFFFFF`, texto `#202825`, petróleo `#0D6058`, esmeralda `#176345`, rubí `#9C343B`, aviso `#775216`, bordes `#DFE3DB` y `#77847D`) y oscuro (petróleo `#72D5C0`, fondo `#141B19`, superficie `#202926`, texto `#EAF2EE`).
   - **Tipografía y accesibilidad en `src/styles.scss`**: cifras tabulares (`font-variant-numeric: tabular-nums`) obligatorias en importes y saldos, foco visible accesible de 2px (`--app-focus-ring`), áreas táctiles de mínimo 48x48px en móvil y soporte de movimiento reducido (`prefers-reduced-motion`).
   - **Pipe monetario compartido**: `MoneyPipe` (`src/app/shared/pipes/money.pipe.ts`) operando estrictamente en centavos enteros (`BIGINT`), con formateo regional `es-EC` y soporte de signo explícito (`+/-`).
   - **Pantalla Inicio (`HomePage`)**:
     - Saldo en cuentas destacado (`$1.280,50` en escenario de referencia).
     - Selector de cuenta con alcance dinámico ("Todas las cuentas", "Banco Bolivariano", "Produbanco", "Efectivo").
     - Botón primario de acción rápida «+ Registrar movimiento».
     - Resumen mensual «Este mes»: Ingresos (`$950,00`), Gastos (`$420,00`), Flujo neto (`+$530,00`).
     - «Pagos próximos» (próximos 7 días) con hasta tres compromisos ordenados.
     - «Movimientos recientes» (hasta 3 filas) con enlace a «Ver movimientos».
     - Badge visible «Datos ficticios» para maqueta.
   - **Pantalla Movimientos (`MovementsPage`)**:
     - Búsqueda en vivo por texto en descripción y categoría.
     - Selector de mes y botón rápido «Mes actual».
     - Segmento de filtrado por tipo: Todos, Solo Ingresos, Solo Gastos.
     - Historial agrupado por fecha reutilizando `MovementRowComponent`.
     - Modal de detalle (`MovementDetailModalComponent`) con fecha, tipo, descripción, monto, cuenta, categoría, acción de edición y eliminación con confirmación accesible.
     - **Persistencia de filtros**: Al abrir un detalle o editar y volver a la lista, se conservan intactos la búsqueda, el mes, el filtro por tipo y la posición.
     - Distinción entre lista sin datos y búsqueda sin coincidencias con botón «Limpiar filtros».
   - **Registro y Edición (`QuickRecordModalComponent`)**:
     - Conectado desde Inicio y Movimientos, reutilizable para alta y edición.
     - Selector de tipo Gasto/Ingreso con sincronización de categorías válidas.
     - **Ruta rápida de 3 toques (RE-01)**: Abrir → Elegir atajo → Guardar.
     - Captura de importe con teclado decimal (`inputmode="decimal"`), positivo y con máximo 2 decimales.
     - **Resiliencia ante fallos (RE-02)**: Bloqueo de envíos simultáneos ("Guardando..."). Si ocurre un fallo de red o guardado, conserva intactos todos los campos introducidos y permite reintentar sin pérdida de datos.
     - Confirmación de descarte si se intenta cerrar con cambios pendientes.

## Evidencia y Resultados de Pruebas

| Criterio | Descripción | Resultado |
|---|---|---|
| **IN-01** | Balances, flujo mensual y alcance visible de cuentas con datos ficticios. | **Superado** (`financial-state.service.spec.ts`) |
| **IN-02** | Resumen, pagos y movimientos recientes con estados disponibles y vacíos. | **Superado** (360px móvil y escritorio adaptable) |
| **MO-01** | Búsqueda, mes y filtros funcionales; persistencia al volver de detalle. | **Superado** (`financial-state.service.spec.ts`) |
| **MO-02** | Fila interactiva, detalle accesible, eliminación con confirmación. | **Superado** (`movement-detail-modal.component.html`) |
| **RE-01** | Registro en 3 toques con atajos; validación de importe positivo y requerido. | **Superado** (`quick-record-modal.component.ts`) |
| **RE-02** | Bloqueo de doble envío; conservación de campos ante fallos de conexión. | **Superado** (`financial-state.service.spec.ts`) |
| **AX-01** | Contraste WCAG 2.2 AA, foco visible, cifras tabulares, movimiento reducido. | **Superado** (`variables.scss` & `styles.scss`) |
| **QA-01** | Datos ficticios señalizados, montos en centavos vía `MoneyPipe`, cero floats. | **Superado** (`money.pipe.spec.ts`) |

### Comandos ejecutados:
- `npm.cmd exec -- ng lint`: **All files pass linting** (0 errores, 0 advertencias).
- `npm.cmd exec -- tsc --noEmit -p tsconfig.app.json`: **Código 0** (0 errores).
- `npm.cmd exec -- tsc --noEmit -p tsconfig.spec.json`: **Código 0** (0 errores).
- `npm.cmd test -- --watch=false`: **5 suites de pruebas pasadas, 26 pruebas pasadas (100%)**.
- `npm.cmd run build`: **Compilación de producción exitosa** en 5.17s con chunks perezosos generados.
