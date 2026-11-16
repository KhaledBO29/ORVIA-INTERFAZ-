# Aprende ORVIA componente por componente

Este recorrido está pensado para una sola persona. Lee un capítulo, abre los archivos indicados, realiza el ejercicio y comprueba el resultado antes de continuar. Puedes estudiar cada entrega con su rama sin cambiar el proyecto actual: `git show feature/02-iconos:src/app/shared/icon/icon.ts`.

Para experimentar en una rama histórica usa un directorio separado: `git worktree add ../orvia-estudio feature/02-iconos`. El ensamblaje completo se conecta al final, en la rama 25. Las ramas anteriores contienen componentes añadidos a la base, aunque todavía no estén montados en la interfaz inicial.

## 0. Qué estás construyendo

Un componente es una pieza de interfaz con comportamiento. Normalmente tiene tres archivos:

- `.ts`: datos, dependencias y métodos.
- `.html`: elementos visibles y sus enlaces con los datos.
- `.scss`: apariencia de esa pieza.

Un componente standalone declara lo que usa en `imports`. Para mostrarlo, un padre importa la clase y escribe su selector en HTML. Una página también es un componente: el router decide cuál colocar dentro de `<router-outlet>`.

```text
App
├── Sidebar                 navegación
├── Header                  filtros compartidos
└── RouterOutlet
    ├── Dashboard           inicio
    ├── página de negocio
    │   └── Business        panel configurable
    │       ├── StatCard    indicadores
    │       ├── Chart       gráfica
    │       ├── DataTable   listado y evento selected
    │       └── RecordForm formulario y eventos saved/closed
    ├── Taskflow            tareas con estados
    └── Settings            preferencias
```

## 1. Base Angular, modelos y servicio

Archivos: `src/main.ts`, `src/app/app.config.ts`, `src/app/core/models.ts`, `src/app/core/store.ts`, `src/styles.scss`.

`bootstrapApplication(App, appConfig)` arranca Angular. `provideRouter(routes)` registra las rutas. El locale `es-CO` permite presentar pesos colombianos y fechas en español.

Las interfaces `BusinessRecord`, `Metric` y `Task` definen la forma de los datos. TypeScript puede advertir cuando olvidas una propiedad. Una interfaz no valida el contenido de LocalStorage: por eso `restore()` comprueba los datos antes de recuperarlos.

`Store` es un servicio `providedIn: 'root'`: todos los componentes reciben la misma instancia con `inject(Store)`. Ahí viven los registros y filtros para que el encabezado y las páginas se comuniquen sin conocerse directamente.

```ts
readonly search = signal('');
readonly total = computed(() =>
  this.filtered().reduce((sum, record) => sum + record.amount, 0)
);
```

`signal()` almacena un valor. Se lee con `search()`, se reemplaza con `.set()` y se modifica en función del anterior con `.update()`. `computed()` calcula un valor derivado y vuelve a calcularlo cuando cambian sus dependencias. No debes escribir sobre un `computed`.

`effect()` conecta los signals con una API externa: aquí guarda registros y tareas en LocalStorage. Los arreglos se reemplazan con `map`, `filter` y spread; no se mutan con `push` dentro de un signal.

Ejercicio: agrega un material al arreglo de demostración y sigue su recorrido hasta la tabla. Después cambia el filtro de empresa y observa qué valores se recalculan.

## 2. Icon: tu primer componente

Archivo: `src/app/shared/icon/icon.ts`. Rama: `feature/02-iconos`.

`input('box')` permite al padre elegir el icono. En `<app-icon name="cart" />`, el padre proporciona una cadena. El método `path()` busca el trazado SVG correspondiente. `aria-hidden` evita que un lector de pantalla anuncie el mismo texto dos veces.

Ejercicio: usa `<app-icon name="truck" />` en otro componente; recuerda importar `Icon` en su arreglo `imports`.

## 3. StatCard: datos de un padre a un hijo

Archivos: `src/app/shared/stat-card/`. Rama: `feature/03-tarjeta-indicador`.

La tarjeta recibe un `Metric` con `input.required<Metric>()`. El padre decide los datos y el hijo decide cómo presentarlos.

```html
<app-stat-card [metric]="metric" />
```

