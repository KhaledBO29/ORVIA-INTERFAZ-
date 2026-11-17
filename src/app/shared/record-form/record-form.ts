import { Component, inject, input, OnInit, output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { Store } from '../../core/store';
import { Draft, emptyDraft, Kind, Line, Party, plants, quote, today } from '../../core/erp';
import { DialogFocus } from '../dialog-focus.directive';
import { Icon } from '../icon/icon';
@Component({
  selector: 'app-record-form',
  imports: [FormsModule, CurrencyPipe, Icon, DialogFocus],
  templateUrl: './record-form.html',
  styleUrl: './record-form.scss',
})
export class RecordForm implements OnInit {
  readonly title = input('Nuevo registro');
  readonly mode = input('ventas');
  readonly party = input<Party | null>(null);
  readonly partyType = input<'proveedor' | 'cliente'>('proveedor');
  readonly closed = output<void>();
  readonly saved = output<void>();
  readonly store = inject(Store);
  readonly plants = plants;
  readonly today = today();
  draft: Draft = emptyDraft('venta');
  third: Party = {
    id: '',
    name: '',
    nit: '',
    email: '',
    phone: '',
    specialty: '',
    type: 'proveedor',
    active: true,
  };
  error = '';
  get isParty() {
    return this.mode() === 'proveedores' || this.mode() === 'clientes';
  }
  get isCash() {
    return ['gasto', 'ingreso'].includes(this.draft.kind);
  }
  get internal() {
    return ['entrada', 'consumo'].includes(this.draft.kind);
  }
  get totals() {
    return quote(this.draft);
  }
  get counterparties() {
    return this.store
      .parties()
      .filter(
        (p) => p.active && p.type === (this.draft.kind === 'venta' ? 'cliente' : 'proveedor'),
      );
  }
  ngOnInit() {
    const kinds: Record<string, Kind> = {
      compras: 'orden',
      'ordenes-compra': 'orden',
      solicitudes: 'solicitud',
      ventas: 'venta',
      inventario: 'entrada',
      consumo: 'consumo',
      finanzas: 'gasto',
      ingreso: 'ingreso',
    };
    this.draft = emptyDraft(kinds[this.mode()] ?? 'venta');
    this.draft.retention = this.store.preferences().retention;
    if (this.store.plant() !== 'Todas las sucursales') this.draft.plant = this.store.plant();
    if (this.store.company() !== 'Todas las empresas') this.draft.company = this.store.company();
    if (this.isParty)
      this.third = this.party()
        ? { ...this.party()! }
        : { ...this.third, type: this.mode() === 'clientes' ? 'cliente' : this.partyType() };
    else if (!this.isCash) this.addLine();
  }
  addLine() {
    const p = this.store.products.find((p) => !this.draft.lines.some((l) => l.productId === p.id));
    if (p)
      this.draft.lines.push({
        productId: p.id,
        quantity: 1,
        price: this.draft.kind === 'venta' ? p.price : p.cost,
        iva: this.internal ? 0 : this.store.preferences().iva,
        stockCost: 0,
      });
  }
  get trips() {
    return Math.ceil(
      this.draft.lines
        .filter((l) => this.store.unit(l.productId) === 'm³')
        .reduce((s, l) => s + l.quantity, 0) / this.store.preferences().capacity,
    );
  }
  selectProduct(line: Line) {
    const p = this.store.products.find((p) => p.id === line.productId)!;
    line.price = this.draft.kind === 'venta' ? p.price : p.cost;
  }
  available(line: Line) {
    return (
      this.store.stock().find((p) => p.id === line.productId && p.plant === this.draft.plant)
        ?.quantity ?? 0
    );
  }
  average(line: Line) {
    return (
      this.store.stock().find((p) => p.id === line.productId && p.plant === this.draft.plant)
        ?.average ?? 0
    );
  }
  lineAmount(line: Line) {
    return Math.round(
      line.quantity * (this.draft.kind === 'consumo' ? this.average(line) : line.price),
    );
  }
  submit(form: NgForm) {
    this.error = '';
    if (form.invalid) {
      form.control.markAllAsTouched();
      this.error = 'Completa los campos requeridos y confirma la revisión.';
      return;
    }
    try {
      if (this.isParty) this.store.saveParty(this.third);
      else this.store.create(this.draft);
      this.saved.emit();
    } catch (e) {
      this.error = (e as Error).message;
    }
  }
}
