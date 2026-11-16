import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { Store } from '../../core/store';
import { Metric } from '../../core/models';
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
  readonly actions = [
    ['Nueva venta', 'cart'],
    ['Nueva compra', 'download'],
    ['Nuevo cliente', 'users'],
    ['Registrar gasto', 'wallet'],
    ['Registrar ingreso', 'bank'],
    ['Ajustar inventario', 'box'],
    ['Crear pedido', 'file'],
  ];
  readonly metrics = computed<Metric[]>(() => [
    { label: 'Ventas', value: this.store.total(), change: '↑ 18,4%', icon: 'wallet' },
    { label: 'Utilidad', value: this.store.total() * 0.34, change: '↑ 11,7%', icon: 'chart' },
    {
      label: 'Gastos',
      value: this.store.total() * 0.21,
      change: '↓ 4,2%',
      tone: 'pink',
      icon: 'wallet',
    },
    { label: 'Caja y bancos', value: this.store.total() * 0.39, change: '↑ 8,2%', icon: 'bank' },
  ]);
  saved() {
    this.form.set('');
    this.notice.set('Registro creado. Puedes consultarlo en los módulos y exportarlo.');
  }
}
