import { Component } from '@angular/core';
import { DepartamentosListaComponent } from './lista/departamentos-lista.component';

@Component({
  selector: 'app-departamentos',
  standalone: true,
  imports: [DepartamentosListaComponent],
  template: `<app-departamentos-lista />`
})
export class DepartamentosComponent {}
