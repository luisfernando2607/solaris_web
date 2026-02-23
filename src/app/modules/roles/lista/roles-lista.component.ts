import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';

import { RolService } from '../../../core/services/rol.service';
import { RolPanelComponent } from '../panel/rol-panel.component';
import { Rol } from '../../../shared/models/rol.models';

@Component({
  selector: 'app-roles-lista',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    ToastModule, ButtonModule, InputTextModule,
    TagModule, ConfirmDialogModule, TooltipModule,
    RolPanelComponent,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './roles-lista.component.html',
  styleUrls: ['./roles-lista.component.scss']
})
export class RolesListaComponent implements OnInit {
  private readonly rolService     = inject(RolService);
  private readonly toast          = inject(MessageService);
  private readonly confirmService = inject(ConfirmationService);

  readonly roles    = this.rolService.roles;
  readonly cargando = this.rolService.cargando;

  busqueda     = signal('');
  panelVisible = signal(false);
  rolEdicion   = signal<Rol | null>(null);

  readonly rolesFiltrados = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    return !q ? this.roles()
      : this.roles().filter(r =>
          r.nombre.toLowerCase().includes(q) ||
          r.codigo.toLowerCase().includes(q) ||
          r.descripcion?.toLowerCase().includes(q)
        );
  });

  ngOnInit(): void { this.cargar(); }
  cargar():    void {
    this.rolService.listar().subscribe({
      error: () => this.toast.add({ severity:'error', summary:'Error', detail:'No se pudo cargar roles', life:3000 })
    });
  }

  abrirCrear(): void { this.rolEdicion.set(null); this.panelVisible.set(true); }

  abrirEditar(rol: Rol): void { this.rolEdicion.set(rol); this.panelVisible.set(true); }

  cerrarPanel(): void { this.panelVisible.set(false); this.rolEdicion.set(null); }

  onGuardado(): void { this.cerrarPanel(); this.cargar(); }

  eliminar(rol: Rol): void {
    if (rol.esSistema) {
      this.toast.add({ severity:'warn', summary:'No permitido', detail:'Los roles del sistema no se pueden eliminar', life:3500 });
      return;
    }
    this.confirmService.confirm({
      message:     `¿Seguro que deseas eliminar el rol <strong>${rol.nombre}</strong>?`,
      header:      'Eliminar rol',
      icon:        'pi pi-trash',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.rolService.eliminar(rol.id).subscribe({
          next:  () => { this.toast.add({ severity:'success', summary:'Eliminado', detail:rol.nombre, life:2500 }); this.cargar(); },
          error: (e) => this.toast.add({ severity:'error', summary:'Error', detail: e?.error?.message ?? 'No se pudo eliminar', life:3000 })
        });
      }
    });
  }
}
