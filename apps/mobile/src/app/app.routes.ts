import { Routes } from '@angular/router';
import { authGuard, onboardingGuard, publicOnlyGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

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
    path: 'auth/reset-password',
    data: { passwordReset: true },
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

  // Área Protegida
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.page').then((m) => m.DashboardPage),
  },

  { path: '**', redirectTo: 'dashboard' },
];
