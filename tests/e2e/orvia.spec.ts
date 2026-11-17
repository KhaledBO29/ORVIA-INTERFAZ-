import { expect, test, Page } from '@playwright/test';
import { ErpState, inventory, journal, quote, seed, today } from '../../src/app/core/erp';
const dialog = (page: Page) => page.getByRole('dialog');
const state = (page: Page) =>
  page.evaluate<ErpState>(() => JSON.parse(localStorage.getItem('orvia.erp.v2')!));
async function save(page: Page) {
  await dialog(page).getByRole('checkbox', { name: 'Confirmo que revisé los datos.' }).check();
  await dialog(page).getByRole('button', { name: 'Guardar registro', exact: true }).click();
}
async function openId(page: Page, id: string) {
  await page.getByRole('button', { name: 'Ver ' + id, exact: true }).click();
}
async function close(page: Page) {
  await dialog(page).getByRole('button', { name: 'Cerrar detalle', exact: true }).click();
}

test('conserva el menú exacto y todas las rutas cargan sin errores', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const paths = [
    'inicio',
    'finanzas',
    'ventas',
    'inventario',
    'compras',
    'proveedores',
    'solicitudes',
    'ordenes-compra',
    'recepciones',
    'cuentas-por-pagar',
    'pagos',
    'reportes',
    'taskflow',
    'configuracion',
  ];
  for (const path of paths) {
    await page.goto('/' + path);
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page).toHaveTitle(/ORVIA/);
  }
  await expect(
    page.getByRole('navigation', { name: 'Navegación principal' }).locator('a'),
  ).toHaveText(
    [
      'Inicio',
      'Finanzas',
      'Ventas',
      'Inventario',
      'Compras',
      'Proveedores',
      'Solicitudes 4',
      'Órdenes de compra',
      'Recepciones',
      'Cuentas por pagar',
      'Pagos',
      'Reportes',
      'TaskFlow',
      'Configuración',
    ],
    { useInnerText: true },
  );
  await page.goto('/no-existe');
  await expect(page).toHaveURL(/\/inicio$/);
  expect(errors).toEqual([]);
});

