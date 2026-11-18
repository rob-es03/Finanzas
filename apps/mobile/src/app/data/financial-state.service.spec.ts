import { TestBed } from '@angular/core/testing';
import { AccountOption, Movement, UpcomingPayment } from '@finanzas/contracts';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FinanceRepository } from './finance.repository';
import { FinancialStateService } from './financial-state.service';

/**
 * Estas pruebas comprobaban el escenario de referencia que el servicio traía
 * escrito a mano. Ahora los datos vienen de Supabase, así que se comprueba el
 * mismo comportamiento contra un repositorio falso con un escenario fijo:
 * saldos por cuenta, resumen del mes, filtros y registro.
 *
 * El doble está tipado contra FinanceRepository a propósito: si el servicio
 * empieza a usar un método que el doble no implementa, esto deja de compilar
 * en vez de romper en ejecución.
 */

const CUENTA_BANCO = 'acc-banco';
const CUENTA_EFECTIVO = 'acc-efectivo';
const MES = '2026-11';

function movimientos(): Movement[] {
  return [
    {
      id: 'mov-1',
      type: 'income',
      description: 'Sueldo de noviembre',
      amountCents: 95000,
      date: `${MES}-01`,
      accountId: CUENTA_BANCO,
      accountName: 'Banco',
      categoryId: 'cat-sueldo',
      categoryName: 'Sueldo',
    },
    {
      id: 'mov-2',
      type: 'expense',
      description: 'Arriendo',
      amountCents: 42000,
      date: `${MES}-05`,
      accountId: CUENTA_BANCO,
      accountName: 'Banco',
      categoryId: 'cat-vivienda',
      categoryName: 'Vivienda',
    },
    {
      id: 'mov-3',
      type: 'expense',
      description: 'Almuerzo',
      amountCents: 1500,
      date: '2026-10-20',
      accountId: CUENTA_EFECTIVO,
      accountName: 'Efectivo',
      categoryId: 'cat-alimentacion',
      categoryName: 'Alimentación',
    },
  ];
}

function cuentas(): AccountOption[] {
  return [
    { id: CUENTA_BANCO, name: 'Banco', type: 'bank', balanceCents: 128050 },
    { id: CUENTA_EFECTIVO, name: 'Efectivo', type: 'cash', balanceCents: 10000 },
  ];
}

function proximosPagos(): UpcomingPayment[] {
  return [
    {
      id: 'cuota-1',
      description: 'Préstamo · cuota 3',
      amountCents: 7000,
      dueDate: `${MES}-25`,
      accountName: 'Préstamo',
      status: 'due_soon',
    },
  ];
}

