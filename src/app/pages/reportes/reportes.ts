import { Component } from '@angular/core';
import { Business } from '../business/business';
// Una página ensambla el componente compartido con la configuración de su negocio.
@Component({
  selector: 'app-reportes-page',
  imports: [Business],
  template: '<app-business title="Reportes" mode="reportes" />',
})
export class ReportsPage {}
