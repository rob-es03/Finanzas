-- ==============================================================================
-- Migración: 20261117180000_auth_profiles_and_accounts.sql
-- Propósito: Esquema de autenticación, perfiles de usuario, cuentas y categorías
-- Cumplimiento:
--  - RLS activada en toda tabla con aislamiento estricto por auth.uid()
--  - Dinero siempre en centavos enteros (BIGINT)
--  - Creación idempotente de perfil y categorías por defecto vía trigger
-- ==============================================================================

-- 1. Tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    currency VARCHAR(5) NOT NULL DEFAULT 'USD',
    onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 2. Tabla de cuentas financieras (saldos iniciales en centavos)
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('bank', 'cash', 'credit_card', 'savings')),
    initial_balance_cents BIGINT NOT NULL DEFAULT 0,
    color VARCHAR(20),
    icon VARCHAR(30),
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON public.accounts(user_id);

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "accounts_select_own"
    ON public.accounts FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "accounts_insert_own"
    ON public.accounts FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "accounts_update_own"
    ON public.accounts FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "accounts_delete_own"
    ON public.accounts FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 3. Tabla de categorías (ingresos y gastos)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    icon VARCHAR(30),
    color VARCHAR(20),
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_select_own"
    ON public.categories FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "categories_insert_own"
    ON public.categories FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "categories_update_own"
    ON public.categories FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "categories_delete_own"
    ON public.categories FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 4. Función y trigger para siembra automática e idempotente tras registro OAuth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- 1. Crear perfil si no existe aún
    INSERT INTO public.profiles (id, email, full_name, avatar_url, currency, onboarding_completed)
    VALUES (
        NEW.id,
        COALESCE(NEW.email, ''),
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
        'USD',
        FALSE
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        avatar_url = EXCLUDED.avatar_url,
        updated_at = timezone('utc'::text, now());

    -- 2. Sembrar categorías iniciales inspiradas en el prototipo si no existen
    IF NOT EXISTS (SELECT 1 FROM public.categories WHERE user_id = NEW.id) THEN
        -- Ingresos por defecto
        INSERT INTO public.categories (user_id, name, type, icon, color, is_default) VALUES
            (NEW.id, 'Sueldo Quincenal', 'income', 'cash-outline', '#10b981', true),
            (NEW.id, 'Bono / Utilidades', 'income', 'trending-up-outline', '#059669', true),
            (NEW.id, 'Ventas / Extra', 'income', 'sparkles-outline', '#34d399', true),
            (NEW.id, 'Reembolso', 'income', 'receipt-outline', '#6ee7b7', true),
            (NEW.id, 'Otros Ingresos', 'income', 'wallet-outline', '#a7f3d0', true);

        -- Gastos por defecto
        INSERT INTO public.categories (user_id, name, type, icon, color, is_default) VALUES
            (NEW.id, 'Arriendo y Servicios', 'expense', 'home-outline', '#ef4444', true),
            (NEW.id, 'Alimentación y Transporte', 'expense', 'fast-food-outline', '#f97316', true),
            (NEW.id, 'Pago Tarjeta Diners', 'expense', 'card-outline', '#dc2626', true),
            (NEW.id, 'Cuota Produbanco', 'expense', 'business-outline', '#b91c1c', true),
            (NEW.id, 'Deprati / Otros Créditos', 'expense', 'pricetags-outline', '#e11d48', true),
            (NEW.id, 'Salud / Personal', 'expense', 'medkit-outline', '#be123c', true),
            (NEW.id, 'Otros Gastos', 'expense', 'cart-outline', '#991b1b', true);
    END IF;

    RETURN NEW;
END;
$$;

-- Vincular trigger a auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
