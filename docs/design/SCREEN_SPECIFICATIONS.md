# Saldo claro · Especificaciones de pantalla

Alcance: Inicio, Movimientos y registro de ingresos y gastos. En las maquetas, marcar **Datos ficticios**. Escenario de referencia: saldo en cuentas de USD 1.280,50, ingresos del mes de USD 950,00, gastos del mes de USD 420,00 y flujo neto mensual de +USD 530,00. Los pagos próximos son un conjunto separado de los movimientos ya registrados.

## Inicio

**Objetivo.** Saber cuánto hay en las cuentas seleccionadas, entender el mes y registrar un movimiento o revisar un próximo pago.

**Orden móvil.** Encabezado «Inicio» y acceso a perfil; selector «Todas las cuentas»; «Saldo en cuentas» y su valor; botón «Registrar movimiento»; «Este mes» con ingresos, gastos y flujo neto; «Próximos pagos»; hasta tres movimientos recientes y «Ver movimientos». Al seleccionar una cuenta, etiquetar el saldo con su contexto. El resumen conserva su propio alcance explícito, «Todas las cuentas» o el de la cuenta elegida, según el contrato de datos. Los accesos a presupuestos y análisis aparecen cuando existe un destino funcional.

**Comportamiento.** Si el contrato entrega vencimientos, mostrar hasta tres ordenados por fecha de los próximos siete días, con etiqueta «Próximos 7 días» y acceso al detalle cuando exista. En escritorio, colocar el saldo, registro y movimientos en la columna principal y el resumen mensual y vencimientos a la derecha. La secuencia de foco conserva una lectura coherente por sección.

**Estados.** Mostrar USD 0,00 para un saldo cero calculado. Sin cuentas, mostrar «Aún no tienes cuentas» y acceso a Cuentas si está disponible. Sin movimientos, explicar cómo registrar el primero. Con datos insuficientes, mostrar «Saldo no disponible» o suprimir el bloque dependiente si todavía carece de integración. En error parcial, conservar los bloques válidos y ofrecer reintento en el bloque afectado. Si existe caché, indicar su antigüedad durante la desconexión.

## Movimientos

**Objetivo.** Encontrar, comprobar, editar o eliminar un movimiento y registrar otro desde el mismo contexto.

**Orden móvil.** Encabezado «Movimientos» y acción «Registrar movimiento»; búsqueda por descripción; selector de mes y acceso «Mes actual»; filtro Todos, Ingresos y Gastos; lista agrupada por fecha. Cada fila muestra descripción, categoría, cuenta y monto con signo. La exportación CSV, cuando esté integrada, queda en el menú de acciones. En desktop, usar lista y detalle contiguos desde 960 px, o lista de ancho completo cuando no haya selección.

**Interacción.** Abrir el detalle desde toda la fila. Mostrar fecha, tipo, descripción, importe, cuenta y categoría. «Editar» reutiliza el formulario precargado. «Eliminar» abre confirmación con descripción y monto. Al regresar, conservar búsqueda, mes, filtro y posición de lectura. Si la edición o eliminación cambia la lista, anunciar el resultado y colocar el foco en un elemento próximo. La acción «Deshacer» se muestra cuando hay una operación real de reversión.

**Estados.** Separar lista sin datos, «Aún no tienes movimientos», de lista filtrada sin coincidencias, «No encontramos movimientos con estos filtros», con acceso a limpiar filtros. En recarga por filtros mostrar el estado de búsqueda y evitar anunciar cada cambio mientras se escribe. Con error, conservar el contexto y ofrecer «Reintentar».

## Registro de un movimiento

**Objetivo.** Registrar un ingreso o gasto habitual con confianza y con el mínimo de pasos.

1. Abrir desde «Registrar movimiento» en Inicio o Movimientos. Usar hoja inferior desplazable en móvil y diálogo centrado en escritorio. El título identifica alta o edición. El foco entra al formulario y vuelve al origen al cerrarlo.
2. Mostrar selector Ingreso/Gasto, importe, descripción, cuenta, categoría y fecha. Destacar el importe con teclado decimal en móvil. Gasto y fecha local de hoy son valores iniciales propuestos; una cuenta solo se preselecciona si el contexto identifica inequívocamente una cuenta válida. Mostrar categorías compatibles con el tipo. Al cambiar de tipo, limpiar una categoría incompatible y conservar los campos válidos.
3. Mostrar los atajos disponibles en una fila secundaria. Al elegir uno se rellenan sus campos editables. Informar qué campos faltan y permitir revisar el resultado antes de enviar. Para T-020, medir la ruta rápida como **Abrir → Elegir atajo → Guardar** con campos obligatorios completos y una cuenta válida. Cuando falte un dato se abre su control.
4. «Guardar movimiento» valida el formulario y deja visible la acción durante el desplazamiento y al usar el teclado. El importe se captura en USD, con un máximo de dos decimales y valor positivo. La interfaz deriva el signo del tipo; el formateo y la conversión exacta se delegan a la lógica acordada. Anunciar los errores junto a su campo con una instrucción de recuperación.
5. Mientras se guarda, mostrar «Guardando…» y bloquear envíos simultáneos. Tras confirmarse, anunciar «Movimiento guardado» y actualizar saldo y lista según las respuestas de datos. Ante error o desconexión, conservar entradas y permitir reintentar cuando corresponda. Si hay cambios y se cierra mediante Atrás, gesto o Escape, pedir confirmación para descartarlos. El estado «Pendiente de sincronizar» depende de una cola offline aprobada y operativa.

## Criterios de aceptación

| ID | Verificación |
| --- | --- |
| IN-01 | Con datos ficticios, se reconocen saldo en cuentas, ingresos, gastos y flujo mensual por sus etiquetas. Cambiar de cuenta actualiza lo que corresponde y mantiene el alcance visible. Cero real, ausencia de cuentas y error se distinguen. |
| IN-02 | El resumen, los pagos y los movimientos recientes funcionan con datos disponibles, carga, vacío y error parcial. En 360 px se ve el saldo y se puede alcanzar la acción principal sin desplazamiento horizontal. |
| MO-01 | Mes, «Mes actual», búsqueda y filtro por tipo funcionan juntos. Se conservan al volver del detalle y pueden limpiarse. La ausencia de resultados filtrados ofrece una recuperación específica. |
| MO-02 | Cada fila se puede abrir con toque, teclado y lector de pantalla. Edición y eliminación conservan el contexto. La eliminación requiere confirmación, y la cancelación conserva el movimiento. |
| RE-01 | Con un atajo completo y cuenta válida, el recorrido se completa en tres toques desde Inicio. Para entrada manual, se pueden corregir campo requerido, importe cero/negativo, más de dos decimales y categoría incompatible. |
| RE-02 | Doble toque durante guardado produce un solo envío desde la interfaz. Error y desconexión conservan lo escrito. El éxito aparece tras confirmación y el saldo y la lista muestran el resultado coherente con el alcance activo. |
| AX-01 | Revisar Android y web en 360, 768 y 1280 px, ambos temas y texto al 200 %. Comprobar contraste, foco visible, orden lógico, etiquetas, TalkBack, teclado web, regreso del foco, movimiento reducido y acceso a Guardar con teclado abierto. |
| QA-01 | La maqueta identifica datos ficticios. La entrega integrada usa contratos existentes, montos formateados por el mecanismo compartido y renderizado textual. La conformidad final requiere evidencia con datos reales y validación en Android y web. |
