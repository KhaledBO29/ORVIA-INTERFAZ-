import { Component, input } from '@angular/core';
import { CurrencyPipe, DecimalPipe, NgClass } from '@angular/common';
import { Metric } from '../../core/models';
import { Icon } from '../icon/icon';
@Component({
  selector: 'app-stat-card',
  imports: [CurrencyPipe, DecimalPipe, NgClass, Icon],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.scss',
})
export class StatCard {
  readonly metric = input.required<Metric>();
}
