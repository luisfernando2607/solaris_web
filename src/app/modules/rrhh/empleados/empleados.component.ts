import { Component } from '@angular/core';
import { EmpleadosListaComponent } from './lista/empleados-lista.component';

@Component({
  selector: 'app-empleados',
  standalone: true,
  imports: [EmpleadosListaComponent],
  template: `<app-empleados-lista />`
})
export class EmpleadosComponent {}
