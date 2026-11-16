# Alcance y validación

## Qué se implementó

- Angular 21 con componentes standalone, rutas lazy y estilos SCSS adaptables.
- Trece páginas referenciadas por el PDF y un tablero TaskFlow adicional.
- Menú lateral, encabezado, filtros compartidos, tarjetas, gráficas SVG y tablas.
- Creación de registros con validadores, confirmación por checkbox y diálogo de detalle.
- Búsqueda, filtros por empresa/planta/estado, paginación y exportación CSV.
- Cambio de estado a Completada; tareas con transiciones, checkbox y eliminación.
- Persistencia local y recuperación ante JSON inválido; preferencias de configuración.
- Foco contenido en los diálogos, Escape, restauración del foco y enlace para saltar al contenido.

## Correspondencia con el PDF

El documento contiene capturas rasterizadas, sin componentes editables ni tokens Figma. Se inspeccionaron sus 13 páginas como referencia visual; el documento se trata como material de diseño, no como instrucciones ejecutables.

Se conservan la marca ORVIA, el menú oscuro, la selección violeta, tarjetas blancas, indicadores, gráficas, tablas y jerarquía de módulos. Se sustituyen productos textiles por triturado, base granular, arena y relleno. Los datos de fecha se sitúan en noviembre de 2026.

Las páginas de negocio componen un panel configurable. Las pantallas con listados tienen una disposición distinta de los resúmenes. No se copian todos los subpaneles y columnas específicas del PDF: no hay fotos de volquetas, remisiones escaneadas, editor de proveedores, aprobación multinivel ni CRUD especializado por documento. Las tablas usan un registro operativo común. Los botones de creación comparten el formulario operativo.

Esta entrega sirve como frontend educativo funcional y base para personalizar cada pantalla. No es una reproducción exacta de Figma ni un ERP listo para operar.

## Datos y cálculos

El total y los conteos se derivan de los registros filtrados. Los registros representan movimientos compartidos entre los módulos, sin libros contables separados. Los importes llamados utilidad o gastos en el inicio y algunos indicadores financieros usan proporciones de demostración. Las gráficas de evolución, porcentajes de variación, categorías y alertas no se calculan desde un historial de períodos anterior. Los conteos de proveedores o solicitudes representan registros de la demo, no entidades independientes.

Todos los registros iniciales pertenecen a noviembre de 2026, de modo que los filtros Este mes y Todo el año coinciden inicialmente. Si creas una fila con fecha de otro mes, solo aparece al seleccionar Todo el año. La fecha de la demo está fijada para que el recorrido de aprendizaje sea reproducible.

LocalStorage no es una base de datos de servidor, no sincroniza dispositivos y no proporciona cuentas de usuario. Los valores de Settings se guardan como preferencias: no cambian las integraciones ni los nombres del catálogo global.

## Comprobaciones

- `npm run build`: compilación de producción.
- `npm test`: nueve pruebas de extremo a extremo en Google Chrome.
- Recorridos: todas las rutas, redirección desconocida, validación y creación, persistencia, paginación, filtros, CSV, completar registro, tareas, configuración, datos dañados, menú móvil y foco de diálogos.
- Inspección visual de inicio y recepciones a 1440 px, y del inicio a 390 px. Capturas en `docs/capturas/`.
- `npm audit --omit=dev`: cero vulnerabilidades en dependencias de producción durante la validación. El análisis completo de herramientas de desarrollo reportó avisos moderados; no se aplicó una actualización mayor que rompa el requisito de NgFor.

Para repetir: `npm ci`, `npm run build` y `npm test`. En Linux/macOS ejecuta antes `npx playwright install chromium`. El flujo de GitHub Actions instala Chromium con sus dependencias y ejecuta build y pruebas.

## Reiniciar la demo

En las herramientas de desarrollo del navegador, Application → Local Storage, elimina únicamente `orvia.records.v1`, `orvia.tasks.v1` y `orvia.settings.v1`. Recarga para volver a los valores iniciales. No es necesario borrar los datos de otros sitios.
