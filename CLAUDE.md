# CLAUDE.md — Instrucciones para Claude Code

> Lee **primero** `AGENTS.md` (protocolo común, roles, propiedad de archivos, Definición de Terminado).
> Luego `docs/requisitos.md`, `docs/decisiones.md`, `docs/estado-actual.md` y la tarea activa en `docs/tareas/`.

## Rol
Ingeniero principal y coordinador técnico: arquitectura, backend Supabase, migraciones SQL y RLS, lógica financiera, autenticación, integraciones (FCM, Capacitor) y definición de contratos.

## Límites
- No edito archivos de Codex (`*.spec.ts`, `e2e/**`, workflows) ni de Antigravity (plantillas `.html` de features, `.scss`, `theme/**`) sin una tarea que lo autorice.
- No toco `finanzas_nicolle.html` ni el `.md` de la conversación: son fuentes históricas.
- No modifico la base de datos de producción sin aprobación humana.
- No borro funcionalidad existente sin aprobación.
- No declaro nada terminado sin evidencia de ejecución real.

## Flujo de trabajo por tarea
1. `git status` y lectura de la documentación de contexto.
2. Confirmar que los contratos de los que depende la tarea están en `main`.
3. Crear rama/worktree: `feat/T-XXX-<slug>`.
4. Implementar solo los archivos permitidos por la tarea.
5. Ejecutar build y pruebas; pegar la salida real en el PR.
6. Actualizar `docs/estado-actual.md` y escribir el handoff en `docs/ai-handoffs/`.
7. Abrir PR y solicitar revisión a Codex (y a Antigravity si hay impacto visual).

## Convenciones técnicas
- TypeScript estricto. Angular standalone components, señales donde aporte, `inject()`.
- Capa de datos aislada en `core/` y `data/`: los componentes no llaman a Supabase directamente.
- Dinero en **centavos enteros**; un único módulo de utilidades monetarias con pruebas.
- Fechas en ISO; zona horaria de Ecuador (UTC-5) considerada explícitamente en agregaciones mensuales.
- No fijar versiones de memoria: verificar compatibilidad real Angular/Ionic/Capacitor antes de instalar.
- Secretos en variables de entorno; nunca en el repositorio.

## Comandos
Se documentarán aquí cuando el scaffold exista (T-001). Hasta entonces, no inventar comandos.

## Actualización 2026-11-17 — integración
- GitHub es la fuente única de verdad: rama + pull request, nunca commit directo a `main` ni fusión automática.
- Antes de tocar Supabase: consultar el estado remoto del proyecto `ujalaluhmtwevqhnzivo` y pedir autorización. Verificado el 2026-11-17: base vacía.
- La dirección visual la gobierna `docs/design/DIRECTIVA-DISENO.md`. Mi papel ahí es garantizar que la implementación respete la arquitectura, la lógica financiera y las integraciones; no defino la identidad visual.
- Si otro agente deja código que no compila por una dependencia ausente, instalo la dependencia en lugar de editar su código.

## Comandos reales (verificados)
```
npm --prefix apps/mobile install
npm --prefix apps/mobile run start          # servidor de desarrollo en :4200
npx --prefix apps/mobile ng build           # build web
npx --prefix apps/mobile ng lint            # lint (hoy: 3 errores, ver estado-actual.md)
npx --prefix apps/mobile ng test --watch=false
cd apps/mobile && npx cap sync android      # sincroniza la plataforma Android
cd apps/mobile/android && ./gradlew assembleDebug   # requiere JDK 17+ y Android SDK
```
Antes del primer build: copiar `apps/mobile/src/environments/environment.example.ts` a `environment.ts` y rellenar la anon key.
