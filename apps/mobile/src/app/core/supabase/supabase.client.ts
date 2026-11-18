import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { CapacitorStorageAdapter } from '../auth/capacitor-storage.adapter';

/**
 * Punto único de acceso al cliente de Supabase.
 * Configura la persistencia segura según la plataforma (Capacitor Preferences en Android,
 * localStorage en web) con renovación automática de sesión y detección en URL.
 */
@Injectable({ providedIn: 'root' })
export class SupabaseClientService {
  private client: SupabaseClient | null = null;

  get db(): SupabaseClient {
    if (!this.client) {
      if (!environment.supabaseUrl || !environment.supabaseAnonKey) {
        throw new Error(
          'Supabase no está configurado. Copia src/environments/environment.example.ts a environment.ts y rellena los valores.',
        );
      }

      const isNative = Capacitor.isNativePlatform();

      this.client = createClient(environment.supabaseUrl, environment.supabaseAnonKey, {
        auth: {
          storage: isNative ? new CapacitorStorageAdapter() : undefined,
          autoRefreshToken: true,
          persistSession: true,
          // El intercambio del código PKCE lo hace `AuthService.handleOAuthRedirectUrl`.
          // Con `detectSessionInUrl: true` supabase-js lo intercambiaba también por su
          // cuenta al cargar la página de callback: consumía y borraba el code_verifier,
          // y el intercambio explícito fallaba después con
          // «PKCE code verifier not found in storage». Un único responsable del
          // intercambio, y el mismo camino en web y en el deep link de Android.
          detectSessionInUrl: false,
          flowType: 'pkce',
        },
      });
    }
    return this.client;
  }
}
