# Finanzas · Acceso con correo y contraseña y entrega con Resend

17 de noviembre de 2026. Requisito solicitado por el propietario. La implementación y la configuración externa están pendientes. Resend se propone para los correos transaccionales de Supabase Auth.

## Comportamiento de la app

| Flujo | Resultado esperado |
| --- | --- |
| Inicio de sesión | La pantalla de acceso ofrece «Continuar con Google», correo y contraseña, «Crear cuenta» y «Olvidé mi contraseña». Mantener la sesión y los guards existentes. |
| Registro | Pedir correo y contraseña, permitir pegar y usar gestores de contraseñas, y mostrar la política aplicable. Supabase crea la identidad y envía confirmación. Explicar que debe revisar el correo, con opción de reenvío sujeto a límites. |
| Confirmación | Un enlace válido abre la ruta autorizada de confirmación en web o Android, establece la sesión según el flujo configurado y continúa al onboarding, cuando corresponda. Un enlace expirado tiene una salida clara para solicitar otro. |
| Recuperación | Pedir correo y mostrar una respuesta genérica. El enlace válido abre «Nueva contraseña» dentro de una sesión de recuperación. Probar expiración, segundo uso y reapertura en el dispositivo. En caso de éxito, explicar cómo volver a entrar. |
| Identidad existente | Probar Google → correo y correo → Google con la misma dirección verificada. La vinculación se rige por Supabase Auth. Mantener un perfil y los mismos datos financieros por identificador; si las condiciones para vincular no se cumplen, guiar al método anterior. No fusionar perfiles desde el cliente. |

Claude Code implementa Supabase Auth y contratos, incluidos los callbacks de confirmación y recuperación. Validar el flujo PKCE o la estrategia de tokens elegida en ambos destinos, y limitar los redireccionamientos a destinos explícitos de cada entorno. Separar errores de validación local de respuestas de acceso y recuperación que podrían revelar si existe una cuenta. Aplicar límites de envío y reintentos. Redactar los mensajes en español y mantener identificadores, enlaces y credenciales fuera de la telemetría. [Contraseñas en Supabase Auth](https://supabase.com/docs/guides/auth/passwords)

## Configuración propuesta de Resend y Cloudflare

El dominio comprado es `miespaciodecrecimiento.com`. Una consulta DNS local devolvió los servidores autoritativos `daniella.ns.cloudflare.com` y `kolton.ns.cloudflare.com`. Se propone verificar **`auth.miespaciodecrecimiento.com`** como subdominio de envío y usar **`no-reply@auth.miespaciodecrecimiento.com`** con remitente **Finanzas**. La URL de la app y sus callbacks se definen aparte. [Dominios verificados de Resend](https://resend.com/docs/dashboard/domains/introduction)

1. Crear el subdominio en Resend y copiar en Cloudflare los registros exactos de verificación y envío que Resend entregue. Aplicar los nombres, tipos, prioridades y valores de esa cuenta, incluidos DKIM y SPF/return-path según corresponda. Proteger los registros de correo existentes del dominio raíz y comprobar el estado **Verified** desde Resend. Revisar cómo aplica la política DMARC existente. [Configuración DNS de Cloudflare](https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/)
2. Crear en Resend una credencial de solo envío, restringida al dominio si la cuenta lo permite, y guardarla como contraseña SMTP solo en Supabase Auth. Host `smtp.resend.com`, puerto `465`, usuario `resend`; usar el remitente verificado. Separar credenciales de pruebas y producción. Mantener la clave fuera de Angular, Capacitor, GitHub y chats. [Resend SMTP para Supabase](https://resend.com/docs/send-with-supabase-smtp)
3. En un entorno de pruebas, activar correo y contraseña, confirmación de correo y SMTP personalizado. Preparar plantillas en español de confirmación y recuperación. Configurar las URLs permitidas de web y Android, y desactivar el rastreo de clics para conservar los enlaces de Auth. En producción, aplicar la configuración tras verificar la entrega y aprobar el despliegue. [SMTP de Supabase](https://supabase.com/docs/guides/auth/auth-smtp) · [Lista de preparación para producción](https://supabase.com/docs/guides/deployment/going-into-prod)

## Recuperar Saldo claro sin mezclar cambios

1. Antigravity revisa el estado actual de la app contra los documentos de Saldo claro y adjunta capturas de referencia. Separar desviaciones visuales de los problemas funcionales de Auth. La auditoría inicial debe incluir bienvenida, login y el paso de autenticación a Inicio.
2. Antigravity es responsable de plantillas y estilos. Claude Code es responsable de Auth, rutas y contratos. Codex verifica accesibilidad, regresiones e integración. Acordar archivos compartidos antes de trabajar en paralelo y preservar cambios locales aún sin integrar. Mantener el botón Google conforme a su identidad y aplicar los tokens Saldo claro a los controles propios.
3. Publicar el trabajo en PRs revisables y ordenar la integración por dependencia. La carga del proyecto que está preparando Claude Code es independiente de este documento.

## Evidencia de aceptación

- **Auth web y Android.** Registro, entrega, confirmación, login con contraseña, recuperación, Google, onboarding y cierre de sesión con dos cuentas sintéticas. Probar que cada una mantiene su perfil y datos. Adjuntar capturas con correos y enlaces ocultos.
- **Entrega.** Verificación de dominio y eventos Resend de confirmación y recuperación, con evidencia de recepción real en un buzón de prueba. Probar enlaces expirados, usados y reenvío, además de la apertura de la app cuando corresponda.
- **Diseño y accesibilidad.** Capturas de claro y oscuro, teclado, foco, TalkBack, mostrar/ocultar contraseña, errores, estados de carga y texto ampliado. Comparar con los artefactos de Saldo claro.
- **Calidad.** Adjuntar salida de build, chequeo TypeScript, lint y pruebas. La preparación de lanzamiento requiere también las pruebas pendientes de RLS y cálculos financieros, registradas aparte.

Registro de ejecución de esta entrega documental: consulta DNS pública y contraste con documentación oficial. No se crearon credenciales, dominios en Resend, registros DNS ni cambios en Supabase.
