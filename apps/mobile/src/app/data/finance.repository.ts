import { Injectable, inject } from '@angular/core';
import {
  AccountOption,
  Movement,
  MovementType,
  UpcomingPayment,
} from '@finanzas/contracts';
import { SupabaseClientService } from '../core/supabase/supabase.client';

/**
 * Acceso a los datos financieros en Supabase.
 *
 * Todas las consultas van contra tablas con RLS: no hace falta filtrar por
 * `user_id` aquí, la base solo devuelve lo del usuario de la sesión. Los
 * importes viajan en centavos enteros de extremo a extremo.
 */
@Injectable({ providedIn: 'root' })
export class FinanceRepository {
  private readonly supabase = inject(SupabaseClientService);

  /** Saldos por cuenta, calculados en la base (vista `account_balances`). */
  async getAccounts(): Promise<AccountOption[]> {
    const { data, error } = await this.supabase.db
      .from('account_balances')
      .select('account_id, name, type, balance_cents')
      .order('name');
    if (error) throw new Error(error.message);

    return (data ?? []).map((fila) => ({
      id: fila.account_id as string,
      name: fila.name as string,
      type: fila.type as AccountOption['type'],
      // La vista devuelve BIGINT, que llega como cadena desde PostgREST.
      balanceCents: Number(fila.balance_cents ?? 0),
    }));
  }

  async getCategories(): Promise<{ id: string; name: string; type: MovementType }[]> {
    const { data, error } = await this.supabase.db
      .from('categories')
      .select('id, name, type')
      .order('type')
      .order('name');
    if (error) throw new Error(error.message);

    return (data ?? []).map((fila) => ({
      id: fila.id as string,
      name: fila.name as string,
      type: fila.type as MovementType,
    }));
  }

  /**
   * Movimientos del usuario, del más reciente al más antiguo.
   *
   * Sin `select` anidado a propósito: las claves foráneas a `accounts` y
   * `categories` son compuestas `(user_id, id)` y PostgREST no resuelve el
   * embebido sobre ellas. Los nombres se resuelven con los catálogos que la
   * pantalla ya carga, que además son pocos.
   */
  async getMovements(
    nombreCuentas: Map<string, string> = new Map(),
    nombreCategorias: Map<string, string> = new Map(),
    limite = 200,
  ): Promise<Movement[]> {
    const { data, error } = await this.supabase.db
      .from('transactions')
      .select(
        'id, type, description, amount_cents, occurred_on, note, account_id, category_id, created_at',
      )
      .order('occurred_on', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limite);
    if (error) throw new Error(error.message);

    return (data ?? []).map((fila) => {
      const accountId = (fila.account_id as string) ?? '';
      const categoryId = (fila.category_id as string) ?? '';
      return {
        id: fila.id as string,
        type: fila.type as MovementType,
        description: fila.description as string,
        amountCents: Number(fila.amount_cents ?? 0),
        date: fila.occurred_on as string,
        accountId,
        accountName: nombreCuentas.get(accountId) ?? 'Cuenta',
        categoryId,
        categoryName: nombreCategorias.get(categoryId) ?? 'Sin categoría',
        note: (fila.note as string) ?? undefined,
        createdAt: (fila.created_at as string) ?? undefined,
      } satisfies Movement;
    });
  }

  /**
   * Cuotas de deuda pendientes como «próximos pagos».
   * El estado se deriva de la fecha, no se almacena.
   */
  async getUpcomingPayments(dias = 30): Promise<UpcomingPayment[]> {
    const hoy = new Date();
    const limite = new Date(hoy);
    limite.setDate(limite.getDate() + dias);

    const { data, error } = await this.supabase.db
      .from('debt_installments')
      .select('id, number, due_on, amount_cents, paid_cents, debt_id')
      .lte('due_on', limite.toISOString().slice(0, 10))
      .order('due_on');
    if (error) throw new Error(error.message);

    // El acreedor se resuelve aparte: la foránea a `debts` también es compuesta.
    const acreedores = new Map<string, string>();
    if ((data ?? []).length > 0) {
      const { data: deudas } = await this.supabase.db.from('debts').select('id, creditor');
      for (const d of deudas ?? []) acreedores.set(d.id as string, d.creditor as string);
    }

    const hoyIso = hoy.toISOString().slice(0, 10);
    const enSieteDias = new Date(hoy);
    enSieteDias.setDate(enSieteDias.getDate() + 7);
    const sieteIso = enSieteDias.toISOString().slice(0, 10);

    return (data ?? [])
      .filter((fila) => Number(fila.paid_cents ?? 0) < Number(fila.amount_cents ?? 0))
      .map((fila) => {
        const creditor = acreedores.get(fila.debt_id as string);
        const deuda = { creditor };
        const vence = fila.due_on as string;
        const estado: UpcomingPayment['status'] =
          vence < hoyIso ? 'overdue' : vence <= sieteIso ? 'due_soon' : 'pending';
        return {
          id: fila.id as string,
          description: `${deuda?.creditor ?? 'Deuda'} · cuota ${fila.number}`,
          amountCents: Number(fila.amount_cents ?? 0) - Number(fila.paid_cents ?? 0),
          dueDate: vence,
          accountName: deuda?.creditor ?? 'Deuda',
          status: estado,
        } satisfies UpcomingPayment;
      });
  }

  async insertMovement(payload: {
    type: MovementType;
    description: string;
    amountCents: number;
    date: string;
    accountId: string;
    categoryId: string | null;
    note?: string;
  }): Promise<string> {
    const { data, error } = await this.supabase.db
      .from('transactions')
      .insert({
        type: payload.type,
        description: payload.description,
        amount_cents: Math.round(payload.amountCents),
        occurred_on: payload.date,
        account_id: payload.accountId,
        category_id: payload.categoryId,
        note: payload.note ?? null,
        user_id: (await this.supabase.db.auth.getUser()).data.user?.id,
      })
      .select('id')
      .single();
    if (error) throw new Error(error.message);
    return data.id as string;
  }

  async updateMovement(
    id: string,
    payload: {
      type: MovementType;
      description: string;
      amountCents: number;
      date: string;
      accountId: string;
      categoryId: string | null;
      note?: string;
    },
  ): Promise<void> {
    const { error } = await this.supabase.db
      .from('transactions')
      .update({
        type: payload.type,
        description: payload.description,
        amount_cents: Math.round(payload.amountCents),
        occurred_on: payload.date,
        account_id: payload.accountId,
        category_id: payload.categoryId,
        note: payload.note ?? null,
      })
      .eq('id', id);
    if (error) throw new Error(error.message);
  }

  async deleteMovement(id: string): Promise<void> {
    const { error } = await this.supabase.db.from('transactions').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }

  /** Crea una cuenta. Necesaria para que un usuario nuevo pueda registrar algo. */
  async createAccount(nombre: string, tipo: AccountOption['type'], saldoInicialCents: number): Promise<string> {
    const { data, error } = await this.supabase.db
      .from('accounts')
      .insert({
        name: nombre,
        type: tipo,
        initial_balance_cents: Math.round(saldoInicialCents),
        user_id: (await this.supabase.db.auth.getUser()).data.user?.id,
      })
      .select('id')
      .single();
    if (error) throw new Error(error.message);
    return data.id as string;
  }
}
