import { Component, computed, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { Store } from '../../core/store';
import { Task } from '../../core/models';
import { Icon } from '../../shared/icon/icon';
@Component({
  selector: 'app-taskflow',
  imports: [NgClass, Icon],
  templateUrl: './taskflow.html',
  styleUrl: './taskflow.scss',
})
export class Taskflow {
  readonly store = inject(Store);
  readonly draft = signal('');
  readonly columns: Task['status'][] = ['Pendiente', 'En proceso', 'Completada'];
  readonly completed = computed(
    () => this.store.tasks().filter((t) => t.status === 'Completada').length,
  );
  byStatus(s: Task['status']) {
    return this.store.tasks().filter((t) => t.status === s);
  }
  add(event: Event) {
    event.preventDefault();
    const title = this.draft().trim();
    if (!title) return;
    this.store.tasks.update((t) => [...t, { id: crypto.randomUUID(), title, status: 'Pendiente' }]);
    this.draft.set('');
  }
  updateDraft(e: Event) {
    this.draft.set((e.target as HTMLInputElement).value);
  }
  toggle(id: string, e: Event) {
    const checked = (e.target as HTMLInputElement).checked;
    this.store.tasks.update((t) =>
      t.map((v) => (v.id === id ? { ...v, status: checked ? 'Completada' : 'Pendiente' } : v)),
    );
  }
  move(id: string, status: Task['status']) {
    this.store.tasks.update((t) => t.map((v) => (v.id === id ? { ...v, status } : v)));
  }
  remove(id: string) {
    this.store.tasks.update((t) => t.filter((v) => v.id !== id));
  }
}
