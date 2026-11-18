import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { OnboardingPayload, SupportedCurrency, UserProfile } from '@finanzas/contracts';
import { Session, User } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { SupabaseClientService } from '../supabase/supabase.client';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabaseService = inject(SupabaseClientService);
  private readonly router = inject(Router);

  // Señales reactivas de estado
  private readonly _session = signal<Session | null>(null);
  private readonly _profile = signal<UserProfile | null>(null);
  private readonly _isLoading = signal<boolean>(true);
  private readonly _authError = signal<string | null>(null);

  // Computadas públicas
  readonly session = computed(() => this._session());
  readonly profile = computed(() => this._profile());
  readonly isLoading = computed(() => this._isLoading());
  readonly authError = computed(() => this._authError());
  readonly isAuthenticated = computed(() => !!this._session());
  readonly isOnboardingCompleted = computed(() => this._profile()?.onboardingCompleted ?? false);

  /**
   * Se resuelve cuando la restauración inicial de la sesión ha terminado.
   * Los guards la esperan: sin esto, en una carga en frío se evalúan antes de
   * que `getSession()` responda, ven la sesión en `null` y dejan pasar a un
   * usuario que sí está autenticado.
   */
  private readonly ready: Promise<void>;

  constructor() {
    this.ready = this.initializeAuth();
    this.setupDeepLinkListener();
  }

  /** Espera a que la sesión inicial esté resuelta. Nunca rechaza. */
  whenReady(): Promise<void> {
    return this.ready;
  }

  /**
   * Inicializa la sesión recuperándola desde el almacenamiento seguro y
   * escucha cambios de estado (login, logout, renovación de token).
   */
  async initializeAuth(): Promise<void> {
    try {
      this._isLoading.set(true);
      const supabase = this.supabaseService.db;

      // 1. Obtener sesión activa existente
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.warn('Error al recuperar sesión inicial:', error.message);
      }

      this._session.set(session);
      if (session?.user) {
        await this.syncProfile(session.user);
      }

      // 2. Suscribirse a cambios de estado de autenticación
      supabase.auth.onAuthStateChange(async (event, newSession) => {
        this._session.set(newSession);

        if (event === 'SIGNED_IN' && newSession?.user) {
          this._authError.set(null);
          await this.syncProfile(newSession.user);
        } else if (event === 'SIGNED_OUT') {
          this._profile.set(null);
          this._authError.set(null);
          this.router.navigate(['/auth/login']);
        } else if (event === 'TOKEN_REFRESHED' && newSession?.user) {
          // Token renovado silenciosa y transparentemente
          this._session.set(newSession);
        }
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error inesperado de autenticación';
      this._authError.set(msg);
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Configura el listener de deep links para Capacitor Android (`appUrlOpen`).
   * Captura retornos de OAuth con esquema personalizado `ec.finanzas.app://auth/callback`.
   */
  private setupDeepLinkListener(): void {
    if (!Capacitor.isNativePlatform()) return;

    App.addListener('appUrlOpen', async ({ url }) => {
      if (!url) return;

      // Verificar si es el callback de autenticación
      if (url.includes('auth/callback') || url.startsWith('ec.finanzas.app')) {
        try {
          await Browser.close();
        } catch {
          // Si el navegador ya estaba cerrado, ignorar
        }

        await this.handleOAuthRedirectUrl(url);
      }
    });
  }

  /**
   * Procesa el código o tokens recibidos en la URL de callback (OAuth PKCE).
   */
  async handleOAuthRedirectUrl(urlStr: string): Promise<void> {
    try {
      this._isLoading.set(true);
      this._authError.set(null);
      const supabase = this.supabaseService.db;

      // Procesar URL con parámetros de búsqueda o fragmentos hash
      const parsedUrl = new URL(urlStr.replace('#', '?'));
      const code = parsedUrl.searchParams.get('code');
      const errorDescription = parsedUrl.searchParams.get('error_description');

      if (errorDescription) {
        throw new Error(errorDescription);
      }

      if (code) {
        // Intercambiar código PKCE por tokens de sesión
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          // Si el código ya fue canjeado (por ejemplo, al recargar la página de
          // callback), puede existir ya una sesión válida. Comprobarlo antes de
          // dar el acceso por fallido evita un error que el usuario no entiende.
          const { data: { session: existing } } = await supabase.auth.getSession();
          if (!existing) throw error;
          this._session.set(existing);
          await this.syncProfile(existing.user);
          this.redirectAfterAuth();
          return;
        }
        if (data.session) {
          this._session.set(data.session);
          await this.syncProfile(data.session.user);
          this.redirectAfterAuth();
        }
      } else {
        // Caso de hash tokens o sesión ya interceptada
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (session) {
          this._session.set(session);
          await this.syncProfile(session.user);
          this.redirectAfterAuth();
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al procesar el retorno de Google';
      this._authError.set(msg);
      this.router.navigate(['/auth/error'], { queryParams: { message: msg } });
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Inicia el flujo de autenticación con Google mediante Supabase Auth.
   * Solicita únicamente los permisos mínimos necesarios (email, profile, openid).
   */
  async signInWithGoogle(): Promise<void> {
    try {
      this._isLoading.set(true);
      this._authError.set(null);
      const isNative = Capacitor.isNativePlatform();
      const supabase = this.supabaseService.db;

      const redirectTo = isNative
        ? environment.oauth.androidRedirectUri
        : (typeof window !== 'undefined'
            ? `${window.location.origin}/auth/callback`
            : environment.oauth.webRedirectUri);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          scopes: 'openid email profile',
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
          skipBrowserRedirect: isNative, // En Android abrimos con Capacitor Browser
        },
      });

      if (error) throw error;

      if (isNative && data?.url) {
        // Abrir navegador in-app para que el usuario elija su cuenta de Google
        await Browser.open({ url: data.url, windowName: '_self' });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al iniciar sesión con Google';
      this._authError.set(msg);
      this._isLoading.set(false);
      throw err;
    }
  }

  /**
   * Cierra la sesión activa de forma segura.
   * Limpia almacenamiento seguro de tokens y restablece el estado.
   */
  async signOut(): Promise<void> {
    try {
      this._isLoading.set(true);
      const supabase = this.supabaseService.db;
      await supabase.auth.signOut();
      this._session.set(null);
      this._profile.set(null);
      this._authError.set(null);
      await this.router.navigate(['/auth/login']);
    } catch (err: unknown) {
      console.error('Error al cerrar sesión:', err);
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Sincroniza o crea el perfil financiero en la base de datos de manera idempotente.
   * Solo extrae nombre y correo autorizados explícitamente en el login.
   */
  async syncProfile(user: User): Promise<UserProfile | null> {
    try {
      const supabase = this.supabaseService.db;

      // 1. Intentar leer perfil existente
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (existingProfile && !fetchError) {
        const mappedProfile: UserProfile = {
          id: existingProfile.id,
          email: existingProfile.email,
          fullName: existingProfile.full_name,
          avatarUrl: existingProfile.avatar_url,
          currency: (existingProfile.currency as SupportedCurrency) || 'USD',
          onboardingCompleted: existingProfile.onboarding_completed ?? false,
          createdAt: existingProfile.created_at,
          updatedAt: existingProfile.updated_at,
        };
        this._profile.set(mappedProfile);
        return mappedProfile;
      }

      // 2. Si no existe (fallback por si no se ejecutó el trigger), crearlo con datos básicos
      const fullName = (user.user_metadata?.['full_name'] ||
        user.user_metadata?.['name'] ||
        user.email?.split('@')[0] ||
        'Usuario') as string;

      const avatarUrl = (user.user_metadata?.['avatar_url'] ||
        user.user_metadata?.['picture'] ||
        null) as string | null;

      const newProfileData = {
        id: user.id,
        email: user.email ?? '',
        full_name: fullName,
        avatar_url: avatarUrl,
        currency: 'USD',
        onboarding_completed: false,
      };

      const { data: created, error: insertError } = await supabase
        .from('profiles')
        .upsert(newProfileData)
        .select()
        .single();

      if (insertError) {
        console.warn('Nota: Perfil creado por trigger o pendiente de sincronizar:', insertError.message);
      }

      const current = created ?? newProfileData;
      const profile: UserProfile = {
        id: current.id,
        email: current.email,
        fullName: current.full_name,
        avatarUrl: current.avatar_url,
        currency: (current.currency as SupportedCurrency) || 'USD',
        onboardingCompleted: current.onboarding_completed ?? false,
        createdAt: (current as { created_at?: string }).created_at ?? new Date().toISOString(),
        updatedAt: (current as { updated_at?: string }).updated_at ?? new Date().toISOString(),
      };

      this._profile.set(profile);
      return profile;
    } catch (err) {
      console.error('Error al sincronizar perfil financiero:', err);
      return null;
    }
  }

  /**
   * Finaliza la configuración inicial (Onboarding).
   * Registra la moneda elegida, crea las cuentas con sus saldos iniciales (en centavos enteros)
   * y marca el onboarding como completado.
   */
  async completeOnboarding(payload: OnboardingPayload): Promise<void> {
    const user = this._session()?.user;
    if (!user) throw new Error('Usuario no autenticado');

    this._isLoading.set(true);
    const supabase = this.supabaseService.db;

    try {
      // 1. Actualizar perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: payload.fullName,
          currency: payload.currency,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // 2. Insertar cuentas iniciales con sus saldos en centavos enteros
      if (payload.accounts.length > 0) {
        const accountsToInsert = payload.accounts.map((acc) => ({
          user_id: user.id,
          name: acc.name,
          type: acc.type,
          initial_balance_cents: Math.round(acc.initialBalanceCents), // Asegurar entero estricto
          color: acc.color ?? '#6366f1',
          icon: acc.icon ?? 'wallet-outline',
        }));

        const { error: accountsError } = await supabase
          .from('accounts')
          .insert(accountsToInsert);

        if (accountsError) throw accountsError;
      }

      // 3. Actualizar estado local
      if (this._profile()) {
        this._profile.update((p) =>
          p
            ? {
                ...p,
                fullName: payload.fullName,
                currency: payload.currency,
                onboardingCompleted: true,
              }
            : null,
        );
      }

      // 4. Navegar al dashboard principal
      await this.router.navigate(['/dashboard']);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar la configuración inicial';
      this._authError.set(msg);
      throw err;
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Redirección inteligente post-autenticación:
   * Si es usuario nuevo (onboarding incompleto) -> /auth/onboarding
   * Si ya completó onboarding -> /dashboard
   */
  redirectAfterAuth(): void {
    if (this.isOnboardingCompleted()) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/auth/onboarding']);
    }
  }
}
