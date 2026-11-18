/**
 * Contratos de datos para autenticación, perfiles y onboarding inicial.
 * Representación monetaria exacta: importes en CENTAVOS enteros (BIGINT / integer).
 */

export type SupportedCurrency = 'USD' | 'EUR' | 'COP' | 'MXN' | 'PEN';

export interface UserProfile {
  id: string; // UUID coincidente con auth.users(id)
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  currency: SupportedCurrency;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AccountType = 'bank' | 'cash' | 'credit_card' | 'savings';

export interface InitialAccountSetup {
  name: string;
  type: AccountType;
  initialBalanceCents: number; // En centavos: ej. 10000 = $100.00
  color?: string;
  icon?: string;
}

export interface OnboardingPayload {
  fullName: string;
  currency: SupportedCurrency;
  accounts: InitialAccountSetup[];
}

export interface AuthSessionState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}
