import { Component, computed, effect, input, output, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, NgClass, NgFor } from '@angular/common';
import { BusinessRecord } from '../../core/models';
import { Icon } from '../icon/icon';
@Component({
  selector: 'app-data-table',
  imports: [CurrencyPipe, DatePipe, NgClass, NgFor, Icon],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
})
export class DataTable {
  readonly rows = input.required<BusinessRecord[]>();
  readonly title = input('Últimos movimientos');
  readonly selected = output<BusinessRecord>();
  readonly page = signal(1);
  readonly status = signal('Todos');
  readonly filtered = computed(() =>
    this.rows().filter((r) => this.status() === 'Todos' || r.status === this.status()),
  );
  readonly pages = computed(() => Math.max(1, Math.ceil(this.filtered().length / 6)));
  readonly visible = computed(() => this.filtered().slice((this.page() - 1) * 6, this.page() * 6));
  constructor() {
    effect(() => {
      this.rows();
      this.status();
      this.page.set(1);
    });
  }
  trackRow(_index: number, row: BusinessRecord) {
    return row.id;
  }
  changeStatus(event: Event) {
    this.status.set((event.target as HTMLSelectElement).value);
  }
  exportCsv() {
    const rows = [
      ['Documento', 'Proveedor / Cliente', 'Material', 'Planta', 'Fecha', 'Estado', 'Total'],
      ...this.filtered().map((r) => [
        r.id,
        r.name,
        r.detail,
        r.plant,
        r.date,
        r.status,
        String(r.amount),
      ]),
    ];
    const safe = (v: string) =>
      '"' + (/^[=+@-]/.test(v) ? "'" : '') + v.replaceAll('"', '""') + '"';
    const blob = new Blob(['﻿' + rows.map((r) => r.map(safe).join(';')).join('\r\n')], {
      type: 'text/csv;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orvia-movimientos.csv';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
