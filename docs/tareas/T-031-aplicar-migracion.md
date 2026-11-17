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