Los corchetes envían el valor de una expresión TypeScript, no una cadena literal. `{{ ... }}` escribe un valor en el HTML. `CurrencyPipe` y `DecimalPipe` le dan formato sin modificar el dato original. `[ngClass]` añade clases según el tono o el signo del indicador.

Ejercicio: cambia el tono de una tarjeta a `amber`. Después crea un indicador numérico con `money: false`.

## 4. Chart: un valor derivado también puede dibujar una gráfica

Archivos: `src/app/shared/chart/`. Rama: `feature/04-grafica`.

El componente recibe `title`, `total` y `bars`. Dos `computed()` transforman el total en una serie de demostración y después en coordenadas SVG. `[attr.points]` enlaza esas coordenadas con la línea. `@for` repite puntos o barras y `@if` elige el tipo de representación.

La serie es ilustrativa; no hay historial financiero real. El título SVG y los valores de cada punto ayudan a interpretar el dibujo.

Ejercicio: cambia `bars` entre `true` y `false`. Compara `[bars]="false"` con `bars="false"`: los corchetes preservan el tipo booleano.

## 5. DataTable: listas, métodos y eventos hacia el padre

Archivos: `src/app/shared/data-table/`. Rama: `feature/05-tabla`.

La tabla recibe `rows` y expone `selected = output<BusinessRecord>()`. Al pulsar Ver, ejecuta `selected.emit(row)`. El padre escucha ese evento y guarda la fila seleccionada:

```html
<app-data-table [rows]="rows()" (selected)="selected.set($event)" />
```

`$event` contiene el registro emitido. El hijo no abre por su cuenta el detalle; solicita al padre que responda al evento. Este es el ejemplo principal de comunicación hijo → padre.

Aquí se usa explícitamente `*ngFor`, importando `NgFor` desde `@angular/common`, para cumplir la actividad. `trackBy: trackRow` identifica cada fila por su ID. Angular 21 todavía admite esa sintaxis aunque está deprecada; para código nuevo se usa `@for (row of visible(); track row.id)`. No actualices a una versión mayor sin revisar esta compatibilidad.

`filtered`, `pages` y `visible` son valores derivados. Un `effect()` vuelve a la primera página cuando cambian las filas o el estado. `exportCsv()` genera un archivo en el navegador; protege las celdas que podrían interpretarse como fórmulas al abrirlas en una hoja de cálculo.

Ejercicio: filtra por Completada, cambia de planta, revisa la paginación y descarga el CSV. Comprueba que exporta todas las filas filtradas, no solo las seis visibles.

## 6. DialogFocus: una directiva personalizada

Archivo: `src/app/shared/dialog-focus.directive.ts`. Rama: `feature/06-directiva-dialogo`.

Un componente crea una pieza visual; una directiva agrega comportamiento a un elemento existente. `appDialogFocus` da foco al primer control del diálogo, mantiene Tab dentro de él y devuelve el foco al botón original cuando se destruye. `dismissed` avisa al padre cuando el usuario pulsa Escape.

```html
<section appDialogFocus (dismissed)="closed.emit()">...</section>
```

Ejercicio: abre un formulario usando teclado, pulsa Shift+Tab y luego Escape. Identifica en el código qué método responde a cada acción.

## 7. RecordForm: formulario reactivo y checkbox

Archivos: `src/app/shared/record-form/`. Rama: `feature/07-formulario-registro`.

`FormBuilder.nonNullable.group()` crea un modelo tipado del formulario. `ReactiveFormsModule` habilita `[formGroup]`, `formControlName` y `(ngSubmit)`. Los validadores exigen nombre, material, planta, fecha y valores mayores que cero. El checkbox usa `Validators.requiredTrue`.

```html
<form [formGroup]="form" (ngSubmit)="submit()">
  <input formControlName="name" />
  <input type="checkbox" formControlName="accepted" />
</form>
```

`submit()` marca los controles como tocados si hay errores; si los datos son válidos, llama a `Store.addRecord()`. El servicio actualiza el signal, el efecto lo guarda y los listados se recalculan. El evento `saved` permite al padre cerrar el formulario y mostrar el mensaje de éxito.

Ejercicio: intenta guardar sin valor ni confirmación. Después completa todo, guarda y recarga el navegador.

## 8. Sidebar: navegación declarativa

Archivos: `src/app/layout/sidebar/`. Rama: `feature/08-menu-lateral`.

