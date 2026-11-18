# Saldo claro · Decisiones UX

## Aprobadas

- **Identidad.** Dirección A, Saldo claro, aprobada por el usuario. La combinación de marfil, grafito y petróleo organiza el contenido alrededor del saldo y de una acción de registro. Se usan divisiones y espaciado para ordenar las secciones.
- **Navegación objetivo.** Inicio para revisar y actuar, Movimientos para buscar o editar, Análisis para entender tendencias y Cuentas para consultar saldos por cuenta. Deudas, presupuestos y recordatorios tienen accesos contextuales cuando estén listos. Perfil y notificaciones quedan en navegación secundaria. El mapa es funcional; los cambios de rutas y guards requieren coordinación con Claude Code.
- **Magnitudes financieras.** «Saldo en cuentas» es el agregado de los saldos según el alcance visible. «Flujo neto del mes» representa ingresos menos gastos del período. Las transferencias entre cuentas propias quedan excluidas del flujo. «Pagos próximos» representa compromisos identificados en un plazo explícito. «Disponible» y «Ahorro» requieren definiciones aprobadas y datos que las respalden.
- **Gráficos.** En Inicio se usan cifras y vencimientos. En Análisis, las barras mensuales comparan ingresos y gastos y las horizontales permiten ordenar gastos por categoría. Cada gráfico tendrá valores y una alternativa textual.

## Decisiones de diseño para validar con Antigravity

- Se proponen siete días y hasta tres elementos para próximos pagos y un máximo de tres movimientos recientes. Validar con un caso cargado y uno con poco historial.
- El formulario comienza en Gasto y con fecha local de hoy. La cuenta se preselecciona solo si el contexto es inequívoco. Los atajos conservan todos los valores editables.
- La guía de Antigravity en `docs/ux-ui/design-system.md` ya describe onboarding, tema índigo y Google Sign-In. Aplicar Saldo claro primero a las tres experiencias de esta entrega. Acordar con Antigravity cuándo trasladar los tokens a las demás pantallas y cómo mantener el botón oficial de Google.
- R-27 mantiene offline pendiente de alcance. Un formulario abierto puede conservar sus campos al fallar la conexión. La persistencia tras cerrar la app y el estado pendiente dependen del contrato de sincronización aprobado.

## Revisión antes de integrar

Antigravity valida el recorrido con un dispositivo o emulador Android y escritorio, captura los estados principales de ambos temas y adjunta resultados de [los criterios de aceptación](SCREEN_SPECIFICATIONS.md#criterios-de-aceptación). Claude Code confirma la correspondencia entre datos disponibles, rótulos y reglas del dominio. Codex revisa accesibilidad, regresiones, comportamiento con error y coherencia con las especificaciones. Las pantallas adicionales se detallarán tras validar Inicio, Movimientos y Registro.
