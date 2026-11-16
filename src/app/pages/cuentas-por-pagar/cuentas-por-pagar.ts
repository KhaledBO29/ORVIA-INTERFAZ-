import { Component } from '@angular/core';
import { Business } from '../business/business';
// Una página ensambla el componente compartido con la configuración de su negocio.
@Component({
  selector: 'app-cuentas-por-pagar-page',
  imports: [Business],
  template: '<app-business title="Cuentas por pagar" mode="cuentas-por-pagar" />',
})
export class PayablesPage {}
