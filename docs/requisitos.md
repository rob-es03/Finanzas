# Requisitos

Fuentes: `finanzas_nicolle.html` (prototipo) y `ChatGPT-Megaprompt Aplicación Full Stack-20261117-1824.md` (conversación), más el encargo inicial al equipo de agentes.
Cada requisito indica su origen. Lo que no está en las fuentes aparece como **SUPUESTO** y requiere confirmación.

## 1. Funcionalidad existente en el prototipo (no debe perderse)
Origen: `finanzas_nicolle.html`.
- R-01 Registro de movimientos con descripción, monto, fecha, categoría y cuenta; tipo ingreso o gasto.
- R-02 Categorías diferenciadas por tipo (ingreso / gasto).
- R-03 Atajos rápidos preconfigurados que rellenan el formulario (quincena, arriendo, luz, internet, cuota).
- R-04 Filtro por mes y botón "mes actual".
- R-05 Resumen del mes: ingresos, gastos, saldo libre y margen libre en porcentaje.
- R-06 Saldos por cuenta, calculados sobre el histórico completo.
- R-07 Historial con búsqueda por texto y filtro por tipo.
- R-08 Eliminación de movimientos.
- R-09 Gráfico de distribución (dona) de gastos por categoría más saldo libre.
- R-10 Exportación CSV.
- R-11 Borrado total de datos con confirmación.
- R-12 Moneda USD, idioma español, localización `es-EC`.

## 2. Defectos del prototipo a corregir
Origen: conversación, sección "Qué encontré en tu HTML" + lectura directa del código.
- D-01 Nombre de usuario fijo en la interfaz → perfil por usuario.
- D-02 Bancos y categorías fijos en código → configurables por usuario.
- D-03 Persistencia solo en `localStorage` → Supabase + caché local.
- D-04 Sin autenticación → Supabase Auth.
- D-05 Sin edición de movimientos → CRUD completo con confirmaciones.
- D-06 Saldos desde cero → saldos iniciales, transferencias y conciliación.
- D-07 Deudas modeladas como categorías de gasto → módulo real de deudas y cuotas.
- D-08 Importes en `float` → centavos enteros.
- D-09 Datos del usuario insertados con `innerHTML` (tabla de historial, saldos, atajos) → renderizado seguro.
- D-10 `JSON.parse` de `localStorage` sin manejo de error → validación de datos.
- D-11 Borrado sin posibilidad de deshacer → confirmación explícita y, donde aplique, deshacer.

## 3. Producto objetivo
Origen: conversación.
- R-20 Aplicación de finanzas personales multiusuario; cada usuario ve solo sus datos.
- R-21 Plataformas prioritarias: **Android y web** (origen: encargo al equipo). iOS no está comprometido.
- R-22 Módulos: panel financiero; movimientos y cuentas; deudas, cuotas y presupuestos; recordatorios; perfil y privacidad.
- R-23 Entidades: cuentas, categorías, ingresos, gastos, transferencias, deudas, cuotas, presupuestos, recordatorios.
- R-24 Representación monetaria exacta (centavos).
- R-25 Operaciones idempotentes donde corresponda.
- R-26 Importación segura de datos históricos (incluye los del `localStorage` del prototipo).
- R-27 Sincronización offline — **alcance por aprobar** antes de implementarse.
- R-28 Presupuestos compartidos (parejas/familias) — fase posterior, no comprometido.

## 4. Autenticación
Origen: encargo al equipo.
- R-30 Google Sign-In sobre **Supabase Auth**.
- R-31 Crear o recuperar el perfil asociado al usuario autenticado tras el login.
- R-32 Pedir solo los datos adicionales imprescindibles.
- R-33 Flujo web y flujo Android compatibles con Capacitor.
- R-34 Verificar documentación oficial, clientes OAuth, huella SHA, redirect URIs, manejo y almacenamiento seguro de tokens, y cierre de sesión.
- R-35 No usar Firebase Authentication salvo razón arquitectónica aprobada.
- R-36 Firebase Cloud Messaging solo para notificaciones push.

## 5. Seguridad y datos
- R-40 RLS estricta por usuario en todas las tablas de datos.
- R-41 Sin claves privilegiadas en el cliente; operaciones sensibles en Edge Functions.
- R-42 Validación de entradas en cliente y servidor.
- R-43 Pruebas de cálculo financiero y de políticas RLS.

## 6. Android y utilidades del teléfono
Origen: conversación, sección 4.
- R-50 Widget de inicio para registro rápido de gasto/ingreso y consulta de saldo — viable.
- R-51 Abrir el panel de Wi-Fi/Internet del sistema — viable.
- R-52 Linterna mediante API de cámara/flash — **condicionada** a permisos, hardware y versión.
- R-53 Encender/apagar Wi-Fi directamente — **restringido por Android**, no se promete.
- R-54 Las utilidades nativas se mantienen separadas de la lógica financiera y son opcionales.
- R-55 Prioridad: primero finanzas, después utilidades del teléfono (**SUPUESTO**: la pregunta quedó abierta en la conversación; se asume esta prioridad porque el encargo pide "priorizar Android y web" para la app financiera y califica las utilidades como evaluables).

## 7. Preguntas abiertas (bloquean decisiones, no el arranque)
- P-01 ¿Para quién es la app: individual, familiar/compartida, o producto público monetizable? (la conversación la deja sin responder).
- P-02 Alcance real de la sincronización offline.
- P-03 ¿Se migran los datos existentes del `localStorage` de la usuaria del prototipo?
- P-04 Moneda única USD o multimoneda.
- P-05 ¿Existe repositorio remoto (GitHub) y cuentas de Supabase/Firebase ya creadas?
