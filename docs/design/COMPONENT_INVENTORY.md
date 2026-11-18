# Saldo claro · Inventario de componentes

Inventario para T-020 y T-021. Verificar las piezas disponibles en el árbol de Ionic antes de crear una variante local. Los componentes compuestos reciben datos de presentación y emiten acciones hacia su página.

| Componente | Base Ionic o patrón | Variantes y estados | Contrato visual |
| --- | --- | --- | --- |
| Encabezado de pantalla | `ion-header`, `ion-toolbar` | Raíz, detalle con Atrás | Título visible y acciones con nombre accesible |
| Navegación primaria | `ion-tab-bar` / navegación lateral web | Activo, inactivo, foco | Icono y texto, destino activo identificable mediante estado semántico |
| Balance principal | Encabezado y salida textual | Positivo, cero, negativo, carga, no disponible | Etiqueta, importe tabular con signo donde aplique, alcance de cuenta |
| Selector de cuenta | `ion-select` o lista modal | Todas, individual, sin cuentas, deshabilitado | Valor visible y etiquetado; nombre completo disponible |
| Botón y acción rápida | `ion-button` | Principal, secundario, enlace, destructivo; hover, foco, pulsado, deshabilitado, ocupado | Área táctil de 48 px y una acción principal por contexto |
| Resumen mensual | Grupo con heading y filas de valor | Ingreso, gasto, flujo neto, carga, error, vacío | Período y alcance visibles; importes alineados con texto y signo |
| Lista y fila de movimiento | `ion-list` e `ion-item` interactivo | Grupo por fecha, ingreso, gasto, selección, carga, vacío | Orden de lectura descripción, categoría, cuenta, importe y tipo |
| Búsqueda y filtros | `ion-searchbar`, `ion-segment`, selector de mes | Activo, limpio, sin coincidencias, deshabilitado | Cada control identifica campo o valor y conserva teclado accesible |
| Fila de próximo pago | `ion-item` | Pendiente, próximo, vencido, con/sin detalle | Texto de estado, fecha e importe; enlace solo si se puede abrir |
| Campo de registro | `ion-input`, `ion-select` y fecha | Normal, completado, foco, inválido, deshabilitado | Etiqueta persistente, instrucciones y error asociados al control |
| Hoja o diálogo de registro | `ion-modal` | Alta, edición, guardando, error, confirmación de descarte | Foco contenido, retorno al origen y botón accesible con teclado abierto |
| Estados de datos | Bloque de texto y acción; `ion-skeleton-text` para carga | Vacío, sin resultados, error parcial, desconexión, pendiente de sincronizar si aplica | Mensaje y acción contextual. Esqueleto oculto a lectores y carga anunciada una vez |
| Confirmación y aviso | `ion-alert`, banner o `ion-toast` | Éxito, error, destructivo, desconexión | Los errores que necesitan acción son persistentes; anuncio de éxito sin mover foco |
| Presupuesto, deuda y gráfico | Patrones reservados para especificación posterior | Progreso, cuota, comparativa, falta de datos | Importe y período en texto; alternativa textual para cada visualización |

Referencias cruzadas: [sistema de diseño](DESIGN_SYSTEM.md), [especificaciones y criterios](SCREEN_SPECIFICATIONS.md), [decisiones UX](UX_DECISIONS.md).
