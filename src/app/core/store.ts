import { Injectable, computed, effect, signal } from '@angular/core';
import { BusinessRecord, Task } from './models';
const names = [
  'Canteras Andinas S.A.S.',
  'Áridos y Rocas del Valle',
  'Constructora Norte S.A.S.',
  'Concretos del Sur S.A.S.',
  'Obras y Vías del Sur',
  'Agregados del Pacífico',
];
const materials = [
  'Triturado 3/4″ (19 mm)',
  'Triturado 1/2″ (12 mm)',
  'Base granular',
  'Arena triturada',
  'Relleno triturado',
  'Triturado 1″ (25 mm)',
];
export const demoRecords: BusinessRecord[] = Array.from({ length: 18 }, (_, i) => ({
  id: 'ORV-2026-' + String(128 - i).padStart(5, '0'),
  name: names[i % 6],
  detail: materials[i % 6],
  company: i % 3 === 2 ? 'Comercializadora' : 'Planta de Triturado',
  plant: i % 3 === 0 ? 'Planta El Encano' : 'Planta Principal',
  date: '2026-11-' + String(15 - (i % 12)).padStart(2, '0'),
  status: ['Pendiente', 'En proceso', 'Completada', 'Completada', 'Vencida', 'Programada'][i % 6],
  amount: [18920000, 28760000, 7500000, 6800000, 3200000, 15680000][i % 6],
  quantity: [60, 80, 120, 50, 70, 40][i % 6],
}));
function validRecord(x: unknown): x is BusinessRecord {
  if (!x || typeof x !== 'object') return false;
  const r = x as BusinessRecord;
  return (
    ['id', 'name', 'detail', 'company', 'plant', 'date', 'status'].every(
      (k) => typeof (r as unknown as Record<string, unknown>)[k] === 'string',
    ) &&
    Number.isFinite(r.amount) &&
    r.amount > 0 &&
    Number.isFinite(r.quantity) &&
    r.quantity > 0
  );
}
function validTask(x: unknown): x is Task {
  if (!x || typeof x !== 'object') return false;
  const t = x as Task;
  return (
    typeof t.id === 'string' &&
    typeof t.title === 'string' &&
    ['Pendiente', 'En proceso', 'Completada'].includes(t.status)
  );
}
function restore<T>(key: string, fallback: T[], guard: (x: unknown) => x is T): T[] {
  try {
    const v = JSON.parse(localStorage.getItem(key) ?? 'null');
    return Array.isArray(v) && v.every(guard) ? v : fallback;
  } catch {
    return fallback;
  }
}
@Injectable({ providedIn: 'root' })
export class Store {
  readonly search = signal('');
  readonly company = signal('Todas las empresas');
  readonly plant = signal('Todas las sucursales');
  readonly period = signal('Este mes');
  readonly storageError = signal('');
  readonly records = signal(restore('orvia.records.v1', demoRecords, validRecord));
  readonly tasks = signal(
    restore<Task>(
      'orvia.tasks.v1',
      [
        { id: 't1', title: 'Revisar reserva de triturado 3/4″', status: 'Pendiente' },
        { id: 't2', title: 'Confirmar recepción de la planta principal', status: 'En proceso' },
        { id: 't3', title: 'Verificar inventario de base granular', status: 'Completada' },
      ],
      validTask,
    ),
  );
  readonly filtered = computed(() =>
    this.records().filter(
      (r) =>
        (this.company() === 'Todas las empresas' || r.company === this.company()) &&
        (this.plant() === 'Todas las sucursales' || r.plant === this.plant()) &&
        (this.period() === 'Todo el año' || r.date.startsWith('2026-11')) &&
        [r.id, r.name, r.detail, r.status]
          .join(' ')
          .toLowerCase()
          .includes(this.search().toLowerCase()),
    ),
  );
  readonly total = computed(() => this.filtered().reduce((s, r) => s + r.amount, 0));
  constructor() {
    effect(() => this.persist('orvia.records.v1', this.records()));
    effect(() => this.persist('orvia.tasks.v1', this.tasks()));
  }
  persist(key: string, value: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      this.storageError.set('');
    } catch {
      this.storageError.set(
        'El navegador no permitió guardar. Los cambios estarán disponibles durante esta sesión.',
      );
    }
  }
  addRecord(value: Omit<BusinessRecord, 'id'>) {
    this.records.update((rows) => [
      { ...value, id: 'ORV-' + crypto.randomUUID().slice(0, 8).toUpperCase() },
      ...rows,
    ]);
  }
  complete(id: string) {
    this.records.update((rows) =>
      rows.map((r) => (r.id === id ? { ...r, status: 'Completada' } : r)),
    );
  }
}
