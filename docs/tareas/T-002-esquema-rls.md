# T-002 · Esquema PostgreSQL, RLS y contratos de tipos
- **Responsable**: Claude Code
- **Dependencias**: ninguna (puede ir en paralelo con T-001)
- **Archivos permitidos**: `supabase/migrations/**`, `packages/contracts/**`, `docs/arquitectura.md`
- **Estado**: propuesta

## Descripción
Primera migración con las tablas de `docs/arquitectura.md`: `profiles, accounts, categories, transactions, transfers, debts, debt_installments, budgets, reminders, import_batches`. Importes en `BIGINT` (centavos). `user_id` y RLS en toda tabla de datos. Función/trigger idempotente que crea el perfil y siembra cuentas y categorías por defecto al primer acceso. Vista o función de saldo por cuenta calculada en la base. Generar los tipos TypeScript en `packages/contracts/`.

Aplicar **solo** en entorno local o en una branch de Supabase. **No tocar producción.**

## Criterios de aceptación
1. La migración aplica desde cero sin errores.
2. Toda tabla de datos tiene RLS habilitada y políticas de select/insert/update/delete sobre `auth.uid()`.
3. Ninguna columna de dinero es `float`/`numeric` decimal; todas `BIGINT` en centavos.
4. La siembra inicial es idempotente: ejecutarla dos veces no duplica datos.
5. El saldo por cuenta se obtiene de la base y coincide con el cálculo esperado en un conjunto de datos de ejemplo.
6. Los tipos de `packages/contracts/` se generan desde el esquema y compilan.

## Pruebas requeridas
Script de verificación que, con dos usuarios de prueba, demuestre que ninguno lee ni escribe datos del otro. Salida adjunta. Codex replica estas pruebas de forma independiente en T-011.

## Riesgos
Modelar mal las transferencias y duplicar ingresos/gastos; olvidar RLS en una tabla nueva.
