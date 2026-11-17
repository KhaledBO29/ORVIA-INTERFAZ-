import { Component, inject, input, output } from '@angular/core';
import { Store } from '../../core/store';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Icon } from '../../shared/icon/icon';
import { sections } from '../../core/models';
@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, Icon],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  readonly store = inject(Store);
  readonly collapsed = input(false);
  readonly navigated = output<void>();
  readonly toggle = output<void>();
  readonly sections = sections;
}
