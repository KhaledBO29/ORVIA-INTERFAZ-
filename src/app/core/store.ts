import { Injectable, computed, effect, signal } from '@angular/core';
import { BusinessRecord, Task } from './models';
import {
  catalog,
  defaultPreferences,
  Document,
  Draft,
  ErpState,
  emptyDraft,
  inventory,
  journal,
  Kind,
  kindLabels,
  money,
  outstanding,
  Party,
  Preferences,
  quote,
  seed,
  today,
  validateDraft,
  validState,
} from './erp';
@Injectable({ providedIn: 'root' })
export class Store {
  readonly search = signal('');
  readonly company = signal('Todas las empresas');
  readonly plant = signal('Todas las sucursales');
  readonly period = signal('Este mes');
  readonly storageError = signal('');
  readonly recovery = signal('');
  private readonly state = signal<ErpState>(this.restore());
  readonly documents = computed(() => this.state().documents);
  readonly parties = computed(() => this.state().parties);
  readonly products = catalog;
  readonly stock = computed(() => inventory(this.documents()));
  readonly scopedStock = computed(() =>
    this.stock().filter(
      (p) =>
        (this.plant() === 'Todas las sucursales' || p.plant === this.plant()) &&
        this.matches([p.id, p.name, p.category, p.status].join(' ')),
    ),
  );
  readonly viewDocuments = computed(() =>
    this.documents().filter(
      (d) =>
        this.inScope(d) &&
        this.inPeriod(d) &&
        this.matches(
          [
            d.id,
            this.partyName(d.partyId),
            d.note,
            d.vehicle,
            d.status,
            kindLabels[d.kind],
            ...d.lines.map((l) => this.productName(l.productId)),
          ].join(' '),
        ),
    ),
  );
  readonly pendingRequests = computed(
    () => this.documents().filter((d) => d.kind === 'solicitud' && d.status === 'Pendiente').length,
  );
  readonly ledger = computed(() =>
    this.viewDocuments().flatMap((d) =>
      journal(d)
        .filter((l) => l.debit || l.credit)
        .map((l) => ({
          ...l,
          document: d.id,
          date: d.date,
          concept: d.note || kindLabels[d.kind],
        })),
    ),
  );
  readonly summary = computed(() => {
    const posted = this.viewDocuments().filter((d) => d.status === 'Completada');
    const sales = posted.filter((d) => d.kind === 'venta');
    const revenue = sales.reduce((s, d) => s + quote(d).subtotal + d.freight + d.loading, 0);
    const cogs = sales.reduce((s, d) => s + d.lines.reduce((v, l) => v + l.stockCost, 0), 0);
    const expenses = posted.reduce(
      (s, d) =>
        s +
        (d.kind === 'gasto'
          ? d.amount
          : d.kind === 'consumo'
            ? d.lines.reduce((v, l) => v + l.stockCost, 0)
            : 0),
      0,
    );
    const income = posted.filter((d) => d.kind === 'ingreso').reduce((s, d) => s + d.amount, 0);
    const balances = this.documents().filter((d) => this.inScope(d));
    const payables = balances.filter((d) => d.kind === 'recepcion' && d.status === 'Completada');
    const debt = payables.reduce((s, d) => s + this.balance(d.id), 0);
    const overdue = payables.filter((d) => d.due < today() && this.balance(d.id) > 0).length;
    const payments = posted.filter((d) => d.kind === 'pago').reduce((s, d) => s + d.amount, 0);
    const cashMovements = balances
      .filter((d) => d.status === 'Completada')
      .reduce(
        (s, d) =>
          s +
          (d.kind === 'venta'
            ? quote(d).total
            : d.kind === 'ingreso'
              ? d.amount
              : ['gasto', 'pago'].includes(d.kind)
                ? -d.amount
                : 0),
        0,
      );
    const opening =
      (this.plant() === 'Todas las sucursales' || this.plant() === 'Planta Principal') &&
      (this.company() === 'Todas las empresas' || this.company() === 'Planta de Triturado')
        ? 50000000
        : 0;
    return {
      revenue,
      cogs,
      expenses,
      income,
      profit: revenue + income - cogs - expenses,
      debt,
      overdue,
      payments,
      cash: opening + cashMovements,
      tax: posted.reduce(
        (s, d) =>
          s + (d.kind === 'venta' ? quote(d).tax : d.kind === 'recepcion' ? -quote(d).tax : 0),
        0,
      ),
      retention: posted
        .filter((d) => d.kind === 'recepcion')
        .reduce((s, d) => s + quote(d).withheld, 0),
      purchased: posted
        .filter((d) => d.kind === 'recepcion')
        .reduce((s, d) => s + quote(d).total, 0),
      inventory: this.scopedStock().reduce((s, p) => s + p.value, 0),
      low: this.scopedStock().filter((p) => p.status !== 'Disponible').length,
    };
  });
  readonly tasks = signal<Task[]>(this.restoreTasks());
  readonly preferences = signal<Preferences>(this.readPreferences());
  readonly paymentMethods = computed(() => [
    ...(this.preferences().cash ? ['Efectivo'] : []),
    ...(this.preferences().transfer ? ['Transferencia bancaria'] : []),
  ]);
  constructor() {
    effect(() => this.persist('orvia.tasks.v1', this.tasks()));
  }
  private restore(): ErpState {
    try {
      const raw = localStorage.getItem('orvia.erp.v2');
      if (!raw) return seed();
      const value: unknown = JSON.parse(raw);
      if (validState(value)) return value;
    } catch {
      /* Recuperación de datos ilegibles. */
    }
    this.recovery.set(
      'Los datos operativos guardados no eran válidos. Se cargó la demostración; los registros antiguos v1 no se modificaron.',
    );
    return seed();
  }
  private restoreTasks(): Task[] {
    try {
      const v = JSON.parse(localStorage.getItem('orvia.tasks.v1') ?? 'null');
      if (
        Array.isArray(v) &&
        v.every(
          (t) =>
            t &&
            typeof t.id === 'string' &&
            typeof t.title === 'string' &&
            ['Pendiente', 'En proceso', 'Completada'].includes(t.status),
        )
      )
        return v;
    } catch {
      /* Valores iniciales. */
    }
    return [
      { id: 't1', title: 'Revisar reserva de triturado 3/4″', status: 'Pendiente' },
      { id: 't2', title: 'Confirmar recepción de diésel ACPM', status: 'En proceso' },
      { id: 't3', title: 'Verificar mallas de vibración', status: 'Completada' },
    ];
  }
  persist(key: string, value: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      this.storageError.set('');
    } catch {
      this.storageError.set(
        'El navegador no permitió guardar. Los cambios solo estarán disponibles durante esta sesión.',
      );
    }
  }
  private commit(state: ErpState) {
    this.persist('orvia.erp.v2', state);
    this.state.set(state);
  }
  private id(kind: Kind) {
    const prefix: Record<Kind, string> = {
      solicitud: 'SOL',
      orden: 'OC',
      recepcion: 'REC',
      venta: 'VEN',
      entrada: 'ENT',
      consumo: 'CON',
      gasto: 'GAS',
      ingreso: 'ING',
      pago: 'PAG',
    };
    return prefix[kind] + '-' + crypto.randomUUID().slice(0, 8).toUpperCase();
  }
  private matches(s: string) {
    return s.toLocaleLowerCase('es').includes(this.search().trim().toLocaleLowerCase('es'));
  }
  inScope(d: Document) {
    return (
      (this.company() === 'Todas las empresas' || d.company === this.company()) &&
      (this.plant() === 'Todas las sucursales' || d.plant === this.plant())
    );
  }
  inPeriod(d: Document) {
    return d.date.startsWith(today().slice(0, this.period() === 'Este mes' ? 7 : 4));
  }
  partyName(id: string) {
    return this.parties().find((p) => p.id === id)?.name ?? 'Operación interna de planta';
  }
  productName(id: string) {
    return catalog.find((p) => p.id === id)?.name ?? id;
  }
  unit(id: string) {
    return catalog.find((p) => p.id === id)?.unit ?? 'und';
  }
  incoming(productId: string, plant: string) {
    return this.documents()
      .filter(
        (d) =>
          d.kind === 'orden' && d.plant === plant && ['Pendiente', 'En proceso'].includes(d.status),
      )
      .flatMap((d) => d.lines)
      .filter((l) => l.productId === productId)
      .reduce((s, l) => s + l.quantity, 0);
  }
  balance(id: string) {
    const d = this.documents().find((d) => d.id === id);
    return d ? outstanding(d, this.documents()) : 0;
  }
  private costLines(d: Document): Document {
    const q = quote(d);
    let allocated = 0;
    const lines = d.lines.map((l, index) => {
      const stock = this.stock().find((p) => p.id === l.productId && p.plant === d.plant)!;
      if (['venta', 'consumo'].includes(d.kind) && l.quantity > stock.quantity)
        throw new Error(
          `Stock insuficiente de ${stock.name}: hay ${stock.quantity} ${stock.unit} en ${d.plant}.`,
        );
      let stockCost: number;
      if (d.kind === 'recepcion') {
        const logistics =
          index === d.lines.length - 1
            ? q.logistics - allocated
            : Math.floor((q.logistics * money(l.quantity * l.price)) / (q.subtotal || 1));
        allocated += logistics;
        stockCost = money(l.quantity * l.price) + logistics;
      } else if (d.kind === 'entrada') stockCost = money(l.quantity * l.price);
      else
        stockCost = l.quantity === stock.quantity ? stock.value : money(l.quantity * stock.average);
      return { ...l, stockCost };
    });
    return { ...d, lines, status: 'Completada', postedAt: today() };
  }
  create(draft: Draft) {
    validateDraft(draft, this.state());
    let d: Document = {
      ...structuredClone(draft),
      id: this.id(draft.kind),
      status: 'Pendiente',
      sourceId: '',
      postedAt: '',
    };
    if (['entrada', 'consumo', 'gasto', 'ingreso'].includes(d.kind)) d = this.costLines(d);
    this.commit({ ...this.state(), documents: [...this.documents(), d] });
    return d.id;
  }
  advance(id: string) {
    const original = this.documents().find((d) => d.id === id);
    if (!original || original.status !== 'Pendiente')
      throw new Error('Esta operación ya fue procesada.');
    const docs = structuredClone(this.documents());
    const d = docs.find((d) => d.id === id)!;
    if (d.kind === 'solicitud' || d.kind === 'orden') {
      const kind = d.kind === 'solicitud' ? 'orden' : 'recepcion';
      const child: Document = {
        ...structuredClone(d),
        id: this.id(kind),
        kind,
        sourceId: d.id,
        status: 'Pendiente',
        postedAt: '',
      };
      d.status = d.kind === 'solicitud' ? 'Completada' : 'En proceso';
      docs.push(child);
    } else if (['venta', 'recepcion'].includes(d.kind)) {
      Object.assign(d, this.costLines(d));
      if (d.kind === 'recepcion') {
        const order = docs.find((o) => o.id === d.sourceId && o.kind === 'orden');
        if (!order || order.status !== 'En proceso')
          throw new Error('La orden origen no está disponible.');
        order.status = 'Completada';
      }
    } else throw new Error('La operación no admite esta transición.');
    this.commit({ ...this.state(), documents: docs });
  }
  cancel(id: string) {
    const d = this.documents().find((d) => d.id === id);
    if (!d || d.status !== 'Pendiente' || !['solicitud', 'orden', 'venta'].includes(d.kind))
      throw new Error('Solo se pueden cancelar solicitudes, órdenes y ventas pendientes.');
    this.commit({
      ...this.state(),
      documents: this.documents().map((d) => (d.id === id ? { ...d, status: 'Cancelada' } : d)),
    });
  }
  pay(id: string, amount: number, method: string) {
    const receipt = this.documents().find(
      (d) => d.id === id && d.kind === 'recepcion' && d.status === 'Completada',
    );
    if (!receipt || !Number.isInteger(amount) || amount <= 0 || amount > this.balance(id))
      throw new Error(
        'El abono debe ser positivo, en COP enteros y no superar el saldo pendiente.',
      );
    if (!this.paymentMethods().includes(method))
      throw new Error('El método de pago no está habilitado en Configuración.');
    const payment: Document = {
      ...emptyDraft('pago'),
      id: this.id('pago'),
      status: 'Completada',
      sourceId: id,
      postedAt: today(),
      partyId: receipt.partyId,
      plant: receipt.plant,
      company: receipt.company,
      amount,
      method,
      note: 'Abono a ' + id,
    };
    this.commit({ ...this.state(), documents: [...this.documents(), payment] });
  }
  private readPreferences(): Preferences {
    const result = { ...defaultPreferences };
    try {
      const raw = JSON.parse(localStorage.getItem('orvia.settings.v1') ?? '{}');
      if (!raw || typeof raw !== 'object') return result;
      for (const k of ['name', 'nit', 'email', 'phone'] as const)
        if (typeof raw[k] === 'string') result[k] = raw[k];
      for (const k of ['cash', 'transfer', 'notifications'] as const)
        if (typeof raw[k] === 'boolean') result[k] = raw[k];
      for (const k of ['iva', 'retention', 'capacity'] as const)
        if (
          typeof raw[k] === 'number' &&
          Number.isFinite(raw[k]) &&
          raw[k] >= (k === 'capacity' ? 1 : 0) &&
          raw[k] <= 100
        )
          result[k] = raw[k];
    } catch {
      /* Preferencias iniciales. */
    }
    return result;
  }
  savePreferences(value: Preferences) {
    this.persist('orvia.settings.v1', value);
    this.preferences.set(value);
  }
  backup() {
    return JSON.stringify(
      { operations: this.state(), tasks: this.tasks(), preferences: this.preferences() },
      null,
      2,
    );
  }
  saveParty(party: Party) {
    if (
      party.name.trim().length < 3 ||
      !party.nit.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(party.email) ||
      !party.phone.trim()
    )
      throw new Error('Completa nombre, NIT, teléfono y un correo válido.');
    if (this.parties().some((p) => p.id !== party.id && p.nit.trim() === party.nit.trim()))
      throw new Error('Ya existe un tercero con este NIT.');
    const p = {
      ...party,
      name: party.name.trim(),
      nit: party.nit.trim(),
      id: party.id || 'TER-' + crypto.randomUUID().slice(0, 8),
    };
    this.commit({ ...this.state(), parties: [...this.parties().filter((v) => v.id !== p.id), p] });
  }
  private asRow(d: Document, mode: string): BusinessRecord {
    const balance = this.balance(d.id);
    return {
      id: d.id,
      name: this.partyName(d.partyId),
      detail:
        kindLabels[d.kind] +
        ' · ' +
        (d.lines
          .map((l) => `${this.productName(l.productId)} (${l.quantity} ${this.unit(l.productId)})`)
          .join(', ') || d.note),
      company: d.company,
      plant: d.plant,
      date: d.date,
      status:
        mode === 'cuentas-por-pagar'
          ? balance === 0
            ? 'Pagada'
            : d.due < today()
              ? 'Vencida'
              : balance < quote(d).total
                ? 'Abonada'
                : 'Pendiente'
          : d.status,
      amount:
        mode === 'cuentas-por-pagar'
          ? balance
          : ['gasto', 'ingreso', 'pago'].includes(d.kind)
            ? d.amount
            : quote(d).total,
      quantity: d.lines.length,
      unit: 'líneas',
    };
  }
  rowsFor(mode: string): BusinessRecord[] {
    if (mode === 'inventario')
      return this.scopedStock().map((p) => ({
        id: p.id + '@' + p.plant,
        name: p.category,
        detail: p.name,
        company: 'Stock físico de planta',
        plant: p.plant,
        date: today(),
        status: p.status,
        amount: p.value,
        quantity: p.quantity,
        unit: p.unit,
        incoming: this.incoming(p.id, p.plant),
        average: p.average,
      }));
    if (mode === 'proveedores')
      return this.parties()
        .filter(
          (p) => p.type === 'proveedor' && this.matches(p.name + ' ' + p.nit + ' ' + p.specialty),
        )
        .map((p) => ({
          id: p.id,
          name: p.name,
          detail: p.specialty,
          company: p.nit,
          plant: p.phone,
          date: today(),
          status: p.active ? 'Activo' : 'Inactivo',
          amount: this.documents()
            .filter((d) => d.partyId === p.id && this.inScope(d))
            .reduce((s, d) => s + outstanding(d, this.documents()), 0),
          quantity: this.documents().filter(
            (d) => d.partyId === p.id && d.kind === 'orden' && this.inScope(d),
          ).length,
          unit: 'órdenes',
        }));
    const kinds: Record<string, Kind[]> = {
      compras: ['orden'],
      ventas: ['venta'],
      solicitudes: ['solicitud'],
      'ordenes-compra': ['orden'],
      recepciones: ['recepcion'],
      'cuentas-por-pagar': ['recepcion'],
      pagos: ['pago'],
      finanzas: ['venta', 'recepcion', 'pago', 'gasto', 'ingreso', 'consumo', 'entrada'],
      reportes: ['venta', 'recepcion', 'consumo', 'entrada', 'gasto', 'ingreso', 'pago'],
    };
    const source =
      mode === 'cuentas-por-pagar'
        ? this.documents().filter(
            (d) => this.inScope(d) && this.matches(d.id + ' ' + this.partyName(d.partyId)),
          )
        : this.viewDocuments();
    return source
      .filter(
        (d) =>
          (kinds[mode] ?? []).includes(d.kind) &&
          (['cuentas-por-pagar', 'finanzas', 'reportes'].includes(mode)
            ? d.status === 'Completada'
            : true),
      )
      .map((d) => this.asRow(d, mode))
      .reverse();
  }
}
