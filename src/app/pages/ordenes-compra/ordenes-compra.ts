import { Component } from '@angular/core';
import { Business } from '../business/business';
// Una página ensambla el componente compartido con la configuración de su negocio.
@Component({
  selector: 'app-ordenes-compra-page',
  imports: [Business],
  template: '<app-business title="Órdenes de compra" mode="ordenes-compra" />',
})
export class OrdersPage {}
