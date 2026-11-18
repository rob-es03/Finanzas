import { Routes } from '@angular/router';
import { authGuard, onboardingGuard, publicOnlyGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },

  // Área privada «Saldo claro». Lleva authGuard: son las pantallas con datos
  // financieros del usuario y no deben abrirse sin sesión.
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () => import('./features/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'movements',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/movements/movements.page').then((m) => m.MovementsPage),
  },
  // `dashboard` fue la primera pantalla privada y sigue apareciendo en enlaces
  // antiguos; se conserva como redirección para no romperlos.
  { path: 'dashboard', pathMatch: 'full', redirectTo: 'home' },

  // Flujo de autenticación y onboarding
  {
    path: 'auth/welcome',
    canActivate: [publicOnlyGuard],
    loadComponent: () =>
      import('./features/auth/welcome/welcome.page').then((m) => m.WelcomePage),
  },
  {
    path: 'auth/login',
    canActivate: [publicOnlyGuard],
    loadComponent: () => import('./features/auth/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'auth/register',
    canActivate: [publicOnlyGuard],
    loadComponent: () =>
      import('./features/auth/register/register.page').then((m) => m.RegisterPage),
  },
  {
    path: 'auth/forgot-password',
    canActivate: [publicOnlyGuard],
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password.page').then(
        (m) => m.ForgotPasswordPage,
      ),
  },
  {
    // Sin guard a propósito: el enlace de recuperación deja una sesión activa,
    // así que publicOnlyGuard echaría justo a quien viene a cambiar la contraseña.
    path: 'auth/reset-password',
    loadComponent: () =>
      import('./features/auth/reset-password/reset-password.page').then(
        (m) => m.ResetPasswordPage,
      ),
  },
  {
    path: 'auth/callback',
    loadComponent: () =>
      import('./features/auth/callback/callback.page').then((m) => m.AuthCallbackPage),
  },
  {
    path: 'auth/error',
    loadComponent: () =>
      import('./features/auth/error/error.page').then((m) => m.AuthErrorPage),
  },
  {
    path: 'auth/onboarding',
    canActivate: [onboardingGuard],
    loadComponent: () =>
      import('./features/auth/onboarding/onboarding.page').then((m) => m.OnboardingPage),
  },

  { path: '**', redirectTo: 'home' },
];
