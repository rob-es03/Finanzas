import { Injectable, computed, signal } from '@angular/core';
import {
  AccountOption,
  MonthSummary,
  Movement,
  MovementType,
  QuickPreset,
  UpcomingPayment,
} from '@finanzas/contracts';

@Injectable({ providedIn: 'root' })
export class FinancialStateService {
  // Cuentas del escenario de referencia: Total = $1,280.50 (128050 centavos)
  readonly accounts = signal<AccountOption[]>([
    { id: 'all', name: 'Todas las cuentas', type: 'bank', balanceCents: 128050 },
    { id: 'acc-bolivariano', name: 'Banco Bolivariano', type: 'bank', balanceCents: 85050 },
    { id: 'acc-produbanco', name: 'Produbanco', type: 'bank', balanceCents: 33000 },
    { id: 'acc-efectivo', name: 'Efectivo', type: 'cash', balanceCents: 10000 },
  ]);

  readonly selectedAccountId = signal<string>('all');

  // Categorías
  readonly categories = signal<{ id: string; name: string; type: MovementType }[]>([
    { id: 'cat-sueldo', name: 'Sueldo Quincenal', type: 'income' },
    { id: 'cat-bono', name: 'Bono / Utilidades', type: 'income' },
    { id: 'cat-ventas', name: 'Ventas / Extra', type: 'income' },
    { id: 'cat-arriendo', name: 'Arriendo y Servicios', type: 'expense' },
    { id: 'cat-alimentos', name: 'Alimentación y Transporte', type: 'expense' },
    { id: 'cat-tarjeta', name: 'Pago Tarjeta Diners', type: 'expense' },
    { id: 'cat-cuota', name: 'Cuota Produbanco', type: 'expense' },
    { id: 'cat-otros-g', name: 'Otros Gastos', type: 'expense' },
  ]);

  // Atajos rápidos preconfigurados (3 toques: Abrir -> Atajo -> Guardar)
  readonly presets = signal<QuickPreset[]>([
    {
      id: 'pre-1',
      label: 'Quincena $300',
      type: 'income',
      description: 'Sueldo Quincenal',
      amountCents: 30000,
      categoryId: 'cat-sueldo',
      categoryName: 'Sueldo Quincenal',
      accountId: 'acc-bolivariano',
      accountName: 'Banco Bolivariano',
    },
    {
      id: 'pre-2',
      label: 'Almuerzo $3.50',
      type: 'expense',
      description: 'Almuerzo ejecutivo',
      amountCents: 350,
      categoryId: 'cat-alimentos',
      categoryName: 'Alimentación y Transporte',
      accountId: 'acc-efectivo',
      accountName: 'Efectivo',
    },
    {
      id: 'pre-3',
      label: 'Arriendo $170',
      type: 'expense',
      description: 'Pago de arriendo mensual',
      amountCents: 17000,
      categoryId: 'cat-arriendo',
      categoryName: 'Arriendo y Servicios',
      accountId: 'acc-efectivo',
      accountName: 'Efectivo',
    },
    {
      id: 'pre-4',
      label: 'Luz $30',
      type: 'expense',
      description: 'Planilla de Luz CNEL',
      amountCents: 3000,
      categoryId: 'cat-arriendo',
      categoryName: 'Arriendo y Servicios',
      accountId: 'acc-bolivariano',
      accountName: 'Banco Bolivariano',
    },
    {
      id: 'pre-5',
      label: 'Cuota Produbanco $70',
      type: 'expense',
      description: 'Cuota préstamo Produbanco',
      amountCents: 7000,
      categoryId: 'cat-cuota',
      categoryName: 'Cuota Produbanco',
      accountId: 'acc-produbanco',
      accountName: 'Produbanco',
    },
  ]);

