-- ==============================================================================
-- Verificación del primer inicio de sesión con Google (T-003)
-- Solo lectura: no modifica nada. Ejecutar tras el primer login real.
--
-- Comprueba lo que de verdad decide si T-003 está terminada:
-- que el usuario exista, que su perfil se haya creado, que la siembra sea la
-- genérica y no la del prototipo, y que no haya duplicados tras volver a entrar.
-- ==============================================================================

-- 1. Usuarios dados de alta y por qué proveedor
SELECT
    u.id,
    u.email,
    u.created_at,
    u.last_sign_in_at,
    u.raw_app_meta_data ->> 'provider' AS proveedor
FROM auth.users u
ORDER BY u.created_at;

-- 2. ¿Tiene perfil? Un usuario sin fila aquí significa que el trigger no corrió.
SELECT
    u.email,
    p.id IS NOT NULL AS tiene_perfil,
    p.full_name,
    p.avatar_url IS NOT NULL AS tiene_avatar,
    p.currency,
    p.timezone,
    p.onboarding_completed
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
ORDER BY u.created_at;

-- 3. Siembra de categorías: deben ser 8 y ninguna debe nombrar a un acreedor
--    real del prototipo. Si aparece 'CONTAMINADA', alguien reaplicó la
--    migración antigua y hay que volver a ejecutar 20261118000000.
SELECT
    u.email,
    count(c.id) AS categorias,
    count(c.id) FILTER (WHERE c.type = 'income')  AS ingresos,
    count(c.id) FILTER (WHERE c.type = 'expense') AS gastos,
    CASE
        WHEN bool_or(c.name ILIKE ANY (ARRAY['%Diners%', '%Produbanco%', '%Deprati%']))
            THEN 'CONTAMINADA'
        ELSE 'generica'
    END AS siembra
FROM auth.users u
LEFT JOIN public.categories c ON c.user_id = u.id
GROUP BY u.email
ORDER BY u.email;

-- 4. Idempotencia: ninguna categoría repetida por usuario, tipo y nombre.
--    Cero filas = correcto.
SELECT user_id, lower(name) AS nombre, type, count(*) AS repeticiones
FROM public.categories
GROUP BY user_id, lower(name), type
HAVING count(*) > 1;

-- 5. Saldos: la vista debe responder sin error aunque no haya movimientos.
SELECT user_id, name, initial_balance_cents, balance_cents
FROM public.account_balances
ORDER BY user_id, name;

-- 6. Red de seguridad: ninguna tabla de datos sin RLS. Cero filas = correcto.
SELECT c.relname AS tabla_sin_rls
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r' AND NOT c.relrowsecurity;
