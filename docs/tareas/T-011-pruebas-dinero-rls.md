# T-011 · Pruebas de utilidades monetarias y de RLS
- **Responsable**: Codex
- **Dependencias**: T-002
- **Archivos permitidos**: `supabase/tests/**`, `**/*.spec.ts`, `.github/workflows/**`
- **Estado**: propuesta

## Descripción
Suite de pruebas independiente de la implementación: utilidades monetarias en centavos (redondeo, suma, reparto, formateo, conversión desde los `float` del prototipo) y políticas RLS (dos usuarios; ningún acceso cruzado en select/insert/update/delete, ni directo ni a través de vistas y funciones). Configurar CI que ejecute build, lint y pruebas en cada PR.

## Criterios de aceptación
1. Las pruebas fallan si se introduce un `float` en la ruta del dinero.
2. Las pruebas fallan si se desactiva una política RLS o se añade una tabla sin RLS.
3. El CI bloquea el merge cuando build, lint o pruebas críticas fallan.
4. La salida de ejecución se adjunta al PR.
