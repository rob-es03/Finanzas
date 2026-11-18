import { describe, expect, it } from 'vitest';
import { MoneyPipe } from './money.pipe';

describe('MoneyPipe (Formato Monetario en Centavos)', () => {
  const pipe = new MoneyPipe();

  it('debe formatear centavos enteros a dolares con 2 decimales en locale es-EC', () => {
    expect(pipe.transform(128050)).toBe('$1.280,50');
    expect(pipe.transform(0)).toBe('$0,00');
    expect(pipe.transform(50)).toBe('$0,50');
  });

  it('debe manejar importes negativos con signo visible', () => {
    expect(pipe.transform(-42000)).toBe('-$420,00');
  });

  it('debe agregar signo positivo cuando forceSign es true', () => {
    expect(pipe.transform(53000, { forceSign: true })).toBe('+$530,00');
  });

  it('debe devolver $0.00 ante valores nulos o indefinidos', () => {
    expect(pipe.transform(null)).toBe('$0.00');
    expect(pipe.transform(undefined)).toBe('$0.00');
  });
});
