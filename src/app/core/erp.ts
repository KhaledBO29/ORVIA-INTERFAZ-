// Dominio de la simulación: importes en COP enteros, cantidades con hasta 3 decimales.
export const plants = ['Planta Principal', 'Planta El Encano'];
export type Kind =
  | 'solicitud'
  | 'orden'
  | 'recepcion'
  | 'venta'
  | 'entrada'
  | 'consumo'
  | 'gasto'
  | 'ingreso'
  | 'pago';
export type Status = 'Pendiente' | 'En proceso' | 'Completada' | 'Cancelada';
export interface Product {
  id: string;
  name: string;
  category: string;
  unit: string;
  cost: number;
  price: number;
  minimum: number;
  opening: number;
}
export interface Party {
  id: string;
  name: string;
  nit: string;
  email: string;
  phone: string;
  specialty: string;
  type: 'proveedor' | 'cliente';
  active: boolean;
}
export interface Line {
  productId: string;
  quantity: number;
  price: number;
  iva: number;
  stockCost: number;
}
export interface Draft {
  kind: Kind;
  partyId: string;
  plant: string;
  company: string;
  date: string;
  due: string;
  lines: Line[];
  freight: number;
  loading: number;
  retention: number;
  note: string;
  vehicle: string;
  amount: number;
  method: string;
}
export interface Document extends Draft {
  id: string;
  status: Status;
  sourceId: string;
  postedAt: string;
}
export interface ErpState {
  version: 2;
  parties: Party[];
  documents: Document[];
}
export interface Preferences {
  name: string;
  nit: string;
  email: string;
  phone: string;
  iva: number;
  retention: number;
  capacity: number;
  notifications: boolean;
  cash: boolean;
  transfer: boolean;
}
export const defaultPreferences: Preferences = {
  name: 'Planta de Triturado',
  nit: '901234567-8',
  email: 'info@orvia.demo',
  phone: '+57 317 654 3210',
  iva: 19,
  retention: 0,
  capacity: 12,
  notifications: true,
  cash: true,
  transfer: true,
};
export interface JournalLine {
  account: string;
  debit: number;
  credit: number;
}
export const catalog: Product[] = [
  {
    id: 'AG-034',
    name: 'Triturado 3/4″',
    category: 'Agregados',
    unit: 'm³',
    cost: 42000,
    price: 78000,
    minimum: 100,
    opening: 620,
  },
  {
    id: 'AG-012',
    name: 'Triturado 1/2″',
    category: 'Agregados',
    unit: 'm³',
    cost: 45000,
    price: 82000,
    minimum: 100,
    opening: 390,
  },
  {
    id: 'AG-038',
    name: 'Triturado 3/8″',
    category: 'Agregados',
    unit: 'm³',
    cost: 48000,
    price: 86000,
    minimum: 80,
    opening: 72,
  },
  {
    id: 'AG-ARE',
    name: 'Arena triturada',
    category: 'Agregados',
    unit: 'm³',
    cost: 32000,
    price: 62000,
    minimum: 100,
    opening: 480,
  },
  {
    id: 'AG-PEN',
    name: 'Arena de peña',
    category: 'Agregados',
    unit: 'm³',
    cost: 28000,
    price: 55000,
    minimum: 80,
    opening: 190,
  },
  {
    id: 'AG-BAS',
    name: 'Base granular',
    category: 'Agregados',
    unit: 'm³',
    cost: 30000,
    price: 57000,
    minimum: 120,
    opening: 310,
  },
  {
    id: 'RP-BAN',
    name: 'Banda transportadora 24 pulgadas',
    category: 'Repuestos',
    unit: 'm',
    cost: 235000,
    price: 290000,
    minimum: 10,
    opening: 8,
  },
  {
    id: 'RP-ROD',
    name: 'Rodamiento industrial 22220',
    category: 'Repuestos',
    unit: 'und',
    cost: 680000,
    price: 790000,
    minimum: 4,
    opening: 12,
  },
  {
    id: 'RP-TOR',
    name: 'Tornillo grado 8 de 3/4″',
    category: 'Consumibles',
    unit: 'und',
    cost: 8500,
    price: 11000,
    minimum: 50,
    opening: 220,
  },
  {
    id: 'RP-TUE',
    name: 'Tuerca industrial de 3/4″',
    category: 'Consumibles',
    unit: 'und',
    cost: 3200,
    price: 4500,
    minimum: 50,
    opening: 280,
  },
  {
    id: 'RP-MAL',
    name: 'Malla de vibración 3/4″',
    category: 'Repuestos',
    unit: 'und',
    cost: 1250000,
    price: 1480000,
    minimum: 2,
    opening: 3,
  },
  {
    id: 'CB-DIE',
    name: 'Diésel ACPM',
    category: 'Combustibles',
    unit: 'gal',
    cost: 10800,
    price: 12000,
    minimum: 200,
    opening: 850,
  },
  {
    id: 'CB-ACE',
    name: 'Aceite hidráulico ISO 68',
    category: 'Lubricantes',
    unit: 'L',
    cost: 14500,
    price: 18000,
    minimum: 60,
    opening: 180,
  },
];
export const money = (n: number) => Math.round(n);
export const qty = (n: number) => Math.round(n * 1000) / 1000;
export function today() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}
export function quote(d: Pick<Draft, 'lines' | 'freight' | 'loading' | 'retention'>) {
  const subtotal = d.lines.reduce((s, l) => s + money(l.quantity * l.price), 0);
  const tax = d.lines.reduce((s, l) => s + money((money(l.quantity * l.price) * l.iva) / 100), 0);
  const withheld = money((subtotal * d.retention) / 100);
  const gross = subtotal + tax + d.freight + d.loading;
  return {
    subtotal,
    tax,
    withheld,
    gross,
    total: gross - withheld,
    logistics: d.freight + d.loading,
  };
}
export function documentTotal(d: Document) {
  return ['gasto', 'ingreso', 'pago'].includes(d.kind) ? d.amount : quote(d).total;
}
export function outstanding(d: Document, documents: Document[]) {
  return d.kind === 'recepcion' && d.status === 'Completada'
    ? documentTotal(d) -
        documents
          .filter((p) => p.kind === 'pago' && p.sourceId === d.id && p.status === 'Completada')
          .reduce((s, p) => s + p.amount, 0)
    : 0;
}
export function inventory(documents: Document[]) {
  return plants.flatMap((plant, pi) =>
    catalog.map((product) => {
      const opening = product.opening * (pi ? 0.4 : 1);
      let quantity = product.unit === 'und' ? Math.floor(opening) : qty(opening);
      let value = money(quantity * product.cost);
      for (const d of documents) {
        if (d.plant !== plant || d.status !== 'Completada') continue;
        if (!['recepcion', 'entrada', 'venta', 'consumo'].includes(d.kind)) continue;
        const sign = ['recepcion', 'entrada'].includes(d.kind) ? 1 : -1;
        for (const l of d.lines.filter((l) => l.productId === product.id)) {
          quantity = qty(quantity + sign * l.quantity);
          value += sign * l.stockCost;
        }
      }
      return {
        ...product,
        plant,
        quantity,
        value,
        average: quantity > 0 ? value / quantity : product.cost,
        status: quantity === 0 ? 'Agotado' : quantity < product.minimum ? 'Bajo' : 'Disponible',
      };
    }),
  );
}
export function journal(d: Document): JournalLine[] {
  if (d.status !== 'Completada' || ['solicitud', 'orden'].includes(d.kind)) return [];
  const q = quote(d);
  const cost = d.lines.reduce((s, l) => s + l.stockCost, 0);
  const row = (account: string, debit = 0, credit = 0) => ({ account, debit, credit });
  switch (d.kind) {
    case 'recepcion':
      return [
        row('Inventario', q.subtotal + q.logistics),
        row('IVA descontable simulado', q.tax),
        row('Proveedores', 0, q.total),
        row('Retenciones por pagar', 0, q.withheld),
      ];
    case 'venta':
      return [
        row('Caja y bancos', q.total),
        row('Retenciones a favor', q.withheld),
        row('Ventas y transporte', 0, q.subtotal + q.logistics),
        row('IVA generado simulado', 0, q.tax),
        row('Costo de ventas', cost),
        row('Inventario', 0, cost),
      ];
    case 'entrada':
      return [row('Inventario', cost), row('Producción / ajustes de entrada', 0, cost)];
    case 'consumo':
      return [row('Consumos y mantenimiento', cost), row('Inventario', 0, cost)];
    case 'pago':
      return [row('Proveedores', d.amount), row('Caja y bancos', 0, d.amount)];
    case 'gasto':
      return [row('Gastos operativos', d.amount), row('Caja y bancos', 0, d.amount)];
    case 'ingreso':
      return [row('Caja y bancos', d.amount), row('Otros ingresos', 0, d.amount)];
    default:
      return [];
  }
}
export function emptyDraft(kind: Kind): Draft {
  return {
    kind,
    partyId: '',
    plant: plants[0],
    company: 'Planta de Triturado',
    date: today(),
    due: today(),
    lines: [],
    freight: 0,
    loading: 0,
    retention: 0,
    note: '',
    vehicle: '',
    amount: 0,
    method: 'Transferencia bancaria',
  };
}
export const kindLabels: Record<Kind, string> = {
  solicitud: 'Solicitud',
  orden: 'Orden de compra',
  recepcion: 'Recepción',
  venta: 'Venta / despacho',
  entrada: 'Entrada de producción / ajuste',
  consumo: 'Consumo interno',
  gasto: 'Gasto operativo',
  ingreso: 'Ingreso de caja',
  pago: 'Pago a proveedor',
};
export function seed(): ErpState {
  const parties: Party[] = [
    {
      id: 'PR-DIE',
      name: 'Combustibles del Sur S.A.S.',
      nit: '901234001-1',
      email: 'ventas@combustibles.example',
      phone: '602 731 1001',
      specialty: 'Diésel y lubricantes',
      type: 'proveedor',
      active: true,
    },
    {
      id: 'PR-REP',
      name: 'Repuestos Industriales Andinos',
      nit: '901234002-2',
      email: 'ventas@repuestos.example',
      phone: '602 731 1002',
      specialty: 'Bandas, rodamientos y mallas',
      type: 'proveedor',
      active: true,
    },
    {
      id: 'PR-CAN',
      name: 'Cantera El Encano S.A.S.',
      nit: '901234003-3',
      email: 'cantera@example.com',
      phone: '602 731 1003',
      specialty: 'Material pétreo y arenas',
      type: 'proveedor',
      active: true,
    },
    {
      id: 'CL-OBR',
      name: 'Constructora Vías de Nariño',
      nit: '901234004-4',
      email: 'obras@example.com',
      phone: '602 731 1004',
      specialty: 'Obras civiles',
      type: 'cliente',
      active: true,
    },
    {
      id: 'CL-CON',
      name: 'Concretos del Pacífico S.A.S.',
      nit: '901234005-5',
      email: 'concretos@example.com',
      phone: '602 731 1005',
      specialty: 'Concreto premezclado',
      type: 'cliente',
      active: true,
    },
  ];
  const docs: Document[] = [];
  const line = (id: string, quantity: number, price: number, iva = 19): Line => ({
    productId: id,
    quantity,
    price,
    iva,
    stockCost: money(quantity * price),
  });
  const add = (
    id: string,
    kind: Kind,
    partyId: string,
    lines: Line[],
    status: Status = 'Pendiente',
    sourceId = '',
  ) => {
    const d: Document = {
      ...emptyDraft(kind),
      id,
      partyId,
      lines,
      status,
      sourceId,
      note: 'Operación de ejemplo',
      postedAt: status === 'Completada' ? today() : '',
    };
    docs.push(d);
    return d;
  };
  for (const [i, product] of ['CB-DIE', 'RP-BAN', 'RP-MAL', 'CB-ACE'].entries()) {
    const p = catalog.find((p) => p.id === product)!;
    add('SOL-00' + (i + 1), 'solicitud', product.startsWith('CB') ? 'PR-DIE' : 'PR-REP', [
      line(product, i ? 4 : 300, p.cost),
    ]);
  }
  add('OC-001', 'orden', 'PR-DIE', [line('CB-DIE', 500, 10800, 0)], 'En proceso');
  add('REC-001', 'recepcion', 'PR-DIE', [line('CB-DIE', 500, 10800, 0)], 'Pendiente', 'OC-001');
  add('OC-002', 'orden', 'PR-REP', [line('RP-ROD', 4, 680000)], 'Completada');
  const receipt = add(
    'REC-002',
    'recepcion',
    'PR-REP',
    [line('RP-ROD', 4, 680000)],
    'Completada',
    'OC-002',
  );
  const payment = add('PAG-001', 'pago', 'PR-REP', [], 'Completada', receipt.id);
  payment.amount = 1000000;
  const sale = add('VEN-001', 'venta', 'CL-OBR', [line('AG-034', 24, 78000)], 'Completada');
  sale.lines[0].stockCost = 24 * 42000;
  sale.vehicle = 'NAR-321';
  sale.freight = 180000;
  sale.loading = 60000;
  add('VEN-002', 'venta', 'CL-CON', [line('AG-012', 36, 82000)]);
  add('VEN-003', 'venta', 'CL-OBR', [line('AG-ARE', 12, 62000)]);
  const sale2 = add('VEN-004', 'venta', 'CL-CON', [line('AG-012', 36, 82000)], 'Completada');
  sale2.lines[0].stockCost = 36 * 45000;
  const sale3 = add('VEN-005', 'venta', 'CL-OBR', [line('AG-ARE', 48, 62000)], 'Completada');
  sale3.lines[0].stockCost = 48 * 32000;
  const consumption = add('CON-001', 'consumo', '', [line('CB-DIE', 50, 10800, 0)], 'Completada');
  consumption.note = 'Consumo de cargador CAT 950';
  const expense = add('GAS-001', 'gasto', '', [], 'Completada');
  expense.amount = 750000;
  expense.note = 'Mantenimiento preventivo de mandíbula trituradora';
  const earlier = (days: number) =>
    today().slice(0, 8) + String(Math.max(1, Number(today().slice(8)) - days)).padStart(2, '0');
  for (const [id, offset] of [
    ['OC-002', 10],
    ['REC-002', 8],
    ['PAG-001', 5],
    ['VEN-001', 6],
    ['VEN-004', 4],
    ['VEN-005', 2],
    ['CON-001', 1],
    ['GAS-001', 1],
  ] as const) {
    const d = docs.find((d) => d.id === id)!;
    d.date = earlier(offset);
    d.postedAt = d.date;
    if (id === 'REC-002' || id === 'OC-002') d.due = earlier(1);
  }
  return { version: 2, parties, documents: docs };
}
const finite = (n: unknown, min = 0, max = 1e12): n is number =>
  typeof n === 'number' && Number.isFinite(n) && n >= min && n <= max;
