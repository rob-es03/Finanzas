import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe de formato monetario compartido para el dominio financiero en centavos enteros.
 * Cumple con AGENTS.md regla 6 y docs/design/DESIGN_SYSTEM.md:
 * - Entrada: importe en centavos enteros (BIGINT / integer).
 * - Salida: USD con locale es-EC y 2 decimales exactos.
 * - Soporta inclusión de signo explícito (+/-) para ingresos/gastos y flujo neto.
 */
@Pipe({
  name: 'money',
  standalone: true,
})
export class MoneyPipe implements PipeTransform {
  transform(
    cents: number | bigint | null | undefined,
    options: {
      currency?: string;
      showSign?: boolean;
      forceSign?: boolean;
    } = {},
  ): string {
    if (cents === null || cents === undefined || isNaN(Number(cents))) {
      return '$0.00';
    }

    const totalCents = typeof cents === 'bigint' ? Number(cents) : cents;
    const isNegative = totalCents < 0;
    const absDollars = Math.abs(totalCents) / 100;

    // Formatear con 2 decimales y separador de miles
    const formatted = absDollars.toLocaleString('es-EC', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    if (isNegative) {
      return `-$${formatted}`;
    }

    if (options.forceSign && totalCents > 0) {
      return `+$${formatted}`;
    }

    return `$${formatted}`;
  }
}
