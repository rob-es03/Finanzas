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

---

## Resuelta · 2026-11-17

**Causa.** Los tres guards leían `isAuthenticated()` de forma **síncrona**, pero `initializeAuth()` es asíncrona: en una carga en frío, `getSession()` aún no había respondido y la sesión valía `null`. `authGuard` lo disimulaba esperando 100 ms fijos —una apuesta sobre la latencia de la red, no una garantía—; `publicOnlyGuard` y `onboardingGuard` no esperaban nada.

**Corrección.** `AuthService` expone `whenReady()`, una promesa que se resuelve cuando termina la restauración inicial de la sesión. Los tres guards la esperan. Se eliminó el `setTimeout(100)`.

**Verificado en navegador, con sesión activa:**
| Ruta | Resultado |
|---|---|
| `/auth/login` | → `/auth/onboarding` |
| `/auth/welcome` | → `/auth/onboarding` |
| `/dashboard` | → `/auth/onboarding` (onboarding incompleto) |
| `/dashboard` sin sesión | → `/auth/welcome` |

**Sobre las pruebas.** Al añadir `whenReady()` la suite se puso en rojo con `authService.whenReady is not a function`: el doble tipado como `any` no implementaba el miembro. Esa es exactamente la razón por la que la suite pasaba mientras el guard real fallaba. Se tipó el doble con las claves tomadas de `AuthService` (`Pick<AuthService, ...>`), de modo que un miembro que falte o cambie de nombre ya no compila, y se añadió el `await` que faltaba en cuatro pruebas que habían quedado comparando una promesa contra un booleano. **13 de 13 en verde.**

Se editó `auth.guard.spec.ts`, que es de Codex, con el cambio mínimo para no dejar la suite rota. El trabajo de fondo —los `{} as any` restantes— sigue siendo suyo en T-032.
