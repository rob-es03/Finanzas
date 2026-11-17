# T-021 · Pantallas del panel y de movimientos (maquetas)
- **Responsable**: Antigravity
- **Dependencias**: T-020 (y T-001 para integrarse al proyecto)
- **Archivos permitidos**: `apps/mobile/src/app/features/dashboard/**` y `features/transactions/**` (plantillas y estilos), `**/*.scss`, `docs/ux-ui/**`
- **Estado**: propuesta

## Descripción
Maquetar panel financiero y lista/alta/edición de movimientos con datos simulados y tipos de `packages/contracts/`, sin llamar a Supabase. Conservar la funcionalidad visible del prototipo (R-01 a R-12) y añadir edición (D-05) y renderizado seguro (D-09): nada de inyectar datos del usuario como HTML.

## Criterios de aceptación
1. Las pantallas compilan dentro del proyecto y se ven correctamente en 360 px de ancho y en escritorio.
2. Los importes se muestran a través del pipe de moneda compartido (centavos → texto), nunca con aritmética propia.
3. Estados vacío, cargando y error implementados.
4. Ningún dato del usuario se inserta con `innerHTML`.
5. No se modifica la capa de datos ni las pruebas.
