import { Routes } from '@angular/router';

export const PROYECTOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./proyectos.component').then(m => m.ProyectosComponent),
    children: [
      { path: '', redirectTo: 'lista', pathMatch: 'full' },
      {
        path: 'lista',
        loadComponent: () => import('./lista/proyectos-lista.component').then(m => m.ProyectosListaComponent),
      },
      {
        path: ':id/dashboard',
        loadComponent: () => import('./dashboard/proyecto-dashboard.component').then(m => m.ProyectoDashboardComponent),
      },
      {
        path: ':id/detalle',
        loadComponent: () => import('./detalle/proyecto-detalle.component').then(m => m.ProyectoDetalleComponent),
        children: [
          { path: '', redirectTo: 'fases', pathMatch: 'full' },
          {
            path: 'fases',
            loadComponent: () => import('./detalle/fases/fases.component').then(m => m.FasesComponent)
          },
          {
            path: 'hitos',
            loadComponent: () => import('./detalle/hitos/hitos.component').then(m => m.HitosComponent)
          },
          {
            path: 'wbs',
            loadComponent: () => import('./detalle/wbs/wbs.component').then(m => m.WbsComponent)
          },
          {
            path: 'tareas',
            loadComponent: () => import('./detalle/tareas/tareas.component').then(m => m.TareasComponent)
          },
          {
            path: 'cuadrillas',
            loadComponent: () => import('./detalle/cuadrillas/cuadrillas.component').then(m => m.CuadrillasComponent)
          },
          // {
          //   path: 'recursos',
          //   loadComponent: () => import('./detalle/recursos/recursos.component').then(m => m.RecursosComponent)
          // },
          {
            path: 'presupuesto',
            loadComponent: () => import('./detalle/presupuesto/presupuesto.component').then(m => m.PresupuestoComponent)
          },
          {
            path: 'gantt',
            loadComponent: () => import('./detalle/gantt/gantt.component').then(m => m.GanttComponent)
          },
          {
            path: 'ordenes',
            loadComponent: () => import('./detalle/ordenes-trabajo/ordenes-trabajo.component').then(m => m.OrdenesTrabajoPComponent)
          },
          {
            path: 'reportes',
            loadComponent: () => import('./detalle/reportes/reportes.component').then(m => m.ReportesComponent)
          },
          {
            path: 'kpis',
            loadComponent: () => import('./detalle/kpis/kpis.component').then(m => m.KpisComponent)
          },
          {
            path: 'documentos',
            loadComponent: () => import('./detalle/documentos/documentos.component').then(m => m.DocumentosComponent)
          },
        ]
      },
    ],
  },
];
