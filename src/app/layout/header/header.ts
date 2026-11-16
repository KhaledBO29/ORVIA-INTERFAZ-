import { Component, computed, inject, output, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { Store } from '../../core/store';
import { sections } from '../../core/models';
import { Icon } from '../../shared/icon/icon';
@Component({
  selector: 'app-header',
  imports: [Icon],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  readonly store = inject(Store);
  readonly toggle = output<void>();
  readonly notifications = signal(false);
  readonly help = signal(false);
  private router = inject(Router);
  private navigation = toSignal(this.router.events.pipe(filter((e) => e instanceof NavigationEnd)));
  readonly title = computed(() => {
    this.navigation();
    return sections.find((s) => this.router.url.split('?')[0] === '/' + s[0])?.[1] ?? 'ORVIA';
  });
  update(field: 'search' | 'company' | 'plant' | 'period', event: Event) {
    this.store[field].set((event.target as HTMLInputElement).value);
  }
}
