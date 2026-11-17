# Estado actual

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
