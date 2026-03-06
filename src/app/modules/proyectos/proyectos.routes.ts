import { Routes } from '@angular/router';

export const PROYECTOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./proyectos.component').then(m => m.ProyectosComponent),
    children: [
      { path: '', redirectTo: 'lista', pathMatch: 'full' },
      {
        path: 'lista',
        loadComponent: () => import('./components/lista/proyectos-lista.component').then(m => m.ProyectosListaComponent),
      },
      {
        path: ':id/dashboard',
        loadComponent: () => import('./components/dashboard/proyecto-dashboard.component').then(m => m.ProyectoDashboardComponent),
      },
    ],
  },
];
