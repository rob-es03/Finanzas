-- ==============================================================================
-- Migración: 20261118000000_core_finance_model.sql
-- Propósito:
--   1. Corregir los hallazgos H-1 a H-8 de
--      docs/auditorias/2026-11-17-revision-migracion-T-031.md
--   2. Completar el modelo financiero: movimientos, transferencias, deudas,
--      cuotas, presupuestos, recordatorios e importaciones.
--
-- Reglas respetadas (AGENTS.md, sección 6):
--   - Todo importe es BIGINT en CENTAVOS. Ninguna columna de dinero en coma flotante.
--   - RLS activada en toda tabla de datos, con políticas sobre auth.uid().
--   - Integridad entre usuarios por claves foráneas compuestas (user_id, id):
--     una fila no puede apuntar a la cuenta o categoría de otro usuario.
--   - Idempotente: puede ejecutarse varias veces sin error ni duplicados.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 0. Utilidades
-- ------------------------------------------------------------------------------

-- H-5: updated_at nunca se refrescaba. De este dato dependerá la resolución de
-- conflictos de la sincronización offline (R-27), así que debe ser veraz.
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $fn$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$fn$;

-- ------------------------------------------------------------------------------
-- 1. Correcciones sobre las tablas ya definidas
-- ------------------------------------------------------------------------------

-- H-6: sin unicidad se podían duplicar cuentas y categorías.
CREATE UNIQUE INDEX IF NOT EXISTS uq_accounts_user_name
    ON public.accounts (user_id, lower(name));
CREATE UNIQUE INDEX IF NOT EXISTS uq_categories_user_name_type
    ON public.categories (user_id, lower(name), type);

-- Claves candidatas necesarias para las foráneas compuestas de más abajo.
-- Han de ser CONSTRAINT, no solo índice único: PostgreSQL exige una restricción
-- unique o primary key no diferible para poder referenciarla desde una foránea.
DO $do$
BEGIN
    ALTER TABLE public.accounts ADD CONSTRAINT uq_accounts_user_id_id UNIQUE (user_id, id);
EXCEPTION WHEN duplicate_table OR duplicate_object THEN NULL;
END
$do$;

DO $do$
BEGIN
    ALTER TABLE public.categories ADD CONSTRAINT uq_categories_user_id_id UNIQUE (user_id, id);
EXCEPTION WHEN duplicate_table OR duplicate_object THEN NULL;
END
$do$;

-- H-8: currency admitía cualquier cadena de cinco caracteres.
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_currency_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_currency_check
    CHECK (currency IN ('USD', 'EUR', 'COP', 'PEN', 'MXN', 'ARS', 'CLP', 'BRL'));

-- Las agregaciones mensuales dependen de la zona horaria del usuario y no había
-- dónde guardarla. Ecuador es UTC-5.
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'America/Guayaquil';

