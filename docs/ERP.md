# Operación relacional de ORVIA

ORVIA es una simulación de ERP para una planta de triturados. Conserva el orden del menú: Inicio, Finanzas, Ventas, Inventario, Compras, Proveedores, Solicitudes, Órdenes de compra, Recepciones, Cuentas por pagar, Pagos, Reportes, TaskFlow y Configuración. El contador de solicitudes arranca en 4 y se recalcula con las aprobaciones y cancelaciones.

## Recorrido completo

1. En **Proveedores** crea un proveedor con NIT, correo, teléfono y especialidad. Puedes editarlo e inactivarlo; su historial se conserva y deja de aparecer en nuevos documentos.
2. En **Solicitudes**, registra insumos para la planta. En Ver → Aprobar y crear orden, genera una orden vinculada. También puedes crear órdenes directamente en **Compras** u **Órdenes de compra**.
3. Añade uno o varios productos, cantidades, costos, IVA por línea, retención, transporte y cargador. El resumen se recalcula al escribir. La orden aumenta la cantidad **En pedido** del inventario; todavía no aumenta las existencias físicas ni crea deuda.
4. En el detalle de la orden, pulsa **Generar recepción**. Queda En proceso y genera una única recepción pendiente.
5. En **Recepciones**, pulsa **Confirmar recepción**. Ingresa toda la orden a la planta indicada, actualiza el costo promedio, marca la orden como completada y registra una deuda por el neto del documento. La recepción no se puede confirmar dos veces.
6. En **Cuentas por pagar**, abre la recepción y registra abonos parciales o el saldo completo. Los abonos reducen la deuda y caja, y aparecen en **Pagos**. No se permite abonar cero, valores negativos, fracciones de peso o un valor superior al saldo.
7. En **Ventas** registra clientes y ventas con varios productos. Confirma el despacho desde Ver: descuenta stock, reconoce costo de ventas y simula el cobro de contado. Si falta stock, no cambia inventario ni caja. La venta pendiente se puede cancelar.
8. En **Inventario** registra entradas de producción/ajuste y salidas por consumo/mantenimiento. Un consumo de diésel o repuestos disminuye existencias y reconoce un gasto al costo promedio. Ver muestra cantidades, mínimos, costo, pedidos y kárdex con documentos vinculados.
9. **Finanzas**, **Reportes** e **Inicio** recalculan ventas, costos, gastos, caja, deuda, alertas y series por fecha. **TaskFlow** permite crear, iniciar, completar, reabrir y eliminar tareas.

## Reglas de cantidades y valoración

- Agregados: triturado 3/4″, 1/2″, 3/8″, arenas triturada/de peña y base granular, en m³.
- Repuestos y consumibles: bandas en metros; rodamientos, tornillos, tuercas y mallas por unidad entera.
- Combustible: diésel ACPM en galones. Aceite hidráulico en litros.
- Hay dos almacenes físicos: Planta Principal y Planta El Encano. Las salidas no usan stock de otra planta. Ambas empresas comerciales comparten el almacén físico de cada planta.
- Las cantidades permiten hasta tres decimales, salvo referencias por unidad, que requieren enteros. Los importes de documentos son COP enteros.
- Las compras recibidas se valoran al costo de productos más transporte y cargador. La logística se distribuye proporcionalmente al subtotal de cada línea y el residuo se asigna a la última. El IVA se registra aparte y no se capitaliza.
- El costo promedio es valor disponible / cantidad disponible. Se congela el costo de cada salida al confirmarla; compras posteriores no modifican el costo de ventas histórico.
- El kárdex se procesa por orden de confirmación, no por fecha retroactiva de emisión. Una entrada de producción se valora con el costo unitario ingresado. No hay cálculo de costos de fabricación por órdenes de producción.

## Cálculos de simulación

Las tasas son editables y educativas; no representan clasificación tributaria ni una liquidación fiscal oficial. El diésel inicial tiene IVA 0 como supuesto de ejemplo. No se infieren tasas legales por categoría.

```text
subtotal = suma(redondear(cantidad × precio unitario))
IVA = suma(redondear(subtotal de línea × tasa IVA / 100))
retención = redondear(subtotal × tasa de retención / 100)
neto = subtotal + IVA + transporte + cargador − retención
```

