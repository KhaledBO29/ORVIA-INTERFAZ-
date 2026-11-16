export interface BusinessRecord {
  id: string;
  name: string;
  detail: string;
  company: string;
  plant: string;
  date: string;
  status: string;
  amount: number;
  quantity: number;
}
export interface Task {
  id: string;
  title: string;
  status: 'Pendiente' | 'En proceso' | 'Completada';
}
export interface Metric {
  label: string;
  value: number;
  change: string;
  tone?: string;
  money?: boolean;
  icon: string;
}
export const sections = [
  ['inicio', 'Inicio', 'home'],
  ['finanzas', 'Finanzas', 'bank'],
  ['ventas', 'Ventas', 'wallet'],
  ['inventario', 'Inventario', 'box'],
  ['compras', 'Compras', 'cart'],
  ['proveedores', 'Proveedores', 'users'],
  ['solicitudes', 'Solicitudes', 'file'],
  ['ordenes-compra', 'Órdenes de compra', 'file'],
  ['recepciones', 'Recepciones', 'truck'],
  ['cuentas-por-pagar', 'Cuentas por pagar', 'wallet'],
  ['pagos', 'Pagos', 'wallet'],
  ['reportes', 'Reportes', 'chart'],
  ['taskflow', 'TaskFlow', 'check'],
  ['configuracion', 'Configuración', 'settings'],
] as const;
