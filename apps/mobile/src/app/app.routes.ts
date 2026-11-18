import { Routes } from '@angular/router';
import { onboardingGuard, publicOnlyGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },

  // Flujo de Inicio y Movimientos «Saldo claro»
  {
    path: 'home',
    loadComponent: () =>
      import('./features/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'dashboard',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'movements',
    loadComponent: () =>
      import('./features/movements/movements.page').then((m) => m.MovementsPage),
  },

  // Flujo de Autenticación y Onboarding
  {
    path: 'auth/welcome',
    canActivate: [publicOnlyGuard],
    loadComponent: () =>
      import('./features/auth/welcome/welcome.page').then((m) => m.WelcomePage),
  },
  {
    path: 'auth/login',
    canActivate: [publicOnlyGuard],
    loadComponent: () =>
      import('./features/auth/login/login.page').then((m) => m.LoginPage),
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
