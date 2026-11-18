import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { FinancialStateService } from './financial-state.service';

describe('FinancialStateService (Criterios IN, MO, RE)', () => {
  let service: FinancialStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FinancialStateService],
    });
    service = TestBed.inject(FinancialStateService);
  });

  describe('Criterio IN-01 & IN-02: Inicio, Balances y Flujo Neto', () => {
    it('debe iniciar con el saldo de referencia en cuentas de $1,280.50 (128050 centavos)', () => {
      expect(service.currentBalanceCents()).toBe(128050);
      expect(service.currentAccount().name).toBe('Todas las cuentas');
    });

    it('cambiar de cuenta debe actualizar el saldo y conservar el alcance visible', () => {
      service.setSelectedAccount('acc-bolivariano');
      expect(service.currentAccount().name).toBe('Banco Bolivariano');
      expect(service.currentBalanceCents()).toBe(85050); // $850.50

      service.setSelectedAccount('acc-efectivo');
      expect(service.currentAccount().name).toBe('Efectivo');
      expect(service.currentBalanceCents()).toBe(10000); // $100.00
    });

    it('debe calcular el resumen mensual de referencia: Ingresos $950, Gastos $420, Flujo +$530', () => {
      const summary = service.monthSummary();
      expect(summary.incomeCents).toBe(95000); // $950.00
      expect(summary.expenseCents).toBe(42000); // $420.00
      expect(summary.netFlowCents).toBe(53000); // +$530.00
    });

    it('debe entregar los 3 proximos pagos ordenados para los proximos 7 dias', () => {
      const upcoming = service.upcomingPayments();
      expect(upcoming.length).toBe(3);
      expect(upcoming[0].description).toContain('Luz');
      expect(upcoming[1].description).toContain('Internet');
      expect(upcoming[2].description).toContain('Produbanco');
    });
  });

  describe('Criterio MO-01 & MO-02: Movimientos, Búsqueda y Filtros', () => {
    it('debe filtrar por busqueda de texto insensible a mayusculas', () => {
      service.filterSearch.set('luz');
      const filtered = service.filteredMovements();
      expect(filtered.length).toBe(1);
      expect(filtered[0].description).toBe('Planilla de Luz CNEL');
    });

    it('debe filtrar por tipo de movimiento (ingreso / gasto)', () => {
      service.filterType.set('income');
      const incomes = service.filteredMovements();
      expect(incomes.every((m) => m.type === 'income')).toBe(true);
      expect(incomes.length).toBe(2); // Sueldo y Bono

      service.filterType.set('expense');
      const expenses = service.filteredMovements();
      expect(expenses.every((m) => m.type === 'expense')).toBe(true);
      expect(expenses.length).toBe(4);
    });

    it('debe distinguir busqueda sin coincidencias y permitir limpiar filtros', () => {
      service.filterSearch.set('termino_inexistente_xyz');
      expect(service.filteredMovements().length).toBe(0);

      service.clearFilters();
      expect(service.filterSearch()).toBe('');
      expect(service.filterType()).toBe('all');
      expect(service.filteredMovements().length).toBe(6);
    });
  });

  describe('Criterio RE-01 & RE-02: Registro Rápido y Resiliencia ante Fallos', () => {
    it('debe registrar un movimiento y actualizar el balance en centavos', async () => {
      const initialBalance = service.currentBalanceCents();

      const newMov = await service.saveMovement({
        type: 'expense',
        description: 'Café de prueba',
        amountCents: 250, // $2.50
        date: '2026-11-17',
        accountId: 'acc-bolivariano',
        categoryId: 'cat-alimentos',
      });

      expect(newMov.amountCents).toBe(250);
      expect(service.movements()[0].description).toBe('Café de prueba');
      // El balance total debe reducirse en 250 centavos
      expect(service.currentBalanceCents()).toBe(initialBalance - 250);
    });

    it('debe conservar los datos y lanzar error cuando simulateSaveFailure esta activo', async () => {
      service.simulateSaveFailure.set(true);

      await expect(
        service.saveMovement({
          type: 'expense',
          description: 'Intento fallido',
          amountCents: 500,
          date: '2026-11-17',
          accountId: 'acc-efectivo',
          categoryId: 'cat-alimentos',
        }),
      ).rejects.toThrow('Error de conexión con el servidor. Se conservaron los datos ingresados.');
    });
  });
});
