import { afterNextRender, Directive, ElementRef, inject, OnDestroy, output } from '@angular/core';

/** Mantiene el teclado dentro del diálogo y devuelve el foco al botón que lo abrió. */
@Directive({ selector: '[appDialogFocus]', host: { '(keydown)': 'onKeydown($event)' } })
export class DialogFocus implements OnDestroy {
  readonly dismissed = output<void>();
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly previous = document.activeElement as HTMLElement | null;

  constructor() {
    afterNextRender(() => this.focusables()[0]?.focus());
  }

  private focusables(): HTMLElement[] {
    return Array.from(
      this.host.nativeElement.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), a[href], [tabindex="0"]',
      ),
    );
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.stopPropagation();
      this.dismissed.emit();
    }
    if (event.key !== 'Tab') return;
    const items = this.focusables();
    const first = items[0];
    const last = items.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  ngOnDestroy() {
    if (this.previous?.isConnected) this.previous.focus();
  }
}
