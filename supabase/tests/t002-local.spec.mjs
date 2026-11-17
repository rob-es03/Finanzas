import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { PGlite } from '@electric-sql/pglite';

const migration = await readFile(process.argv[2] ?? new URL('./migration.sql', import.meta.url), 'utf8');
const alice = '00000000-0000-4000-8000-000000000001';
const bob = '00000000-0000-4000-8000-000000000002';

test('migración de perfiles, cuentas y categorías en PostgreSQL local', async (t) => {
  const db = new PGlite();
  t.after(() => db.close());
  const rows = async (sql, params) => (await db.query(sql, params)).rows;

  // Emula únicamente el contrato de Supabase Auth que usa la migración.
  await db.exec(`
    CREATE ROLE anon;
    CREATE ROLE authenticated;
    CREATE SCHEMA auth;
    CREATE TABLE auth.users (id uuid PRIMARY KEY, email text, raw_user_meta_data jsonb);
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE
      AS $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    GRANT USAGE ON SCHEMA auth, public TO anon, authenticated;
  `);

  const [engine] = await rows('SELECT version() AS postgres');
  t.diagnostic(engine.postgres);
  await t.test('aplica desde cero y activa RLS en las tres tablas', async () => {
    await db.exec(migration);
    const tables = await rows(`
      SELECT relname, relrowsecurity FROM pg_class
      WHERE relnamespace = 'public'::regnamespace AND relkind = 'r'
      ORDER BY relname
    `);
    assert.deepEqual(tables, ['accounts', 'categories', 'profiles'].map(
      relname => ({ relname, relrowsecurity: true }),
    ));
  });

  // Concede privilegios de tabla para comprobar el efecto de las políticas RLS.
  await db.exec('GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated');
  await db.query(
    'INSERT INTO auth.users (id, email) VALUES ($1, $2), ($3, $4)',
    [alice, 'alice@example.test', bob, 'bob@example.test'],
  );

  async function asUser(userId) {
    await db.exec('RESET ROLE; SET ROLE authenticated');
    await db.query("SELECT set_config('request.jwt.claim.sub', $1, false)", [userId]);
  }

  const count = async (table) => (await rows(`SELECT count(*)::int AS count FROM public.${table}`))[0].count;
  for (const [user, other] of [[alice, bob], [bob, alice]]) {
    await t.test(`usuario ${user.slice(-1)} solo ve su perfil y sus categorías sembradas`, async () => {
      await asUser(user);
      assert.deepEqual(await rows('SELECT id FROM public.profiles'), [{ id: user }]);
      assert.deepEqual(await rows('SELECT DISTINCT user_id FROM public.categories'), [{ user_id: user }]);
      assert.equal(await count('categories'), 12);
    });

    await t.test(`usuario ${user.slice(-1)} ejerce CRUD propio sobre cuentas y categorías`, async () => {
      await asUser(user);
      for (const [table, type] of [['accounts', 'cash'], ['categories', 'expense']]) {
        const [{ id }] = await rows(
          `INSERT INTO public.${table} (user_id, name, type) VALUES ($1, $2, $3) RETURNING id`,
          [user, 'Temporal', type],
        );
        assert.deepEqual(
          await rows(`UPDATE public.${table} SET name = 'Editada' WHERE id = $1 RETURNING name`, [id]),
          [{ name: 'Editada' }],
        );
        assert.deepEqual(await rows(`DELETE FROM public.${table} WHERE id = $1 RETURNING id`, [id]), [{ id }]);
      }
    });

    await t.test(`usuario ${user.slice(-1)} no puede gestionar filas de otro propietario`, async () => {
      await asUser(other);
      const [{ id: otherAccount }] = await rows(
        "INSERT INTO public.accounts (user_id, name, type) VALUES ($1, 'Ajena', 'cash') RETURNING id",
        [other],
      );
      await asUser(user);
      for (const [table, predicate, id, field] of [
        ['profiles', 'id', other, 'full_name'],
        ['categories', 'user_id', other, 'name'],
        ['accounts', 'id', otherAccount, 'name'],
      ]) {
        assert.deepEqual(await rows(`SELECT * FROM public.${table} WHERE ${predicate} = $1`, [id]), []);
        assert.deepEqual(
          await rows(`UPDATE public.${table} SET ${field} = 'Editada' WHERE ${predicate} = $1 RETURNING id`, [id]),
          [],
        );
        assert.deepEqual(await rows(`DELETE FROM public.${table} WHERE ${predicate} = $1 RETURNING id`, [id]), []);
      }
      for (const [table, type] of [['accounts', 'cash'], ['categories', 'expense']]) {
        await assert.rejects(
          db.query(`INSERT INTO public.${table} (user_id, name, type) VALUES ($1, 'Temporal', $2)`, [other, type]),
          { code: '42501' },
        );
      }
      await assert.rejects(
        db.query("INSERT INTO public.profiles (id, email) VALUES ($1, 'other@example.test')", [other]),
        { code: '42501' },
      );
    });
  }

  await t.test('anon no ve filas de ninguna de las tres tablas', async () => {
    await db.exec("RESET ROLE; SET ROLE anon; SELECT set_config('request.jwt.claim.sub', '', false)");
    for (const table of ['profiles', 'accounts', 'categories']) assert.equal(await count(table), 0);
  });

  await t.test('saldos iniciales conservan centavos, signo, cero y precisión de BIGINT', async () => {
    await asUser(alice);
    await db.query(`
      INSERT INTO public.accounts (user_id, name, type, initial_balance_cents)
      VALUES ($1, 'Positivo', 'cash', 10025), ($1, 'Negativo', 'credit_card', -4010),
             ($1, 'Grande', 'bank', 9007199254740993)
    `, [alice]);
    await db.query("INSERT INTO public.accounts (user_id, name, type) VALUES ($1, 'Predeterminado', 'savings')", [alice]);
    assert.deepEqual(await rows(`
      SELECT name, initial_balance_cents::text AS cents, pg_typeof(initial_balance_cents)::text AS type
      FROM public.accounts WHERE name <> 'Ajena' ORDER BY name COLLATE "C"
    `), [
      { name: 'Grande', cents: '9007199254740993', type: 'bigint' },
      { name: 'Negativo', cents: '-4010', type: 'bigint' },
      { name: 'Positivo', cents: '10025', type: 'bigint' },
      { name: 'Predeterminado', cents: '0', type: 'bigint' },
    ]);
    assert.deepEqual(await rows('SELECT sum(initial_balance_cents)::text AS total FROM public.accounts'),
      [{ total: '9007199254747008' }]);
  });
});
