# Registro de decisiones (ADR ligero)

Formato: ID · fecha · decisión · motivo · estado · origen.

## D-001 — Supabase como backend
2026-11-17 · Supabase (PostgreSQL + Auth + RLS + Edge Functions) como backend inicial; sin servidor Node dedicado hasta que aparezcan integraciones bancarias o requisitos empresariales. **Aceptada.** Origen: conversación.

## D-002 — Firebase solo para mensajería
2026-11-17 · FCM únicamente para push. La autenticación va por Supabase Auth; Firebase Authentication queda descartado salvo razón arquitectónica aprobada. **Aceptada.** Origen: encargo al equipo.

## D-003 — Dinero en centavos enteros
2026-11-17 · Todos los importes se almacenan y operan como enteros en centavos (`BIGINT`). El prototipo usa `float`, lo que acumula error. **Aceptada.** Origen: conversación + encargo.

## D-004 — El HTML es referencia, no arquitectura
2026-11-17 · `finanzas_nicolle.html` se conserva como fuente histórica y referencia visual/funcional; no se migra su código. **Aceptada.** Origen: conversación.

## D-005 — Aislamiento por usuario mediante RLS
2026-11-17 · Toda tabla de datos lleva `user_id` y política RLS sobre `auth.uid()`. Sin claves privilegiadas en el cliente. **Aceptada.** Origen: encargo.

## D-006 — Plataformas comprometidas
2026-11-17 · Android y web. iOS no se compromete. **Aceptada.** Origen: encargo ("priorizar Android y web").

## D-007 — Un responsable por tarea
2026-11-17 · Claude Code implementa, Codex audita y prueba, Antigravity diseña y valida visualmente. Nadie edita archivos ajenos sin una tarea que lo autorice. **Aceptada.** Origen: conversación + encargo.

## D-008 — Utilidades del teléfono después de las finanzas
2026-11-17 · Primero el núcleo financiero; linterna, panel de Wi-Fi y widget se abordan después y en módulos separados. **SUPUESTO**, pendiente de confirmación humana (P-01/R-55): en la conversación la pregunta quedó sin responder.

## D-009 — Control de versiones local sin remoto
2026-11-17 · Se inicializó un repositorio Git local en la carpeta del proyecto porque no existía ninguno. Aún no hay remoto; los pull requests requieren crear el repositorio en GitHub. **Provisional**, pendiente de P-05.

## Preguntas abiertas
Ver sección 7 de `docs/requisitos.md` (P-01 a P-05). No se implementa nada que dependa de ellas sin respuesta.
