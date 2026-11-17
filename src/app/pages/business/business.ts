import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '../../core/store';
import { BusinessRecord, Metric } from '../../core/models';
import { Document, journal, kindLabels, quote, today } from '../../core/erp';
import { StatCard } from '../../shared/stat-card/stat-card';
import { Chart } from '../../shared/chart/chart';
import { DataTable } from '../../shared/data-table/data-table';
import { Icon } from '../../shared/icon/icon';
import { DialogFocus } from '../../shared/dialog-focus.directive';
import { RecordForm } from '../../shared/record-form/record-form';
@Component({
  selector: 'app-business',
  imports: [
    RouterLink,
    CurrencyPipe,
    DecimalPipe,
    FormsModule,
    StatCard,
    Chart,
    DataTable,
    Icon,
    RecordForm,
    DialogFocus,
  ],
  templateUrl: './business.html',
  styleUrl: './business.scss',
})
export class Business {
  readonly store = inject(Store);
  readonly title = input('Operaciones');
  readonly mode = input('compras');
  readonly formMode = signal('');
  readonly selectedId = signal('');
  readonly notice = signal('');
  readonly error = signal('');
  readonly activeStatus = signal('Todos');
  readonly rows = computed(() => this.store.rowsFor(this.mode()));
  readonly statuses = computed(() => ['Todos', ...new Set(this.rows().map((r) => r.status))]);
  readonly visibleRows = computed(() =>
    this.rows().filter((r) => this.activeStatus() === 'Todos' || r.status === this.activeStatus()),
  );
  readonly selected = computed(() =>
    this.store.documents().find((d) => d.id === this.selectedId()),
  );
  readonly selectedParty = computed(
    () => this.store.parties().find((p) => p.id === this.selectedId()) ?? null,
  );
  readonly selectedStock = computed(() =>
    this.store.stock().find((p) => p.id + '@' + p.plant === this.selectedId()),
  );
  readonly selectedJournal = computed(() => (this.selected() ? journal(this.selected()!) : []));
  readonly children = computed(() =>
    this.store.documents().filter((d) => d.sourceId === this.selectedId()),
  );
  readonly stockHistory = computed(() => {
    const p = this.selectedStock();
    return p
      ? this.store
          .documents()
          .filter(
            (d) =>
              d.plant === p.plant &&
              d.status === 'Completada' &&
              ['venta', 'recepcion', 'entrada', 'consumo'].includes(d.kind) &&
              d.lines.some((l) => l.productId === p.id),
          )
          .reverse()
      : [];
  });
  readonly description = computed(
    () =>
      (
        ({
          compras:
            'Planifica abastecimiento de combustible, repuestos y agregados. Las órdenes no afectan stock hasta su recepción.',
          'ordenes-compra':
            'Emite una recepción por cada orden. La recepción confirma el ingreso completo de sus productos.',
          solicitudes:
            'Revisa requerimientos de la planta y apruébalos para generar órdenes de compra.',
          recepciones:
            'Confirma el ingreso físico: actualiza existencias, costo promedio y cuentas por pagar.',
          ventas:
            'Cotiza agregados y despacha volquetas. El despacho descuenta stock y registra una venta de contado.',
          inventario:
            'Existencias físicas actuales por planta, con unidades y costo promedio. No dependen del período ni de la empresa comercial.',
          proveedores:
            'Directorio compartido de proveedores. Los saldos y las órdenes respetan empresa y planta; el directorio no depende del período.',
          'cuentas-por-pagar':
            'Saldos actuales de recepciones confirmadas, incluidos documentos de períodos anteriores.',
          pagos:
            'Historial de abonos confirmados a proveedores. Registra un pago desde una cuenta por pagar.',
          finanzas:
            'Resultados del período y movimientos contables simulados. Caja y deuda muestran saldos actuales por empresa y planta.',
          reportes:
            'Operación del período: despachos, abastecimiento, consumos, márgenes y trazabilidad documental.',
        }) as Record<string, string>
      )[this.mode()] ?? 'Gestión de operaciones de planta.',
  );
  readonly metrics = computed<Metric[]>(() => {
    const s = this.store.summary();
    const rows = this.rows();
    const docs = this.store.viewDocuments();
    const metric = (label: string, value: number, money = true, icon = 'wallet'): Metric => ({
      label,
      value,
      money,
      icon,
      change: money ? 'COP · cálculo real' : 'Registros actuales',
    });
    switch (this.mode()) {
      case 'finanzas':
      case 'reportes':
        return [
          metric('Ventas sin IVA', s.revenue),
          metric('Costo de ventas', s.cogs),
          metric('Gastos y consumos', s.expenses),
          metric('Resultado operativo', s.profit),
          metric('Caja actual', s.cash),
        ];
      case 'inventario':
        return [
          metric('Valor del stock', s.inventory),
          metric('Referencias por planta', rows.length, false, 'box'),
          metric('Existencias bajas', s.low, false, 'bell'),
          metric(
            'Consumos del período',
            docs.filter((d) => d.kind === 'consumo' && d.status === 'Completada').length,
            false,
            'truck',
          ),
        ];
      case 'ventas':
        return [
          metric('Facturado sin IVA', s.revenue),
          metric('Costo despachado', s.cogs),
          metric('Margen bruto', s.revenue - s.cogs),
          metric(
            'Pendientes de despacho',
            rows.filter((r) => r.status === 'Pendiente').length,
            false,
            'truck',
          ),
        ];
      case 'cuentas-por-pagar':
        return [
          metric(
            'Saldo con proveedores',
            rows.reduce((s, r) => s + r.amount, 0),
          ),
          metric('Documentos abiertos', rows.filter((r) => r.amount > 0).length, false, 'file'),
          metric('Vencidas', rows.filter((r) => r.status === 'Vencida').length, false, 'bell'),
          metric('Abonos del período', s.payments),
        ];
      case 'pagos':
        return [
          metric('Pagado en el período', s.payments),
          metric('Abonos registrados', rows.length, false, 'check'),
          metric('Saldo por pagar', s.debt),
          metric('Caja actual', s.cash),
        ];
      case 'proveedores':
        return [
          metric(
            'Proveedores activos',
            rows.filter((r) => r.status === 'Activo').length,
            false,
            'users',
          ),
          metric(
            'Saldo a proveedores',
            rows.reduce((s, r) => s + r.amount, 0),
          ),
          metric('Compras recibidas', s.purchased),
          metric(
            'Órdenes del período',
            docs.filter((d) => d.kind === 'orden').length,
            false,
            'file',
          ),
        ];
      default:
        return [
          metric(
            'Valor de documentos',
            rows.filter((r) => r.status !== 'Cancelada').reduce((s, r) => s + r.amount, 0),
          ),
          metric('Documentos del período', rows.length, false, 'file'),
          metric('Pendientes', rows.filter((r) => r.status === 'Pendiente').length, false, 'truck'),
          metric(
            'Completados',
            rows.filter((r) => r.status === 'Completada').length,
            false,
            'check',
          ),
        ];
    }
  });
  readonly chartRows = computed(() => this.rows().filter((r) => r.status === 'Completada'));
  readonly reportProducts = computed(() =>
    this.store.products
      .map((p) => {
        const docs = this.store.viewDocuments().filter((d) => d.status === 'Completada');
        const sales = docs
          .filter((d) => d.kind === 'venta')
          .flatMap((d) => d.lines)
          .filter((l) => l.productId === p.id);
        const receipts = docs
          .filter((d) => d.kind === 'recepcion')
          .flatMap((d) => d.lines)
          .filter((l) => l.productId === p.id);
        return {
          ...p,
          sold: sales.reduce((s, l) => s + l.quantity, 0),
          received: receipts.reduce((s, l) => s + l.quantity, 0),
          revenue: sales.reduce((s, l) => s + Math.round(l.quantity * l.price), 0),
          cost: sales.reduce((s, l) => s + l.stockCost, 0),
        };
      })
      .filter((p) => p.sold || p.received),
  );
  payAmount = 0;
  payMethod = 'Transferencia bancaria';
  readonly quote = quote;
  readonly labels = kindLabels;
  readonly today = today();
  constructor() {
    effect(() => {
      if (!this.statuses().includes(this.activeStatus())) this.activeStatus.set('Todos');
    });
  }
  open(row: BusinessRecord) {
    this.selectedId.set(row.id);
    this.error.set('');
    this.payAmount = this.store.balance(row.id);
    this.payMethod = this.store.paymentMethods()[0] ?? '';
  }
  run(action: () => void, message: string) {
    try {
      action();
      this.notice.set(message);
      this.error.set('');
    } catch (e) {
      this.error.set((e as Error).message);
    }
  }
  advance(d: Document) {
    this.run(
      () => this.store.advance(d.id),
      (
        {
          solicitud: 'Solicitud aprobada. La orden está disponible en Órdenes de compra.',
          orden: 'Recepción generada. Confirma el ingreso desde Recepciones.',
          recepcion: 'Recepción confirmada: inventario y deuda actualizados.',
          venta: 'Despacho confirmado: stock, costo de venta y caja actualizados.',
        } as Record<string, string>
      )[d.kind],
    );
  }
  actionLabel(d: Document) {
    return (
      {
        solicitud: 'Aprobar y crear orden',
        orden: 'Generar recepción',
        recepcion: 'Confirmar recepción',
        venta: 'Confirmar despacho y cobro',
      } as Record<string, string>
    )[d.kind];
  }
  pay() {
    this.run(() => {
      this.store.pay(this.selectedId(), this.payAmount, this.payMethod);
      this.payAmount = this.store.balance(this.selectedId());
    }, 'Abono registrado. Se actualizaron el saldo y la caja.');
  }
  cancelSelected() {
    this.run(
      () => this.store.cancel(this.selectedId()),
      'Documento cancelado. No generó movimientos de inventario ni contabilidad.',
    );
  }
  openDocument(d: Document) {
    this.selectedId.set(d.id);
    this.error.set('');
    this.payAmount = this.store.balance(d.id);
    this.payMethod = this.store.paymentMethods()[0] ?? '';
  }
  saved() {
    this.formMode.set('');
    this.notice.set('Registro guardado. Los módulos relacionados se actualizaron.');
  }
}