-- ------------------------------------------------------------------------------
-- 2. Movimientos
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id UUID NOT NULL,
    category_id UUID,
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    -- Importe SIEMPRE positivo: el signo lo determina `type`. Evita el doble
    -- criterio de signo que volvía ambiguo el prototipo.
    amount_cents BIGINT NOT NULL CHECK (amount_cents > 0),
    occurred_on DATE NOT NULL,
    description TEXT NOT NULL CHECK (length(trim(description)) > 0),
    note TEXT,
    -- Idempotencia de importación y de registros repetidos (R-25).
    external_key TEXT,
    import_batch_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    CONSTRAINT fk_transactions_account
        FOREIGN KEY (user_id, account_id)
        REFERENCES public.accounts (user_id, id) ON DELETE RESTRICT,
    -- SET NULL se limita a category_id: en una foránea compuesta, un SET NULL sin
    -- lista anularía también user_id, que es NOT NULL, y haría fallar el borrado
    -- de cualquier categoría. Requiere PostgreSQL 15+ (el proyecto corre 17).
    CONSTRAINT fk_transactions_category
        FOREIGN KEY (user_id, category_id)
        REFERENCES public.categories (user_id, id) ON DELETE SET NULL (category_id)
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_date
    ON public.transactions (user_id, occurred_on DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_account
    ON public.transactions (account_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_transactions_external_key
    ON public.transactions (user_id, external_key)
    WHERE external_key IS NOT NULL;

-- ------------------------------------------------------------------------------
-- 3. Transferencias entre cuentas propias
--    Tabla aparte a propósito: una transferencia no es ingreso ni gasto y no debe
--    distorsionar el flujo del mes (UX_DECISIONS.md, «Magnitudes financieras»).
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    from_account_id UUID NOT NULL,
    to_account_id UUID NOT NULL,
    amount_cents BIGINT NOT NULL CHECK (amount_cents > 0),
    occurred_on DATE NOT NULL,
    description TEXT,
    external_key TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    CONSTRAINT chk_transfers_distinct_accounts CHECK (from_account_id <> to_account_id),
    CONSTRAINT fk_transfers_from_account
        FOREIGN KEY (user_id, from_account_id)
        REFERENCES public.accounts (user_id, id) ON DELETE RESTRICT,
    CONSTRAINT fk_transfers_to_account
        FOREIGN KEY (user_id, to_account_id)
        REFERENCES public.accounts (user_id, id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_transfers_user_date
    ON public.transfers (user_id, occurred_on DESC);
CREATE UNIQUE INDEX IF NOT EXISTS uq_transfers_external_key
    ON public.transfers (user_id, external_key)
    WHERE external_key IS NOT NULL;

-- ------------------------------------------------------------------------------
-- 4. Deudas y cuotas (defecto D-07: dejan de ser categorías de gasto)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.debts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    creditor TEXT NOT NULL CHECK (length(trim(creditor)) > 0),
    principal_cents BIGINT NOT NULL CHECK (principal_cents >= 0),
    -- Tasa anual en puntos básicos: entero, para no introducir coma flotante.
    annual_rate_bp INTEGER CHECK (annual_rate_bp IS NULL OR annual_rate_bp >= 0),
    status VARCHAR(12) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'paid', 'cancelled')),
    opened_on DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_debts_user ON public.debts (user_id, status);

DO $do$
BEGIN
    ALTER TABLE public.debts ADD CONSTRAINT uq_debts_user_id_id UNIQUE (user_id, id);
EXCEPTION WHEN duplicate_table OR duplicate_object THEN NULL;
END
$do$;

CREATE TABLE IF NOT EXISTS public.debt_installments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    debt_id UUID NOT NULL,
    number INTEGER NOT NULL CHECK (number > 0),
    due_on DATE NOT NULL,
    amount_cents BIGINT NOT NULL CHECK (amount_cents > 0),
    paid_cents BIGINT NOT NULL DEFAULT 0 CHECK (paid_cents >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    CONSTRAINT chk_installment_not_overpaid CHECK (paid_cents <= amount_cents),
    CONSTRAINT fk_installments_debt
        FOREIGN KEY (user_id, debt_id)
        REFERENCES public.debts (user_id, id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_installments_debt_number
    ON public.debt_installments (debt_id, number);
CREATE INDEX IF NOT EXISTS idx_installments_due
    ON public.debt_installments (user_id, due_on);

-- Estado derivado, no almacenado: un estado guardado se desincroniza del importe
-- realmente pagado.
CREATE OR REPLACE FUNCTION public.installment_status(p_amount_cents BIGINT, p_paid_cents BIGINT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
SET search_path = public, pg_temp
AS $fn$
    SELECT CASE
        WHEN p_paid_cents <= 0 THEN 'pending'
        WHEN p_paid_cents >= p_amount_cents THEN 'paid'
        ELSE 'partial'
    END;
$fn$;

-- ------------------------------------------------------------------------------
-- 5. Presupuestos
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL,
    -- Primer día del mes presupuestado.
    period_month DATE NOT NULL,
    limit_cents BIGINT NOT NULL CHECK (limit_cents > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    CONSTRAINT chk_budget_period_is_first_day
        CHECK (period_month = date_trunc('month', period_month)::date),
    CONSTRAINT fk_budgets_category
        FOREIGN KEY (user_id, category_id)
        REFERENCES public.categories (user_id, id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_budgets_user_category_period
    ON public.budgets (user_id, category_id, period_month);

-- ------------------------------------------------------------------------------
-- 6. Recordatorios
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (length(trim(title)) > 0),
    kind VARCHAR(12) NOT NULL CHECK (kind IN ('payment', 'record', 'budget')),
    due_on DATE NOT NULL,
    due_time TIME,
    amount_cents BIGINT CHECK (amount_cents IS NULL OR amount_cents > 0),
    debt_installment_id UUID REFERENCES public.debt_installments(id) ON DELETE CASCADE,
    status VARCHAR(12) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'sent', 'done', 'cancelled')),
    notified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_reminders_due
    ON public.reminders (user_id, status, due_on);

-- ------------------------------------------------------------------------------
-- 7. Importaciones idempotentes (R-26)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.import_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    source VARCHAR(20) NOT NULL CHECK (source IN ('csv', 'localstorage', 'manual')),
    idempotency_key TEXT NOT NULL,
    row_count INTEGER NOT NULL DEFAULT 0 CHECK (row_count >= 0),
    status VARCHAR(12) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'applied', 'failed')),
    error_detail TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_import_batches_key
    ON public.import_batches (user_id, idempotency_key);

ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS fk_transactions_import_batch;
ALTER TABLE public.transactions ADD CONSTRAINT fk_transactions_import_batch
    FOREIGN KEY (import_batch_id) REFERENCES public.import_batches(id) ON DELETE SET NULL;

-- ------------------------------------------------------------------------------
-- 8. RLS y políticas, de forma idempotente (H-2)
--    CREATE POLICY no admite IF NOT EXISTS: se elimina antes de crear.
-- ------------------------------------------------------------------------------

DO $do$
DECLARE
    t TEXT;
    tablas TEXT[] := ARRAY[
        'accounts', 'categories', 'transactions', 'transfers',
        'debts', 'debt_installments', 'budgets', 'reminders', 'import_batches'
    ];
BEGIN
    FOREACH t IN ARRAY tablas LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);

        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_select_own', t);
        EXECUTE format(
            'CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (auth.uid() = user_id)',
            t || '_select_own', t);

        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_insert_own', t);
        EXECUTE format(
            'CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)',
            t || '_insert_own', t);

        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_update_own', t);
        EXECUTE format(
            'CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)',
            t || '_update_own', t);

        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_delete_own', t);
        EXECUTE format(
            'CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (auth.uid() = user_id)',
            t || '_delete_own', t);
    END LOOP;
END
$do$;

-- profiles se trata aparte: su clave de aislamiento es `id`, no `user_id`.
-- H-7: la política de borrado faltaba; queda declarada explícitamente.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_own ON public.profiles
    FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
CREATE POLICY profiles_insert_own ON public.profiles
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS profiles_delete_own ON public.profiles;
CREATE POLICY profiles_delete_own ON public.profiles
    FOR DELETE TO authenticated USING (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- 9. Triggers de updated_at (H-5)
-- ------------------------------------------------------------------------------

DO $do$
DECLARE
    t TEXT;
    tablas TEXT[] := ARRAY[
        'profiles', 'accounts', 'transactions', 'transfers',
        'debts', 'debt_installments', 'budgets', 'reminders', 'import_batches'
    ];
BEGIN
    FOREACH t IN ARRAY tablas LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I', 'set_updated_at_' || t, t);
        EXECUTE format(
            'CREATE TRIGGER %I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()',
            'set_updated_at_' || t, t);
    END LOOP;
END
$do$;

-- ------------------------------------------------------------------------------
-- 10. Saldo por cuenta, calculado en la base
--     La arquitectura exige que web y Android obtengan el mismo número.
--     security_invoker = true hace que la vista respete la RLS de quien consulta.
-- ------------------------------------------------------------------------------

CREATE OR REPLACE VIEW public.account_balances
WITH (security_invoker = true) AS
SELECT
    a.id AS account_id,
    a.user_id,
    a.name,
    a.type,
    a.initial_balance_cents,
    a.initial_balance_cents
        + COALESCE(mov.income_cents, 0)
        - COALESCE(mov.expense_cents, 0)
        + COALESCE(tin.in_cents, 0)
        - COALESCE(tout.out_cents, 0) AS balance_cents
FROM public.accounts a
LEFT JOIN (
    SELECT account_id,
           COALESCE(SUM(amount_cents) FILTER (WHERE type = 'income'), 0)  AS income_cents,
           COALESCE(SUM(amount_cents) FILTER (WHERE type = 'expense'), 0) AS expense_cents
    FROM public.transactions
    GROUP BY account_id
) mov ON mov.account_id = a.id
LEFT JOIN (
    SELECT to_account_id AS account_id, SUM(amount_cents) AS in_cents
    FROM public.transfers
    GROUP BY to_account_id
) tin ON tin.account_id = a.id
LEFT JOIN (
    SELECT from_account_id AS account_id, SUM(amount_cents) AS out_cents
    FROM public.transfers
    GROUP BY from_account_id
) tout ON tout.account_id = a.id;

-- ------------------------------------------------------------------------------
-- 11. Siembra inicial corregida
--     H-1: las categorías por defecto eran los acreedores reales de una persona
--          concreta (Diners, Produbanco, Deprati). Se sustituyen por genéricas.
--     H-3: un fallo al sembrar ya no impide registrarse.
--     H-4: ON CONFLICT ya no sobrescribe con cadena vacía un nombre personalizado.
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $fn$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, currency, onboarding_completed)
    VALUES (
        NEW.id,
        COALESCE(NEW.email, ''),
        NULLIF(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''), ''),
        NULLIF(COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''), ''),
        'USD',
        FALSE
    )
    ON CONFLICT (id) DO UPDATE SET
        -- Nunca degradar a vacío un dato que el usuario ya personalizó.
        full_name  = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.profiles.full_name),
        avatar_url = COALESCE(NULLIF(EXCLUDED.avatar_url, ''), public.profiles.avatar_url),
        updated_at = timezone('utc'::text, now());

    BEGIN
        INSERT INTO public.categories (user_id, name, type, icon, color, is_default) VALUES
            (NEW.id, 'Sueldo',           'income',  'cash-outline',        '#176345', true),
            (NEW.id, 'Otros ingresos',   'income',  'wallet-outline',      '#1F7A58', true),
            (NEW.id, 'Vivienda',         'expense', 'home-outline',        '#9C343B', true),
            (NEW.id, 'Alimentación',     'expense', 'basket-outline',      '#A8454C', true),
            (NEW.id, 'Transporte',       'expense', 'bus-outline',         '#B4565D', true),
            (NEW.id, 'Salud',            'expense', 'medkit-outline',      '#775216', true),
            (NEW.id, 'Deudas y cuotas',  'expense', 'card-outline',        '#8A2F36', true),
            (NEW.id, 'Otros gastos',     'expense', 'ellipsis-horizontal', '#53605A', true)
        ON CONFLICT DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
        -- La siembra es una comodidad, no un requisito del alta: si falla, el
        -- usuario debe poder entrar igualmente y crear sus propias categorías.
        RAISE WARNING 'handle_new_user: fallo al sembrar categorias para %: %', NEW.id, SQLERRM;
    END;

    RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
