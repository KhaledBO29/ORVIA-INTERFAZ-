# Operación ERP de triturados con módulos relacionados

Feature: Conectar abastecimiento, inventario, despachos y contabilidad simulada sin cambiar el orden del menú lateral.
Bug: Se reemplazan los registros genéricos repetidos entre secciones, indicadores con porcentajes fijos y alertas estáticas.
Hotfix: No aplica.

Desarrollador: Khaled Benavides.

## Cambios

- Dominio con catálogo sectorial, terceros, documentos de varias líneas, importes, valoración de existencias y asientos.
- Solicitud → orden → recepción con ingreso completo, inventario por planta y deuda; pagos parciales/completos sin exceder saldo.
- Ventas de contado al despachar, control de stock, costo promedio congelado por salida y consumos de maquinaria.
- Proveedores/clientes editables e inactivables, informes por producto, libro contable, filtros, CSV y kárdex con documentos vinculados.
- Configuración efectiva de parámetros, capacidad, alertas y métodos de abono. Persistencia de una instantánea relacional y respaldo JSON descargable.
- Gráficas, métricas y avisos derivados de movimientos; documentación de reglas y límites en docs/ERP.md.

## Validación

- npm run build: compilación de producción correcta.
- npm test: 21 pruebas aprobadas, incluidos el flujo completo de compra/recepción/abonos, costo promedio después de una compra, despachos, stock insuficiente, documentos de períodos anteriores, configuración y accesibilidad móvil/teclado.
- Inspección visual a 1440 px y 390 px; captura actual del inicio e inventario en docs/capturas.

Es una simulación local sin backend, facturación electrónica, bancos, concurrencia, recepciones parciales ni reversión de asientos. Las tasas tributarias son parámetros educativos explícitos.

Integración mediante commits de merge a develop y main. Este archivo documenta el cambio; no implica que exista un PR remoto.