  // Movimientos registrados (Escenario: Ingresos $950, Gastos $420, Flujo Neto +$530)
  readonly movements = signal<Movement[]>([
    {
      id: 'mov-1',
      type: 'income',
      description: 'Bono Laboral Extra',
      amountCents: 65000,
      date: '2026-11-15',
      accountId: 'acc-bolivariano',
      accountName: 'Banco Bolivariano',
      categoryId: 'cat-bono',
      categoryName: 'Bono / Utilidades',
    },
    {
      id: 'mov-2',
      type: 'income',
      description: 'Sueldo Quincenal',
      amountCents: 30000,
      date: '2026-11-14',
      accountId: 'acc-bolivariano',
      accountName: 'Banco Bolivariano',
      categoryId: 'cat-sueldo',
      categoryName: 'Sueldo Quincenal',
    },
    {
      id: 'mov-3',
      type: 'expense',
      description: 'Pago Arriendo',
      amountCents: 17000,
      date: '2026-11-10',
      accountId: 'acc-efectivo',
      accountName: 'Efectivo',
      categoryId: 'cat-arriendo',
      categoryName: 'Arriendo y Servicios',
    },
    {
      id: 'mov-4',
      type: 'expense',
      description: 'Supermercado semanal',
      amountCents: 12000,
      date: '2026-11-08',
      accountId: 'acc-bolivariano',
      accountName: 'Banco Bolivariano',
      categoryId: 'cat-alimentos',
      categoryName: 'Alimentación y Transporte',
    },
    {
      id: 'mov-5',
      type: 'expense',
      description: 'Pago Tarjeta Diners Club',
      amountCents: 10000,
      date: '2026-11-05',
      accountId: 'acc-produbanco',
      accountName: 'Produbanco',
      categoryId: 'cat-tarjeta',
      categoryName: 'Pago Tarjeta Diners',
    },
    {
      id: 'mov-6',
      type: 'expense',
      description: 'Planilla de Luz CNEL',
      amountCents: 3000,
      date: '2026-11-02',
      accountId: 'acc-bolivariano',
      accountName: 'Banco Bolivariano',
      categoryId: 'cat-arriendo',
      categoryName: 'Arriendo y Servicios',
    },
  ]);

  // Próximos pagos (próximos 7 días)
  readonly upcomingPayments = signal<UpcomingPayment[]>([
    {
      id: 'pay-1',
      description: 'Planilla de Luz CNEL',
      amountCents: 3000,
      dueDate: '2026-11-20',
      accountName: 'Banco Bolivariano',
      status: 'due_soon',
    },
    {
      id: 'pay-2',
      description: 'Servicio de Internet Fibra',
      amountCents: 2300,
      dueDate: '2026-11-22',
      accountName: 'Banco Bolivariano',
      status: 'pending',
    },
    {
      id: 'pay-3',
      description: 'Cuota Préstamo Produbanco',
      amountCents: 7000,
      dueDate: '2026-11-24',
      accountName: 'Produbanco',
      status: 'pending',
    },
  ]);

  // Filtros persistentes para la pantalla de Movimientos (Criterio MO-01)
  readonly filterSearch = signal<string>('');
  readonly filterMonth = signal<string>('2026-11');
  readonly filterType = signal<'all' | 'income' | 'expense'>('all');

  // Estados de datos (Criterios IN-02, MO-02)
  readonly isLoading = signal<boolean>(false);
  readonly hasPartialError = signal<boolean>(false);
  readonly simulateSaveFailure = signal<boolean>(false); // Para probar resiliencia en registro

  // Computados de balance
  readonly currentAccount = computed(() => {
    const id = this.selectedAccountId();
    return this.accounts().find((a) => a.id === id) ?? this.accounts()[0];
  });

  readonly currentBalanceCents = computed(() => {
    return this.currentAccount().balanceCents;
  });

