# Directiva global de diseño — gobierno y reglas

Fuente: directiva del responsable del producto, 2026-11-17. Versionada aquí para que los tres agentes compartan la misma referencia.
**Ninguna IA puede cambiar unilateralmente la identidad visual global.**

> **Dirección adoptada: «Saldo claro»** (marfil, grafito y petróleo), ya aprobada y especificada en `DESIGN_SYSTEM.md`, `SCREEN_SPECIFICATIONS.md`, `COMPONENT_INVENTORY.md` y `UX_DECISIONS.md`. Este documento **no la sustituye**: recoge los principios *Modern Banking*, las prohibiciones y las reglas de gobierno que la enmarcan. Ante una discrepancia de valores concretos (tokens, medidas, componentes), manda `DESIGN_SYSTEM.md`.

## Principios obligatorios
Minimalismo funcional · saldo y dinero disponible como información protagonista · acciones financieras rápidas y accesibles · navegación inferior clara en Android · tipografía moderna muy legible con **cifras tabulares** · espacio en blanco consistente · iconografía uniforme · gráficos que responden preguntas concretas · animaciones discretas · responsive · modo claro y oscuro · componentes reutilizables · **WCAG 2.2 AA**.

## Prohibido (aspecto genérico de IA)
Degradados morados/azules/rosados sin justificación · glassmorphism innecesario · sombras grandes y difusas en todas las tarjetas · bordes excesivamente redondeados · tarjetas anidadas · iconos y emojis como decoración · exceso de métricas y gráficos · botones enormes sin jerarquía · encabezados gigantes · textos vacíos tipo «lleva tus finanzas al siguiente nivel» · ilustraciones que no informan · animaciones excesivas · estética de plantilla de panel administrativo · todo compitiendo por la atención.
No es una prohibición absoluta de tarjetas, sombras o color: se usan cuando hay una razón funcional.

## Navegación principal
1. Inicio · 2. Movimientos · 3. Análisis · 4. Cuentas.
Deudas, presupuestos, recordatorios, perfil y utilidades del teléfono cuelgan de una navegación secundaria coherente.
**No se modifican rutas existentes sin comprobar dependencias y acordar la migración** (hoy existen `auth/welcome`, `auth/login`, `auth/callback`, `auth/onboarding`, `auth/error` y `dashboard`).

## Pantalla principal
Saldo total de cuentas · selector de cuentas · acciones rápidas · movimientos recientes · próximos pagos · acceso a estadísticas y presupuestos.
**Regla de dominio**: saldo total de cuentas, flujo del mes, saldo disponible y dinero comprometido son magnitudes distintas y nunca se presentan como equivalentes. El prototipo original las confundía; es el defecto D-06 de `docs/requisitos.md`.

## Documentos del sistema de diseño (propiedad del director de diseño / Antigravity)
- `docs/design/DESIGN_SYSTEM.md` — tokens: color semántico, tipografía y escalas, espaciado, radios, elevación, bordes, estados interactivos, iconografía, animación, dark mode.
- `docs/design/SCREEN_SPECIFICATIONS.md` — por pantalla: objetivo del usuario, jerarquía, distribución, componentes, interacciones, estados, responsive, accesibilidad.
- `docs/design/COMPONENT_INVENTORY.md` — inventario de componentes reutilizables y sus variantes.
- `docs/design/UX_DECISIONS.md` — decisiones de experiencia con su justificación.

Ningún valor de color, margen, tamaño o estilo arbitrario cuando exista un token aprobado.

## Componentes reutilizables mínimos
Balance principal · selector de cuenta · acciones rápidas · fila de movimiento · resumen de ingresos y gastos · presupuestos · deudas y cuotas · gráficos · encabezados · navegación · formularios · estados vacío/error/carga · confirmaciones y notificaciones.

## Responsabilidades
- **Director de diseño (Google AI Studio)**: propone diseño, especificaciones, reglas visuales y auditorías de coherencia. No modifica el repositorio sin una tarea explícita.
- **Antigravity**: implementa el sistema de diseño en Angular/Ionic/Capacitor; móvil primero, componentes reutilizables, validación visual.
- **Claude Code**: garantiza que la implementación respete la arquitectura, la lógica financiera y las integraciones con Supabase y Firebase; coordina los cambios compartidos.
- **Codex**: audita implementación, accesibilidad, pruebas, consistencia de componentes, regresiones y errores funcionales.

## Control de cambios (antes de tocar una pantalla)
Leer `AGENTS.md` → leer `DESIGN_SYSTEM.md` → revisar el código existente → consultar `COMPONENT_INVENTORY.md` → identificar componentes reutilizables → rama independiente → ejecutar pruebas → comparar con las especificaciones → abrir Pull Request → actualizar documentación.

## Criterios de aceptación de una pantalla
Funcional con datos reales · respeta el sistema de diseño · correcta en Android · adaptada a escritorio cuando corresponda · accesible · maneja carga, error y ausencia de datos · no rompe funciones existentes · con pruebas pertinentes · revisada visual y funcionalmente.

## Datos en prototipos
**Nunca datos financieros reales.** Datos ficticios marcados como tales. El prototipo histórico `finanzas_nicolle.html` contiene datos personales reales y no se usa como fuente de contenido para maquetas.

## Orden de trabajo acordado
1. Auditar el diseño actual · 2. Compararlo con esta dirección · 3. Crear el sistema de diseño · 4. Proponer Inicio y Movimientos · 5. Obtener aprobación · 6. Implementar componentes base · 7. Extender al resto de módulos.
