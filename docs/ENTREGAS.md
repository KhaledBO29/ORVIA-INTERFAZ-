# Entregas ORVIA

Las entregas tienen su rama feature y conservan las referencias después de integrarse. Las primeras entregas se enlazan con sus PR históricos; las posteriores indican el método real de integración. La publicación actual está en main y mantiene el flujo feature → develop → main.

| Orden | Rama | Commit | Pull request |
| --- | --- | --- | --- |
| 01 | feature/01-base-angular | Feat:Crear base Angular y estado compartido | [#1](https://github.com/KhaledBO29/ORVIA-INTERFAZ-/pull/1) |
| 02 | feature/02-iconos | Feat:Crear componente de iconos SVG | [#2](https://github.com/KhaledBO29/ORVIA-INTERFAZ-/pull/2) |
| 03 | feature/03-tarjeta-indicador | Feat:Crear componente de tarjeta de indicador | [#3](https://github.com/KhaledBO29/ORVIA-INTERFAZ-/pull/3) |
| 04 | feature/04-grafica | Feat:Crear componente de grafica empresarial | [#4](https://github.com/KhaledBO29/ORVIA-INTERFAZ-/pull/4) |
| 05 | feature/05-tabla | Feat:Crear componente de tabla con filtros y exportacion CSV | [#5](https://github.com/KhaledBO29/ORVIA-INTERFAZ-/pull/5) |
| 06 | feature/06-directiva-dialogo | Feat:Crear directiva de foco para dialogos | [#6](https://github.com/KhaledBO29/ORVIA-INTERFAZ-/pull/6) |
| 07 | feature/07-formulario-registro | Feat:Crear componente de formulario reactivo de registros | [#7](https://github.com/KhaledBO29/ORVIA-INTERFAZ-/pull/7) |
| 08 | feature/08-menu-lateral | Feat:Crear componente de menu lateral | [#8](https://github.com/KhaledBO29/ORVIA-INTERFAZ-/pull/8) |
| 09 | feature/09-encabezado | Feat:Crear componente de encabezado y filtros globales | [#9](https://github.com/KhaledBO29/ORVIA-INTERFAZ-/pull/9) |
| 10 | feature/10-inicio | Feat:Crear componente de pagina de inicio | [#10](https://github.com/KhaledBO29/ORVIA-INTERFAZ-/pull/10) |
| 11 | feature/11-panel-negocio | Feat:Crear componente reutilizable de panel de negocio | [#11](https://github.com/KhaledBO29/ORVIA-INTERFAZ-/pull/11) |
| 12 | feature/12-finanzas | Feat:Crear componente de pagina de finanzas | [#12](https://github.com/KhaledBO29/ORVIA-INTERFAZ-/pull/12) |
| 13 | feature/13-ventas | Feat:Crear componente de pagina de ventas | [#14](https://github.com/KhaledBO29/ORVIA-INTERFAZ-/pull/14) |
| 14 | feature/14-inventario | Feat:Crear componente de pagina de inventario | [#15](https://github.com/KhaledBO29/ORVIA-INTERFAZ-/pull/15) |
| 15 | feature/15-compras | Feat:Crear componente de pagina de compras | [#16](https://github.com/KhaledBO29/ORVIA-INTERFAZ-/pull/16) |
| 16 | feature/16-proveedores | Feat:Crear componente de pagina de proveedores | [#17](https://github.com/KhaledBO29/ORVIA-INTERFAZ-/pull/17) |
| 17 | feature/17-solicitudes | Feat:Crear componente de pagina de solicitudes | [#18](https://github.com/KhaledBO29/ORVIA-INTERFAZ-/pull/18) |
| 18 | feature/18-ordenes-compra | Feat:Crear componente de pagina de ordenes de compra | [#19](https://github.com/KhaledBO29/ORVIA-INTERFAZ-/pull/19) |
| 19 | feature/19-recepciones | Feat:Crear componente de pagina de recepciones | [#20](https://github.com/KhaledBO29/ORVIA-INTERFAZ-/pull/20) |
| 20 | feature/20-cuentas-por-pagar | Feat:Crear componente de pagina de cuentas por pagar | [#21](https://github.com/KhaledBO29/ORVIA-INTERFAZ-/pull/21) |
| 21 | feature/21-pagos | Feat:Crear componente de pagina de pagos | [#22](https://github.com/KhaledBO29/ORVIA-INTERFAZ-/pull/22) |
| 22 | feature/22-reportes | Feat:Crear componente de pagina de reportes | [#23](https://github.com/KhaledBO29/ORVIA-INTERFAZ-/pull/23) |
| 23 | feature/23-taskflow | Feat:Crear componente TaskFlow con signals y checkbox | [#24](https://github.com/KhaledBO29/ORVIA-INTERFAZ-/pull/24) |
| 24 | feature/24-configuracion | Feat:Crear componente de configuracion con formulario reactivo | [#25](https://github.com/KhaledBO29/ORVIA-INTERFAZ-/pull/25) |
| 25 | feature/25-ensamblaje-rutas | Feat:Ensamblar componente App y rutas de todas las pantallas | [#26](https://github.com/KhaledBO29/ORVIA-INTERFAZ-/pull/26) |
| 26 | feature/26-documentacion-pruebas | Feat:Agregar guia por componentes y validacion automatizada | PR de esta entrega; consultar la rama en GitHub |
| 27 | feature/27-organizacion-historial | Feat:Organizar historial continuo y colores de ramas | [#28](https://github.com/KhaledBO29/ORVIA-INTERFAZ-/pull/28) |
| 28 | feature/28-prueba-persistencia | Fix:Esperar persistencia de TaskFlow antes de recargar | [#30](https://github.com/KhaledBO29/ORVIA-INTERFAZ-/pull/30) |
| 29 | feature/29-orden-colores-gitflow | Feat:Ordenar main verde develop cian y features rosadas | [#31](https://github.com/KhaledBO29/ORVIA-INTERFAZ-/pull/31) |
| 30 | feature/30-arranque-portable | Fix:Facilitar arranque desde una copia limpia del repositorio | Merge explícito a develop y luego a main, sin PR |
| 31 | feature/31-erp-relacional | Feat:Conectar operacion ERP de triturados inventario y contabilidad | Merge explícito a develop y luego a main, sin PR; [reglas y recorrido](ERP.md) |
| 32 | feature/32-colores-ramas | Fix:Configurar main cian develop rosado y features verdes | Merge explícito a develop y luego a main, sin PR; reemplaza la paleta de la entrega 29 |

La entrega 27 configura Git Graph y documenta la organización continua: [ver su PR por rama](https://github.com/KhaledBO29/ORVIA-INTERFAZ-/pulls?q=is%3Apr+head%3Afeature%2F27-organizacion-historial).

Repositorio: https://github.com/KhaledBO29/ORVIA-INTERFAZ-

Para ver el gráfico: `git log --graph --oneline --decorate --all`.
