import { Component } from '@angular/core';
import { Business } from '../business/business';
// Una página ensambla el componente compartido con la configuración de su negocio.
@Component({
  selector: 'app-ventas-page',
  imports: [Business],
  template: '<app-business title="Ventas" mode="ventas" />',
})
export class SalesPage {}
