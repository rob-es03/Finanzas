# T-033 · Acceso por correo y recuperación

- **Responsable** · Codex, a solicitud del propietario para esta tarea.
- **Dependencias** · T-003, Supabase Auth local y remitente Resend verificado.
- **Archivos permitidos** · Ruta Angular de Auth, cliente Supabase, servicio y pruebas de Auth, pantallas login/callback y documentos de esta tarea.
- **Descripción** · Añadir registro, ingreso y recuperación por correo y contraseña. Conservar Google. Usar el callback PKCE compartido y el evento de recuperación para abrir el formulario de nueva contraseña.
- **Criterios de aceptación** · Confirmación real de correo antes de ingresar, acceso con correo y contraseña, recuperación por un enlace recibido y rechazo de la contraseña anterior. Prueba web y Android con datos sintéticos.
- **Pruebas requeridas** · Build, pruebas de Auth y recorrido completo con Gmail, Angular, Supabase local y Resend. Android requiere SDK y emulador o equipo físico con acceso al Auth local.
- **Riesgos** · PKCE requiere abrir los enlaces en el mismo navegador o volver a la misma instalación Android. La lista permitida debe incluir el callback correspondiente. Las plantillas y los límites de envío pertenecen al entorno que se prueba.
- **Estado** · Implementación en revisión.
