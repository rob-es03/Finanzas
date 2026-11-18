import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authGuard, onboardingGuard, publicOnlyGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('Auth Guards', () => {
  let mockAuthService: any;
  let mockRouter: any;

  beforeEach(() => {
    mockAuthService = {
      isLoading: vi.fn().mockReturnValue(false),
      isAuthenticated: vi.fn().mockReturnValue(false),
      isOnboardingCompleted: vi.fn().mockReturnValue(false),
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
    it('debe permitir acceso libre a usuarios no autenticados', () => {
      mockAuthService.isAuthenticated.mockReturnValue(false);

      const result = TestBed.runInInjectionContext(() => publicOnlyGuard({} as any, {} as any));
      expect(result).toBe(true);
    });

    it('debe redirigir a /dashboard a usuarios ya autenticados y con onboarding listo', () => {
      mockAuthService.isAuthenticated.mockReturnValue(true);
      mockAuthService.isOnboardingCompleted.mockReturnValue(true);

      const result = TestBed.runInInjectionContext(() => publicOnlyGuard({} as any, {} as any));
      expect(result).toBe('urlTree:/dashboard');
    });
  });

  describe('onboardingGuard', () => {
    it('debe permitir acceso si el usuario esta autenticado pero aun no completo onboarding', () => {
      mockAuthService.isAuthenticated.mockReturnValue(true);
      mockAuthService.isOnboardingCompleted.mockReturnValue(false);

      const result = TestBed.runInInjectionContext(() => onboardingGuard({} as any, {} as any));
      expect(result).toBe(true);
    });

    it('debe redirigir a /dashboard si ya completo onboarding previamente', () => {
      mockAuthService.isAuthenticated.mockReturnValue(true);
      mockAuthService.isOnboardingCompleted.mockReturnValue(true);

      const result = TestBed.runInInjectionContext(() => onboardingGuard({} as any, {} as any));
      expect(result).toBe('urlTree:/dashboard');
    });
  });
});
