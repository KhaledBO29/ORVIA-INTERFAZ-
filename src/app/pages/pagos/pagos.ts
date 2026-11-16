import { Component } from '@angular/core';
import { Business } from '../business/business';
// Una página ensambla el componente compartido con la configuración de su negocio.
@Component({
  selector: 'app-pagos-page',
  imports: [Business],
  template: '<app-business title="Pagos" mode="pagos" />',
})
export class PaymentsPage {}