`RouterLink` cambia la ruta sin recargar toda la página. `RouterLinkActive` aplica la clase del módulo activo. `sections` mantiene el menú en una sola lista y `@for` genera sus enlaces.

`collapsed` llega desde App. Los eventos `toggle` y `navigated` permiten a App contraer el menú o cerrarlo al navegar desde un móvil. El menú no conoce el tamaño del resto de la aplicación.

Ejercicio: sigue el evento de Contraer menú hasta `App.toggle()`. Después localiza la regla SCSS que cambia la cuadrícula.

## 9. Header: comunicación por servicio

Archivos: `src/app/layout/header/`. Rama: `feature/09-encabezado`.

`(input)` responde mientras escribes y `(change)` al seleccionar una opción. El método `update()` obtiene el valor de `HTMLInputElement` o `HTMLSelectElement` y actualiza el signal correspondiente del servicio.

```text
Header → Store.search.set(valor)
       → Store.filtered se recalcula
       → Business y Dashboard leen el nuevo resultado
```

`toSignal()` convierte los eventos del router en un signal para actualizar el título de la página. Las notificaciones y la ayuda usan signals locales porque su estado solo afecta al encabezado.

Ejercicio: busca “arena” desde Inventario y observa el resultado. Luego cambia a Compras: el filtro compartido sigue activo hasta que lo borres.

## 10. Dashboard: ensamblaje del inicio

Archivos: `src/app/pages/dashboard/`. Rama: `feature/10-inicio`.

Esta página importa tarjetas, gráfica, iconos y formulario. `metrics()` transforma el total compartido en cuatro tarjetas. `form()` guarda el título del formulario activo: cuando es una cadena vacía, `@if` no monta el componente.

Los botones de acciones rápidas demuestran la apertura del mismo formulario con distintos títulos. Todos crean un registro operativo compartido; no hay flujos fiscales o bancarios distintos detrás de cada botón. Las alertas y variaciones porcentuales están fijadas para reproducir la intención visual del diseño.

Ejercicio: agrega un botón a `actions` y úsalo para abrir el formulario. Después explica por qué no fue necesario copiar su HTML completo.

## 11. Business: composición reutilizable

Archivos: `src/app/pages/business/`. Rama: `feature/11-panel-negocio`.

`title` y `mode` son inputs. `metricLabels` elige títulos para cada módulo. `listFirst()` elige entre un resumen con gráficas y un listado operativo con pestañas de estado. `rows()` combina el filtro global con la pestaña activa.

La tabla emite un registro y Business abre su detalle. El detalle llama a `Store.complete(id)` para cambiar el estado. El formulario comparte el mismo servicio, por lo que al crear un registro no se necesita refrescar manualmente la tabla.

Ejercicio: sigue la secuencia Ver → detalle → Marcar como completado. Identifica el dato local, el método del servicio y la expresión que repinta el estado.

## 12–22. Una página y una rama por pantalla de negocio

Cada archivo de esta tabla declara una clase de página independiente y ensambla Business con `title` y `mode`. Así puedes revisar una pantalla por PR sin copiar tabla, gráfica y formulario once veces.

| Rama | Componente / archivo dentro de `src/app/pages` | Qué estudiar |
| --- | --- | --- |
| `feature/12-finanzas` | `FinancePage`, `finanzas/finanzas.ts` | Resumen monetario y gráfica de barras. |
| `feature/13-ventas` | `SalesPage`, `ventas/ventas.ts` | Pedidos y valores de ventas. |
| `feature/14-inventario` | `InventoryPage`, `inventario/inventario.ts` | Volumen en m³ y materiales. |
| `feature/15-compras` | `PurchasesPage`, `compras/compras.ts` | Resumen de compras y órdenes. |
| `feature/16-proveedores` | `SuppliersPage`, `proveedores/proveedores.ts` | Reutilización para proveedores. |
| `feature/17-solicitudes` | `RequestsPage`, `solicitudes/solicitudes.ts` | Listado primero y pestañas por estado. |
| `feature/18-ordenes-compra` | `OrdersPage`, `ordenes-compra/ordenes-compra.ts` | Seguimiento de operaciones. |
| `feature/19-recepciones` | `ReceptionsPage`, `recepciones/recepciones.ts` | Cantidad reservada y recepción. |
| `feature/20-cuentas-por-pagar` | `PayablesPage`, `cuentas-por-pagar/cuentas-por-pagar.ts` | Filtrar estados pendientes y vencidos. |
| `feature/21-pagos` | `PaymentsPage`, `pagos/pagos.ts` | Total de registros completados. |
| `feature/22-reportes` | `ReportsPage`, `reportes/reportes.ts` | Volumen, movimientos y CSV. |

