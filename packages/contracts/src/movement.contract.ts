export type MovementType = 'income' | 'expense';

export interface Movement {
  id: string;
  type: MovementType;
  description: string;
  amountCents: number; // En centavos enteros positivos
  date: string; // Formato ISO YYYY-MM-DD
  accountId: string;
  accountName: string;
  categoryId: string;
  categoryName: string;
  note?: string;
  createdAt?: string;
}

export interface UpcomingPayment {
  id: string;
  description: string;
  amountCents: number;
  dueDate: string; // YYYY-MM-DD
  accountName: string;
  status: 'pending' | 'due_soon' | 'overdue';
}

export interface AccountOption {
  id: string;
  name: string;
  type: 'bank' | 'cash' | 'credit_card' | 'savings';
  balanceCents: number;
}

export interface MonthSummary {
  month: string; // YYYY-MM
  incomeCents: number;
  expenseCents: number;
  netFlowCents: number; // income - expense
}

export interface QuickPreset {
  id: string;
  label: string;
  type: MovementType;
  description: string;
  amountCents: number;
  categoryId: string;
  categoryName: string;
  accountId: string;
  accountName: string;
}
