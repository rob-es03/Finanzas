import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authGuard, onboardingGuard, publicOnlyGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('Auth Guards', () => {
  // Los miembros de AuthService de los que dependen los guards. Las claves se
  // toman del servicio real: si una deja de existir o cambia de nombre, esto no
  // compila. Era lo que ocultaba el `any`: faltaba `whenReady` y la suite pasaba
  // en verde mientras el guard real no redirigía (T-033).
  type DependenciasDeGuards = Pick<
    AuthService,
    'isLoading' | 'isAuthenticated' | 'isOnboardingCompleted' | 'whenReady'
  >;
  type AuthServiceDoble = { [K in keyof DependenciasDeGuards]: ReturnType<typeof vi.fn> };

  let mockAuthService: AuthServiceDoble;
  let mockRouter: { createUrlTree: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockAuthService = {
      isLoading: vi.fn().mockReturnValue(false),
      isAuthenticated: vi.fn().mockReturnValue(false),
      isOnboardingCompleted: vi.fn().mockReturnValue(false),
      whenReady: vi.fn().mockResolvedValue(undefined),
    };

    mockRouter = {
      createUrlTree: vi.fn().mockImplementation((commands: string[]) => `urlTree:${commands.join('/')}`),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    });
  });

  describe('authGuard', () => {
    it('debe redirigir a /auth/welcome si el usuario no esta autenticado', async () => {
      mockAuthService.isAuthenticated.mockReturnValue(false);

      const result = await TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
      expect(result).toBe('urlTree:/auth/welcome');
    });

    it('debe redirigir a /auth/onboarding si esta autenticado pero onboarding esta incompleto', async () => {
      mockAuthService.isAuthenticated.mockReturnValue(true);
      mockAuthService.isOnboardingCompleted.mockReturnValue(false);

      const result = await TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
      expect(result).toBe('urlTree:/auth/onboarding');
    });

    it('debe permitir acceso (true) si esta autenticado y completo onboarding', async () => {
      mockAuthService.isAuthenticated.mockReturnValue(true);
      mockAuthService.isOnboardingCompleted.mockReturnValue(true);

      const result = await TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
      expect(result).toBe(true);
    });
  });

  describe('publicOnlyGuard', () => {
    it('debe permitir acceso libre a usuarios no autenticados', async () => {
      mockAuthService.isAuthenticated.mockReturnValue(false);

      const result = await TestBed.runInInjectionContext(() => publicOnlyGuard({} as any, {} as any));
      expect(result).toBe(true);
    });

    it('debe redirigir a /dashboard a usuarios ya autenticados y con onboarding listo', async () => {
      mockAuthService.isAuthenticated.mockReturnValue(true);
      mockAuthService.isOnboardingCompleted.mockReturnValue(true);

      const result = await TestBed.runInInjectionContext(() => publicOnlyGuard({} as any, {} as any));
      expect(result).toBe('urlTree:/dashboard');
    });
  });

  describe('onboardingGuard', () => {
    it('debe permitir acceso si el usuario esta autenticado pero aun no completo onboarding', async () => {
      mockAuthService.isAuthenticated.mockReturnValue(true);
      mockAuthService.isOnboardingCompleted.mockReturnValue(false);

      const result = await TestBed.runInInjectionContext(() => onboardingGuard({} as any, {} as any));
      expect(result).toBe(true);
    });

    it('debe redirigir a /dashboard si ya completo onboarding previamente', async () => {
      mockAuthService.isAuthenticated.mockReturnValue(true);
      mockAuthService.isOnboardingCompleted.mockReturnValue(true);

      const result = await TestBed.runInInjectionContext(() => onboardingGuard({} as any, {} as any));
      expect(result).toBe('urlTree:/dashboard');
    });
  });
});
