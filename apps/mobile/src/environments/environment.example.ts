/**
 * Plantilla de configuración de entorno.
 * Solo claves PÚBLICAS (anon key de Supabase). La `service_role` key NUNCA entra al cliente.
 *
 * Proyecto Supabase: ujalaluhmtwevqhnzivo
 */
export const environment = {
  production: false,
  supabaseUrl: 'https://ujalaluhmtwevqhnzivo.supabase.co',
  supabaseAnonKey: 'REEMPLAZAR_CON_SUPABASE_ANON_KEY',
  oauth: {
    webRedirectUri: 'http://localhost:4200/auth/callback',
    androidRedirectUri: 'ec.finanzas.app://auth/callback',
  },
};
