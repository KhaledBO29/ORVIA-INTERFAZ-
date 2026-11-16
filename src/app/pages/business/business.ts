import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { Store } from '../../core/store';
import { BusinessRecord, Metric } from '../../core/models';
import { StatCard } from '../../shared/stat-card/stat-card';
import { Chart } from '../../shared/chart/chart';
import { DataTable } from '../../shared/data-table/data-table';
import { Icon } from '../../shared/icon/icon';
import { DialogFocus } from '../../shared/dialog-focus.directive';
import { RecordForm } from '../../shared/record-form/record-form';
@Component({
  selector: 'app-business',
  imports: [RouterLink, CurrencyPipe, StatCard, Chart, DataTable, Icon, RecordForm, DialogFocus],
  templateUrl: './business.html',
  styleUrl: './business.scss',
})
export class Business {
  readonly store = inject(Store);
  readonly title = input('Operaciones');
  readonly mode = input('compras');
  readonly form = signal(false);
  readonly selected = signal<BusinessRecord | null>(null);
  readonly notice = signal('');
  readonly listFirst = computed(() =>
    ['solicitudes', 'ordenes-compra', 'recepciones', 'cuentas-por-pagar'].includes(this.mode()),
  );
  readonly activeStatus = signal('Todos');
  readonly rows = computed(() =>
    this.store
      .filtered()
      .filter((r) => this.activeStatus() === 'Todos' || r.status === this.activeStatus()),
  );
  readonly pending = computed(() =>
    this.rows().filter((r) => ['Pendiente', 'En proceso'].includes(r.status)),
  );
  readonly total = computed(() => this.rows().reduce((sum, r) => sum + r.amount, 0));
  readonly quantity = computed(() => this.rows().reduce((sum, r) => sum + r.quantity, 0));
  readonly metricLabels = computed(
    () =>
      (
        ({
          finanzas: ['Ingresos', 'Gastos', 'Utilidad', 'Cartera', 'Cuentas por pagar'],
          ventas: ['Ventas totales', 'Pedidos', 'Entregados', 'Pendientes', 'Devoluciones'],
          inventario: [
            'Valor total inventario',
            'Materiales totales',
            'Stock disponible (m³)',
            'Materiales bajos',
            'Agotados',
          ],
          compras: [
            'Compras totales',
            'Órdenes de compra',
            'Recibidas',
            'Por recibir',
            'Pendientes por pagar',
          ],
          proveedores: [
            'Compras a proveedores',
            'Proveedores activos',
            'Evaluaciones positivas',
            'Pendientes',
            'Por revisar',
          ],
          solicitudes: [
            'Valor estimado',
            'Solicitudes totales',
            'Aprobadas',
            'Pendientes',
            'Rechazadas',
          ],
          'ordenes-compra': [
            'Valor de las órdenes',
            'Órdenes totales',
            'Recibidas completas',
            'Parcialmente recibidas',
            'Canceladas',
          ],
          recepciones: [
            'Valor de recepciones',
            'Recepciones totales',
            'Completadas',
            'Pendientes por recibir',
            'Por revisar',
          ],
          'cuentas-por-pagar': [
            'Total por pagar',
            'Documentos',
            'Pagadas',
            'Por vencer',
            'Vencidas',
          ],
          pagos: ['Total pagado', 'Pagos del período', 'Realizados', 'Programados', 'Rechazados'],
          reportes: [
            'Total entradas',
            'Viajes realizados',
            'Despachos completados',
            'En tránsito',
            'Pendientes',
          ],
        }) as Record<string, string[]>
      )[this.mode()] ?? ['Total', 'Registros', 'Completados', 'Pendientes', 'Por revisar'],
  );
  readonly metrics = computed<Metric[]>(() => {
    const rows = this.store.filtered();
    const labels = this.metricLabels();
    const total = this.store.total();
    const completed = rows.filter((r) => r.status === 'Completada');
    return [
      {
        label: labels[0],
        value: this.mode() === 'pagos' ? completed.reduce((sum, r) => sum + r.amount, 0) : total,
        change: '↑ 14,2%',
        icon: 'wallet',
      },
      {
        label: labels[1],
        value: rows.length,
        change: '↑ 9,1%',
        money: false,
        icon: 'file',
        tone: 'pink',
      },
      {
        label: labels[2],
        value:
          this.mode() === 'finanzas'
            ? total * 0.34
            : this.mode() === 'inventario'
              ? rows.reduce((sum, r) => sum + r.quantity, 0)
              : completed.length,
        change: '↑ 5,6%',
        money: this.mode() === 'finanzas',
        icon: 'check',
        tone: 'green',
      },
      {
        label: labels[3],
        value:
          this.mode() === 'finanzas'
            ? total * 0.18
            : rows.filter((r) => ['Pendiente', 'En proceso'].includes(r.status)).length,
        change: '↑ 8,3%',
        money: this.mode() === 'finanzas',
        icon: 'box',
        tone: 'amber',
      },
      {
        label: labels[4],
        value:
          this.mode() === 'finanzas'
            ? total * 0.24
            : rows.filter((r) => r.status === 'Vencida').length,
        change: '↓ 6,7%',
        money: this.mode() === 'finanzas',
        icon: 'bell',
        tone: 'pink',
      },
    ];
  });
  readonly categories = [
    ['Triturado 3/4″', '38,4%', '#7951ef'],
    ['Base granular', '26,7%', '#f49ab7'],
    ['Arena triturada', '20,7%', '#efb43b'],
    ['Otros materiales', '14,2%', '#43bd99'],
  ];
  saved() {
    this.form.set(false);
    this.notice.set('Registro guardado correctamente.');
  }
  complete() {
    const r = this.selected();
    if (r) {
      this.store.complete(r.id);
      this.selected.set(null);
      this.notice.set('Registro marcado como completado.');
    }
  }
}
