import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface StatCard {
  label: string;
  value: string;
  icon: string;
  color: string;
  trend?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  readonly authService = inject(AuthService);
  readonly usuario = this.authService.usuario;

  readonly stats: StatCard[] = [
    { label: 'Usuarios activos',   value: '1',   icon: 'pi pi-users',     color: '#3b82f6', trend: '+0' },
    { label: 'Roles configurados', value: '5',   icon: 'pi pi-id-card',   color: '#8b5cf6', trend: '' },
    { label: 'Empresas',           value: '1',   icon: 'pi pi-building',  color: '#10b981', trend: '' },
    { label: 'Sesiones hoy',       value: '—',   icon: 'pi pi-desktop',   color: '#f59e0b', trend: '' },
  ];

  readonly accesosRapidos = [
    { label: 'Gestionar Usuarios', icon: 'pi pi-users',    route: '/usuarios',  color: '#3b82f6', permiso: 'usuarios.ver' },
    { label: 'Gestionar Roles',    icon: 'pi pi-id-card',  route: '/roles',     color: '#8b5cf6', permiso: 'roles.ver' },
    { label: 'Empresas',           icon: 'pi pi-building', route: '/empresas',  color: '#10b981', permiso: 'empresas.ver' },
  ];

  tienePermiso(p: string) {
    return this.authService.tienePermiso(p);
  }
}
