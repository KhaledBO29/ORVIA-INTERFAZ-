import { Component, computed, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
@Component({
  selector: 'app-chart',
  imports: [CurrencyPipe],
  templateUrl: './chart.html',
  styleUrl: './chart.scss',
})
export class Chart {
  readonly title = input('Rendimiento empresarial');
  readonly total = input(185400000);
  readonly bars = input(false);
  readonly values = computed(() =>
    [
      0.18, 0.48, 0.32, 0.55, 0.45, 0.25, 0.38, 0.63, 0.5, 0.78, 0.46, 0.68, 0.55, 0.9, 0.65, 0.85,
    ].map((v) => Math.round((v * this.total()) / 6)),
  );
  readonly points = computed(() =>
    this.values()
      .map((v, i) => 20 + i * 30 + ',' + (190 - (v / (this.total() || 1)) * 900))
      .join(' '),
  );
}
