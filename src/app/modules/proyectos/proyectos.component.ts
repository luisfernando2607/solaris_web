import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-proyectos',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`
})
export class ProyectosComponent {}
