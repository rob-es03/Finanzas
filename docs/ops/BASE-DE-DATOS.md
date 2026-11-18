# A qué base apunta cada agente

Decisión: **D-018** · 2026-11-17

## La base compartida es el proyecto en la nube

```
ujalaluhmtwevqhnzivo  ·  https://ujalaluhmtwevqhnzivo.supabase.co  ·  us-east-2  ·  PostgreSQL 17.12
```

Todo agente que ejecute la aplicación apunta ahí, salvo que una tarea diga lo contrario por escrito.

## Por qué, y no al revés

Durante la sesión del 2026-11-17 convivieron dos bases: el proyecto en la nube y un stack local en `127.0.0.1:54321`, levantado por otro agente, que reescribió `environment.ts` en la carpeta principal. El resultado fue que el primer intento de login devolvió `Unsupported provider: provider is not enabled`: la aplicación hablaba con una base donde Google no estaba configurado. Dos agentes probando contra bases distintas no pueden contrastar nada.

Tres razones concretas para fijar la nube:

1. **Es donde están aplicadas y verificadas las migraciones**: 10 tablas, RLS en todas, 40 políticas, y el asesor de seguridad sin hallazgos.
2. **Es la única donde funciona el login con Google.** La URI de redirección registrada en Google Cloud apunta a `https://ujalaluhmtwevqhnzivo.supabase.co/auth/v1/callback`. Un stack local necesitaría su propio cliente OAuth y su propio secreto.
3. **El stack local no es reproducible.** No hay `supabase/config.toml` versionado, así que nadie más puede levantar el mismo entorno; y corre **PostgreSQL 16.5** frente al **17.12** de la nube. Probar sobre una versión distinta de la que va a ejecutar el código es arrastrar una diferencia silenciosa.

## Qué hacer en cada worktree

```bash
cp apps/mobile/src/environments/environment.example.ts apps/mobile/src/environments/environment.ts
```

y rellenar la anon key desde el panel de Supabase (*Settings → API*). El archivo está en `.gitignore`: no se versiona y cada worktree tiene el suyo.

Comprobación rápida antes de dar por buena una prueba:

```bash
grep supabaseUrl apps/mobile/src/environments/environment.ts
```

Si aparece `127.0.0.1` o `localhost`, no estás probando contra la base compartida y el resultado no es comparable con el de los demás.

## Puertos del servidor de desarrollo

Las URLs de redirección permitidas en Supabase Auth son:

```
http://localhost:4200/auth/callback   ·   http://localhost:4200/**
http://localhost:4300/auth/callback   ·   http://localhost:4300/**
ec.finanzas.app://auth/callback
```

Dos puertos web, para que dos agentes puedan servir la aplicación a la vez sin pisarse. Si hace falta un tercero, hay que añadirlo a `uri_allow_list`, o el login fallará al volver de Google.

## Si más adelante se quiere desarrollo local

Es una decisión legítima, pero entonces hay que hacerla completa, no a medias:

1. Versionar `supabase/config.toml` con la versión de PostgreSQL **igual a la de la nube**.
2. Aplicar las tres migraciones del repositorio al stack local.
3. Registrar un cliente OAuth propio para `http://localhost:54321/auth/v1/callback` y configurar el proveedor en el `config.toml` local, con los secretos fuera del repositorio.
4. Dejar escrito en `AGENTS.md` cuál es la base de referencia y cuál la de trabajo.

Hasta que eso esté hecho y acordado, la base compartida es la de la nube.

## Producción

Hoy no existe un entorno de producción separado: el proyecto de la nube hace de base de desarrollo compartida. Cuando haya usuarios reales habrá que separar los entornos antes, no después.

## Estado al cerrar la unificación · 2026-11-17

| Worktree | Apunta a |
|---|---|
| `finanzas-claude` | base compartida ✅ |
| `FINANZAS` (Antigravity) | `http://127.0.0.1:54321` ❌ **pendiente de cambiar** |
| `finanzas-codex` | sin `environment.ts` todavía |
| `finanzas-codex-resend` | sin `environment.ts` todavía |

No reescribí el `environment.ts` de `FINANZAS`: es la copia de trabajo de otro agente que está desarrollando ahora mismo, y cambiarle la configuración bajo los pies es exactamente el vaivén que esta decisión busca terminar. El cambio lo hace Antigravity, o el responsable humano, copiando `environment.example.ts` y rellenando la anon key.

Para comprobarlo en cualquier worktree:

```bash
npm --prefix apps/mobile run check:env
```
