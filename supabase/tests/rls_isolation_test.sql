-- ==============================================================================
-- Script de Prueba y Verificación: RLS y Aislamiento Multiusuario
-- Proyecto: Finanzas Personales
-- Propósito: Demostrar que las políticas RLS aíslan estrictamente los datos
--            entre dos usuarios distintos (auth.uid() = user_id)
-- ==============================================================================

BEGIN;

-- 1. Crear dos usuarios sintéticos en auth.users
INSERT INTO auth.users (id, email, raw_user_meta_data)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'usuario_a@ejemplo.com', '{"name": "Usuario A", "full_name": "Usuario A"}'::jsonb),
    ('22222222-2222-2222-2222-222222222222', 'usuario_b@ejemplo.com', '{"name": "Usuario B", "full_name": "Usuario B"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 2. Probar como Usuario A
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" = '11111111-1111-1111-1111-111111111111';

-- Usuario A inserta una cuenta propia (saldo en centavos: $500.00 = 50000)
INSERT INTO public.accounts (user_id, name, type, initial_balance_cents)
VALUES ('11111111-1111-1111-1111-111111111111', 'Cuenta Bolivariano A', 'bank', 50000);

-- Verificar que Usuario A puede leer su cuenta
DO $$
DECLARE
    cnt INT;
BEGIN
    SELECT count(*) INTO cnt FROM public.accounts WHERE user_id = '11111111-1111-1111-1111-111111111111';
    IF cnt <> 1 THEN
        RAISE EXCEPTION 'Fallo: Usuario A no pudo leer su propia cuenta';
    END IF;
END $$;

-- 3. Cambiar contexto a Usuario B
SET LOCAL "request.jwt.claim.sub" = '22222222-2222-2222-2222-222222222222';

-- Verificar que Usuario B ve 0 cuentas de Usuario A (Aislamiento RLS en SELECT)
DO $$
DECLARE
    cnt INT;
BEGIN
    SELECT count(*) INTO cnt FROM public.accounts WHERE user_id = '11111111-1111-1111-1111-111111111111';
    IF cnt <> 0 THEN
        RAISE EXCEPTION 'Violación de RLS: Usuario B pudo leer cuentas de Usuario A!';
    END IF;
END $$;

-- Verificar que Usuario B NO puede modificar las cuentas de Usuario A
UPDATE public.accounts SET initial_balance_cents = 0 WHERE user_id = '11111111-1111-1111-1111-111111111111';
-- Ninguna fila debe ser afectada gracias a USING (auth.uid() = user_id)

-- Verificar que Usuario B NO puede insertar filas asignándoselas a Usuario A
DO $$
BEGIN
    BEGIN
        INSERT INTO public.accounts (user_id, name, type, initial_balance_cents)
        VALUES ('11111111-1111-1111-1111-111111111111', 'Ataque Suplantación', 'bank', 99999);
        RAISE EXCEPTION 'Violación de RLS: Se permitió suplantación de user_id ajeno!';
    EXCEPTION WHEN check_violation OR insufficient_privilege THEN
        -- Esperado: RLS WITH CHECK bloquea la inserción
        NULL;
    END;
END $$;

ROLLBACK;
