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

  // Si está cargando la sesión inicial, esperar un ciclo
  if (authService.isLoading()) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

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
export const publicOnlyGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

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
export const onboardingGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/auth/welcome']);
  }

  if (authService.isOnboardingCompleted()) {
    return router.createUrlTree(['/dashboard']);
  }

  return true;
};
