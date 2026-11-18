# T-033 · `publicOnlyGuard` no redirige a un usuario ya autenticado
- **Responsable**: Claude Code (código) · Codex (pruebas)
- **Estado**: abierta · detectada el 2026-11-17 en prueba real

## Observado
Con sesión activa y verificada (usuario en `auth.users`, perfil creado), navegar a `http://localhost:4300/auth/login` **muestra la pantalla de inicio de sesión** en vez de redirigir al área privada. Comprobado dos veces, la segunda esperando 8 segundos para descartar una carrera con la hidratación de la sesión. Sin errores en consola.

Cabe esperar lo mismo en `auth/welcome`, que usa el mismo guard.

## Por qué importa
No es un detalle estético: un usuario con sesión que vuelve a la pantalla de acceso y pulsa «Continuar con Google» inicia un flujo OAuth innecesario. Y es la otra mitad de `authGuard`: si uno de los dos no evalúa bien la sesión, conviene dudar del otro.

## Detalle que conviene mirar
`core/auth/auth.guard.spec.ts` pasa sus pruebas y aun así el comportamiento real falla. Esa suite usa dobles tipados como `any` (los 20 errores de lint de T-032): un doble sin tipo no detecta que el guard lea la sesión de una forma que en producción todavía no está resuelta. Vale la pena revisar qué comprueba realmente.

## Criterios de aceptación
1. Con sesión activa, `auth/login` y `auth/welcome` redirigen al destino privado.
2. Sin sesión, `dashboard` redirige a la bienvenida.
3. La prueba automatizada falla si se rompe cualquiera de los dos sentidos, con dobles tipados.