test('compra mixta → recepción única → stock y costo → abonos parciales → saldo cero', async ({
  page,
}) => {
  await page.goto('/compras');
  await page.getByRole('button', { name: 'Nuevo registro', exact: true }).click();
  await dialog(page).getByRole('button', { name: 'Guardar registro', exact: true }).click();
  await expect(dialog(page).getByRole('alert')).toBeVisible();
  await dialog(page).getByLabel('Proveedor', { exact: true }).selectOption('PR-DIE');
  let line = dialog(page).locator('fieldset').first();
  await line.getByLabel('Material o insumo').selectOption('CB-DIE');
  await line.getByLabel('Cantidad (gal)').fill('100');
  await line.getByLabel('IVA simulado (%)').fill('0');
  await dialog(page).getByRole('button', { name: 'Añadir producto' }).click();
  line = dialog(page).locator('fieldset').nth(1);
  await line.getByLabel('Material o insumo').selectOption('RP-BAN');
  await line.getByLabel('Cantidad (m)', { exact: true }).fill('4');
  await dialog(page).getByLabel('Transporte en volqueta (COP)').fill('60000');
  await dialog(page).getByLabel('Servicio de cargador (COP)').fill('20000');
  await dialog(page).getByLabel('Retención simulada (%)').fill('2.5');
  await expect(dialog(page).getByTestId('quote-total')).toContainText('2.228.100');
  await save(page);
  await expect(dialog(page)).toHaveCount(0);
  let s = await state(page);
  const order = s.documents.at(-1)!;
  expect(order.kind).toBe('orden');
  expect(
    inventory(s.documents).find((p) => p.id === 'CB-DIE' && p.plant === 'Planta Principal')
      ?.quantity,
  ).toBe(800);
  await openId(page, order.id);
  await dialog(page).getByRole('button', { name: 'Generar recepción', exact: true }).click();
  await expect(
    dialog(page).getByRole('button', { name: 'Generar recepción', exact: true }),
  ).toHaveCount(0);
  await close(page);
  s = await state(page);
  const receipt = s.documents.find((d) => d.sourceId === order.id)!;
  await page.goto('/recepciones');
  await openId(page, receipt.id);
  await dialog(page).getByRole('button', { name: 'Confirmar recepción', exact: true }).click();
  await expect(
    dialog(page).getByRole('button', { name: 'Confirmar recepción', exact: true }),
  ).toHaveCount(0);
  s = await state(page);
  const received = s.documents.find((d) => d.id === receipt.id)!;
  expect(received.lines.map((l) => l.stockCost)).toEqual([1122772, 977228]);
  expect(s.documents.find((d) => d.id === order.id)?.status).toBe('Completada');
  await expect(dialog(page).getByTestId('outstanding')).toContainText('2.228.100');
  await dialog(page).getByLabel('Valor del abono (COP)').fill('2228101');
  await dialog(page).getByRole('button', { name: 'Confirmar abono' }).click();
  await expect(dialog(page).getByRole('alert')).toContainText('no superar');
  await dialog(page).getByLabel('Valor del abono (COP)').fill('1000000');
  await dialog(page).getByRole('button', { name: 'Confirmar abono' }).click();
  await expect(dialog(page).getByTestId('outstanding')).toContainText('1.228.100');
  await page.reload();
  await openId(page, receipt.id);
  await expect(dialog(page).getByTestId('outstanding')).toContainText('1.228.100');
  await dialog(page).getByRole('button', { name: 'Confirmar abono' }).click();
  await expect(dialog(page).getByTestId('outstanding')).toHaveText(/\$\s*0$/);
  await expect(dialog(page).getByRole('button', { name: 'Confirmar abono' })).toHaveCount(0);
  await close(page);
  await page.goto('/inventario');
  await page
    .getByRole('combobox', { name: 'Sucursal', exact: true })
    .selectOption('Planta Principal');
  await page.getByRole('textbox', { name: 'Buscar registros' }).fill('Diésel');
  await page.locator('tbody').getByRole('button').click();
  await expect(dialog(page).getByTestId('stock-quantity')).toHaveText('900 gal');
  await close(page);
  await page.getByRole('textbox', { name: 'Buscar registros' }).fill('Banda');
  await page.locator('tbody').getByRole('button').click();
  await expect(dialog(page).getByTestId('stock-quantity')).toHaveText('12 m');
  s = await state(page);
  for (const d of s.documents) {
    const lines = journal(d);
    expect(lines.reduce((v, l) => v + l.debit - l.credit, 0)).toBe(0);
  }
  await page.goto('/cuentas-por-pagar');
  await page.getByRole('textbox', { name: 'Buscar registros' }).fill('');
  await expect(page.locator('tbody tr').filter({ hasText: receipt.id })).toContainText('Pagada');
  await page.goto('/pagos');
  await expect(page.locator('tbody tr')).toHaveCount(3);
  await page.goto('/inventario');
  await page.getByRole('button', { name: 'Registrar movimiento' }).click();
  await dialog(page).getByLabel('Tipo de movimiento').selectOption('consumo');
  await dialog(page).getByLabel('Material o insumo').selectOption('CB-DIE');
  await dialog(page).getByLabel('Cantidad (gal)').fill('100');
  await dialog(page).getByLabel('Concepto / observaciones').fill('Diésel para turno de cargador');
  await expect(dialog(page)).toContainText('1.084.752');
  await save(page);
  expect((await state(page)).documents.at(-1)!.lines[0].stockCost).toBe(1084752);
});

test('aprobar una solicitud crea una sola orden y actualiza el contador del menú', async ({
  page,
}) => {
  await page.goto('/solicitudes');
  await openId(page, 'SOL-001');
  await dialog(page).getByRole('button', { name: 'Aprobar y crear orden' }).click();
  await expect(dialog(page).getByRole('button', { name: 'Aprobar y crear orden' })).toHaveCount(0);
  await close(page);
  await expect(
    page
      .getByRole('navigation', { name: 'Navegación principal' })
      .getByRole('link', { name: /Solicitudes/ }),
  ).toContainText('3');
  const s = await state(page);
  expect(s.documents.filter((d) => d.sourceId === 'SOL-001')).toHaveLength(1);
  await page.goto('/ordenes-compra');
  await openId(page, s.documents.at(-1)!.id);
  await expect(dialog(page)).toContainText('SOL-001');
});

