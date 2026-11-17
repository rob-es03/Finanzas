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
          detectSessionInUrl: true,
          flowType: 'pkce',
        },
      });
    }
    return this.client;
  }
}
