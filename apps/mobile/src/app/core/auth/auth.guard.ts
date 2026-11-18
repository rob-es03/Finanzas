import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Guarda para rutas privadas.
 * Requiere usuario autenticado y con configuración inicial completada.
 */
export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Esperar a que la sesión inicial esté resuelta. Antes se esperaba un plazo
  // fijo de 100 ms, que es una apuesta sobre cuánto tarda la red: si tardaba
  // más, el guard decidía con la sesión todavía en null.
  await authService.whenReady();

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/auth/welcome']);
  }

  if (!authService.isOnboardingCompleted()) {
    return router.createUrlTree(['/auth/onboarding']);
  }

  return true;
};

/**
 * Guarda para páginas públicas de login/bienvenida.
 * Si ya tiene sesión activa, redirige al dashboard o al onboarding según corresponda.
 */
export const publicOnlyGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  await authService.whenReady();

  if (authService.isAuthenticated()) {
    if (authService.isOnboardingCompleted()) {
      return router.createUrlTree(['/dashboard']);
    }
    return router.createUrlTree(['/auth/onboarding']);
  }

  return true;
};

/**
 * Guarda para la pantalla de Onboarding.
 * Solo accesible para usuarios autenticados que NO han completado la configuración inicial.
 */
export const onboardingGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  await authService.whenReady();

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/auth/welcome']);
  }

  if (authService.isOnboardingCompleted()) {
    return router.createUrlTree(['/dashboard']);
  }

  return true;
};
