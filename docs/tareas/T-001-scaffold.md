# T-001 · Scaffold Angular + Ionic + Capacitor
- **Responsable**: Claude Code
- **Dependencias**: ninguna
- **Archivos permitidos**: `apps/mobile/**`, `package.json`, `tsconfig*.json`, `.gitignore`, `README.md`, `CLAUDE.md` (sección Comandos)
- **Estado**: propuesta

## Descripción
Crear el proyecto base en `apps/mobile/` con Angular + Ionic + Capacitor y plataforma Android. Verificar en la documentación oficial las versiones estables compatibles entre sí antes de instalar; no fijar versiones de memoria. Configurar TypeScript estricto, linter, variables de entorno (sin secretos en el repo) y el esqueleto de carpetas `core/ data/ features/ shared/`. Sin lógica de negocio.

## Criterios de aceptación
1. `npm install` y el build de producción web terminan sin errores.
2. `npx cap add android` y el build de Android terminan sin errores.
3. La app arranca y muestra una pantalla vacía con navegación básica.
4. Existe plantilla `.env.example` con las claves públicas necesarias; ningún secreto versionado.
5. `CLAUDE.md` documenta los comandos reales de instalar, servir, construir y abrir Android.

## Pruebas requeridas
Salida real de build web, build Android y del linter, adjunta en el PR.

## Riesgos
Incompatibilidades entre versiones de Angular, Ionic y Capacitor; entorno Android (JDK, SDK) no configurado en la máquina.
