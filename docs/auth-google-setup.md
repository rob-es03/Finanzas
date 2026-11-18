# Guía de Configuración: Google OAuth y Supabase Auth

**Proyecto Supabase**: `ujalaluhmtwevqhnzivo`  
**Paquete Android**: `ec.finanzas.app`  
**Esquema Deep Link**: `ec.finanzas.app://auth/callback`

---

## 1. Configuración en Google Cloud Console

1. Acceder a [Google Cloud Console](https://console.cloud.google.com/) y crear o seleccionar el proyecto.
2. Ir a **APIs y servicios > Pantalla de consentimiento de OAuth**:
   - Tipo de usuario: **Externo**.
   - Nombre de la aplicación: `Finanzas Personales`.
   - Correo de soporte y del desarrollador.
   - **Permisos / Scopes**: Seleccionar únicamente los básicos:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
     - `openid`
3. Ir a **Credenciales > Crear credenciales > ID de cliente de OAuth**:
   - **Cliente 1: Aplicación web** (Utilizado por Supabase Auth):
     - Tipo: Aplicación web.
     - Nombre: `Finanzas Web & Supabase Auth`.
     - Orígenes autorizados de JavaScript:
       - `http://localhost:4200`
       - `https://ujalaluhmtwevqhnzivo.supabase.co`
     - URIs de redireccionamiento autorizados:
       - `https://ujalaluhmtwevqhnzivo.supabase.co/auth/v1/callback`
       - `http://localhost:4200/auth/callback`
     - Guardar el **Client ID** y **Client Secret**.
   - **Cliente 2: Android** (Para compilación y ejecución nativa):
     - Tipo: Android.
     - Nombre: `Finanzas Android Native`.
     - Nombre del paquete: `ec.finanzas.app`.
     - Huella digital de certificado SHA-1:
       ```bash
       keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
       ```

---

## 2. Configuración en el Panel de Supabase (`ujalaluhmtwevqhnzivo`)

1. Ir a [Supabase Dashboard](https://supabase.com/dashboard/project/ujalaluhmtwevqhnzivo).
2. Navegar a **Authentication > Providers > Google**:
   - Activar el interruptor **Enable Google provider**.
   - **Client ID (for OAuth)**: Pegar el Client ID de la aplicación web de Google.
   - **Client Secret**: Pegar el Client Secret de Google.
   - Guardar cambios.
3. Navegar a **Authentication > URL Configuration**:
   - **Site URL**: `http://localhost:4200`
   - **Redirect URLs** (Añadir ambas):
     - `http://localhost:4200/auth/callback` (Para desarrollo y producción web)
     - `ec.finanzas.app://auth/callback` (Para retorno nativo de Capacitor en Android)
4. En **Authentication > Email Templates**:
   - Asegurar que la redirección por defecto apunte a la aplicación.

---

## 3. Variables de Entorno en el Proyecto Móvil

Copiar `apps/mobile/src/environments/environment.example.ts` a `apps/mobile/src/environments/environment.ts` y rellenar con las claves públicas:

```typescript
export const environment = {
  production: false,
  supabaseUrl: 'https://ujalaluhmtwevqhnzivo.supabase.co',
  supabaseAnonKey: 'TU_SUPABASE_ANON_KEY',
  oauth: {
    webRedirectUri: 'http://localhost:4200/auth/callback',
    androidRedirectUri: 'ec.finanzas.app://auth/callback',
  },
};
```
> **Nota de Seguridad**: Nunca colocar la `service_role` key en este archivo ni en el cliente.
