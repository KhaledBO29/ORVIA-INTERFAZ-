import { Component } from '@angular/core';
import { Business } from '../business/business';
// Una página ensambla el componente compartido con la configuración de su negocio.
@Component({
  selector: 'app-proveedores-page',
  imports: [Business],
  template: '<app-business title="Proveedores" mode="proveedores" />',
})
export class SuppliersPage {}