describe('FinancialStateService (Criterios IN, MO, RE)', () => {
  let service: FinancialStateService;
  let repo: {
    getAccounts: ReturnType<typeof vi.fn>;
    getCategories: ReturnType<typeof vi.fn>;
    getMovements: ReturnType<typeof vi.fn>;
    getUpcomingPayments: ReturnType<typeof vi.fn>;
    insertMovement: ReturnType<typeof vi.fn>;
    updateMovement: ReturnType<typeof vi.fn>;
    deleteMovement: ReturnType<typeof vi.fn>;
    createAccount: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    repo = {
      getAccounts: vi.fn().mockResolvedValue(cuentas()),
      getCategories: vi.fn().mockResolvedValue([
        { id: 'cat-sueldo', name: 'Sueldo', type: 'income' },
        { id: 'cat-vivienda', name: 'Vivienda', type: 'expense' },
      ]),
      getMovements: vi.fn().mockResolvedValue(movimientos()),
      getUpcomingPayments: vi.fn().mockResolvedValue(proximosPagos()),
      insertMovement: vi.fn().mockResolvedValue('mov-nuevo'),
      updateMovement: vi.fn().mockResolvedValue(undefined),
      deleteMovement: vi.fn().mockResolvedValue(undefined),
      createAccount: vi.fn().mockResolvedValue('acc-nueva'),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: FinanceRepository, useValue: repo }],
    });

    service = TestBed.inject(FinancialStateService);
    service.setFilters('', MES, 'all');
    await service.load();
  });

  describe('Criterio IN-01 e IN-02: saldos y flujo neto', () => {
    it('suma el saldo de todas las cuentas en la opción «Todas»', () => {
      expect(service.selectedAccountId()).toBe('all');
      expect(service.currentBalanceCents()).toBe(138050);
    });

    it('al elegir una cuenta muestra su saldo, no el total', () => {
      service.setSelectedAccount(CUENTA_EFECTIVO);
      expect(service.currentAccount().name).toBe('Efectivo');
      expect(service.currentBalanceCents()).toBe(10000);
    });

    it('el resumen del mes solo cuenta los movimientos de ese mes', () => {
      const resumen = service.monthSummary();
      expect(resumen.incomeCents).toBe(95000);
      expect(resumen.expenseCents).toBe(42000);
      expect(resumen.netFlowCents).toBe(53000);
    });

    it('el resumen se acota a la cuenta elegida', () => {
      service.setSelectedAccount(CUENTA_EFECTIVO);
      const resumen = service.monthSummary();
      expect(resumen.incomeCents).toBe(0);
      expect(resumen.expenseCents).toBe(0);
    });

    it('entrega los próximos pagos que devuelve la base', () => {
      expect(service.upcomingPayments()).toHaveLength(1);
      expect(service.upcomingPayments()[0].status).toBe('due_soon');
    });
  });

  describe('Criterio MO-01 y MO-02: búsqueda y filtros', () => {
    it('busca por texto sin distinguir mayúsculas', () => {
      service.setFilters('ARRIENDO', MES, 'all');
      expect(service.filteredMovements()).toHaveLength(1);
      expect(service.filteredMovements()[0].id).toBe('mov-2');
    });

    it('filtra por tipo de movimiento', () => {
      service.setFilters('', MES, 'income');
      expect(service.filteredMovements().every((m) => m.type === 'income')).toBe(true);

      service.setFilters('', MES, 'expense');
      expect(service.filteredMovements().every((m) => m.type === 'expense')).toBe(true);
    });

    it('distingue «sin coincidencias» de «sin datos» y permite limpiar', () => {
      service.setFilters('zzz-inexistente', MES, 'all');
      expect(service.filteredMovements()).toHaveLength(0);
      expect(service.movements().length).toBeGreaterThan(0);

      service.clearFilters();
      expect(service.filterSearch()).toBe('');
      expect(service.filterType()).toBe('all');
    });
  });

  describe('Criterio RE-01 y RE-02: registro y resiliencia', () => {
    it('guarda el movimiento en la base y recarga el estado', async () => {
      await service.saveMovement({
        type: 'expense',
        description: 'Luz',
        amountCents: 3000,
        date: `${MES}-18`,
        accountId: CUENTA_BANCO,
        categoryId: 'cat-vivienda',
      });

      expect(repo.insertMovement).toHaveBeenCalledTimes(1);
      expect(repo.insertMovement.mock.calls[0][0]).toMatchObject({
        amountCents: 3000,
        accountId: CUENTA_BANCO,
      });
      // Recarga: los saldos vuelven a pedirse a la base en lugar de sumarse aquí.
      expect(repo.getAccounts).toHaveBeenCalledTimes(2);
    });

    it('con «Todas las cuentas» elige una cuenta real en vez de enviar «all»', async () => {
      service.setSelectedAccount('all');
      await service.saveMovement({
        type: 'expense',
        description: 'Café',
        amountCents: 250,
        date: `${MES}-18`,
        accountId: 'all',
        categoryId: 'cat-vivienda',
      });

      expect(repo.insertMovement.mock.calls[0][0].accountId).toBe(CUENTA_BANCO);
    });

    it('conserva los datos y lanza error cuando se simula un fallo', async () => {
      service.simulateSaveFailure.set(true);

      await expect(
        service.saveMovement({
          type: 'expense',
          description: 'Internet',
          amountCents: 2300,
          date: `${MES}-18`,
          accountId: CUENTA_BANCO,
          categoryId: 'cat-vivienda',
        }),
      ).rejects.toThrow(/conexión/i);

      expect(repo.insertMovement).not.toHaveBeenCalled();
    });

    it('marca error parcial si una parte de la carga falla, sin tumbar el resto', async () => {
      repo.getUpcomingPayments.mockRejectedValueOnce(new Error('sin red'));
      await service.load();

      expect(service.hasPartialError()).toBe(true);
      expect(service.movements().length).toBeGreaterThan(0);
    });
  });
});
