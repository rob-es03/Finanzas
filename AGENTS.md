# AGENTS.md — Protocolo de colaboración multiagente

Proyecto: **Finanzas personales** (Angular + Ionic + Capacitor + Supabase).
Este documento es la fuente de verdad común para **Claude Code**, **Codex** y **Antigravity**.
Lectura obligatoria al inicio de cada sesión, junto con `docs/requisitos.md`, `docs/decisiones.md` y `docs/estado-actual.md`.

## 0. Fuentes históricas (NO modificar ni borrar)
- `finanzas_nicolle.html` — prototipo original. Referencia funcional y visual.
- `ChatGPT-Megaprompt Aplicación Full Stack-20261117-1824.md` — conversación y requisitos de origen.

Ambos son de solo lectura permanente. Cualquier reescritura se hace en el código nuevo, nunca sobre ellos.

## 1. Roles y propiedad de archivos

| Agente | Rol | Ramas | Archivos de su propiedad |
|---|---|---|---|
| **Claude Code** | Ingeniero principal: arquitectura, backend, lógica de negocio, integraciones, coordinación técnica | `feat/*`, `chore/*` | `supabase/**`, `apps/mobile/src/app/core/**`, `apps/mobile/src/app/data/**`, `packages/contracts/**`, `AGENTS.md`, `CLAUDE.md`, `docs/**` |
| **Codex** | Calidad y seguridad: auditoría independiente, pruebas, revisión, corrección | `test/*`, `fix/*`, `audit/*` | `**/*.spec.ts`, `e2e/**`, `supabase/tests/**`, `.github/workflows/**`, `docs/auditorias/**` |
| **Antigravity** | UX/UI: design system, pantallas, navegación, experiencia Android, validación visual | `ui/*`, `ux/*` | `apps/mobile/src/app/features/**/*.html`, `**/*.scss`, `apps/mobile/src/theme/**`, `docs/ux-ui/**` |

Regla: **un responsable por tarea, una revisión independiente antes de integrar.** Ningún agente edita archivos de otro sin una tarea que lo autorice explícitamente en `docs/tareas/`.

## 2. Git
- Rama base: `main`. Nadie hace commit directo a `main`.
- Una rama por tarea, nombrada `<prefijo>/<ID-tarea>-<slug>` (ej. `feat/T-003-auth-google`).
- Worktrees para aislar espacios de trabajo:
  ```
  git worktree add ../finanzas-claude  feat/T-003-auth-google
  git worktree add ../finanzas-codex   test/T-010-rls-tests
  git worktree add ../finanzas-ui      ui/T-020-design-system
  ```
- Commits en imperativo, con el ID de tarea: `feat(auth): T-003 login con Google via Supabase`.
- Pull request obligatorio. El PR enlaza su tarea y adjunta la **evidencia real** de pruebas (salida de comandos, no afirmaciones).
- Prohibido: `push --force` sobre ramas compartidas, `reset --hard` sobre trabajo ajeno, reescribir historia publicada, borrar archivos de otro agente.
- Antes de cualquier operación destructiva: `git status` y `git log --oneline -5`, y pedir aprobación humana.

## 3. Contratos antes del paralelismo
Ningún trabajo paralelo empieza sin que estén acordados y fusionados en `main`:
1. Esquema SQL y políticas RLS (`supabase/migrations/`).
2. Tipos TypeScript compartidos (`packages/contracts/`), generados desde el esquema cuando sea posible.
3. Contratos de servicios/API y formatos de error.

Un cambio de contrato es un PR propio, anunciado en `docs/decisiones.md`, antes de que dependa código nuevo.

## 4. Formato de tarea (`docs/tareas/T-XXX-*.md`)
Toda tarea declara: **ID · Título · Responsable · Dependencias · Archivos permitidos · Descripción · Criterios de aceptación · Pruebas requeridas · Riesgos · Estado**.

## 5. Definición de TERMINADO
Una funcionalidad está terminada solo si:
1. Cumple sus criterios de aceptación.
2. Tiene integración real con sus dependencias (no mocks que simulen lo que debe ser real).
3. Compila.
4. Supera las pruebas pertinentes, con salida adjunta.
5. No introduce vulnerabilidades conocidas ni regresiones detectadas.
6. Funciona en las plataformas comprometidas (web y Android).
7. Está documentada.
8. Ha sido revisada por otro agente e integrada a `main`.

Prohibido declarar algo "funcional" sin evidencia verificable.

## 6. Reglas de dominio no negociables
- **Dinero en enteros**: todos los importes se almacenan y operan en **centavos** (`BIGINT` / `number` entero). Nunca `float` para dinero. Formateo solo en la capa de presentación.
- **Aislamiento por usuario**: RLS activada en toda tabla con datos de usuario; política basada en `auth.uid()`. Ninguna tabla de datos queda sin RLS.
- **Sin claves privilegiadas en el cliente**: la `service_role` key nunca llega a Angular/Capacitor. Operaciones sensibles en Edge Functions.
- **Renderizado seguro**: nada de `innerHTML` con datos del usuario (defecto heredado del prototipo).
- **Idempotencia** en operaciones repetibles (importación, sincronización offline, registro de pagos) mediante claves de operación.
- **Base de datos de producción**: no se modifica sin aprobación humana explícita. Migraciones versionadas y probadas en entorno local/branch.
- **Android**: no se promete control de funciones restringidas por el sistema operativo. Las utilidades del teléfono viven separadas de la lógica financiera.

## 7. Memoria persistente entre sesiones
Al cerrar sesión, el agente añade un handoff en `docs/ai-handoffs/AAAA-MM-DD-<agente>.md` con:
tareas realizadas · archivos modificados · decisiones tomadas · pruebas ejecutadas y resultados reales · errores pendientes · dependencias o bloqueos · identificador del commit · próximos pasos.
Y actualiza `docs/estado-actual.md`.

## 8. Qué hacer ante una contradicción
No inventar. Registrar la contradicción en `docs/decisiones.md` como pregunta abierta, elegir la opción más conservadora, marcarla como **supuesto** y pedir confirmación humana.
