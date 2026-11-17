import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { OnboardingPayload, SupportedCurrency } from '@finanzas/contracts';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SupabaseClientService } from '../supabase/supabase.client';
import { AuthService } from './auth.service';

describe('AuthService & Manejo de Sesiones', () => {
  let service: AuthService;
  let mockSupabase: any;
  let mockRouter: any;

  beforeEach(() => {
    mockSupabase = {
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
        onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
        signInWithOAuth: vi.fn().mockResolvedValue({ data: { url: 'https://accounts.google.com/o/oauth2' }, error: null }),
        signOut: vi.fn().mockResolvedValue({ error: null }),
        exchangeCodeForSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockResolvedValue({ data: [], error: null }),
        update: vi.fn().mockReturnThis(),
        upsert: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    };

    mockRouter = {
      navigate: vi.fn().mockResolvedValue(true),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: SupabaseClientService, useValue: { db: mockSupabase } },
        { provide: Router, useValue: mockRouter },
      ],
    });

    service = TestBed.inject(AuthService);
  });

  it('debe inicializarse en estado no autenticado por defecto cuando getSession es null', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.profile()).toBeNull();
    expect(service.isOnboardingCompleted()).toBe(false);
  });

  it('debe llamar a signInWithOAuth de Supabase con proveedor google y scopes minimos', async () => {
    await service.signInWithGoogle();

    expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: 'google',
        options: expect.objectContaining({
          scopes: 'openid email profile',
        }),
      }),
    );
  });

  it('debe limpiar el estado y navegar a login al invocar signOut()', async () => {
    await service.signOut();

    expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    expect(service.session()).toBeNull();
    expect(service.profile()).toBeNull();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('completeOnboarding debe convertir los saldos a enteros estrictos en centavos', async () => {
    // Simular sesión activa
    (service as any)._session.set({
      user: { id: 'usr-123', email: 'test@ejemplo.com' },
    });

    const payload: OnboardingPayload = {
      fullName: 'Nicolle Rivera',
      currency: 'USD' as SupportedCurrency,
      accounts: [
        { name: 'Banco Bolivariano', type: 'bank', initialBalanceCents: 15050 }, // $150.50
        { name: 'Efectivo', type: 'cash', initialBalanceCents: 4000 }, // $40.00
      ],
    };

    await service.completeOnboarding(payload);

    expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
    expect(mockSupabase.from).toHaveBeenCalledWith('accounts');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('debe capturar errores de OAuth y redirigir a /auth/error', async () => {
    await service.handleOAuthRedirectUrl('http://localhost:4200/auth/callback?error_description=Acceso%20denegado');

    expect(service.authError()).toBe('Acceso denegado');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/error'], {
      queryParams: { message: 'Acceso denegado' },
    });
  });
});
