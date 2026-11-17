# Arquitectura (propuesta inicial)

Estado: **propuesta**. Nada de esto está implementado todavía. Ver `docs/estado-actual.md`.

## Stack
- **Frontend**: Angular + Ionic, TypeScript estricto, componentes standalone.
- **Nativo**: Capacitor (Android prioritario; web como segundo objetivo de primera clase).
- **Backend**: Supabase — PostgreSQL, Auth, RLS, Storage, Edge Functions.
- **Push**: Firebase Cloud Messaging, solo mensajería.
- **Local**: almacenamiento del dispositivo para caché y, si se aprueba el alcance, cola de sincronización offline.

No se fijan versiones aquí: se verifica la compatibilidad real entre Angular, Ionic y Capacitor antes de instalar (T-001).

## Estructura de repositorio propuesta
```
finanzas-app/
├── apps/mobile/              # Angular + Ionic + Capacitor
│   └── src/app/
│       ├── core/             # auth, supabase client, guards, interceptores
│       ├── data/             # repositorios, mapeos, tipos de dominio
│       ├── features/         # dashboard, movimientos, cuentas, deudas, presupuestos, recordatorios, perfil
│       └── shared/           # componentes, pipes (moneda), utilidades
├── packages/contracts/       # tipos y esquemas compartidos (generados desde el esquema SQL)
├── supabase/
│   ├── migrations/
│   ├── functions/
│   └── tests/                # pruebas pgTAP de RLS y cálculos
├── docs/
├── AGENTS.md · CLAUDE.md · README.md
└── .github/workflows/
```

## Capas
`features` (UI) → `data` (repositorios) → `core/supabase` (cliente). Los componentes nunca llaman a Supabase directamente. La lógica financiera es pura y comprobable, sin dependencias de Angular.

## Modelo de datos propuesto (a validar en T-002)
Todas las tablas de datos llevan `user_id uuid not null references auth.users(id)` y RLS `user_id = auth.uid()`.
Todos los importes son `BIGINT` en **centavos**, con la moneda como campo aparte.

- `profiles` — perfil del usuario autenticado (nombre visible, moneda, zona horaria).
- `accounts` — cuentas: banco, efectivo, tarjeta; saldo inicial en centavos.
- `categories` — categorías por tipo (`income` / `expense`), propias del usuario, sembradas al crear el perfil.
- `transactions` — movimientos: tipo, monto en centavos, fecha, cuenta, categoría, descripción, nota.
- `transfers` — traspaso entre cuentas propias; se representa de forma que no distorsione ingresos ni gastos.
- `debts` — deuda con acreedor, capital, estado.
- `debt_installments` — cuotas: número, vencimiento, monto, pagado/pendiente, pago parcial.
- `budgets` — presupuesto por categoría y período.
- `reminders` — recordatorios de pago y de registro, con su estado de notificación.
- `import_batches` — lotes de importación, con clave de idempotencia.

Saldo de cuenta = saldo inicial + movimientos + transferencias. Se calcula en la base (vista o función), no en el cliente, para que web y Android coincidan.

## Autenticación
Google Sign-In sobre Supabase Auth.
- **Web**: flujo OAuth de Supabase con redirect URI registrado.
- **Android**: cliente OAuth propio con huella SHA-1/SHA-256 del keystore, intercambio del token de Google en Supabase mediante el plugin de Capacitor adecuado (a verificar contra documentación oficial en T-003).
- Tokens en almacenamiento seguro del dispositivo, nunca en `localStorage` en Android.
- Al primer login: crear perfil y sembrar categorías y cuentas por defecto, de forma idempotente.
- Cierre de sesión: limpiar sesión, caché local y token de FCM.

## Decisiones pendientes de validar técnicamente
- Mecanismo exacto del login con Google en Capacitor.
- Motor de almacenamiento local (SQLite vs. preferencias) — depende del alcance offline (P-02).
- Widget Android: implementación nativa separada del código financiero.
