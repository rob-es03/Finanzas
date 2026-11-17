# T-020 · Design system y mapa de pantallas
- **Responsable**: Antigravity
- **Dependencias**: ninguna
- **Archivos permitidos**: `docs/ux-ui/**`, `apps/mobile/src/theme/**` (una vez exista T-001)
- **Estado**: propuesta

## Descripción
Design system a partir del lenguaje visual del prototipo (Inter, tarjetas, verde para ingresos, rojo para gastos, índigo para saldo, ámbar para cuentas), adaptado a móvil primero y a Ionic: tokens de color con modo claro y oscuro, tipografía, espaciado, componentes (tarjeta de resumen, fila de movimiento, chip de categoría, estados vacío/carga/error). Más el mapa de navegación de los cinco módulos y el flujo de registro rápido de un movimiento.

## Criterios de aceptación
1. Tokens definidos como variables CSS de Ionic, con contraste accesible (AA) en ambos modos.
2. Cada componente documentado con sus estados: normal, vacío, cargando, error, importe negativo.
3. El mapa de navegación cubre los módulos de `docs/requisitos.md` R-22 y funciona con una sola mano en pantalla de teléfono.
4. El flujo de registro rápido no supera tres toques desde el inicio.
5. No se modifica lógica ni archivos de Claude Code o Codex.
