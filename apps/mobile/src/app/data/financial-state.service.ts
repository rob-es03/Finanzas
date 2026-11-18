import { Injectable, computed, inject, signal } from '@angular/core';
import {
  AccountOption,
  MonthSummary,
  Movement,
  MovementType,
  QuickPreset,
  UpcomingPayment,
} from '@finanzas/contracts';
import { FinanceRepository } from './finance.repository';

/** Mes actual en formato YYYY-MM, según la zona horaria del dispositivo. */
function mesActual(): string {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Estado financiero de la pantalla, alimentado desde Supabase.
 *
 * Antes contenía datos de ejemplo escritos a mano: cuentas, categorías y
 * movimientos de una persona concreta, con sus bancos y acreedores reales.
 * Eso servía para maquetar, pero no es lo que debe ver nadie que entre con su
 * cuenta, y menos en un repositorio público. Ahora todo sale de la base, con
 * RLS, y una cuenta nueva empieza vacía y lo dice.
 */
@Injectable({ providedIn: 'root' })
export class FinancialStateService {
  private readonly repo = inject(FinanceRepository);

  /** Cuentas reales del usuario. La opción «Todas» se añade al cargar. */
  readonly accounts = signal<AccountOption[]>([]);
  readonly selectedAccountId = signal<string>('all');

  readonly categories = signal<{ id: string; name: string; type: MovementType }[]>([]);

  /**
   * Atajos rápidos. Vacío por ahora: los del prototipo eran los pagos
   * concretos de una persona. El requisito R-03 pide que cada usuario
   * configure los suyos; mientras tanto, el registro manual sigue disponible.
   */
  readonly presets = signal<QuickPreset[]>([]);

  readonly movements = signal<Movement[]>([]);
  readonly upcomingPayments = signal<UpcomingPayment[]>([]);

  readonly filterSearch = signal<string>('');
  readonly filterMonth = signal<string>(mesActual());
  readonly filterType = signal<'all' | 'income' | 'expense'>('all');

  readonly isLoading = signal<boolean>(false);
  readonly hasPartialError = signal<boolean>(false);
  readonly loadError = signal<string | null>(null);
  /** Se conserva para las pruebas de resiliencia del formulario de registro. */
  readonly simulateSaveFailure = signal<boolean>(false);

  /** True cuando el usuario todavía no tiene ninguna cuenta creada. */
  readonly hasNoAccounts = computed(() => this.accounts().filter((a) => a.id !== 'all').length === 0);

  readonly currentAccount = computed(() => {
    const id = this.selectedAccountId();
    return (
      this.accounts().find((a) => a.id === id) ??
      this.accounts()[0] ?? {
        id: 'all',
        name: 'Todas las cuentas',
        type: 'bank' as const,
        balanceCents: 0,
      }
    );
  });

  readonly currentBalanceCents = computed(() => this.currentAccount().balanceCents);

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

  readonly filteredMovements = computed(() => {
    const query = this.filterSearch().trim().toLowerCase();
    const month = this.filterMonth();
    const type = this.filterType();
    const selectedAcc = this.selectedAccountId();

    return this.movements().filter((m) => {
      const matchQuery =
        !query ||
        m.description.toLowerCase().includes(query) ||
        m.categoryName.toLowerCase().includes(query);
      const matchMonth = !month || m.date.startsWith(month);
      const matchType = type === 'all' || m.type === type;
      const matchAcc = selectedAcc === 'all' || m.accountId === selectedAcc;

      return matchQuery && matchMonth && matchType && matchAcc;
    });
  });

  /**
   * Carga el estado desde la base.
   * Un bloque que falle no tumba la pantalla entera: se marca error parcial y
   * el resto sigue mostrándose, como pide la especificación de Inicio.
   */
  async load(): Promise<void> {
    this.isLoading.set(true);
    this.hasPartialError.set(false);
    this.loadError.set(null);

    // Cuentas y categorías primero: sus nombres resuelven los de cada
    // movimiento sin pedirle a PostgREST un embebido sobre claves compuestas.
    const [cuentas, categorias, proximos] = await Promise.allSettled([
      this.repo.getAccounts(),
      this.repo.getCategories(),
      this.repo.getUpcomingPayments(),
    ]);

    const nombreCuentas = new Map(
      cuentas.status === 'fulfilled' ? cuentas.value.map((c) => [c.id, c.name] as const) : [],
    );
    const nombreCategorias = new Map(
      categorias.status === 'fulfilled'
        ? categorias.value.map((c) => [c.id, c.name] as const)
        : [],
    );

    const movimientos = await Promise.allSettled([
      this.repo.getMovements(nombreCuentas, nombreCategorias),
    ]).then((r) => r[0]);

    if (cuentas.status === 'fulfilled') {
      const propias = cuentas.value;
      const total = propias.reduce((suma, c) => suma + c.balanceCents, 0);
      this.accounts.set([
        { id: 'all', name: 'Todas las cuentas', type: 'bank', balanceCents: total },
        ...propias,
      ]);
      if (!this.accounts().some((c) => c.id === this.selectedAccountId())) {
        this.selectedAccountId.set('all');
      }
    } else {
      this.hasPartialError.set(true);
      this.loadError.set(cuentas.reason?.message ?? 'No se pudieron cargar las cuentas.');
    }

    if (categorias.status === 'fulfilled') {
      this.categories.set(categorias.value);
    } else {
      this.hasPartialError.set(true);
    }

    if (movimientos.status === 'fulfilled') {
      this.movements.set(movimientos.value);
    } else {
      this.hasPartialError.set(true);
    }

    if (proximos.status === 'fulfilled') {
      this.upcomingPayments.set(proximos.value);
    } else {
      this.hasPartialError.set(true);
    }

    this.isLoading.set(false);
  }

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
    this.filterMonth.set(mesActual());
    this.filterType.set('all');
  }

  /** Crea la primera cuenta del usuario. */
  async createAccount(
    nombre: string,
    tipo: AccountOption['type'] = 'bank',
    saldoInicialCents = 0,
  ): Promise<void> {
    await this.repo.createAccount(nombre, tipo, saldoInicialCents);
    await this.load();
  }

  /**
   * Guarda o actualiza un movimiento en la base y recarga el estado para que
   * los saldos vengan calculados por PostgreSQL, no sumados en el cliente.
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
    if (this.simulateSaveFailure()) {
      throw new Error('Error de conexión con el servidor. Se conservaron los datos ingresados.');
    }

    const cuentaDestino =
      payload.accountId && payload.accountId !== 'all'
        ? payload.accountId
        : this.accounts().find((a) => a.id !== 'all')?.id;

    if (!cuentaDestino) {
      throw new Error('Primero crea una cuenta para registrar movimientos.');
    }

    const datos = {
      type: payload.type,
      description: payload.description.trim(),
      amountCents: Math.round(payload.amountCents),
      date: payload.date,
      accountId: cuentaDestino,
      categoryId: payload.categoryId || null,
      note: payload.note,
    };

    const id = payload.id
      ? (await this.repo.updateMovement(payload.id, datos), payload.id)
      : await this.repo.insertMovement(datos);

    await this.load();

    return (
      this.movements().find((m) => m.id === id) ?? {
        id,
        type: datos.type,
        description: datos.description,
        amountCents: datos.amountCents,
        date: datos.date,
        accountId: datos.accountId,
        accountName: this.accounts().find((a) => a.id === datos.accountId)?.name ?? 'Cuenta',
        categoryId: datos.categoryId ?? '',
        categoryName:
          this.categories().find((c) => c.id === datos.categoryId)?.name ?? 'Sin categoría',
        note: datos.note,
      }
    );
  }

  async deleteMovement(id: string): Promise<void> {
    await this.repo.deleteMovement(id);
    await this.load();
  }
}
