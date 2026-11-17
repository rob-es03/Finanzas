# T-010 · Auditoría del prototipo y plan de pruebas
- **Responsable**: Codex
- **Dependencias**: ninguna
- **Archivos permitidos**: `docs/auditorias/**`, `docs/tareas/T-010-*.md`
- **Estado**: propuesta

## Descripción
Auditoría independiente de `finanzas_nicolle.html` (solo lectura, no modificar) y de la documentación creada en Fase 0. Catalogar defectos de seguridad, de cálculo y de pérdida de datos, confirmando o refutando la lista `D-01..D-11` de `docs/requisitos.md` con referencias a línea. Proponer el plan de pruebas del proyecto: unitarias de lógica financiera, de RLS, de integración y E2E, con las herramientas sugeridas y su justificación.

## Criterios de aceptación
1. Cada defecto reportado cita archivo y línea y describe cómo se manifiesta.
2. Se señalan los defectos que la lista actual omite o describe mal.
3. El plan de pruebas cubre dinero en centavos, agregaciones mensuales con zona horaria, aislamiento por usuario y migración de datos.
4. Ningún archivo fuente histórico modificado.

## Entregable
`docs/auditorias/2026-11-auditoria-prototipo.md` y una propuesta de tareas `test/*`.
