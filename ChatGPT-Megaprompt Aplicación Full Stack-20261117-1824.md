# Megaprompt Aplicación Full Stack

**User:** Anonymous  
**Created:** 11/17/2026 18:14:56  
**Updated:** 11/17/2026 18:22:48  
**Exported:** 11/17/2026 18:24:40  
**Link:** [https://chatgpt.com/c/6afcdff0-4420-83ea-bc72-26c529dc2e77](https://chatgpt.com/c/6afcdff0-4420-83ea-bc72-26c529dc2e77)  

## Prompt:
17/11/2026, 6:15:22 p.m.

Armame un megaprompt para desarrollar una aplicación, quiero un backend, frontend, actúa como un ingeniero de software senior con pensamiento crítico y perfeccionista, especialista en U/X y U/I este prompt que me darás se lo enviaré a Google AI Studio y posteriormente lo desarrollaré con ayuda de la IA usando las últimas tecnologías de angular, ionic, capacitor, typescript… Usaremos Firebase para las notificaciones push en Android y usaremos la herramienta digital que tu creas que es la mejor para desarrollar el backend, como supabase o alguna otra tecnología…

## Response:
17/11/2026, 6:15:31 p.m. · gpt-6

# MEGAPROMPT MAESTRO — Desarrollo de aplicaciones profesionales con IA

Te voy a preparar un megaprompt pensado para **Google AI Studio**, pero también reutilizable en Claude Code, Codex y otros asistentes de programación.

El objetivo es que la IA trabaje como un **equipo de ingeniería de software senior**, no simplemente como un generador de código. Quiero que cuestione decisiones, detecte problemas, proponga soluciones y construya una aplicación moderna, escalable, segura y visualmente profesional.

## Arquitectura tecnológica recomendada

**Frontend**

Angular + Ionic + TypeScript

Interfaz responsive, componentes reutilizables y arquitectura modular

**Backend**

Supabase + PostgreSQL

Autenticación, datos relacionales, RLS, funciones y almacenamiento

**Notificaciones**

Firebase Cloud Messaging

Notificaciones push para Android mediante Capacitor

**Calidad**

Testing + CI/CD

Pruebas, seguridad, monitoreo y despliegues controlados

**Mi elección inicial es Supabase**, porque PostgreSQL permite construir un modelo relacional sólido, Supabase Auth resuelve gran parte de la autenticación y sus políticas RLS ayudan a proteger los datos. Para operaciones sensibles usaría funciones de servidor; no colocaría credenciales privilegiadas ni lógica crítica en Angular.

No fijaría números de versiones en el prompt. Exigiría verificar las versiones estables y la compatibilidad real entre Angular, Ionic, Capacitor y sus dependencias antes de instalar nada.

---

## Megaprompt listo para copiar en Google AI Studio

PROMPT MAESTRO · FULL STACK · MOBILE FIRST [Copiar megaprompt]

Incluye las instrucciones de arquitectura, diseño, seguridad, implementación y validación. El botón copia la versión completa.

### Cómo trabajaría con este prompt

Mi recomendación es que no le pidas a Google AI Studio que genere toda la aplicación en una sola respuesta. Primero debe definir el producto, después su arquitectura y finalmente implementar funcionalidades completas, una por una.

1. **Descubrimiento\:** definir qué hace la aplicación y para quién.
2. **UX/UI\:** diseñar las pantallas y validar la navegación.
3. **Backend\:** modelar PostgreSQL, permisos, autenticación y funciones.
4. **Frontend\:** construir Angular e Ionic conectados al backend.
5. **Android\:** integrar Capacitor y Firebase Cloud Messaging.
6. **Calidad\:** probar, corregir, optimizar y preparar el despliegue.

## Una pregunta importante

**¿Qué tipo de aplicación quieres desarrollar?**

Por ejemplo, una aplicación de administración de edificios, ventas, inventario, gestión empresarial, servicios, educación o algo completamente diferente.

Con esa información puedo convertir este megaprompt general en uno **especializado para tu proyecto**, definiendo módulos, pantallas, roles, base de datos, flujos y arquitectura antes de comenzar a programar.

## Prompt:
17/11/2026, 6:22:04 p.m.

Me faltó pasarte la información más importante, hazme un plan para trabajar con claude code, codex y antigravity, para estas IAs pago 20 al mes en cada una. Este html es para organizar las finanzas de cada persona, sería bueno que también funcione como un atajo en el control de funciones como el wifi o la linterna de un celular.

[Attachment: finanzas_nicolle.html]

## Response:
17/11/2026, 6:22:06 p.m. · gpt-6

# Plan maestro de desarrollo - Aplicación de finanzas personales

Ahora sí tenemos una base concreta. Revisé el archivo `finanzas_nicolle.html` y mi propuesta es **convertirlo en una aplicación de finanzas personales para múltiples usuarios**, con Android como plataforma principal, versión web y sincronización segura.

También vamos a aprovechar tus tres suscripciones de IA\:

Claude Code

## \$20/mes

Arquitectura e implementación

Codex

## \$20/mes

Auditoría, pruebas y correcciones

Antigravity

## \$20/mes

UX/UI y validación visual

---

**Inversión total en IA**

# \$60/mes

La idea es que las tres herramientas colaboren mediante un mismo repositorio, documentación compartida y responsabilidades bien definidas, evitando que las tres intenten modificar el mismo código simultáneamente.

## 1\. Qué encontré en tu HTML

Tu prototipo ya contiene una buena base funcional\:

- Registro de ingresos y gastos con fecha, categoría y cuenta.
- Resumen mensual, saldo disponible y gráfico de distribución.
- Historial con búsqueda y filtros.
- Atajos para registrar gastos e ingresos frecuentes.
- Exportación CSV.
- Almacenamiento local mediante `localStorage`\.

Pero también encontré puntos importantes que debemos corregir.

| Situación actual | Solución propuesta |
|--------|--------|
| Nombre de Nicolle fijo en la interfaz | Perfil personalizado por usuario |
| Bancos y categorías predefinidos | Cuentas y categorías configurables |
| Datos guardados solo en el navegador | Persistencia local y sincronización con Supabase |
| No existe autenticación | Registro, inicio de sesión y recuperación |
| No hay edición de movimientos | CRUD completo con confirmaciones |
| Saldos calculados desde cero | Saldos iniciales, transferencias y conciliación |
| Deudas representadas como categorías de gasto | Módulo real de deudas, cuotas y pagos |
| Montos calculados con números decimales JavaScript | Importes en centavos enteros para evitar errores de precisión |

Además, el HTML inserta descripciones de movimientos directamente en `innerHTML`, algo que debe sustituirse por renderizado seguro para evitar inyección de contenido. fileciteturn0file0L385-L400

**Una decisión importante\:** el HTML será una referencia funcional y visual, no una arquitectura que debamos copiar literalmente. Conservaremos lo que funciona y reconstruiremos la aplicación correctamente.

## 2\. Cómo debería evolucionar el producto

Arquitectura propuesta

**Angular + Ionic + Capacitor**

Android y aplicación web

**Supabase**

Auth, PostgreSQL, RLS, API y funciones

**Firebase FCM**

Notificaciones push Android

**Base local del dispositivo**

SQLite o almacenamiento local adecuado, con cola de sincronización offline

Usaría Supabase como backend inicial. No considero necesario implementar NestJS ni un servidor Node dedicado desde el primer día. Si posteriormente aparecen integraciones bancarias, procesos complejos o requisitos empresariales, reevaluaremos esa decisión.

## 3\. Módulos del producto

**Panel financiero**

Saldo total, ingresos, gastos, dinero comprometido, ahorro disponible, evolución mensual y distribución por categorías.

---

**Movimientos y cuentas**

Registro rápido, edición, transferencias, cuentas bancarias, efectivo, tarjetas y filtros avanzados.

---

**Deudas y presupuestos**

Cuotas, fechas de vencimiento, pagos parciales, presupuestos por categoría y seguimiento de obligaciones.

---

**Recordatorios inteligentes**

Avisos de pagos próximos, vencimientos, límites presupuestarios y recordatorios de registro.

---

**Perfiles y privacidad**

Cada usuario con sus finanzas independientes. Más adelante, presupuestos compartidos para parejas o familias, con permisos explícitos.

---

## 4\. Tu idea de usar la aplicación como atajo del celular

Es interesante, pero debemos separar los **atajos financieros**, que podemos implementar sin grandes restricciones, de los **controles del sistema Android**, que tienen límites de seguridad.

| Función | Viabilidad |
|--------|--------|
| Registrar gasto desde un widget | (Viable) |
| Acceso rápido a ingresos y saldos | (Viable) |
| Encender y apagar linterna | (Condicionada) |
| Abrir configuración de Wi-Fi | (Viable) |
| Encender/apagar Wi-Fi directamente | (Restringida) |
| Panel de accesos rápidos Android | (Nativo) |

Para la linterna, una integración nativa puede utilizar las APIs de cámara/flash de Android cuando el dispositivo lo permita. Habría que comprobar permisos, hardware y compatibilidad.

Para Wi-Fi, las versiones modernas de Android restringen que una aplicación convencional lo active o desactive directamente. Podemos abrir el panel de Internet del sistema, pero no prometer un interruptor que el sistema operativo no autoriza.

Mi propuesta es desarrollar primero un **widget financiero Android** y dejar el módulo de utilidades del teléfono como una funcionalidad opcional, separada de la lógica financiera.

## 5\. Distribución del trabajo entre las tres IA

[![Claude](https://images.openai.com/static-rsc-4/oQgL5zqdUFRJuPq3CDmfG9Cua5jw1QQBHCuYIC9ALvQ9g-NiWnyNU28rx3HfLthRsMuQ9gBZK6E5BFAkTPlDVsXka72kjNzf9C3XAVqtbQbCrT643aSr8hlfknqYHCoHIFcjz5JZPX6ey_69VxnVi0jghNAhDhihrZfL_o2330zanzin88REewEA55gHQ2Eo?purpose=fullsize)](https://temka-ai.online/assistant/claude-ai)

**Claude Code - Ingeniero principal**

Responsable de arquitectura, estructura Angular/Ionic, implementación del backend, migraciones SQL, integración con Supabase, autenticación y Firebase.

Trabajará en ramas `feat/*` y será el principal responsable de escribir funcionalidades.

---

[![Liberando el poder de OpenAI Codex: Una guía completa para desarrolladores y entusiastas de la IA](https://images.openai.com/static-rsc-4/BoCTkPTswTvAFNDnGeJe4-hZuJiBgq0LE0PKvKBAxv2kk1N5hfv802CjhfS8qs5kqpfZypZyRsEvnMhe_g_5Aqm8o4aNu6dgLOJvYUYzHXFxe_igOYdim4t3_44LliZHVhan0WWCIVcx0AwVtdu-QiblC4JlXf0xuIPxOPaWCSl2ATGpzyEMVx0dC1SZrnu5?purpose=fullsize)](https://story321.com/es/blog/openai-codex)

**Codex - Ingeniero de calidad y seguridad**

Revisará los cambios de Claude, buscará vulnerabilidades, errores de cálculo financiero, fallos de RLS, problemas de concurrencia y regresiones. También escribirá pruebas y podrá implementar tareas independientes.

Trabajará en ramas `test/*`, `fix/*` y revisiones de pull requests.

---

[![antigravity](https://images.openai.com/static-rsc-4/ICJJ2mSpJSbVYwPC0EaHgDf4I2clfDccbk9Rh1tR5RmoWG8P0WtqEpn20JT_GKF3K_YJ5wuYtLWc1Ch8LVcUuxmMfuMipAe7T13HrTBqJTzDwTOFKAGHSGn16ZYsWQz3inzFRBgne3FKPhUq-OfbYL84OjtYHg3OnuG4QjSTxKOPvSURmg7frsKIO4NTfxy5?purpose=fullsize)](https://mirrors.sdu.edu.cn/spark-store-repository/store/development/antigravity/)

**Antigravity - Especialista UX/UI y validación**

Trabajará sobre las pantallas, el design system, navegación, responsive, estados visuales y pruebas de experiencia en navegador, según las capacidades disponibles.

Podrá implementar mejoras visuales en ramas `ui/*`, sin modificar simultáneamente los módulos que Claude esté desarrollando.

La regla principal será **un responsable por tarea y una revisión independiente antes de integrar**\. Pagar tres herramientas no significa que las tres deban intervenir en cada cambio; eso solo consumiría límites de uso y crearía conflictos.

## 6\. Plan de ejecución de ocho semanas

Es un cronograma orientativo, no una promesa de entrega. La sincronización offline, las notificaciones y los widgets Android podrían requerir más tiempo que una pantalla convencional.

## 7\. Cómo coordinar las IA sin perder el contexto

Propongo un repositorio GitHub con una estructura similar a esta\:

```text
finanzas-app/
├── apps/
│   └── mobile/                # Angular + Ionic + Capacitor
├── supabase/
│   ├── migrations/
│   ├── functions/
│   └── tests/
├── docs/
│   ├── product/
│   ├── architecture/
│   ├── ux-ui/
│   ├── decisions/
│   └── ai-handoffs/
├── AGENTS.md
├── CLAUDE.md
├── README.md
└── .github/
    └── workflows/
```

Los documentos `AGENTS.md` y `CLAUDE.md` definirán convenciones, arquitectura, seguridad, comandos y reglas de colaboración. `docs/ai-handoffs/` contendrá los resúmenes de cada sesión, para que una IA pueda continuar el trabajo de otra sin depender de su historial de conversación.

Cada tarea debe tener requisitos, criterios de aceptación, archivos permitidos, pruebas y una definición clara de terminado.

## 8\. Primer prompt para Claude Code

Este será el punto de partida real. Adjunta el HTML original al proyecto antes de ejecutarlo.

**Prompt de inicio - Fase 0** [Copiar]

Este prompt obliga a Claude Code a inspeccionar el prototipo antes de escribir código, y establece el protocolo de colaboración con las otras dos herramientas.

## 9\. Tres decisiones que debemos definir

¿Para quién será la aplicación?

Cada persona administra sus propias finanzas

Personas, parejas y familias con cuentas compartidas

Para lanzarla al público y posiblemente monetizarla

---

¿Qué importancia tendrán los controles del teléfono?

Primero finanzas; después linterna, Wi-Fi y otros atajos

Quiero ambos módulos desde el inicio

---

¿En qué plataformas quieres lanzarla?

Android y web

Solo Android inicialmente

Android, web e iOS

[Definir mi plan de desarrollo]

Con estas respuestas podremos preparar los **tres megaprompts especializados**, uno para cada IA, con instrucciones complementarias, reglas de Git, distribución de tareas y criterios de calidad. Así construiremos una sola aplicación coherente, en lugar de tres implementaciones diferentes.



---
Powered by [ChatGPT Exporter](https://www.chatgptexporter.com)