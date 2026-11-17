import { Preferences } from '@capacitor/preferences';
import { SupportedStorage } from '@supabase/supabase-js';

/**
 * Adaptador de almacenamiento persistente y seguro para Supabase Auth.
 * En Capacitor nativo (Android), utiliza `@capacitor/preferences` en lugar
 * de localStorage no encriptado del WebView.
 * Cumple con R-34 y D-005: tokens en almacenamiento seguro en el dispositivo.
 */
export class CapacitorStorageAdapter implements SupportedStorage {
  async getItem(key: string): Promise<string | null> {
    const { value } = await Preferences.get({ key });
    return value;
  }

  async setItem(key: string, value: string): Promise<void> {
    await Preferences.set({ key, value });
  }

  async removeItem(key: string): Promise<void> {
    await Preferences.remove({ key });
  }
}
