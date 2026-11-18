# Handoff para Antigravity · Saldo claro

17 de noviembre de 2026 · Dirección A aprobada · [T-030](../tareas/T-030-sistema-diseno.md).

El alcance es Inicio, Movimientos y Registro, con Android como punto de partida y adaptación web. Usa datos ficticios identificados en las maquetas. Coordina con Claude Code los cambios de rutas, guards, contratos y reglas financieras.

## Documentos de referencia

- [Sistema de diseño](../design/DESIGN_SYSTEM.md) · Tokens, temas claro y oscuro, tipografía, espaciado, foco y adaptación responsive.
- [Especificaciones de pantalla](../design/SCREEN_SPECIFICATIONS.md) · Flujos, estados y criterios de aceptación de Inicio, Movimientos y Registro.
- [Inventario de componentes](../design/COMPONENT_INVENTORY.md) · Piezas reutilizables, equivalencias Ionic y variantes.
- [Decisiones UX](../design/UX_DECISIONS.md) · Navegación, presentación de magnitudes financieras y decisiones pendientes.

## Orden de implementación

1. **Inicio.** Aplica los tokens de ambos temas y valida el balance, el selector de cuentas, la acción «Registrar movimiento» y las filas recientes. Distingue saldo en cuentas, flujo neto del mes y próximos pagos. Reserva la etiqueta «Disponible» hasta que se apruebe su cálculo.
2. **Movimientos.** Reutiliza la fila de Inicio para el historial. Añade búsqueda, mes, filtros y detalle. Conserva filtros y posición al volver del detalle. Distingue un historial vacío de una búsqueda sin coincidencias.
3. **Registro.** Conecta la acción desde Inicio y Movimientos y reutiliza el formulario para editar. Comprueba «Abrir → Elegir atajo → Guardar» con un atajo completo y una cuenta válida. Si falla el guardado, conserva los campos y permite reintentar.

## Evidencia para el PR de implementación

- Adjunta capturas de Inicio, Movimientos y Registro en Android y web. Cubre ambos temas e identifica dispositivo o emulador y anchos de referencia de 360, 768 y 1280 px.
- Incluye una grabación breve del registro en tres toques, un guardado fallido que conserva los campos y el regreso desde el detalle con filtros y posición intactos.
- Documenta carga, vacío, sin coincidencias, error y desconexión. Incluye «Pendiente de sincronizar» cuando exista una cola offline aprobada y operativa.
- Registra las comprobaciones con TalkBack, teclado web, texto al 200 %, contraste y movimiento reducido. Muestra foco visible, retorno al origen y acceso a «Guardar» con el teclado móvil abierto.
- Adjunta la salida real de compilación, chequeo de tipos, lint y pruebas pertinentes. Incluye una tabla por criterio `IN`, `MO`, `RE`, `AX` y `QA` con resultado, enlace a evidencia y dependencias pendientes. Enlaza la tarea en el PR.

Este handoff prepara la implementación. La evidencia descrita se adjuntará al PR de Antigravity durante su validación.