Ejercicio por pantalla: abre su archivo, identifica los dos inputs y encuentra dónde `mode()` cambia el panel compartido. Para personalizar de verdad una pantalla, añade su propio contenido al componente de página o compón otros componentes. El hecho de compartir un panel no obliga a que todas las páginas crezcan de la misma manera.

## 23. Taskflow: eventos de checkbox y ngClass

Archivos: `src/app/pages/taskflow/`. Rama: `feature/23-taskflow`.

Se interpreta TaskFlow como un tablero de tareas. Tiene tres estados tipados: Pendiente, En proceso y Completada. `byStatus()` selecciona las tarjetas de una columna. `add`, `move`, `toggle` y `remove` son métodos llamados desde eventos de la plantilla.

```html
<input type="checkbox" [checked]="task.status === 'Completada'"
       (change)="toggle(task.id, $event)" />
```

`event.target.checked` es booleano; `value` no sirve para saber si un checkbox está marcado. `[ngClass]` agrega `completed` y el SCSS tacha el título. El signal de tareas pertenece al servicio, y su efecto lo guarda automáticamente.

Ejercicio: crea una tarea, muévela a En proceso, márcala, recarga y desmárcala. Explica por qué vuelve a Pendiente.

## 24. Settings: otro uso del formulario reactivo

Archivos: `src/app/pages/settings/`. Rama: `feature/24-configuracion`.

Aquí el modelo combina cadenas y booleanos. Recupera únicamente propiedades cuyo tipo coincide con el control original. `Validators.email` comprueba el correo. El guardado de preferencias es explícito mediante `save()`; no se necesita guardar en cada pulsación.

Estos checkbox representan preferencias locales de la demo: no activan una integración GPS ni un sistema de notificaciones externo.

Ejercicio: cambia la razón social y un checkbox, guarda y recarga. Escribe un correo inválido y verifica que no se muestra el mensaje de guardado.

## 25. App y rutas: ensamblar las piezas

Archivos: `src/app/app.ts`, `app.html`, `app.scss`, `app.routes.ts`. Rama: `feature/25-ensamblaje-rutas`.

App conserva solo estado de presentación del menú. El HTML coloca Sidebar y Header alrededor del `RouterOutlet`. El router carga cada página mediante `loadComponent` cuando se visita su ruta. La ruta vacía redirige a Inicio y la ruta comodín captura direcciones desconocidas.

```ts
{
  path: 'inventario',
  loadComponent: () => import('./pages/inventario/inventario')
    .then(module => module.InventoryPage)
}
```

Los archivos de componente pueden existir antes de conectarlos a una ruta. Por eso el ensamblaje ocurre después de que todas las piezas estén disponibles. Un menú visible no crea una ruta por sí solo: necesitas tanto RouterLink como su entrada en `routes`.

Ejercicio: sigue la ruta `/inventario` desde el enlace del menú hasta InventoryPage y desde esa página hasta el panel Business.

## 26. Comprobar y documentar

Archivos: `tests/e2e/orvia.spec.ts`, `playwright.config.ts`, `.github/workflows/ci.yml`, `docs/`.

`npm run build` valida TypeScript, plantillas y el empaquetado. `npm test` abre un navegador real y comprueba nueve recorridos. GitHub Actions ejecuta ambos sobre los PR dirigidos a develop y los pushes a develop/main.

Para tu próxima entrega, trabaja en una feature nueva, haz un commit `Feat:...`, completa la plantilla del PR y compara su diff antes de integrarlo. No necesitas simular dos integrantes: tú eres el autor y puedes integrar tus propios cambios si las reglas del repositorio lo permiten.

## Referencias oficiales

- [Signals](https://angular.dev/guide/signals).
- [Formularios reactivos](https://angular.dev/guide/forms/reactive-forms).
- [Control de flujo en plantillas](https://angular.dev/guide/templates/control-flow).
- [Rutas](https://angular.dev/guide/routing).

Para empezar: ejecuta la aplicación, abre `shared/icon/icon.ts` y completa el ejercicio del capítulo 2. Después continúa con StatCard.
