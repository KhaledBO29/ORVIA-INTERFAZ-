import { Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '../../core/store';
import { DialogFocus } from '../dialog-focus.directive';
import { Icon } from '../icon/icon';
@Component({
  selector: 'app-record-form',
  imports: [ReactiveFormsModule, Icon, DialogFocus],
  templateUrl: './record-form.html',
  styleUrl: './record-form.scss',
})
export class RecordForm {
  readonly title = input('Nuevo registro');
  readonly closed = output<void>();
  readonly saved = output<void>();
  private store = inject(Store);
  private fb = inject(FormBuilder);
  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    detail: ['Triturado 3/4″ (19 mm)', Validators.required],
    company: ['Planta de Triturado', Validators.required],
    plant: ['Planta Principal', Validators.required],
    date: ['2026-11-15', Validators.required],
    status: ['Pendiente', Validators.required],
    amount: [0, [Validators.required, Validators.min(1)]],
    quantity: [1, [Validators.required, Validators.min(1)]],
    accepted: [false, Validators.requiredTrue],
  });
  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { accepted, ...record } = this.form.getRawValue();
    this.store.addRecord(record);
    this.saved.emit();
  }
}
