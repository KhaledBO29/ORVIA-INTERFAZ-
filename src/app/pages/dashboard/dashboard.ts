import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { Store } from '../../core/store';
import { Metric } from '../../core/models';
import { kindLabels, quote, today } from '../../core/erp';
import { StatCard } from '../../shared/stat-card/stat-card';
import { Chart } from '../../shared/chart/chart';
import { Icon } from '../../shared/icon/icon';
import { RecordForm } from '../../shared/record-form/record-form';
@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, CurrencyPipe, StatCard, Chart, Icon, RecordForm],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  readonly store = inject(Store);
  readonly form = signal('');
  readonly notice = signal('');
  readonly date = today();
  readonly actions = [
    ['Nueva venta', 'cart', 'ventas'],
    ['Nueva compra', 'download', 'compras'],
    ['Nuevo cliente', 'users', 'clientes'],
    ['Registrar gasto', 'wallet', 'finanzas'],
    ['Registrar ingreso', 'bank', 'ingreso'],
    ['Movimiento de inventario', 'box', 'inventario'],
    ['Crear solicitud', 'file', 'solicitudes'],
  ];
  readonly metrics = computed<Metric[]>(() => {
    const s = this.store.summary();
    return [
      { label: 'Ventas sin IVA', value: s.revenue, change: 'Período seleccionado', icon: 'wallet' },
      {
        label: 'Resultado operativo',
        value: s.profit,
        change: 'Ingresos − costos − gastos',
        icon: 'chart',
      },
      {
        label: 'Gastos y consumos',
        value: s.expenses,
        change: 'Período seleccionado',
        icon: 'wallet',
        tone: 'pink',
      },
      { label: 'Caja y bancos', value: s.cash, change: 'Saldo actual', icon: 'bank' },
    ];
  });
  readonly activity = computed(() => this.store.viewDocuments().slice().reverse().slice(0, 5));
  readonly sales = computed(() =>
    this.store.rowsFor('ventas').filter((r) => r.status === 'Completada'),
  );
  readonly labels = kindLabels;
  readonly quote = quote;
  readonly alerts = computed(() => [
    [
      this.store.summary().overdue + ' facturas vencidas',
      'Consulta el saldo y registra abonos',
      'cuentas-por-pagar',
      'wallet',
    ],
    [
      this.store.summary().low + ' referencias con stock bajo',
      'Existencias por planta',
      'inventario',
      'box',
    ],
    [
      this.store.pendingRequests() + ' solicitudes pendientes',
      'Revisar requerimientos de la planta',
      'solicitudes',
      'file',
    ],
    [
      this.store
        .documents()
        .filter((d) => d.kind === 'recepcion' && d.status === 'Pendiente' && this.store.inScope(d))
        .length + ' recepciones pendientes',
      'Ingresos físicos por confirmar',
      'recepciones',
      'truck',
    ],
  ]);
  saved() {
    this.form.set('');
    this.notice.set('Registro guardado. Los módulos relacionados se actualizaron.');
  }
}