test('despacho de venta calcula tributos y costos y descuenta stock una sola vez', async ({
  page,
}) => {
  await page.goto('/ventas');
  await page.getByRole('button', { name: 'Nuevo registro', exact: true }).click();
  await dialog(page).getByLabel('Cliente', { exact: true }).selectOption('CL-OBR');
  await dialog(page).getByLabel('Cantidad (m³)').fill('10');
  await dialog(page).getByLabel('Precio unitario (COP)').fill('80000');
  await dialog(page).getByLabel('Retención simulada (%)').fill('2.5');
  await dialog(page).getByLabel('Transporte en volqueta (COP)').fill('100000');
  await dialog(page).getByLabel('Servicio de cargador (COP)').fill('25000');
  await dialog(page).getByLabel('Placa de volqueta').fill('NAR-555');
  await expect(dialog(page).getByTestId('quote-total')).toContainText('1.057.000');
  await save(page);
  const id = (await state(page)).documents.at(-1)!.id;
  await openId(page, id);
  await dialog(page).getByRole('button', { name: 'Confirmar despacho y cobro' }).click();
  await expect(
    dialog(page).getByRole('button', { name: 'Confirmar despacho y cobro' }),
  ).toHaveCount(0);
  let s = await state(page);
  expect(s.documents.at(-1)!.lines[0].stockCost).toBe(420000);
  expect(
    inventory(s.documents).find((p) => p.id === 'AG-034' && p.plant === 'Planta Principal')
      ?.quantity,
  ).toBe(586);
  await close(page);
  await page.reload();
  await openId(page, id);
  await expect(dialog(page)).toContainText('NAR-555');
  await expect(dialog(page)).toContainText('Caja y bancos');
  await page.goto('/reportes');
  await expect(page.locator('main')).toContainText('Triturado 3/4″');
  await page.goto('/finanzas');
  await expect(page.locator('main')).toContainText('Costo de ventas');
  await expect(page.locator('main')).toContainText('Retenciones a favor');
});

test('stock insuficiente no genera salida ni cobro y permite cancelar la venta', async ({
  page,
}) => {
  await page.goto('/ventas');
  await page.getByRole('button', { name: 'Nuevo registro', exact: true }).click();
  await dialog(page).getByLabel('Cliente', { exact: true }).selectOption('CL-OBR');
  await dialog(page).getByLabel('Cantidad (m³)').fill('999999');
  await save(page);
  const id = (await state(page)).documents.at(-1)!.id;
  await openId(page, id);
  await dialog(page).getByRole('button', { name: 'Confirmar despacho y cobro' }).click();
  await expect(dialog(page).getByRole('alert')).toContainText('Stock insuficiente');
  expect((await state(page)).documents.at(-1)!.status).toBe('Pendiente');
  await dialog(page).getByRole('button', { name: 'Cancelar documento' }).click();
  expect((await state(page)).documents.at(-1)!.status).toBe('Cancelada');
  expect(journal((await state(page)).documents.at(-1)!)).toEqual([]);
});

test('inventario registra producción y consumo por planta sin mezclar unidades', async ({
  page,
}) => {
  await page.goto('/inventario');
  await page.getByRole('button', { name: 'Registrar movimiento' }).click();
  await dialog(page).getByLabel('Planta', { exact: true }).selectOption('Planta El Encano');
  await dialog(page).getByLabel('Cantidad (m³)').fill('30');
  await dialog(page)
    .getByLabel('Concepto / observaciones')
    .fill('Producción de turno trituradora primaria');
  await save(page);
  let s = await state(page);
  expect(
    inventory(s.documents).find((p) => p.id === 'AG-034' && p.plant === 'Planta El Encano')
      ?.quantity,
  ).toBe(278);
  await page.getByRole('button', { name: 'Registrar movimiento' }).click();
  await dialog(page).getByLabel('Tipo de movimiento').selectOption('consumo');
  await dialog(page).getByLabel('Material o insumo').selectOption('CB-DIE');
  await dialog(page).getByLabel('Cantidad (gal)').fill('25');
  await dialog(page).getByLabel('Concepto / observaciones').fill('Consumo cargador CAT 950');
  await save(page);
  s = await state(page);
  expect(s.documents.at(-1)!.lines[0].stockCost).toBe(270000);
  expect(
    inventory(s.documents).find((p) => p.id === 'CB-DIE' && p.plant === 'Planta Principal')
      ?.quantity,
  ).toBe(775);
  await page
    .getByRole('combobox', { name: 'Sucursal', exact: true })
    .selectOption('Planta Principal');
  await page.getByRole('textbox', { name: 'Buscar registros' }).fill('Diésel');
  await page.locator('tbody').getByRole('button').click();
  await expect(dialog(page).getByTestId('stock-quantity')).toHaveText('775 gal');
  await expect(dialog(page)).toContainText('Consumo interno');
});

