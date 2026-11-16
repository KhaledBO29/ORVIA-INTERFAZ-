import { expect, test } from '@playwright/test';

test('todas las rutas cargan y la ruta desconocida vuelve al inicio', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const path of [
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
  ]) {
    await page.goto('/' + path);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page).toHaveTitle(/ORVIA/);
  }
  await page.goto('/no-existe');
  await expect(page).toHaveURL(/\/inicio$/);
  expect(errors).toEqual([]);
});

test('formulario valida, crea un registro y lo conserva al recargar', async ({ page }) => {
  await page.goto('/compras');
  await page.getByRole('button', { name: 'Nuevo registro', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Guardar registro' }).click();
  await expect(dialog.getByRole('alert')).toBeVisible();
  await dialog.getByLabel('Proveedor o cliente').fill('Proveedor de prueba E2E');
  await dialog.getByLabel('Valor total (COP)').fill('950000');
  await dialog.getByLabel('Cantidad (m³)').fill('25');
  await dialog.getByRole('checkbox').check();
  await dialog.getByRole('button', { name: 'Guardar registro' }).click();
  await expect(dialog).not.toBeVisible();
  await page.reload();
  await page.getByRole('textbox', { name: 'Buscar registros' }).fill('Proveedor de prueba E2E');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await expect(page.locator('tbody')).toContainText('Proveedor de prueba E2E');
});

test('filtros, paginación y exportación funcionan juntos', async ({ page }) => {
  await page.goto('/inventario');
  await page.getByRole('button', { name: 'Página siguiente' }).click();
  await expect(page.locator('.pagination')).toContainText('Página 2');
  await page
    .getByRole('combobox', { name: 'Sucursal', exact: true })
    .selectOption('Planta El Encano');
  await expect(page.locator('.pagination')).toContainText('Página 1');
  await page.getByRole('combobox', { name: 'Filtrar por estado' }).selectOption('Completada');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportar CSV' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('orvia-movimientos.csv');
  await page.getByRole('textbox', { name: 'Buscar registros' }).fill('inexistente999');
  await expect(page.getByText('No hay registros con los filtros seleccionados.')).toBeVisible();
});

test('un detalle se completa y actualiza la tabla', async ({ page }) => {
  await page.goto('/recepciones');
  await page
    .getByRole('button', { name: /^Ver ORV/ })
    .first()
    .click();
  await page.getByRole('dialog').getByRole('button', { name: 'Marcar como completado' }).click();
  await expect(page.locator('tbody tr').first()).toContainText('Completada');
});

test('TaskFlow permite crear, avanzar y completar tareas con checkbox', async ({ page }) => {
  await page.goto('/taskflow');
  await page.getByLabel('¿Qué necesitas hacer?').fill('Coordinar volqueta de prueba');
  await page.getByRole('button', { name: 'Añadir tarea' }).click();
  let task = page.locator('.task').filter({ hasText: 'Coordinar volqueta de prueba' });
  await task.getByRole('button', { name: 'Iniciar tarea' }).click();
  await expect(page.locator('.column').nth(1)).toContainText('Coordinar volqueta de prueba');
  await task.getByRole('checkbox').check();
  await page.reload();
  task = page.locator('.task').filter({ hasText: 'Coordinar volqueta de prueba' });
  await expect(task).toHaveClass(/completed/);
  await expect(task.getByRole('checkbox')).toBeChecked();
  await task.getByRole('button', { name: 'Eliminar tarea' }).click();
  await expect(task).toHaveCount(0);
});

test('configuración valida correo y persiste valores y checkbox', async ({ page }) => {
  await page.goto('/configuracion');
  await page.getByLabel('Razón social').fill('Triturados de prueba');
  await page.getByLabel('Correo electrónico').fill('invalido');
  await page.getByRole('button', { name: 'Guardar configuración' }).click();
  await expect(page.getByRole('status')).toHaveCount(0);
  await page.getByLabel('Correo electrónico').fill('operaciones@example.com');
  await page.getByLabel('GPS obligatorio').uncheck();
  await page.getByRole('button', { name: 'Guardar configuración' }).click();
  await expect(page.getByRole('status')).toContainText('guardada');
  await page.reload();
  await expect(page.getByLabel('Razón social')).toHaveValue('Triturados de prueba');
  await expect(page.getByLabel('GPS obligatorio')).not.toBeChecked();
});

test('LocalStorage dañado se recupera sin impedir el arranque', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('orvia.records.v1', '{json roto');
    localStorage.setItem('orvia.tasks.v1', '[{"id":4}]');
    localStorage.setItem('orvia.settings.v1', 'null');
  });
  await page.goto('/compras');
  await expect(page.locator('tbody tr')).toHaveCount(6);
  await page.goto('/taskflow');
  await expect(page.locator('.task')).toHaveCount(3);
});

test('menú móvil abre, navega y no desborda la pantalla', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/inicio');
  await page.getByRole('button', { name: 'Abrir o contraer menú' }).click();
  await page
    .getByRole('navigation', { name: 'Navegación principal' })
    .getByRole('link', { name: 'Inventario' })
    .click();
  await expect(page).toHaveURL(/inventario$/);
  await expect(page.locator('.sidebar-wrap')).not.toHaveClass(/open/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('los diálogos mantienen el foco y se cierran con Escape', async ({ page }) => {
  await page.goto('/ventas');
  const trigger = page.getByRole('button', { name: 'Nuevo registro', exact: true });
  await trigger.click();
  await expect(
    page.getByRole('dialog').getByRole('button', { name: 'Cerrar formulario' }),
  ).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(
    page.getByRole('dialog').getByRole('button', { name: 'Guardar registro' }),
  ).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(trigger).toBeFocused();
});
