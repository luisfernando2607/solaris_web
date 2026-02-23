import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route?: string;
  permiso?: string;
  children?: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  private readonly authService = inject(AuthService);

  readonly usuario = this.authService.usuario;
  readonly collapsed = signal(false);

  readonly navItems: NavItem[] = [
    {
      label: 'Dashboard',
      icon: 'pi pi-home',
      route: '/dashboard'
    },
    {
      label: 'Seguridad',
      icon: 'pi pi-shield',
      children: [
        { label: 'Usuarios',  icon: 'pi pi-users',   route: '/usuarios',  permiso: 'usuarios.ver' },
        { label: 'Roles',     icon: 'pi pi-id-card', route: '/roles',     permiso: 'roles.ver' },
      ]
    },
    {
      label: 'Empresas',
      icon: 'pi pi-building',
      route: '/empresas',
      permiso: 'empresas.ver'
    },
  ];

  expandidos = signal<Set<string>>(new Set(['Seguridad']));

  toggleCollapse(): void {
    this.collapsed.update(v => !v);
  }

  toggleExpandido(label: string): void {
    this.expandidos.update(set => {
      const nuevo = new Set(set);
      nuevo.has(label) ? nuevo.delete(label) : nuevo.add(label);
      return nuevo;
    });
  }

  estaExpandido(label: string): boolean {
    return this.expandidos().has(label);
  }

  tieneAcceso(item: NavItem): boolean {
    if (!item.permiso) return true;
    return this.authService.tienePermiso(item.permiso);
  }

  logout(): void {
    this.authService.logout();
  }
}
