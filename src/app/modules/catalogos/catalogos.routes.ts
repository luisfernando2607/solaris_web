import { Routes } from '@angular/router';

export const CATALOGOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./catalogos.component').then(m => m.CatalogosComponent),
    children: [
      { path: '', redirectTo: 'paises', pathMatch: 'full' },
      {
        path: 'paises',
        loadComponent: () => import('./components/paises/lista/paises-lista.component').then(m => m.PaisesListaComponent),
      },
      {
        path: 'estados-provincias',
        loadComponent: () => import('./components/estados/lista/estados-lista.component').then(m => m.EstadosListaComponent),
      },
      {
        path: 'ciudades',
        loadComponent: () => import('./components/ciudades/lista/ciudades-lista.component').then(m => m.CiudadesListaComponent),
      },
      {
        path: 'monedas',
        loadComponent: () => import('./components/monedas/lista/monedas-lista.component').then(m => m.MonedasListaComponent),
      },
      {
        path: 'tipos-identificacion',
        loadComponent: () => import('./components/tipos-identificacion/lista/tipo-identificacion-lista.component').then(m => m.TipoIdentificacionListaComponent),
      },
      {
        path: 'impuestos',
        loadComponent: () => import('./components/impuestos/lista/impuestos-lista.component').then(m => m.ImpuestosListaComponent),
      },
      {
        path: 'formas-pago',
        loadComponent: () => import('./components/formas-pago/lista/formas-pago-lista.component').then(m => m.FormasPagoListaComponent),
      },
      {
        path: 'bancos',
        loadComponent: () => import('./components/bancos/lista/bancos-lista.component').then(m => m.BancosListaComponent),
      },
    ],
  },
];
