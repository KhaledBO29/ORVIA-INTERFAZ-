import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '../../core/store';
import { Icon } from '../../shared/icon/icon';
@Component({
  selector: 'app-settings',
  imports: [ReactiveFormsModule, Icon],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  readonly saved = signal(false);
  readonly form = this.fb.nonNullable.group({
    name: ['Planta de Triturado', [Validators.required, Validators.minLength(3)]],
    nit: ['901234567-8', Validators.required],
    email: ['info@orvia.demo', [Validators.required, Validators.email]],
    phone: ['+57 317 654 3210', Validators.required],
    photo: [true],
    gps: [true],
    notifications: [true],
    transfer: [true],
    cash: [true],
  });
  constructor() {
    try {
      const value = JSON.parse(localStorage.getItem('orvia.settings.v1') ?? 'null');
      if (value && typeof value === 'object') {
        for (const key of ['name', 'nit', 'email', 'phone'] as const) {
          if (typeof value[key] === 'string') this.form.controls[key].setValue(value[key]);
        }
        for (const key of ['photo', 'gps', 'notifications', 'transfer', 'cash'] as const) {
          if (typeof value[key] === 'boolean') this.form.controls[key].setValue(value[key]);
        }
      }
    } catch {
      /* Se conservan los valores iniciales ante datos dañados. */
    }
  }
  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.store.persist('orvia.settings.v1', this.form.getRawValue());
    this.saved.set(!this.store.storageError());
  }
}
