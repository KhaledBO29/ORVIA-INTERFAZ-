# Alcance y validación

La entrega relacional de ORVIA reemplaza la lista genérica compartida y los porcentajes fijos por documentos de negocio vinculados. Las reglas y el recorrido se detallan en [ERP.md](ERP.md).

Se conserva la navegación lateral de 14 secciones y la apariencia de marca, menú oscuro, selección violeta, tarjetas, tablas y formularios adaptables. Cada sección consulta su propio tipo de entidad o documento. El stock muestra unidades correctas por producto, pedidos pendientes, costos promedio y kárdex. Los proveedores/clientes tienen un directorio editable y se relacionan con sus documentos.

## Comprobaciones

- `npm run build`: compilación de producción con los presupuestos de Angular.
- `npm test`: 21 pruebas automatizadas, con recorridos de navegador y reglas de dominio.
- Compra mixta de diésel y banda con IVA por línea, retención y logística; recepción única, costo, stock y dos abonos hasta saldo cero.
- Solicitudes y contador del menú; ventas con despacho/cobro único; bloqueo por stock insuficiente; cancelación antes de contabilizar.
- Producción y consumo por planta; unidades; proveedores creados, editados e inactivados.
- Filtros, paginación y contenido del CSV; preferencias efectivas y descarga de respaldo JSON.
- Todas las rutas, recuperación de datos dañados, deuda de un período anterior, tareas, persistencia, teclado y menú móvil.
- Asientos de los documentos iniciales y del recorrido de compra con débito igual a crédito; validación de NaN, duplicados, fechas y cantidades inválidas.
- Inspección visual de escritorio a 1440 px y formulario móvil a 390 px.

Para repetir: `npm ci`, `npm run build` y `npm test`. En Windows las pruebas usan Chrome instalado; en Linux/macOS, `npx playwright install chromium`. El servidor de pruebas arranca sin apertura de navegador cuando no hay otro en el puerto 4200.

## Límites

Los datos se guardan en este navegador. Es una simulación ERP, sin backend, sincronización multiusuario, facturación electrónica ni conexión bancaria. Los impuestos son supuestos configurables de demostración. Las recepciones son completas; no se implementan devoluciones, reversión de movimientos o liquidación fiscal. Consulta [las reglas y límites exactos](ERP.md).

Las capturas de las primeras entregas y las ramas históricas muestran el alcance anterior. La guía por componentes permite estudiarlas; los archivos y reglas actuales se describen en ERP.md.
