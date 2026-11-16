# ORVIA · Sistema Operativo Empresarial

Frontend educativo en **Angular 21**, TypeScript y SCSS, basado en las 13 pantallas del PDF de referencia. Adaptado a una trituradora de piedra, materiales de construcción y empresas comercializadoras.

![Inicio de ORVIA en escritorio](docs/capturas/dashboard-desktop.png)

## Ejecutar

Requisitos: Node.js 22.12+ o 24 y npm. Se desarrolló con Node 24.19.0.

```powershell
git switch develop
npm ci
npm start
```

Abre http://localhost:4200. Para compilar: `npm run build`. Salida: `dist/orvia/browser`.

## Aprender y revisar

- [Guía componente por componente](docs/APRENDER-ANGULAR.md): explicaciones, ejercicios y ensamblaje.
- [Ramas, commits y pull requests](docs/GIT-Y-PR.md): flujo de un solo desarrollador y orden de implementación.
- [Matriz de requisitos](docs/REQUISITOS.md): ubicación exacta de cada concepto solicitado.
- [Alcance y validación](docs/VALIDACION.md): comportamiento real y diferencias respecto al diseño.
- [Entregas y enlaces a los PR](docs/ENTREGAS.md).
- [Plantilla de PR de la UCC](.github/pull_request_template.md).

## Pantallas

Inicio, finanzas, ventas, inventario, compras, proveedores, solicitudes, órdenes de compra, recepciones, cuentas por pagar, pagos, reportes, configuración y TaskFlow.

Las páginas de negocio ensamblan un panel compartido. Solicitudes, órdenes, recepciones y cuentas por pagar priorizan listados; los resúmenes priorizan indicadores y gráficas. TaskFlow agrega el tablero de tareas requerido.

## Validar

```powershell
npm run build
npm test
```

En Windows las pruebas usan Google Chrome instalado. En Linux/macOS instala Chromium con `npx playwright install chromium`. La configuración inicia Angular automáticamente cuando el puerto 4200 está libre.

## Demostración

Los registros son ficticios y compartidos entre módulos para enseñar comunicación de estado. Se pueden crear registros, consultar detalles, completar operaciones, filtrar, paginar, exportar CSV y organizar tareas. Los datos se conservan **en el navegador mediante LocalStorage**. No hay backend, autenticación, procesamiento de pagos ni contabilidad real.

Las curvas, porcentajes de variación, distribución por categoría y alertas del inicio son ilustrativos. El proyecto es una adaptación funcional de la referencia, con paneles simplificados; no es una reproducción píxel por píxel de sus 13 pantallas.

Las preferencias de configuración se guardan como demostración, sin controlar dispositivos GPS, procesos bancarios o servicios externos. La fecha de demostración es el 15 de noviembre de 2026.

Las fuentes de Google son opcionales; existe una alternativa local Arial. Los iconos y el logo se dibujan con SVG locales.

Desarrollador: **Khaled Benavides**. El orden del gráfico es **main verde → develop cian → features rosadas**. Las features se encadenan desde la anterior, se integran mediante PR a develop y luego se publica develop en main mediante otro PR. Consulta [el flujo y sus colores](docs/GIT-Y-PR.md).
