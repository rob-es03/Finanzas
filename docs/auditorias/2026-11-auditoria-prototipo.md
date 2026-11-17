# Auditoría inicial de Finanzas personales

17 de noviembre de 2026 · T-010 · Base local `ad9ee875f4ef45de4cb0cef7741f7818bd4e7dc1`.

**Dictamen de lanzamiento: bloqueado por falta de evidencia sobre la versión candidata.** Revisé la documentación de fase 0, el prototipo histórico y el scaffold Angular local sin seguimiento en Git. La rama de Claude Code y su PR siguen sin identificar. `git remote -v` no devolvió remotos y la búsqueda en GitHub no encontró una coincidencia verificable. Supabase rechazó `list_migrations` con `You do not have permission to perform this action` en ambas conexiones para `ujalaluhmtwevqhnzivo`.

## Hallazgos y correcciones

| Prioridad | Evidencia | Corrección o condición de cierre |
| --- | --- | --- |
| Crítica · credencial expuesta | Se compartió un token de acceso de Supabase en el chat. Su validez y alcance efectivo están sin verificar. | Revocar el token y revisar su actividad. Conectar Supabase mediante OAuth para la revisión. |
| Alta · aislamiento sin verificar | No hay `supabase/migrations` ni `supabase/tests` en la copia local y se denegó la consulta remota. | Revisar migraciones, RLS, permisos, FKs por propietario, vistas y funciones. Validar el aislamiento con dos usuarios sintéticos en Supabase local o en una rama de pruebas. |
| Alta · identidad y Android sin verificar | `apps/mobile/src/app/app.routes.ts` declara `routes = []`. El manifiesto local carece de Ionic, Capacitor y Supabase. | Validar login Google, perfil idempotente, recuperación, renovación, reinicio, cierre de sesión y rutas protegidas en web y Android. Verificar configuración OAuth, firmas de Android y almacenamiento de tokens. |
| Alta · integridad financiera sin verificar | El scaffold solo renderiza la pantalla inicial. `finanzas_nicolle.html:292,335–337,350–354` usa `parseFloat`, agrega `number` y parte de cero. | Verificar centavos enteros de extremo a extremo, incluyendo rango seguro en TypeScript, saldos iniciales, transferencias atómicas, cuotas y presupuestos. |
| Alta · interpolación HTML del prototipo | `finanzas_nicolle.html:299–309,385–395` persiste la descripción y la interpola en `innerHTML`. | Usar interpolación textual de Angular y validar los datos al importar. |
| Alta · dependencias de desarrollo | `npm audit` devolvió código 1 y 12 paquetes de severidad alta en la resolución temporal. La cadena reportada incluye `picomatch`; `--omit=dev` devolvió código 0 y cero hallazgos. | Verificar el lockfile del PR; actualizar las cadenas afectadas y repetir instalación, auditoría, build y pruebas. [GHSA-fc5q-39xc-vjpf](https://github.com/advisories/GHSA-fc5q-39xc-vjpf) |
| Media · integridad de datos históricos | `finanzas_nicolle.html:229–235` parsea sin manejar errores. `:301,315–318` usa milisegundos como ID y elimina todos los registros con ese ID. | Validar la estructura de importación y usar IDs únicos y claves de idempotencia. |
| Media · exportación CSV | `finanzas_nicolle.html:443–455` entrecomilla descripciones sin neutralizar su interpretación como fórmulas por hojas de cálculo. | Validar la exportación con descripciones que comiencen con caracteres de fórmula y con comillas o saltos de línea. |
| Baja · atajos y cuentas fijos | `finanzas_nicolle.html:271–286,350` genera atajos a partir de presets y calcula saldos sobre tres cuentas predefinidas. | Verificar que el producto conserva los atajos y muestra las cuentas configuradas para el usuario. |

El escaneo local por patrones de claves Supabase, secretos Google, claves privadas, credenciales PostgreSQL y JWT devolvió cero coincidencias en archivos fuente y en los dos commits locales. Sigue pendiente revisar referencias remotas, CI, los bundles de la versión candidata y el APK. No se ejecutaron cambios en Supabase.

## Evidencia local

Se instaló el scaffold en un directorio temporal con Node `24.19.0`, npm `11.17.0`, Angular `22.2.6`, Angular CLI `22.2.7` y TypeScript `6.0.3`. El lockfile generado en la copia temporal se usó para esta ejecución; la evidencia corresponde a esa resolución.

| Comando | Resultado |
| --- | --- |
| `npm.cmd run build` | Compiló. Bundle principal `216.97 kB`. |
| `npm.cmd exec -- tsc --noEmit -p tsconfig.app.json` | Código 0. |
| `npm.cmd exec -- tsc --noEmit -p tsconfig.spec.json` | Código 0. |
| `npm.cmd test -- --watch=false` | 1 archivo, 2 pruebas superadas. |
| `npm.cmd audit --json` | Código 1. `high: 12`, `critical: 0`. |
| `npm.cmd audit --omit=dev --json` | Código 0. `total: 0`. |
| `node --test docs/auditorias/prototipo-finanzas.spec.ts` | 2 pruebas superadas. Ejecutan las funciones de registro y resumen del HTML con adaptadores de DOM y almacenamiento en memoria. |

## Pruebas pendientes en la versión candidata

- PostgreSQL con pgTAP y dos usuarios sintéticos. Verificar CRUD sobre filas propias, aislamiento de filas ajenas, referencias del mismo propietario y permisos efectivos de tablas, vistas y funciones.
- Centavos y agregaciones. Afirmar igualdad exacta en sumas y conversiones, límites de rango, saldos iniciales positivos y negativos, corte de mes en la zona acordada y conservación del total al mover fondos entre cuentas.
- Integridad transaccional. Comprobar transferencia completa o revertida, cuotas parciales y completas, reintentos idempotentes, concurrencia de pagos, y presupuesto por categoría y período sin sumar transferencias.
- Auth de extremo a extremo en web y Android. Comprobar cancelación y retorno de OAuth, perfil único, sesión tras reinicio, expiración, renovación, recuperación según proveedor y limpieza de datos al cerrar sesión. [Google Sign-In de Supabase](https://supabase.com/docs/guides/auth/social-sign-in/auth-google), [Intercambio de ID token](https://supabase.com/docs/reference/javascript/auth-signinwithidtoken).
- CI del PR con instalación desde lockfile, build, TypeScript, pruebas unitarias, pgTAP y pruebas de APK. Repetir escaneo de secretos sobre el historial completo y los artefactos de publicación.

## Seguimiento tras reconectar Supabase · 2026-11-17

La conexión **Crecimiento Nic** ya tiene acceso de lectura al proyecto `ujalaluhmtwevqhnzivo`. Este resultado sustituye al error de permisos descrito en la auditoría inicial.

| Verificación | Resultado |
| --- | --- |
| Listado de migraciones | `{"migrations":[]}`. |
| Listado de tablas en `public` | `{"tables":[]}`. |
| Catálogo PostgreSQL (`pg_namespace`, `pg_class` y `pg_proc`) | `public` tiene 0 tablas, 0 vistas y 0 funciones. Los demás esquemas identificados corresponden a componentes de plataforma, entre ellos `auth` y `storage`. |
| Supabase Advisors de seguridad y rendimiento | Ambas consultas devolvieron `lints: []`. El esquema financiero aún no existe en el proyecto consultado, por lo que estas consultas no validan RLS ni integridad financiera. |

Se ejecutaron solo consultas de metadatos. No se leyeron registros de usuarios ni se aplicaron migraciones.

La rama local `feat/T-003-auth-google` apunta al commit `db6802a`, que añade el scaffold Angular, Ionic y Capacitor, la plataforma Android y un cliente Supabase. El commit carece de `supabase/migrations/`. La rama tiene cambios locales en curso y se dejó intacta. La evidencia de compilación de la auditoría inicial corresponde al scaffold anterior. Sigue pendiente identificar el PR de GitHub.

**Bloqueo de lanzamiento actualizado.** El proyecto accesible carece del esquema de finanzas. Para verificar T-002 y T-011 hacen falta las migraciones versionadas y un entorno aislado donde aplicarlas y ejecutar las pruebas de aislamiento y cálculos. La revisión de Google Sign-In y sesiones sigue pendiente.

## Migración T-002 probada localmente · 2026-11-17

Se encontró `20261117180000_auth_profiles_and_accounts.sql` como archivo sin seguimiento en el worktree de `feat/T-003-auth-google`. Ninguna rama tenía la migración en su historial al comenzar la revisión. Se ejecutó una copia exacta con SHA-256 `FAE693222A19E5DE846A62E6C6E7F50C85DD9281D0CB50235923DE7503EC20D7` en PostgreSQL 18.6, PGlite 0.5.16, con datos sintéticos. Se preparó solo el contrato mínimo de Auth y se concedieron privilegios de tabla para comprobar RLS. Los resultados cubren las políticas PostgreSQL y el almacenamiento, con validación de Supabase Auth, PostgREST y permisos efectivos de despliegue todavía pendiente.

`node --test t002-local.spec.mjs` devolvió 10 pruebas superadas, incluidas nueve subpruebas. La migración aplicó desde cero, RLS quedó activa en las tres tablas, los usuarios A y B quedaron aislados en lectura y mutaciones, y el rol anónimo no vio filas. El registro creó un perfil y 12 categorías por usuario. Los saldos iniciales conservaron el signo, el cero predeterminado y la precisión `BIGINT`; PostgreSQL conservó exactamente `9007199254740993` centavos, fuera del rango seguro de JavaScript `number`. Falta validar el transporte de esos importes o aplicar un límite explícito antes de consumirlos en el cliente.

**T-002 parcial.** La migración carece de siembra de cuentas, movimientos, transferencias, deudas, cuotas, presupuestos, recordatorios, lotes de importación y una vista o función para el saldo por cuenta. Se comprobó la suma exacta de saldos iniciales en PostgreSQL. Los cálculos de dominio restantes requieren las migraciones correspondientes. Producción quedó fuera de esta ejecución.

Para reproducir, copiar `supabase/tests/t002-local.spec.mjs` y la migración (como `migration.sql`) a un directorio temporal, instalar `npm install --no-save --ignore-scripts @electric-sql/pglite@0.5.16` y ejecutar `node --test t002-local.spec.mjs`.