test('proveedores se crean, se editan y se inactivan sin borrar su historial', async ({ page }) => {
  await page.goto('/proveedores');
  await page.getByRole('button', { name: 'Nuevo proveedor' }).click();
  await dialog(page).getByLabel('Razón social').fill('Mallas del Sur E2E');
  await dialog(page).getByLabel('NIT').fill('901999999-1');
  await dialog(page).getByLabel('Correo electrónico').fill('mallas@example.com');
  await dialog(page).getByLabel('Teléfono').fill('3001234567');
  await dialog(page).getByLabel('Especialidad').fill('Mallas de vibración');
  await save(page);
  await page.getByRole('textbox', { name: 'Buscar registros' }).fill('Mallas del Sur');
  await page.locator('tbody').getByRole('button').click();
  await dialog(page).getByRole('button', { name: 'Editar proveedor' }).click();
  const edit = page.getByRole('dialog', { name: 'Editar proveedor', exact: true });
  await edit.getByLabel('Razón social').fill('Mallas Andinas E2E');
  await edit.getByRole('checkbox', { name: 'Tercero activo' }).uncheck();
  await edit.getByRole('checkbox', { name: 'Confirmo que revisé los datos.' }).check();
  await edit.getByRole('button', { name: 'Guardar registro' }).click();
  await expect(edit).toHaveCount(0);
  await expect(page.getByRole('dialog', { name: 'Datos del tercero', exact: true })).toContainText(
    'Mallas Andinas E2E',
  );
  await close(page);
  await page.goto('/compras');
  await page.getByRole('textbox', { name: 'Buscar registros' }).fill('');
  await page.getByRole('button', { name: 'Nuevo registro', exact: true }).click();
  await expect(
    dialog(page).getByLabel('Proveedor', { exact: true }).locator('option'),
  ).not.toContainText(['Mallas Andinas E2E']);
});

test('filtros, paginación y CSV exportan las filas seleccionadas con sus unidades', async ({
  page,
}) => {
  await page.goto('/inventario');
  await page.getByRole('button', { name: 'Página siguiente' }).click();
  await expect(page.locator('.pagination')).toContainText('Página 2');
  await page
    .getByRole('combobox', { name: 'Sucursal', exact: true })
    .selectOption('Planta El Encano');
  await expect(page.locator('.pagination')).toContainText('Página 1');
  await page.getByRole('combobox', { name: 'Filtrar por estado' }).selectOption('Bajo');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportar CSV' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('orvia-movimientos.csv');
  const stream = await download.createReadStream();
  let csv = '';
  for await (const chunk of stream!) csv += chunk.toString('utf8');
  expect(csv).toContain('Unidad');
  expect(csv).toContain('Bajo');
  expect(csv).not.toContain('Disponible');
  await page.getByRole('textbox', { name: 'Buscar registros' }).fill('inexistente999');
  await expect(page.getByText('No hay registros con los filtros seleccionados.')).toBeVisible();
});

