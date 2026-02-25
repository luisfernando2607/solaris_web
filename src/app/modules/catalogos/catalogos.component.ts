import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLinkActive, RouterLink } from '@angular/router';

interface CatalogoMenu {
  label: string;
  icon:  string;
  path:  string;
}

@Component({
  selector: 'app-catalogos',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLinkActive, RouterLink],
  templateUrl: './catalogos.component.html',
  styleUrls: ['./catalogos.component.scss'],
})
export class CatalogosComponent {
  readonly menuAbierto = signal(true);

  readonly menuItems: CatalogoMenu[] = [
    { label: 'Países',               icon: 'pi pi-globe',        path: 'paises' },
    { label: 'Estados / Provincias', icon: 'pi pi-map',          path: 'estados-provincias' },
    { label: 'Ciudades',             icon: 'pi pi-map-marker',   path: 'ciudades' },
    { label: 'Monedas',              icon: 'pi pi-dollar',       path: 'monedas' },
    { label: 'Tipos Identificación', icon: 'pi pi-id-card',      path: 'tipos-identificacion' },
    { label: 'Impuestos',            icon: 'pi pi-percentage',   path: 'impuestos' },
    { label: 'Formas de Pago',       icon: 'pi pi-credit-card',  path: 'formas-pago' },
    { label: 'Bancos',               icon: 'pi pi-wallet',       path: 'bancos' },
  ];
}
