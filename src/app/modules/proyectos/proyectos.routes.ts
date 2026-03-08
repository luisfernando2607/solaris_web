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
      {
        path: ':id/detalle',
        loadComponent: () => import('./components/detalle/proyecto-detalle.component').then(m => m.ProyectoDetalleComponent),
        children: [
          { path: '', redirectTo: 'fases', pathMatch: 'full' },
          { path: 'fases',     loadComponent: () => import('./components/detalle/fases/fases.component').then(m => m.FasesComponent) },
          { path: 'hitos',     loadComponent: () => import('./components/detalle/hitos/hitos.component').then(m => m.HitosComponent) },
          { path: 'wbs',       loadComponent: () => import('./components/detalle/wbs/wbs.component').then(m => m.WbsComponent) },
          { path: 'tareas',    loadComponent: () => import('./components/detalle/tareas/tareas.component').then(m => m.TareasComponent) },
          { path: 'cuadrillas',loadComponent: () => import('./components/detalle/cuadrillas/cuadrillas.component').then(m => m.CuadrillasComponent) },
          { path: 'presupuesto',loadComponent: () => import('./components/detalle/presupuesto/presupuesto.component').then(m => m.PresupuestoComponent) },
          { path: 'gantt',     loadComponent: () => import('./components/detalle/gantt/gantt.component').then(m => m.GanttComponent) },
          { path: 'ordenes',   loadComponent: () => import('./components/detalle/ordenes-trabajo/ordenes-trabajo.component').then(m => m.OrdenesTrabajoPComponent) },
          { path: 'reportes',  loadComponent: () => import('./components/detalle/reportes/reportes.component').then(m => m.ReportesComponent) },
          { path: 'kpis',      loadComponent: () => import('./components/detalle/kpis/kpis.component').then(m => m.KpisComponent) },
        ]
      },
    ],
  },
];