test('TaskFlow crea, avanza, completa, persiste y elimina tareas', async ({ page }) => {
  await page.goto('/taskflow');
  await page.getByLabel('¿Qué necesitas hacer?').fill('Coordinar volqueta de prueba');
  await page.getByRole('button', { name: 'Añadir tarea' }).click();
  let task = page.locator('.task').filter({ hasText: 'Coordinar volqueta de prueba' });
  await task.getByRole('button', { name: 'Iniciar tarea' }).click();
  await expect(page.locator('.column').nth(1)).toContainText('Coordinar volqueta de prueba');
  await task.getByRole('checkbox').check();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem('orvia.tasks.v1') ?? '[]').find(
            (t: { title: string }) => t.title === 'Coordinar volqueta de prueba',
          )?.status,
      ),
    )
    .toBe('Completada');
  await page.reload();
  task = page.locator('.task').filter({ hasText: 'Coordinar volqueta de prueba' });
  await expect(task.getByRole('checkbox')).toBeChecked();
  await task.getByRole('button', { name: 'Eliminar tarea' }).click();
  await expect(task).toHaveCount(0);
});

test('configuración modifica nuevas cotizaciones, capacidad, alertas y métodos de abono', async ({
  page,
}) => {
  await page.goto('/configuracion');
  await page.getByLabel('Razón social').fill('Triturados de prueba');
  await page.getByLabel('Correo electrónico').fill('invalido');
  await page.getByRole('button', { name: 'Guardar configuración' }).click();
  await expect(page.getByRole('status')).toHaveCount(0);
  await page.getByLabel('Correo electrónico').fill('operaciones@example.com');
  await page.getByLabel('IVA predeterminado simulado (%)').fill('5');
  await page.getByLabel('Retención predeterminada simulada (%)').fill('2');
  await page.getByLabel('Capacidad de volqueta (m³)').fill('6');
  await page.getByLabel('Efectivo', { exact: true }).uncheck();
  await page.getByLabel('Transferencia bancaria', { exact: true }).uncheck();
  await page.getByLabel('Notificaciones locales').uncheck();
  await page.getByRole('button', { name: 'Guardar configuración' }).click();
  await expect(page.getByRole('status')).toContainText('guardada');
  await page.reload();
  await expect(page.getByLabel('Razón social')).toHaveValue('Triturados de prueba');
  await page.goto('/ventas');
  await page.getByRole('button', { name: 'Nuevo registro', exact: true }).click();
  await expect(dialog(page).getByLabel('IVA simulado (%)')).toHaveValue('5');
  await expect(dialog(page).getByLabel('Retención simulada (%)')).toHaveValue('2');
  await dialog(page).getByLabel('Cantidad (m³)').fill('12');
  await expect(dialog(page)).toContainText('Viajes estimados: 2');
  await dialog(page).getByRole('button', { name: 'Cerrar formulario' }).click();
  await page.goto('/cuentas-por-pagar');
  await openId(page, 'REC-002');
  await expect(dialog(page).getByRole('button', { name: 'Confirmar abono' })).toBeDisabled();
  await expect(dialog(page)).toContainText('Habilita un método');
});

test('respaldo JSON incluye documentos, terceros, preferencias y tareas', async ({ page }) => {
  await page.goto('/configuracion');
  const promise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Descargar respaldo JSON' }).click();
  const download = await promise;
  const stream = await download.createReadStream();
  let data = '';
  for await (const chunk of stream!) data += chunk.toString('utf8');
  const backup = JSON.parse(data);
  expect(backup.operations.version).toBe(2);
  expect(backup.operations.parties.length).toBe(5);
  expect(backup.tasks.length).toBe(3);
  expect(backup.preferences.capacity).toBe(12);
});

test('datos corruptos se recuperan sin impedir el arranque', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('orvia.erp.v2', '{json roto');
    localStorage.setItem('orvia.tasks.v1', '[{"id":4}]');
    localStorage.setItem('orvia.settings.v1', 'null');
  });
  await page.goto('/compras');
  await expect(page.locator('tbody tr')).toHaveCount(2);
  await expect(page.getByRole('alert')).toContainText('no eran válidos');
  await page.goto('/taskflow');
  await expect(page.locator('.task')).toHaveCount(3);
});

