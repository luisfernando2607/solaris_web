import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'auth',
    canActivate: [noAuthGuard],
    loadChildren: () => import('./modules/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./modules/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'usuarios',
        loadChildren: () =>
          import('./modules/usuarios/usuarios.routes').then(m => m.USUARIOS_ROUTES)
      },
      {
        path: 'roles',
        loadChildren: () =>
          import('./modules/roles/roles.routes').then(m => m.ROLES_ROUTES)
      },
      {
        path: 'empresas',
        loadChildren: () =>
          import('./modules/empresas/empresas.routes').then(m => m.EMPRESAS_ROUTES)
      },
      {
        path: 'catalogos',
        loadChildren: () =>
          import('./modules/catalogos/catalogos.routes').then(m => m.CATALOGOS_ROUTES)
      },
      // ── RRHH ─────────────────────────────────────────────────────
      {
        path: 'rrhh',
        loadChildren: () =>
          import('./modules/rrhh/rrhh.routes').then(m => m.RRHH_ROUTES)
      },
      // ─────────────────────────────────────────────────────────────
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
