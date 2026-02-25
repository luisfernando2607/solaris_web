import { Component, inject, signal } from '@angular/core';
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

  readonly usuario  = this.authService.usuario;
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
        { label: 'Usuarios', icon: 'pi pi-users',   route: '/usuarios', permiso: 'usuarios.ver' },
        { label: 'Roles',    icon: 'pi pi-id-card', route: '/roles',    permiso: 'roles.ver'    },
      ]
    },
    {
      label: 'Empresas',
      icon: 'pi pi-building',
      route: '/empresas',
      permiso: 'empresas.ver'
    },
    {
      label: 'Catálogos',
      icon: 'pi pi-list',
      children: [
        { label: 'Países',               icon: 'pi pi-globe',       route: '/catalogos/paises'               },
        { label: 'Estados / Provincias', icon: 'pi pi-map',         route: '/catalogos/estados-provincias'              },
        { label: 'Ciudades',             icon: 'pi pi-map-marker',  route: '/catalogos/ciudades'             },
        { label: 'Monedas',              icon: 'pi pi-dollar',      route: '/catalogos/monedas'              },
        { label: 'Tipos Identificación', icon: 'pi pi-id-card',     route: '/catalogos/tipos-identificacion' },
        { label: 'Impuestos',            icon: 'pi pi-percentage',  route: '/catalogos/impuestos'            },
        { label: 'Formas de Pago',       icon: 'pi pi-credit-card', route: '/catalogos/formas-pago'          },
        { label: 'Bancos',               icon: 'pi pi-wallet',      route: '/catalogos/bancos'               },
      ]
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
