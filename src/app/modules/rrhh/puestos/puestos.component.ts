import { Component } from '@angular/core';
import { PuestosListaComponent } from './lista/puestos-lista.component';

@Component({
  selector: 'app-puestos',
  standalone: true,
  imports: [PuestosListaComponent],
  template: `<app-puestos-lista />`
})
export class PuestosComponent {}
