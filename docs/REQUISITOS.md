# Matriz de requisitos de la actividad

| Requisito | Implementación | Cómo comprobarlo |
| --- | --- | --- |
| Angular y componentes | `src/app/shared`, `layout`, `pages` | Revisar `@Component` e `imports`. |
| Rutas | `src/app/app.routes.ts` | Visitar las 14 rutas; probar una desconocida. |
| Signals | `core/store.ts`, `taskflow.ts`, `app.ts` | `signal`, `computed`, `effect`, `set`, `update`. |
| Estructura ngFor | `shared/data-table/data-table.html` | `*ngFor` y `trackBy: trackRow`; importación de `NgFor`. |
| Control de flujo moderno | Plantillas de Dashboard, Business y Taskflow | `@for` y `@if`. |
| TaskFlow | `pages/taskflow/` | Crear tarea y moverla entre columnas. |
| ngClass | `stat-card.html`, `data-table.html`, `taskflow.html` | Cambios de color y tarea completada tachada. |
| LocalStorage | `core/store.ts`, `settings.ts` | Crear, recargar y conservar valores. |
| Eventos | Header, tablas, formularios y tareas | `(click)`, `(input)`, `(change)`, `(ngSubmit)`, `(submit)`. |
| Condicionales | `record-form.html`, `business.html`, `dashboard.html` | Errores, diálogos y layouts condicionales. |
| Directivas Angular | `routerLink`, `routerLinkActive`, `ngClass`, `ngFor`, `formControlName` | Revisar plantillas e imports. |
| Directiva propia | `shared/dialog-focus.directive.ts` | Navegar un diálogo con Tab y Escape. |
| Métodos | `create`, `advance`, `pay`, `saveParty`, `exportCsv`, `submit`, `toggle` | Seguir llamadas desde los eventos HTML. |
| Eventos checkbox | `pages/taskflow/taskflow.html` | `[checked]` y `(change)` con `event.target.checked`. |
| Checkbox reactivo | `settings.html` | `formControlName` y valores booleanos. |
| Formularios reactivos | `pages/settings/` | FormBuilder, ReactiveFormsModule y validadores. |
| Documentos con varias líneas | `shared/record-form/` | FormsModule, NgForm, ngModel y validación de dominio. |
| Operación ERP relacional | `core/erp.ts`, `core/store.ts` | [Recorrido de compras, stock, ventas y pagos](ERP.md). |
| Comunicación padre → hijo | StatCard, Chart, Business, Sidebar | `input()` y enlaces `[propiedad]`. |
| Comunicación hijo → padre | DataTable, RecordForm, Header, Sidebar | `output()`, `emit()`, `$event`. |
| Comunicación mediante servicio | Header → Store → páginas | Buscar un material desde el encabezado. |
| Main, develop, features | Historial Git y PR | `git log --graph --oneline --decorate --all`. |
| Un commit por componente | Ramas numeradas | Consultar `docs/ENTREGAS.md`. |
| PR hacia develop y formato UCC | `.github/pull_request_template.md` y PR reales | Revisar base `develop`, autor y cambios. |
| Único integrante | Autor Khaled Benavides | No se inventan revisores ni aprobaciones. |

NgFor se conserva por el requisito académico en Angular 21; está deprecado. Las listas nuevas usan `@for`. TaskFlow se interpreta como una función de gestión de tareas, no como una biblioteca externa indicada por el PDF.
