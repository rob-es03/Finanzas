# Sistema de Diseño y Guía de Interfaz (UX/UI)
**Autor**: Antigravity  
**Proyecto**: Finanzas Personales (Angular + Ionic + Capacitor)  
**Referencias**: `finanzas_nicolle.html`, Material Design 3, Google Identity Services

---

## 1. Tokens Fundamentales

### 1.1 Paleta de Color
Inspirada en el prototipo histórico y optimizada para contraste WCAG AA tanto en modo claro como en modo oscuro.

| Rol | Token CSS | Modo Claro | Modo Oscuro | Significado Semántico |
|---|---|---|---|---|
| **Primario** | `--ion-color-primary` | `#4F46E5` (Índigo) | `#6366F1` | Identidad, acciones principales, saldo neto positivo |
| **Éxito / Ingresos** | `--ion-color-success` | `#10B981` (Esmeralda) | `#34D399` | Ingresos, entradas de dinero, confirmaciones |
| **Peligro / Gastos** | `--ion-color-danger` | `#F43F5E` (Rosa fuerte) | `#FB7185` | Gastos, pagos, cuotas de préstamos, saldos negativos |
| **Alerta / Cuentas** | `--ion-color-warning` | `#F59E0B` (Ámbar) | `#FBBF24` | Cuentas bancarias, advertencias, vencimientos próximos |
| **Fondo Base** | `--app-bg-color` | `#F8FAFC` (Slate 50) | `#0B0F19` (Slate 950) | Lienzo de la aplicación |
| **Superficie** | `--app-surface-color` | `#FFFFFF` | `#151C2C` | Tarjetas, modales, hojas inferiores |
| **Bordes** | `--app-border-color` | `#E2E8F0` | `#242F47` | Delimitadores de componentes |

### 1.2 Tipografía
- **Familia tipográfica**: `Inter`, `-apple-system`, `system-ui`, `sans-serif`.
- **Pesos**: Regular (400), Medium (500), Semibold (600), Bold (700), Extrabold (800).
- **Regla monetaria**: Los importes se formatean siempre con separador de miles y dos decimales (`$1,250.00`), calculados internamente desde centavos enteros (`125000 BIGINT`).

---

## 2. Mapa de Navegación del Flujo de Autenticación

```
                           [Inicio de la App]
                                   │
                           ¿Sesión activa?
                            /             \
                        (No)              (Sí)
                         │                 │
                [/auth/welcome]      ¿Onboarding listo?
                         │            /              \
                 [/auth/login]     (No)              (Sí)
                         │          │                 │
         [Continuar con Google]    [/auth/onboarding]  [/dashboard]
                         │          │ (Paso 1: Moneda)
                  (Google OAuth)    │ (Paso 2: Cuentas)
                         │          │
                [/auth/callback] ───┘
                         │
                 (¿Error en OAuth?)
                         │
                  [/auth/error]
```

---

## 3. Especificación del Botón «Continuar con Google»

Cumple rigurosamente con las directrices de marca de **Google Identity**:
- **Texto estandarizado**: «Continuar con Google».
- **Tipografía**: Inter / Roboto Medium 15px.
- **Logotipo 'G'**: Cuatro colores oficiales vectoriales (Azul `#4285F4`, Verde `#34A853`, Amarillo `#FBBC05`, Rojo `#EA4335`).
- **Zona táctil**: Altura mínima de 50px, accesible con pulgar (ergonomía móvil con una sola mano).
- **Feedback Háptico**: Vibración ligera (`Haptics.impact({ style: ImpactStyle.Light })`) al pulsar en Android.
- **Transiciones de estado**:
  - `Default`: Fondo blanco, borde `#747775`, sombra sutil.
  - `Hover/Focus`: Borde `#0B57D0`, halo accesible.
  - `Pressed`: Escala 0.99, fondo `#E8F0FE`.
  - `Loading`: Spinner animado con mensaje "Conectando con Google...".

---

## 4. Estados Universales de Pantalla

Toda vista del sistema implementa explícitamente 4 estados:
1. **Estado Vacío (Empty State)**: Ilustración vectorial amigable, mensaje explicativo y botón de acción principal (ej. "Aún no tienes cuentas registradas").
2. **Estado de Carga (Skeleton/Spinner)**: Pulso animado que mantiene el diseño estructural sin saltos visuales.
3. **Estado de Error (Error State)**: Banner accesible con diagnóstico técnico claro, sin jerga informática incomprensible, y botón de reintento.
4. **Estado Negativo (Negative Balance)**: En finanzas, los saldos negativos o sobregiros se destacan inmediatamente con borde y texto `--ion-color-danger` para advertencia visual preventiva.