  // Resumen mensual de referencia: Ingresos $950, Gastos $420, Flujo +$530
  readonly monthSummary = computed<MonthSummary>(() => {
    const selectedAcc = this.selectedAccountId();
    const currentMonth = this.filterMonth();

    const monthlyMoves = this.movements().filter((m) => {
      const matchMonth = m.date.startsWith(currentMonth);
      const matchAcc = selectedAcc === 'all' || m.accountId === selectedAcc;
      return matchMonth && matchAcc;
    });

    let incomeCents = 0;
    let expenseCents = 0;

    for (const m of monthlyMoves) {
      if (m.type === 'income') {
        incomeCents += m.amountCents;
      } else {
        expenseCents += m.amountCents;
      }
    }

    return {
      month: currentMonth,
      incomeCents,
      expenseCents,
      netFlowCents: incomeCents - expenseCents,
    };
  });

  // Movimientos filtrados
  readonly filteredMovements = computed(() => {
    const query = this.filterSearch().trim().toLowerCase();
    const month = this.filterMonth();
    const type = this.filterType();
    const selectedAcc = this.selectedAccountId();

    return this.movements().filter((m) => {
      const matchQuery = !query || m.description.toLowerCase().includes(query) || m.categoryName.toLowerCase().includes(query);
      const matchMonth = !month || m.date.startsWith(month);
      const matchType = type === 'all' || m.type === type;
      const matchAcc = selectedAcc === 'all' || m.accountId === selectedAcc;

      return matchQuery && matchMonth && matchType && matchAcc;
    });
  });

  // Acciones de estado
  setSelectedAccount(id: string): void {
    this.selectedAccountId.set(id);
  }

  setFilters(search: string, month: string, type: 'all' | 'income' | 'expense'): void {
    this.filterSearch.set(search);
    this.filterMonth.set(month);
    this.filterType.set(type);
  }

  clearFilters(): void {
    this.filterSearch.set('');
    this.filterMonth.set('2026-11');
    this.filterType.set('all');
  }

  /**
   * Guarda o actualiza un movimiento con manejo de error simulable y actualización de balances.
   */
  async saveMovement(payload: {
    id?: string;
    type: MovementType;
    description: string;
    amountCents: number;
    date: string;
    accountId: string;
    categoryId: string;
    note?: string;
  }): Promise<Movement> {
    // Si se activa la simulación de falla (Criterio RE-02), simular error de red
    if (this.simulateSaveFailure()) {
      throw new Error('Error de conexión con el servidor. Se conservaron los datos ingresados.');
    }

    const account = this.accounts().find((a) => a.id === payload.accountId) || this.accounts()[1];
    const category = this.categories().find((c) => c.id === payload.categoryId) || this.categories()[0];

    const movement: Movement = {
      id: payload.id || `mov-${Date.now()}`,
      type: payload.type,
      description: payload.description,
      amountCents: Math.round(payload.amountCents),
      date: payload.date,
      accountId: account.id,
      accountName: account.name,
      categoryId: category.id,
      categoryName: category.name,
      note: payload.note,
    };

    if (payload.id) {
      // Edición
      this.movements.update((list) =>
        list.map((m) => (m.id === payload.id ? movement : m)),
      );
    } else {
      // Nuevo movimiento
      this.movements.update((list) => [movement, ...list]);

      // Actualizar balance de la cuenta
      const delta = movement.type === 'income' ? movement.amountCents : -movement.amountCents;
      this.accounts.update((accs) =>
        accs.map((acc) => {
          if (acc.id === movement.accountId) {
            return { ...acc, balanceCents: acc.balanceCents + delta };
          }
          if (acc.id === 'all') {
            return { ...acc, balanceCents: acc.balanceCents + delta };
          }
          return acc;
        }),
      );
    }

    return movement;
  }

  deleteMovement(id: string): void {
    const toDelete = this.movements().find((m) => m.id === id);
    if (!toDelete) return;

    this.movements.update((list) => list.filter((m) => m.id !== id));

    // Revertir balance
    const delta = toDelete.type === 'income' ? -toDelete.amountCents : toDelete.amountCents;
    this.accounts.update((accs) =>
      accs.map((acc) => {
        if (acc.id === toDelete.accountId || acc.id === 'all') {
          return { ...acc, balanceCents: acc.balanceCents + delta };
        }
        return acc;
      }),
    );
  }
}
