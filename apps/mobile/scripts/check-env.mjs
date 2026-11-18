/**
 * Comprueba que este worktree apunta a la base compartida del equipo (D-018).
 *
 * Existe porque durante la sesión del 2026-11-17 dos agentes probaron contra
 * bases distintas sin darse cuenta: uno contra el proyecto en la nube y otro
 * contra un stack local. El primer login falló con «provider is not enabled»
 * y costó un rato entender por qué. Un resultado obtenido contra otra base no
 * es comparable con el de los demás.
 *
 * Uso:  node scripts/check-env.mjs
 * Falla con código 1 si la configuración no apunta a la base compartida.
 */
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const archivo = resolve(raiz, 'src/environments/environment.ts');
const ESPERADO = 'https://ujalaluhmtwevqhnzivo.supabase.co';

if (!existsSync(archivo)) {
  console.error('✗ Falta src/environments/environment.ts');
  console.error('  Copia environment.example.ts y rellena la anon key (Supabase → Settings → API).');
  process.exit(1);
}

const contenido = readFileSync(archivo, 'utf8');
const url = contenido.match(/supabaseUrl:\s*'([^']*)'/)?.[1] ?? '';
const anon = contenido.match(/supabaseAnonKey:\s*'([^']*)'/)?.[1] ?? '';

if (url !== ESPERADO) {
  console.error(`✗ supabaseUrl apunta a: ${url || '(vacío)'}`);
  console.error(`  La base compartida del equipo es: ${ESPERADO}`);
  console.error('  Ver docs/ops/BASE-DE-DATOS.md (decisión D-018).');
  process.exit(1);
}

if (!anon || anon.startsWith('REEMPLAZAR')) {
  console.error('✗ Falta la anon key en environment.ts (Supabase → Settings → API).');
  process.exit(1);
}

console.log(`✓ Apuntando a la base compartida (${ESPERADO})`);
