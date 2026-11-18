# T-031 · Revisión de la migración inicial

Revisor: Claude Code · 2026-11-17 · Archivo: `supabase/migrations/20261117180000_auth_profiles_and_accounts.sql`
Estado del remoto al revisar: proyecto `ujalaluhmtwevqhnzivo`, **0 migraciones aplicadas, 0 tablas en `public`**. Nada de esto se ha ejecutado.

## Veredicto
**No aplicar todavía.** La base técnica es correcta —RLS en las tres tablas, 11 políticas bien formadas, dinero en `BIGINT`— pero hay un defecto de privacidad que debe corregirse antes de tocar la base, y un defecto de idempotencia que contradice lo que la propia migración promete en su cabecera.

## Lo que está bien
- RLS habilitada en `profiles`, `accounts` y `categories`, con políticas `TO authenticated` y `auth.uid()` tanto en `USING` como en `WITH CHECK`. El rol `anon` no tiene acceso.
- `initial_balance_cents BIGINT`: ninguna columna de dinero en coma flotante. Cumple D-003.
- `handle_new_user()` es `SECURITY DEFINER` **con `SET search_path = public`**, que es justo la protección que evita el secuestro de la función por un esquema temporal.
- `ON DELETE CASCADE` desde `auth.users` en las tres tablas: al borrar la cuenta no quedan datos huérfanos.
- `CHECK` en `accounts.type` y `categories.type`.
- Índices por `user_id` en `accounts` y `categories`.

## Hallazgos

### H-1 · CRÍTICO (privacidad) · Las categorías por defecto son la vida financiera de una persona real
`handle_new_user()` siembra, para **cada usuario nuevo**, estas categorías de gasto:
`Pago Tarjeta Diners` · `Cuota Produbanco` · `Deprati / Otros Créditos` · `Arriendo y Servicios` · `Sueldo Quincenal`.

No son categorías genéricas: son los acreedores y la estructura de ingresos concretos de la persona del prototipo. Cualquiera que se registre vería el nombre de sus bancos y sus deudas convertidos en el catálogo por defecto de la aplicación. Es un problema de privacidad y además incumple el requisito **D-02** (categorías configurables, no fijas heredadas del prototipo).

**Corrección**: sembrar categorías genéricas (Sueldo, Otros ingresos, Vivienda, Alimentación, Transporte, Salud, Deudas, Otros gastos) y dejar que cada usuario cree las suyas.

### H-2 · ALTO (idempotencia) · La migración no se puede volver a ejecutar
La cabecera declara creación idempotente, pero solo las tablas usan `IF NOT EXISTS`. `CREATE POLICY` **no** admite `IF NOT EXISTS`: si la migración se ejecuta dos veces, o si falla a mitad y se reintenta, aborta en la primera política con `42710 duplicate_object` y deja la base a medias.

**Corrección**: envolver cada política en `DROP POLICY IF EXISTS ... ;` previo, o en un bloque `DO $$ ... EXCEPTION WHEN duplicate_object THEN NULL; END $$;`.

### H-3 · ALTO (disponibilidad) · Un fallo al sembrar impide registrarse
El trigger es `AFTER INSERT ON auth.users`. Si `handle_new_user()` lanza una excepción —una categoría duplicada, un `NOT NULL` violado— la transacción de alta se revierte y **el usuario no puede registrarse**, sin un mensaje que explique por qué. Acoplar el alta de sesión a la siembra de datos de negocio es frágil.

**Corrección**: capturar las excepciones de la siembra dentro de la función y registrarlas, de modo que un fallo al crear categorías no impida el alta; o mover la siembra a una llamada idempotente desde la aplicación tras el primer login.

### H-4 · MEDIO · `ON CONFLICT DO UPDATE` puede borrar el nombre del usuario
```sql
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, avatar_url = EXCLUDED.avatar_url
```
`EXCLUDED.full_name` viene de `COALESCE(metadata->>'full_name', metadata->>'name', '')`. Si el metadato falta, el valor es **cadena vacía**, y la actualización sobrescribe con `''` un nombre que el usuario hubiera personalizado en el onboarding.

**Corrección**: `full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.profiles.full_name)`.

### H-5 · MEDIO · `updated_at` nunca se actualiza
Las tres tablas tienen `updated_at` con valor por defecto, pero no hay trigger `BEFORE UPDATE` que lo refresque. La columna miente en cuanto se edita una fila: es exactamente el tipo de dato en el que después se confía para resolver conflictos de sincronización offline (R-27).

### H-6 · MEDIO · Faltan restricciones de unicidad
Nada impide dos categorías con el mismo nombre y tipo para un usuario, ni dos cuentas con el mismo nombre. La guarda de siembra (`IF NOT EXISTS (SELECT 1 FROM categories WHERE user_id = ...)`) es de grano grueso: basta con que exista **una** categoría para que no siembre ninguna.

**Corrección**: `UNIQUE (user_id, name, type)` en `categories` y `UNIQUE (user_id, name)` en `accounts`.

### H-7 · BAJO · `profiles` sin política de DELETE
Es defendible —el borrado llega por cascada desde `auth.users`— pero conviene dejarlo escrito, porque hoy se lee como un olvido.

### H-8 · BAJO · `currency VARCHAR(5)` sin `CHECK`
Admite cualquier cadena de cinco caracteres. Con la pregunta P-04 (moneda única o multimoneda) todavía abierta, conviene al menos restringir a las monedas soportadas por `packages/contracts`.

### H-9 · BAJO · `profiles.email` duplica `auth.users.email`
Se desincroniza en cuanto el usuario cambia el correo en el proveedor, y nada lo reconcilia.

## El modelo está a un tercio

La migración crea **3 de las 10 tablas** de `docs/arquitectura.md`. Faltan, y sin ellas la aplicación no puede hacer lo que promete su nombre:
`transactions` · `transfers` · `debts` · `debt_installments` · `budgets` · `reminders` · `import_batches`
y la vista o función de **saldo por cuenta**, que según la arquitectura debe calcularse en la base para que web y Android coincidan.

## Sobre `supabase/tests/rls_isolation_test.sql` (Codex)
Cubre bien lo esencial: lectura cruzada, actualización cruzada y suplantación de `user_id` en `accounts`. Tres reservas:
1. Usa `SET LOCAL "request.jwt.claim.sub"`. La definición moderna de `auth.uid()` lee `request.jwt.claims` en JSON y mantiene ese GUC solo como respaldo; conviene fijar ambos para que la prueba no pase por el motivo equivocado.
2. Inserta directamente en `auth.users` sin `instance_id`, `aud` ni `role`. Puede fallar o crear usuarios inválidos según la versión del esquema de Auth.
3. No comprueba `profiles` ni `categories`, ni que la siembra sea idempotente.

## Plan propuesto
1. Corregir H-1 y H-2 en una migración nueva (no editar la ya escrita si llega a aplicarse).
2. Añadir las 7 tablas que faltan y la función de saldo.
3. Que Codex amplíe las pruebas de RLS a todas las tablas.
4. Aplicar **solo entonces**, y con autorización humana explícita, comprobando antes el estado remoto.
