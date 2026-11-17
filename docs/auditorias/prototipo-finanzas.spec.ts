import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { createContext, runInContext } from 'node:vm';

const html = readFileSync(new URL('../../finanzas_nicolle.html', import.meta.url), 'utf8');
const script = html.slice(html.lastIndexOf('<script>') + '<script>'.length, html.lastIndexOf('</script>'));
const bootstrap = /setFormType\('income'\);\s*setCurrentMonth\(\);\s*$/;
assert.match(script, bootstrap);

function openPrototype() {
  const fields = new Map<string, { value: string; textContent?: string; innerHTML?: string }>();
  const storage = new Map<string, string>();
  const originalSource = script.replace(bootstrap, 'renderChart = () => {}; renderTable = () => {};');
  const document = {
    getElementById(id: string) {
      if (!fields.has(id)) fields.set(id, { value: '' });
      return fields.get(id)!;
    },
  };
  const context = createContext({
    document,
    localStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
    },
  });
  runInContext(originalSource, context);
  return {
    field: document.getElementById,
    add(type: 'income' | 'expense', amount: string, date: string) {
      document.getElementById('txDesc').value = 'Movimiento de prueba';
      document.getElementById('txAmount').value = amount;
      document.getElementById('txDate').value = date;
      document.getElementById('txAccount').value = 'Efectivo';
      runInContext(`currentFormType = '${type}'; addTransaction({ preventDefault() {} });`, context);
    },
    count: () => runInContext('getTransactions().length', context),
  };
}

test('el resumen mensual excluye otros meses y el saldo de cuenta conserva el histórico', () => {
  const app = openPrototype();
  app.field('monthFilter').value = '2026-11';
  app.add('income', '25.00', '2026-10-31');
  app.add('income', '100.25', '2026-11-01');
  app.add('expense', '40.10', '2026-11-17');

  assert.equal(app.count(), 3);
  assert.equal(app.field('totalIncome').textContent, '$100.25');
  assert.equal(app.field('totalExpense').textContent, '$40.10');
  assert.equal(app.field('netBalance').textContent, '$60.15');
  assert.match(app.field('accountBalances').innerHTML ?? '', /Efectivo:[\s\S]*\$85\.15/);
});

test('un monto cero o negativo no se persiste como movimiento', () => {
  const app = openPrototype();
  app.add('income', '0', '2026-11-17');
  app.add('expense', '-10.50', '2026-11-17');

  assert.equal(app.count(), 0);
});
