import { Component } from '@angular/core';
import { Business } from '../business/business';
// Una página ensambla el componente compartido con la configuración de su negocio.
@Component({
  selector: 'app-inventario-page',
  imports: [Business],
  template: '<app-business title="Inventario" mode="inventario" />',
})
export class InventoryPage {}
