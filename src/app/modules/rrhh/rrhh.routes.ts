import { Routes } from '@angular/router';

export const RRHH_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'empleados',
    pathMatch: 'full'
  },
  {
    path: 'empleados',
    loadComponent: () =>
      import('./empleados/lista/empleados-lista.component').then(m => m.EmpleadosListaComponent)
  },
  {
    path: 'departamentos',
    loadComponent: () =>
      import('./departamentos/lista/departamentos-lista.component').then(m => m.DepartamentosListaComponent)
  },
  {
    path: 'puestos',
    loadComponent: () =>
      import('./puestos/lista/puestos-lista.component').then(m => m.PuestosListaComponent)
  },
];
