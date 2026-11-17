import { Component, computed, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { BusinessRecord } from '../../core/models';
@Component({
  selector: 'app-chart',
  imports: [CurrencyPipe],
  templateUrl: './chart.html',
  styleUrl: './chart.scss',
})
export class Chart {
  readonly title = input('Operaciones confirmadas');
  readonly rows = input<BusinessRecord[]>([]);
  readonly bars = input(false);
  readonly daily = computed(() => {
    const days = new Map<string, number>();
    for (const r of this.rows()) days.set(r.date, (days.get(r.date) ?? 0) + r.amount);
    return [...days.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({ date, value }));
  });
  readonly total = computed(() => this.daily().reduce((s, d) => s + d.value, 0));
  readonly maximum = computed(() => Math.max(1, ...this.daily().map((d) => d.value)));
  x(index: number) {
    return this.daily().length === 1 ? 250 : 25 + (index * 450) / (this.daily().length - 1);
  }
  y(value: number) {
    return 190 - (value / this.maximum()) * 160;
  }
  readonly points = computed(() =>
    this.daily()
      .map((d, i) => this.x(i) + ',' + this.y(d.value))
      .join(' '),
  );
}
