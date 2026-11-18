-- ==============================================================================
-- Migración: 20261118010000_revoke_trigger_function_execute.sql
-- Propósito: cerrar el hallazgo del asesor de seguridad de Supabase
--            (anon_security_definer_function_executable).
--
-- `handle_new_user()` es SECURITY DEFINER y, por el GRANT EXECUTE que PostgreSQL
-- concede a PUBLIC por defecto, quedaba invocable desde la API REST por los roles
-- `anon` y `authenticated`. Es una función de trigger: llamarla directamente
-- falla, pero una función SECURITY DEFINER alcanzable desde internet no debe
-- existir. Se revoca el permiso y se concede solo a los roles que la necesitan.
-- ==============================================================================

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin, service_role;

REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_updated_at() TO service_role;

-- `installment_status()` sí es de uso legítimo desde el cliente: es una función
-- pura, sin SECURITY DEFINER, que solo transforma dos enteros.
GRANT EXECUTE ON FUNCTION public.installment_status(BIGINT, BIGINT) TO anon, authenticated;
