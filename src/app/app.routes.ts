import { Routes } from '@angular/router';
export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  {
    path: 'inicio',
    title: 'Inicio · ORVIA',
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'finanzas',
    title: 'Finanzas · ORVIA',
    loadComponent: () => import('./pages/finanzas/finanzas').then((m) => m.FinancePage),
  },
  {
    path: 'ventas',
    title: 'Ventas · ORVIA',
    loadComponent: () => import('./pages/ventas/ventas').then((m) => m.SalesPage),
  },
  {
    path: 'inventario',
    title: 'Inventario · ORVIA',
    loadComponent: () => import('./pages/inventario/inventario').then((m) => m.InventoryPage),
  },
  {
    path: 'compras',
    title: 'Compras · ORVIA',
    loadComponent: () => import('./pages/compras/compras').then((m) => m.PurchasesPage),
  },
  {
    path: 'proveedores',
    title: 'Proveedores · ORVIA',
    loadComponent: () => import('./pages/proveedores/proveedores').then((m) => m.SuppliersPage),
  },
  {
    path: 'solicitudes',
    title: 'Solicitudes · ORVIA',
    loadComponent: () => import('./pages/solicitudes/solicitudes').then((m) => m.RequestsPage),
  },
  {
    path: 'ordenes-compra',
    title: 'Órdenes de compra · ORVIA',
    loadComponent: () => import('./pages/ordenes-compra/ordenes-compra').then((m) => m.OrdersPage),
  },
  {
    path: 'recepciones',
    title: 'Recepciones · ORVIA',
    loadComponent: () => import('./pages/recepciones/recepciones').then((m) => m.ReceptionsPage),
  },
  {
    path: 'cuentas-por-pagar',
    title: 'Cuentas por pagar · ORVIA',
    loadComponent: () =>
      import('./pages/cuentas-por-pagar/cuentas-por-pagar').then((m) => m.PayablesPage),
  },
  {
    path: 'pagos',
    title: 'Pagos · ORVIA',
    loadComponent: () => import('./pages/pagos/pagos').then((m) => m.PaymentsPage),
  },
  {
    path: 'reportes',
    title: 'Reportes · ORVIA',
    loadComponent: () => import('./pages/reportes/reportes').then((m) => m.ReportsPage),
  },
  {
    path: 'taskflow',
    title: 'TaskFlow · ORVIA',
    loadComponent: () => import('./pages/taskflow/taskflow').then((m) => m.Taskflow),
  },
  {
    path: 'configuracion',
    title: 'Configuración · ORVIA',
    loadComponent: () => import('./pages/settings/settings').then((m) => m.Settings),
  },
  { path: '**', redirectTo: 'inicio' },
];
