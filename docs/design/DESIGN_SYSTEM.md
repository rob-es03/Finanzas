# Saldo claro · Sistema de diseño

**Dirección aprobada.** Especificación para Antigravity, T-020 y T-021. La identidad combina marfil, grafito y petróleo con composición abierta, filas alineadas y una acción primaria por contexto. La referencia visual aporta la prioridad del saldo y el acceso rápido a movimientos.

## Color

| Token semántico | Claro | Oscuro | Uso |
| --- | --- | --- | --- |
| Fondo | `#F7F6F1` | `#141B19` | Lienzo de pantalla |
| Superficie | `#FFFFFF` | `#202926` | Formularios, diálogos y navegación |
| Texto | `#202825` | `#EAF2EE` | Títulos, importes y etiquetas |
| Texto secundario | `#53605A` | `#AABBB3` | Fecha, categoría y ayuda |
| Acción / enlace | `#0D6058` | `#72D5C0` | Acción principal, enlace y destino activo |
| Texto sobre acción | `#FFFFFF` | `#0D211D` | Botón primario |
| Ingreso / éxito | `#176345` | `#8ADCB2` | Importe positivo y confirmación textual |
| Gasto / error | `#9C343B` | `#FFACAD` | Importe negativo, error o acción destructiva |
| Aviso | `#775216` | `#F4CF83` | Próximos vencimientos y falta de conexión |
| Separador decorativo | `#DFE3DB` | `#394741` | Divisiones de sección y fila |
| Borde de control | `#77847D` | `#84968D` | Límites necesarios para identificar campos |
| Anillo de foco | `#176853` | `#80E1CD` | Contorno de 2 px con separación de 2 px |

Contrastes de referencia calculados según luminancia relativa: texto principal sobre lienzo 13,95:1 / 15,35:1, texto de botón primario 7,42:1 / 9,58:1 y borde sobre superficie 3,90:1 / 4,78:1. Validar también foco, iconos, estados interactivos y temas renderizados. El color acompaña signos, etiquetas y formas. Objetivo de contraste de texto normal ≥4,5:1 y de elementos gráficos o límites esenciales ≥3:1. [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

## Tipografía y medidas

- **Inter**, con fuente del sistema como respaldo. Pesos 400 para lectura, 500 para controles y 600 para títulos e importes. Usar cifras tabulares en saldos, listas y resúmenes. Formateo compartido en USD y locale `es-EC`, con dos decimales. Alinear importes a la derecha en listas y evitar truncar cifras.
- **Escala tamaño/altura de línea en px.** Saldo 40/48 (48/56 en escritorio), título de página 24/32, sección 18/24, cuerpo y campo 16/24, fila 14/20, metadato 12/16. Permitir que etiquetas y controles crezcan con el texto del sistema.
- **Espaciado.** 4, 8, 12, 16, 24, 32 y 48 px. Márgenes laterales de 16 px en compacto, 24 px en medio y 32 px en amplio. Separar secciones con 24–32 px y filas mediante borde de 1 px o 12 px de relleno vertical.
- **Radios.** 8 px para campos y filas seleccionables, 12 px para botones y paneles, 16 px para diálogos y borde superior de hoja móvil. Elevación cero en el contenido. Una sombra de superposición para el diálogo o la hoja, con desplazamiento de 8 px y desenfoque de 24 px.
- **Iconos.** Familia outline de Ionicons, 20 px en acciones y 24 px en navegación. Etiqueta visible en destinos y acciones frecuentes. Nombre accesible en controles icónicos.
- **Interacción.** Área táctil mínima de 48 × 48 en Android. Hover secundario en web, fondo tonal y cambio de borde para pulsado/seleccionado, anillo para foco. Mostrar motivo cuando una acción deshabilitada lo requiera. Transiciones de 120–180 ms para confirmaciones y paneles. Con movimiento reducido, mantener un cambio estático y anuncio textual.

## Responsive y tema

| Ancho disponible | Composición |
| --- | --- |
| Hasta 599 px | Una columna, navegación inferior, formulario en hoja móvil con opción de ocupar toda la altura cuando se abre el teclado. Respetar las áreas seguras. |
| 600–959 px | Una columna centrada para formularios y listas. Dos columnas de resumen si ambos bloques conservan espacio para etiquetas largas. |
| Desde 960 px | Navegación lateral y contenido de hasta 1200 px. Inicio distribuye contenido principal y resumen lateral. Movimientos admite lista y detalle contiguos. |

El tema inicial sigue la preferencia del sistema. Ambos temas preservan orden, roles y texto. Asegurar que navegación fija, avisos y teclado dejan visibles el foco y la acción principal.

## Implementación para Antigravity

Centralizar roles en los tokens del tema de Ionic y usar variables de componente donde corresponda. Aplicar el tema en capas para coordinar la transición desde la [guía UX/UI existente](../ux-ui/design-system.md), que documenta el onboarding y una paleta índigo previa. Mantener la integración y marca de Google dentro del alcance de su flujo. Validar contrastes sobre los componentes renderizados, además de revisar los valores de esta tabla. Los componentes consumen datos de los contratos vigentes y delegan formateo monetario, reglas de guardado y agregaciones a sus capas correspondientes.
