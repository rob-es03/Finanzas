# Evaluación Técnica y Diseño: Widgets Android y Funciones del Sistema
**Autor**: Antigravity (Senior Angular/Ionic/Capacitor & Android Specialist)  
**Proyecto**: Finanzas Personales  
**Fecha**: 2026-11-17  
**Estado**: Especificación Técnica Aprobada

---

## 1. Widget de Pantalla de Inicio Android: Registro Rápido de Gastos

### 1.1 Objetivo y UX
Permitir al usuario registrar un gasto recurrente (almuerzo, pasaje, café) o consultar su saldo disponible en **menos de 3 segundos y en 1 o 2 toques**, directamente desde el escritorio de Android, sin fricción de inicio de sesión ni tiempos de carga.

### 1.2 Arquitectura Recomendada: Jetpack Glance
- **Tecnología**: **Jetpack Glance** (Google AndroidX Glance para AppWidgets). A diferencia de los `RemoteViews` tradicionales de Android basados en XML estático imperativo, Glance permite declarar interfaces reactivas con sintaxis similar a Jetpack Compose, garantizando compatibilidad con Material You (Android 12+) y modos claro/oscuro dinámicos.
- **Dimensiones**:
  - `4 x 1` (Compacto): Muestra el saldo neto del mes y un botón de acceso directo `+ Gasto`.
  - `4 x 2` (Completo / Recomendado):
    - **Cabecera**: Saldo disponible del mes actual con botón de ocultar por privacidad (modo discreto).
    - **Atajos rápidos de 1 toque**: 3 botones de gastos habituales configurados por el usuario (ej. `Almuerzo $3.50`, `Pasaje $0.35`, `Supermercado $20.00`).
    - **Acción manual**: Botón `+ Nuevo` con icono flotante.

### 1.3 Flujo de Interacción y Deep Linking
```
[Widget Android en Home Screen]
       │
       ├── Toque en Atajo Rápido (ej. "Almuerzo $3.50")
       │     └─► Glance ActionCallback / BroadcastReceiver
       │           └─► WorkManager ejecuta inserción idempotente en Supabase/Caché
       │           └─► Vibración háptica de confirmación + Notificación discreta
       │
       └── Toque en "+" o Saldo
             └─► Deep Link: ec.finanzas.app://quick-entry?type=expense
                   └─► Capacitor App abre la Activity directamente en el modal de registro
```

---

## 2. Evaluación de Funciones del Teléfono y Restricciones de Android

| Función del Sistema | Viabilidad Técnica | Restricciones de Seguridad de Android | Patrón Recomendado / Solución Aprobada |
|---|---|---|---|
| **Control de Wi-Fi** (Encender / Apagar) | **Restringido por el SO** (No viable directo) | A partir de **Android 10 (API 29)** y Android 11+, Google deprecó y bloqueó `WifiManager.setWifiEnabled()`. Apps de terceros no pueden encender ni apagar Wi-Fi en segundo plano por razones de seguridad y privacidad. | Usar el **Panel de Ajustes de Internet** (`Settings.Panel.ACTION_INTERNET_CONNECTIVITY`). Muestra un diálogo flotante del sistema donde el usuario conmuta Wi-Fi con 1 toque sin salir de la app. |
| **Linterna** (Torch / Flash LED) | **Viable** (Con validación de hardware) | Requiere que el dispositivo cuente con flash físico (`FEATURE_CAMERA_FLASH`). No requiere permiso de cámara intrusivo en Android 6.0+ cuando se usa `CameraManager.setTorchMode()`. | Invocar `CameraManager.setTorchMode(cameraId, true/false)`. Manejar excepciones de hardware ocupado por otra app. |
| **Feedback Háptico** (Vibración al registrar) | **Viable y Recomendado** | Sin restricciones. Mejora sustancialmente la sensación de respuesta física al registrar gastos o tocar botones. | Integrado mediante `@capacitor/haptics` en botones de acción y atajos. |

---

## 3. Principio de Aislamiento de Código (AGENTS.md)
Las utilidades del teléfono (linterna, panel de conectividad) se implementan como un módulo de plugins nativo opcional (`apps/mobile/src/app/core/native-utils/`), completamente **desacoplado** del núcleo financiero (`data/`, `contracts/`, `transactions`). Una falla en la linterna o en el panel de red jamás afectará el registro o cálculo contable de la aplicación.
