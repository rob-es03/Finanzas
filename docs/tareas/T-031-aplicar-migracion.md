# T-031 · Revisar y aplicar la migración inicial en Supabase
- **Responsable**: Claude Code
- **Dependencias**: revisión de Codex + **autorización humana explícita**
- **Archivos permitidos**: `supabase/migrations/**`, `packages/contracts/**`
- **Estado**: bloqueada (requiere autorización)

## Contexto verificado (2026-11-17)
Proyecto `ujalaluhmtwevqhnzivo`: **0 migraciones aplicadas, 0 tablas en `public`**. La migración local nunca se ejecutó.

## Descripción
Revisar `20261117180000_auth_profiles_and_accounts.sql` (tablas `profiles`, `accounts`, `categories`; 11 políticas RLS; importes en `BIGINT`), completarla con lo que falta del modelo (`transactions`, `transfers`, `debts`, `debt_installments`, `budgets`, `reminders`, `import_batches`) y aplicarla **solo tras autorización**, comprobando antes el estado remoto.

## Criterios de aceptación
1. Se consulta el estado remoto antes de aplicar; no se re-ejecuta nada ya aplicado.
2. Toda tabla de datos con RLS y políticas sobre `auth.uid()`.
3. Ninguna columna de dinero en coma flotante.
4. La siembra inicial es idempotente.
5. Dos usuarios de prueba no acceden a los datos del otro (evidencia adjunta).
6. Tipos regenerados en `packages/contracts/`.

---

## Avance 2026-11-17 · migración correctiva escrita

`supabase/migrations/20261118000000_core_finance_model.sql` (454 líneas). **No aplicada en ninguna base.**

Corrige H-1 a H-8 de la auditoría y añade las 7 tablas que faltaban: `transactions`, `transfers`, `debts`, `debt_installments`, `budgets`, `reminders`, `import_batches`, más la vista `account_balances`.

Decisiones de diseño que conviene revisar:
- **Importes siempre positivos** en `transactions`; el signo lo determina `type`. Elimina el doble criterio de signo del prototipo.
- **Claves foráneas compuestas `(user_id, id)`**: una fila no puede apuntar a la cuenta o categoría de otro usuario ni siquiera si la RLS fallara. Es una segunda línea de defensa, independiente de `auth.uid()`.
- **Transferencias en tabla propia**, para que no distorsionen el flujo del mes.
- **Estado de cuota derivado** (`installment_status()`), no almacenado.
- **`account_balances` con `security_invoker = true`**, para que la vista respete la RLS de quien consulta en lugar de la del propietario.
- **Tasa de interés en puntos básicos** (entero), para no introducir coma flotante por la puerta de atrás.

### Pendiente antes de aplicar
1. **La migración no se ha ejecutado**: no hay PostgreSQL local, ni Docker, ni CLI de Supabase en esta máquina, así que su sintaxis no está verificada por ejecución.
2. Revisión de Codex y ampliación de `supabase/tests/` a todas las tablas.
3. Autorización humana explícita, comprobando antes el estado remoto.
