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
  {
    path: 'horarios',
    loadComponent: () =>
      import('./horarios/lista/horarios-lista.component').then(m => m.HorariosListaComponent)
  },
  {
    path: 'nomina',
    loadComponent: () =>
      import('./nomina/lista/nomina-lista.component').then(m => m.NominaListaComponent)
  },
  {
    path: 'prestamos',
    loadComponent: () =>
      import('./prestamos/lista/prestamos-lista.component').then(m => m.PrestamosListaComponent)
  },
  {
    path: 'evaluaciones',
    loadComponent: () =>
      import('./evaluaciones/lista/evaluaciones-lista.component').then(m => m.EvaluacionesListaComponent)
  },
  {
    path: 'capacitaciones',
    loadComponent: () =>
      import('./capacitaciones/lista/capacitaciones-lista.component').then(m => m.CapacitacionesListaComponent)
  },
  {
    path: 'seleccion',
    loadComponent: () =>
      import('./seleccion/lista/seleccion-lista.component').then(m => m.SeleccionListaComponent)
  },
];
