import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

/**
 * Punto único de acceso al cliente de Supabase.
 * Ningún componente debe importar `@supabase/supabase-js` directamente:
 * la capa `data/` usa este servicio y los componentes usan `data/`.
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
      this.client = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
    }
    return this.client;
  }
}