export function validateDraft(d: Draft, state: ErpState) {
  if (!Object.hasOwn(kindLabels, d.kind) || d.kind === 'pago' || d.kind === 'recepcion')
    throw new Error('Crea las recepciones desde su orden y los pagos desde una cuenta por pagar.');
  if (!plants.includes(d.plant) || !['Planta de Triturado', 'Comercializadora'].includes(d.company))
    throw new Error('Selecciona una empresa y una planta válidas.');
  if (!validDate(d.date) || !validDate(d.due) || d.date > today() || d.due < d.date)
    throw new Error(
      'Revisa las fechas: no se registran operaciones futuras y el vencimiento debe ser igual o posterior a la emisión.',
    );
  if (['solicitud', 'orden', 'venta'].includes(d.kind)) {
    const party = state.parties.find((p) => p.id === d.partyId && p.active);
    if (!party || party.type !== (d.kind === 'venta' ? 'cliente' : 'proveedor'))
      throw new Error('Selecciona un tercero activo del tipo correspondiente.');
  }
  if (
    !finite(d.freight) ||
    !Number.isInteger(d.freight) ||
    !finite(d.loading) ||
    !Number.isInteger(d.loading) ||
    !finite(d.retention, 0, 100)
  )
    throw new Error('Los costos deben ser COP enteros y las tasas deben estar entre 0 y 100.');
  if (['gasto', 'ingreso'].includes(d.kind)) {
    if (!finite(d.amount, 1) || !Number.isInteger(d.amount) || d.note.trim().length < 3)
      throw new Error('Ingresa un concepto y un valor positivo en COP enteros.');
    return;
  }
  if (!d.lines.length || d.lines.length > 50) throw new Error('Agrega entre 1 y 50 líneas.');
  if (['entrada', 'consumo'].includes(d.kind) && d.note.trim().length < 3)
    throw new Error('Describe el motivo de la entrada o el consumo.');
  for (const l of d.lines) {
    const product = catalog.find((p) => p.id === l.productId);
    if (
      !product ||
      !finite(l.quantity, 0.001, 1e6) ||
      qty(l.quantity) !== l.quantity ||
      (product.unit === 'und' && !Number.isInteger(l.quantity)) ||
      !finite(l.price, 1, 1e9) ||
      !Number.isInteger(l.price) ||
      !finite(l.iva, 0, 100)
    )
      throw new Error(
        'Revisa productos, cantidades (máximo 3 decimales; unidades enteras), precios e IVA.',
      );
  }
  if (new Set(d.lines.map((l) => l.productId)).size !== d.lines.length)
    throw new Error('Agrupa cada producto en una sola línea.');
  if (!Number.isSafeInteger(quote(d).total) || quote(d).total <= 0 || quote(d).total > 1e12)
    throw new Error('El total debe ser positivo y menor o igual a un billón de COP.');
}
function validDate(d: unknown): d is string {
  if (typeof d !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(d)) return false;
  const date = new Date(d + 'T12:00:00Z');
  return Number.isFinite(date.getTime()) && date.toISOString().startsWith(d);
}
export function validState(value: unknown): value is ErpState {
  try {
    const s = value as ErpState;
    if (!s || s.version !== 2 || !Array.isArray(s.documents) || !Array.isArray(s.parties))
      return false;
    if (
      !s.parties.every(
        (p) =>
          p &&
          ['id', 'name', 'nit', 'email', 'phone', 'specialty'].every(
            (k) => typeof p[k as keyof Party] === 'string',
          ) &&
          ['proveedor', 'cliente'].includes(p.type) &&
          typeof p.active === 'boolean',
      )
    )
      return false;
    if (
      new Set(s.parties.map((p) => p.id)).size !== s.parties.length ||
      new Set(s.documents.map((d) => d.id)).size !== s.documents.length
    )
      return false;
    return s.documents.every(
      (d) =>
        d &&
        Object.hasOwn(kindLabels, d.kind) &&
        ['id', 'sourceId', 'postedAt', 'note', 'vehicle', 'method', 'partyId'].every(
          (k) => typeof d[k as keyof Document] === 'string',
        ) &&
        ['Pendiente', 'En proceso', 'Completada', 'Cancelada'].includes(d.status) &&
        plants.includes(d.plant) &&
        ['Planta de Triturado', 'Comercializadora'].includes(d.company) &&
        validDate(d.date) &&
        validDate(d.due) &&
        finite(d.amount) &&
        finite(d.freight) &&
        finite(d.loading) &&
        finite(d.retention, 0, 100) &&
        (!d.partyId || s.parties.some((p) => p.id === d.partyId)) &&
        (!d.sourceId || s.documents.some((p) => p.id === d.sourceId)) &&
        Array.isArray(d.lines) &&
        d.lines.every(
          (l) =>
            l &&
            catalog.some((p) => p.id === l.productId) &&
            finite(l.quantity, 0.001, 1e6) &&
            finite(l.price, 1, 1e9) &&
            finite(l.iva, 0, 100) &&
            finite(l.stockCost),
        ),
    );
  } catch {
    return false;
  }
}
