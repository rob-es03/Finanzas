# Tareas

Una tarea por archivo: `T-XXX-<slug>.md`. Formato obligatorio:
ID · Título · Responsable · Dependencias · Archivos permitidos · Descripción · Criterios de aceptación · Pruebas requeridas · Riesgos · Estado.

Estados: `propuesta` → `en curso` → `en revisión` → `terminada` (según la Definición de Terminado de `AGENTS.md`) o `bloqueada`.

| ID | Título | Responsable | Depende de | Estado |
|---|---|---|---|---|
| T-001 | Scaffold Angular + Ionic + Capacitor | Claude Code | — | propuesta |
| T-002 | Esquema PostgreSQL, RLS y contratos de tipos | Claude Code | — | propuesta |
| T-003 | Google Sign-In con Supabase Auth (web + Android) | Claude Code | T-001, T-002 | propuesta |
| T-010 | Auditoría del prototipo y plan de pruebas | Codex | — | propuesta |
| T-011 | Pruebas de utilidades monetarias y de RLS | Codex | T-002 | propuesta |
| T-020 | Design system y mapa de pantallas | Antigravity | — | propuesta |
| T-021 | Pantallas del panel y de movimientos (maquetas) | Antigravity | T-020 | absorbida por T-030 |
| T-030 | Sistema de diseño Modern Banking | Antigravity | directiva de diseño | propuesta |
| T-031 | Revisar y aplicar la migración inicial | Claude Code | autorización humana | bloqueada |
| T-032 | Corregir los 3 errores de lint | Antigravity | — | propuesta |
