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


## D-010 — Proyecto Supabase identificado
2026-11-17 · Proyecto `ujalaluhmtwevqhnzivo` (`us-east-2`, PostgreSQL 17.12, `ACTIVE_HEALTHY`). Verificado por API: **0 migraciones aplicadas y 0 tablas en `public`**. Ninguna migración se ha ejecutado; la del repositorio sigue siendo una propuesta sin aplicar. **Aceptada.**

## D-011 — GitHub como fuente única de verdad
2026-11-17 · El repositorio de GitHub (privado) manda sobre cualquier copia local. Todo trabajo de los tres agentes se integra mediante ramas y pull requests contra `main`; no se fusiona automáticamente. **Aceptada.** Origen: encargo.

## D-012 — `environment.ts` fuera del control de versiones
2026-11-17 · `src/environments/environment.ts` estaba versionado. Se retiró del índice (`git rm --cached`; el archivo permanece en disco) y se añadió a `.gitignore`. Se versiona solo `environment.example.ts`. **Aceptada.**

## D-013 — Dependencias faltantes instaladas, código ajeno intacto
2026-11-17 · El código de autenticación importaba `@capacitor/browser` y `@capacitor/preferences` sin que estuvieran instalados, y el proyecto no compilaba. Se instalaron las dependencias en lugar de modificar código de otro agente. **Aceptada.**

## D-014 — Credencial de Supabase expuesta en conversación
2026-11-17 · Se recibió un token de acceso personal de Supabase (`sbp_...`) por chat. Se usó **solo en lectura** para consultar el estado del proyecto y **no se escribió en ningún archivo del repositorio**. Un token compartido por un canal de conversación debe considerarse comprometido: **se recomienda revocarlo y emitir uno nuevo**. **Pendiente de acción humana.**

## D-015 — El lint en rojo no se corrige por propiedad de archivos
2026-11-17 · Los 3 errores de lint están en archivos propiedad de Antigravity. Según `AGENTS.md` no se editan sin coordinación: quedan documentados en `docs/estado-actual.md` y asignados a su responsable. **Aceptada.**

## D-016 — El repositorio se publica en GitHub público
2026-11-17 · `https://github.com/rob-es03/Finanzas`, **visibilidad pública**, por decisión expresa del responsable tras advertirle del riesgo. Consecuencia conocida y aceptada: el historial contiene desde el commit `394e99a` el prototipo `finanzas_nicolle.html` con el nombre real de una persona, sus entidades bancarias y cifras concretas de su economía; ese contenido queda indexable y clonable. Retirarlo exigiría reescribir el historial y rebasar las ramas de los tres agentes. **Aceptada por el responsable.** Pendiente: decidir si se redacta el prototipo más adelante y se coordina la reescritura.

## D-017 — `main` parte de un historial no relacionado
2026-11-17 · El repositorio remoto se creó con un «Initial commit» (`7bf297e`, solo `README.md`) sin relación con el historial local. Se integró con `merge --allow-unrelated-histories` (`18decbd`) en lugar de forzar el push, para no destruir el commit remoto. **Aceptada.**

## D-018 — Una sola base compartida: el proyecto en la nube
2026-11-17 · Todos los agentes apuntan a `ujalaluhmtwevqhnzivo` (PostgreSQL 17.12). Motivo: es donde están aplicadas y verificadas las migraciones, es la única donde funciona el login con Google —la URI de redirección registrada apunta ahí— y el stack local que convivía con ella no era reproducible: sin `supabase/config.toml` versionado y sobre PostgreSQL 16.5. Dos agentes probando contra bases distintas no pueden contrastar resultados; el primer login falló por eso. Detalle y camino para habilitar desarrollo local en `docs/ops/BASE-DE-DATOS.md`. **Aceptada.**
## Preguntas abiertas

- 2026-11-17 · **P-05, evidencia pendiente.** Se informó que el código de Claude Code está en GitHub. La copia local carece de remoto y las búsquedas no identificaron un PR verificable. **Supuesto provisional:** tratar el scaffold local como una copia independiente de la versión candidata hasta confirmar el enlace del PR y su SHA. El identificador de Supabase es conocido y la consulta de migraciones sigue bloqueada por permisos.
Ver sección 7 de `docs/requisitos.md` (P-01 a P-05). No se implementa nada que dependa de ellas sin respuesta.
