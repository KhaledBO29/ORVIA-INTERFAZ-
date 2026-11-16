import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './layout/sidebar/sidebar';
import { Header } from './layout/header/header';
import { Store } from './core/store';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar, Header],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly store = inject(Store);
  readonly collapsed = signal(false);
  readonly mobileOpen = signal(false);
  toggle() {
    if (window.innerWidth <= 700) this.mobileOpen.update((v) => !v);
    else this.collapsed.update((v) => !v);
  }
}