test('menú móvil navega sin desbordamiento en todos los módulos', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/inicio');
  await page.getByRole('button', { name: 'Abrir o contraer menú' }).click();
  await page
    .getByRole('navigation', { name: 'Navegación principal' })
    .getByRole('link', { name: 'Inventario', exact: true })
    .click();
  await expect(page).toHaveURL(/inventario$/);
  await expect(page.locator('.sidebar-wrap')).not.toHaveClass(/open/);
  for (const path of [
    'inventario',
    'finanzas',
    'ventas',
    'proveedores',
    'reportes',
    'configuracion',
  ]) {
    await page.goto('/' + path);
    await expect(page.locator('main h1')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  await page.screenshot({ path: 'test-results/orvia-mobile.png', fullPage: true });
});

test('diálogos conservan foco, cierran con Escape y restauran el botón original', async ({
  page,
}) => {
  await page.goto('/ventas');
  const trigger = page.getByRole('button', { name: 'Nuevo registro', exact: true });
  await trigger.click();
  await expect(dialog(page).getByRole('button', { name: 'Cerrar formulario' })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(dialog(page).getByRole('button', { name: 'Guardar registro' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog(page)).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('el filtro de período no oculta deudas antiguas y los saldos siguen conciliados', async ({
  page,
}) => {
  const data = seed();
  const date = new Date(today() + 'T12:00:00Z');
  date.setUTCMonth(date.getUTCMonth() - 1);
  const previous = date.toISOString().slice(0, 10);
  for (const d of data.documents) {
    d.date = previous;
    d.due = previous;
  }
  await page.addInitScript(
    (data) => localStorage.setItem('orvia.erp.v2', JSON.stringify(data)),
    data,
  );
  await page.goto('/cuentas-por-pagar');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await expect(page.locator('tbody')).toContainText('Vencida');
  await page.goto('/ventas');
  await expect(page.locator('tbody tr')).toHaveCount(0);
});

test('cliente nuevo queda disponible para ventas y las alertas se pueden abrir y cerrar', async ({
  page,
}) => {
  await page.goto('/ventas');
  await page.getByRole('button', { name: 'Nuevo cliente', exact: true }).click();
  await dialog(page).getByLabel('Razón social').fill('Obras E2E del Sur');
  await dialog(page).getByLabel('NIT').fill('901888888-2');
  await dialog(page).getByLabel('Correo electrónico').fill('obras-e2e@example.com');
  await dialog(page).getByLabel('Teléfono').fill('3001231234');
  await dialog(page).getByLabel('Especialidad').fill('Construcción vial');
  await save(page);
  await page.getByRole('button', { name: 'Nuevo registro', exact: true }).click();
  await expect(dialog(page).getByLabel('Cliente', { exact: true }).locator('option')).toContainText(
    ['Obras E2E del Sur'],
  );
  await dialog(page).getByRole('button', { name: 'Cerrar formulario' }).click();
  await page.getByRole('button', { name: 'Notificaciones', exact: true }).click();
  await expect(page.getByText('Centro de notificaciones')).toBeVisible();
  await page.getByRole('button', { name: 'Cerrar', exact: true }).click();
  await expect(page.getByText('Centro de notificaciones')).toHaveCount(0);
  await page.getByRole('button', { name: 'Ayuda', exact: true }).click();
  await expect(page.getByText('Tu espacio ORVIA')).toBeVisible();
  await page.getByRole('button', { name: 'Entendido' }).click();
});

test('gasto e ingreso actualizan caja y resultado sin crear inventario ni proveedores', async ({
  page,
}) => {
  await page.goto('/finanzas');
  await page.getByRole('button', { name: 'Registrar gasto', exact: true }).click();
  await dialog(page).getByLabel('Valor (COP)', { exact: true }).fill('300000');
  await dialog(page).getByLabel('Concepto / observaciones').fill('Reparación de motor de criba');
  await save(page);
  await page.getByRole('button', { name: 'Registrar ingreso', exact: true }).click();
  await dialog(page).getByLabel('Valor (COP)', { exact: true }).fill('500000');
  await dialog(page).getByLabel('Concepto / observaciones').fill('Venta de chatarra industrial');
  await save(page);
  const s = await state(page);
  expect(s.documents.at(-2)?.kind).toBe('gasto');
  expect(s.documents.at(-1)?.kind).toBe('ingreso');
  expect(inventory(s.documents)).toEqual(inventory(seed().documents));
  await expect(page.locator('.metrics')).toContainText('2.786.000');
  await expect(page.locator('.metrics')).toContainText('57.972.000');
  await expect(page.locator('main')).toContainText('Otros ingresos');
});
