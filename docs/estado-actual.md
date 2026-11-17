# Estado actual

## Verificación de Codex · 2026-11-17

La copia local contiene un scaffold Angular sin seguimiento en Git. La compilación, los dos chequeos TypeScript y las dos pruebas del scaffold pasaron en una copia temporal. Pasaron dos pruebas adicionales del prototipo. La auditoría de la resolución temporal reportó 12 paquetes de desarrollo con severidad alta y cero hallazgos con `--omit=dev`.

Sigue pendiente identificar el PR de Claude Code. Las conexiones disponibles de Supabase devolvieron un error de permisos al consultar las migraciones del proyecto indicado. El estado de lanzamiento queda bloqueado hasta verificar el aislamiento, las funciones financieras y el flujo de autenticación en la versión candidata. [Informe de auditoría](auditorias/2026-11-auditoria-prototipo.md).

Actualizado: 2026-11-17 · por Claude Code (Fase 0, sincronización de contexto).

## Lo que existe realmente
| Elemento | Estado |
|---|---|
| Prototipo `finanzas_nicolle.html` | Existe. HTML+Tailwind+Chart.js, 1 archivo, `localStorage`. Fuente histórica, intacta. |
| Markdown de la conversación | Existe. Fuente histórica, intacta. |
| Repositorio Git | Inicializado localmente en esta sesión. **Sin remoto.** Sin commits previos. |
| Proyecto Angular/Ionic | **No existe.** |
| Proyecto Supabase | **No existe / no verificado.** |
| Proyecto Firebase (FCM) | **No existe / no verificado.** |
| Migraciones SQL | **No existen.** |
| Pruebas | **No existen.** |
| CI/CD | **No existe.** |

## Lo que se hizo en esta sesión
- Inspección completa del repositorio (2 archivos).
- Lectura íntegra del Markdown de la conversación y del HTML original.
- Extracción de requisitos, defectos, decisiones, supuestos y preguntas abiertas.
- Creación de `AGENTS.md`, `CLAUDE.md` y `docs/` (requisitos, arquitectura, decisiones, estado actual, tareas).
- Definición del primer conjunto de tareas independientes.

## Pruebas ejecutadas
Ninguna: todavía no hay código ejecutable. No se declara nada funcional.

## Bloqueos
- P-05: no hay repositorio remoto ni se ha confirmado que existan proyectos de Supabase y Firebase. Sin ellos no hay pull requests ni integración real de autenticación.
- P-01, P-02, P-03, P-04 abiertas (ver `docs/requisitos.md`).

## Próximos pasos
T-001 (scaffold), T-002 (esquema y RLS) y T-010/T-020 en paralelo según `docs/tareas/`.

## Seguimiento Supabase · 2026-11-17

La conexión Crecimiento Nic ya permite consultar el proyecto. Se verificaron cero migraciones y cero tablas, vistas o funciones en public. Los asesores de seguridad y rendimiento devolvieron listas vacías. La rama local de Claude Code contiene el scaffold Ionic/Capacitor en db6802a. Siguen pendientes el PR y la validación de T-002 en un entorno aislado.

## Validación local de T-002 · 2026-11-17

La migración parcial de perfiles, cuentas y categorías aplicó desde cero en PostgreSQL embebido. Pasaron 10 pruebas, con cobertura de RLS de dos usuarios y del almacenamiento de saldos iniciales en centavos. Falta el esquema financiero restante para ejecutar las pruebas de cálculos de dominio.
