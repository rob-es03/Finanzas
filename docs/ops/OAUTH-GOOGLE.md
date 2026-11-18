# Configurar Google Sign-In (T-003)

Proyecto Supabase: `ujalaluhmtwevqhnzivo` · `https://ujalaluhmtwevqhnzivo.supabase.co`

## Estado

| Paso | Estado |
|---|---|
| URLs de redirección en Supabase Auth | ✅ configuradas |
| `environment.ts` local con la anon key | ✅ escrito (no versionado) |
| Deep link Android en el manifiesto | ✅ presente |
| Código de login, callback y guards | ✅ escrito, sin verificar |
| **Cliente OAuth en Google Cloud** | ❌ **lo tienes que crear tú** |
| **Proveedor Google activado en Supabase** | ❌ requiere el client ID y el secret |
| Prueba real del flujo | ❌ pendiente |

Lo ya configurado por API:
- `site_url` = `http://localhost:4200`
- `uri_allow_list` = `http://localhost:4200/auth/callback`, `http://localhost:4200/**`, `ec.finanzas.app://auth/callback`

## Un matiz que ahorra trabajo

La implementación usa `supabase.auth.signInWithOAuth()` y abre el navegador del sistema con Capacitor Browser, no el SDK nativo de Google. En ese flujo **quien habla con Google es Supabase, no la app**. Consecuencia práctica:

- Basta con **un cliente OAuth de tipo «Aplicación web»**. Sirve para web y para Android.
- **No hace falta un cliente de tipo Android ni la huella SHA-1 del keystore.** Solo serían necesarios si más adelante se cambia al SDK nativo de Google Sign-In, que muestra el selector de cuentas del sistema en vez del navegador.

Esa decisión conviene tomarla a conciencia: el flujo por navegador es más simple y funciona hoy; el nativo da mejor experiencia en Android (sin salir de la app, con las cuentas ya presentes en el dispositivo). Si se cambia, habrá que rehacer esta configuración y añadir el cliente Android con la SHA-1 de cada keystore, el de depuración y el de publicación.

## Paso 1 · Crear el cliente OAuth (en tu cuenta de Google)

1. Entra en <https://console.cloud.google.com/> y crea un proyecto, o elige uno existente.
2. **APIs y servicios → Pantalla de consentimiento de OAuth**: tipo **Externo**; rellena nombre de la aplicación, correo de asistencia y correo de contacto. Ámbitos: bastan `openid`, `email` y `profile`, que son los que pide el código. Mientras esté en modo de prueba, añade tu propia cuenta como usuario de prueba.
3. **APIs y servicios → Credenciales → Crear credenciales → ID de cliente de OAuth**.
4. Tipo de aplicación: **Aplicación web**.
5. En **URI de redirección autorizados**, añade exactamente:

```
https://ujalaluhmtwevqhnzivo.supabase.co/auth/v1/callback
```

Esa es la única URI que Google necesita: Supabase recibe la respuesta de Google y después redirige a la aplicación.

6. Guarda y copia el **Client ID** y el **Client secret**.

## Paso 2 · Activar el proveedor en Supabase

En el panel de Supabase, **Authentication → Sign In / Providers → Google**: actívalo y pega ahí el Client ID y el Client secret.

Hazlo tú en el panel. El secret es una credencial: no lo pegues en el chat ni en ningún archivo del repositorio, que además ahora es público.

## Paso 3 · Probar en web

```bash
npm --prefix apps/mobile run start
```

Abre <http://localhost:4200>, entra por `auth/welcome` → `auth/login` y pulsa «Continuar con Google». Debe volver a `auth/callback`, intercambiar el código por sesión y, si el perfil está sin configurar, llevar a `auth/onboarding`.

Qué comprobar después, en el panel de Supabase:
- Hay una fila nueva en `auth.users`.
- Hay su fila en `public.profiles`, con el nombre y el avatar de Google.
- Tiene **8 categorías** sembradas en `public.categories`, las genéricas. Si aparecieran `Diners`, `Produbanco` o `Deprati`, algo reaplicó la migración antigua.
- Al cerrar sesión y volver a entrar **no se duplica nada**: la siembra es idempotente.

## Paso 4 · Probar en Android

Requiere antes lo que hoy falta en la máquina: **JDK 17 o superior** y el **SDK de Android**. Con Java 1.8 el build de Gradle ni siquiera arranca.

```bash
npm --prefix apps/mobile run build
cd apps/mobile && npx cap sync android && npx cap open android
```

El deep link ya está declarado en `AndroidManifest.xml`:

```xml
<data android:scheme="ec.finanzas.app" android:host="auth" android:pathPrefix="/callback" />
```

Comprobaciones propias de Android:
- Al volver de Google, la app recupera el foco por el deep link y no abre una pestaña huérfana.
- La sesión sobrevive a cerrar y reabrir la aplicación (se guarda con Capacitor Preferences, no en `localStorage`).
- Al cerrar sesión se limpian sesión, caché y el token de FCM.

## Para producción

Cuando exista un dominio real:
1. Añadir su URL a `uri_allow_list` y actualizar `site_url`.
2. Añadir su URI de redirección en Google Cloud.
3. Publicar la pantalla de consentimiento (salir del modo de prueba).
4. Revisar `jwt_exp`, hoy en 3600 s.

## Definición de terminado de T-003

No basta con que compile. Hace falta: flujo completo verificado en web **y** en un Android real o emulado, perfil creado y recuperado sin duplicados, sesión persistente tras reiniciar, rutas protegidas inaccesibles sin sesión, cierre de sesión que limpia todo, y ningún secreto en el cliente. Con evidencia adjunta.
