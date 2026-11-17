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
  readonly store = inject(Store);
  readonly saved = signal(false);
  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    nit: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    iva: [19, [Validators.required, Validators.min(0), Validators.max(100)]],
    retention: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
    capacity: [12, [Validators.required, Validators.min(1), Validators.max(100)]],
    notifications: [true],
    transfer: [true],
    cash: [true],
  });
  constructor() {
    this.form.patchValue(this.store.preferences());
    this.form.valueChanges.subscribe(() => this.saved.set(false));
  }
  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.store.savePreferences(this.form.getRawValue());
    this.saved.set(!this.store.storageError());
  }
  download() {
    const url = URL.createObjectURL(new Blob([this.store.backup()], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orvia-respaldo.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