La logística se suma sin IVA ni retención en esta simulación. Una retención de compra crea una obligación separada de la deuda neta con el proveedor. En ventas se registra como retención a favor. Los abonos cancelan solamente la deuda neta con el proveedor; no liquidan impuestos.

Cada recepción, venta, entrada, consumo, gasto, ingreso y pago genera un asiento cuyo débito es igual al crédito. Las solicitudes y órdenes no generan asientos. La venta produce ingreso sin IVA, IVA generado, retención a favor, caja y costo de salida. La compra produce inventario, IVA descontable, retenciones por pagar y deuda. Los abonos no duplican el gasto de la compra.

El resultado operativo es ventas sin IVA + otros ingresos − costo de ventas − gastos y consumos. La caja inicial de demostración es $50.000.000, asignada únicamente a Planta Principal / Planta de Triturado. No se duplica con los filtros. No se impide una caja negativa: una operación puede dejar un déficit simulado visible.

## Filtros e indicadores

- Búsqueda por documento, tercero, producto, concepto, placa o estado; filtros de empresa, planta y período en documentos; estado, paginación y CSV en cada tabla.
- Este mes y Todo el año se calculan con la fecha de Bogotá. Los indicadores de flujo y gráficas usan los documentos de ese período y sus filtros. Las gráficas agrupan importes netos de documentos por fecha de emisión; no representan utilidad ni comparaciones inventadas.
- Caja y deuda son saldos acumulados de empresa/planta y no dependen de la búsqueda o el período. Las cuentas por pagar incluyen deuda antigua; el listado admite búsqueda por documento/proveedor.
- Inventario es el stock físico actual por planta y búsqueda; no se limita por empresa comercial ni período. El directorio de proveedores es permanente; sus saldos/órdenes sí consideran empresa y planta.
- El reporte por producto separa recibido, despachado, ventas sin IVA/logística, costo y margen de producto. El margen operativo incluye la logística vendida, gastos y consumos.

## Configuración y persistencia

Configuración cambia la identidad de la empresa, IVA/retención predeterminados de nuevos formularios, capacidad para estimar viajes de volqueta, avisos locales y métodos permitidos para abonos. Los documentos anteriores conservan sus tasas y costos. Se puede descargar un respaldo JSON de consulta.

La clave `orvia.erp.v2` guarda terceros y documentos relacionados en una sola instantánea; cada operación se valida antes de sustituirla. `orvia.tasks.v1` y `orvia.settings.v1` guardan tareas y preferencias. Se comprueba el esquema al restaurar; si hay datos ilegibles, se avisa y se usa la demostración. La lista genérica anterior `orvia.records.v1` se conserva sin convertirla: no contenía tipos documentales ni vínculos suficientes para asignarle operaciones contables.

Para reiniciar solo la operación de ejemplo, elimina `orvia.erp.v2` en LocalStorage y recarga. Descarga antes el respaldo si quieres conservar una copia. El respaldo es de consulta; esta versión no incluye importación.

## Estructura del código

- `src/app/core/erp.ts`: entidades, catálogo, datos iniciales, validación, cálculo de importes, valoración y asientos puros.
- `src/app/core/store.ts`: estado compartido con signals, persistencia, transiciones, pagos, proveedores, filtros e indicadores.
- `src/app/pages/business/`: vistas por módulo, detalle, acciones, abonos, kárdex y reportes.
- `src/app/shared/record-form/`: formularios de documentos con varias líneas y cálculo inmediato; formulario de terceros.
- `src/app/shared/data-table/`: columnas por contexto, estado, paginación y CSV de los datos filtrados.
- `src/app/shared/chart/`: series calculadas a partir de documentos confirmados.
- `src/app/pages/dashboard/`, `settings/`, `taskflow/`: resumen, parámetros efectivos y tareas.
- `tests/e2e/erp-domain.spec.ts`, `orvia.spec.ts`: invariantes contables y recorridos completos en navegador.

## Alcance

Es un frontend local interactivo con contabilidad simulada. No incluye servidor, usuarios, permisos, concurrencia entre pestañas/equipos, facturación electrónica, bancos, GPS, adjuntos, recepciones parciales, devoluciones, reversión de asientos o cierre contable. Los documentos confirmados conservan su trazabilidad y no se eliminan ni editan; solo se cancelan solicitudes, órdenes sin recepción y ventas pendientes. Los consumos manuales se registran como movimientos nuevos. La operación completa solicitada se puede recorrer sin servicios externos.
