import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

import { TipoIdentificacionService } from '../../../../../core/services/tipo-identificacion.service';
import { TipoIdentificacion } from '../../../../../shared/models/catalogo.models';
import { TipoIdentificacionPanelComponent } from '../panel/tipo-identificacion-panel.component';

@Component({
  selector: 'app-tipo-identificacion-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastModule, ButtonModule, TooltipModule, ConfirmDialogModule, TipoIdentificacionPanelComponent],
  providers: [MessageService, ConfirmationService],
  templateUrl: './tipo-identificacion-lista.component.html',
  styleUrls: ['./tipo-identificacion-lista.component.scss'],
})
export class TipoIdentificacionListaComponent implements OnInit {
  private readonly service = inject(TipoIdentificacionService);
  private readonly toast   = inject(MessageService);
  private readonly confirm = inject(ConfirmationService);

  readonly tipos    = this.service.tipos;
  readonly cargando = this.service.cargando;

  readonly busqueda    = signal('');
  readonly panelVisible = signal(false);
  readonly tipoEdicion  = signal<TipoIdentificacion | null>(null);

  readonly tiposFiltrados = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    if (!q) return this.tipos();
    return this.tipos().filter(t =>
      t.nombre.toLowerCase().includes(q) || t.codigo.toLowerCase().includes(q)
    );
  });

  ngOnInit(): void { this.cargar(); }
  cargar(): void { this.service.listar().subscribe(); }

  abrirCrear(): void { this.tipoEdicion.set(null); this.panelVisible.set(true); }
  abrirEditar(t: TipoIdentificacion): void { this.tipoEdicion.set(t); this.panelVisible.set(true); }
  cerrarPanel(): void { this.panelVisible.set(false); }
  onGuardado(): void { this.panelVisible.set(false); this.cargar(); }

  toggleActivo(tipo: TipoIdentificacion): void {
    const accion = tipo.activo ? this.service.desactivar(tipo.id) : this.service.activar(tipo.id);
    accion.subscribe({
      next: () => {
        this.toast.add({ severity: tipo.activo ? 'warn' : 'success', summary: tipo.activo ? 'Desactivado' : 'Activado', detail: tipo.nombre, life: 2500 });
        this.cargar();
      }
    });
  }

  eliminar(tipo: TipoIdentificacion): void {
    this.confirm.confirm({
      message: `¿Eliminar el tipo <strong>${tipo.nombre}</strong>?`, header: 'Confirmar eliminación',
      icon: 'pi pi-trash', acceptButtonStyleClass: 'p-button-danger', acceptLabel: 'Eliminar', rejectLabel: 'Cancelar',
      accept: () => {
        this.service.eliminar(tipo.id).subscribe({
          next: () => { this.toast.add({ severity: 'success', summary: 'Eliminado', detail: tipo.nombre, life: 2500 }); this.cargar(); },
          error: (e) => this.toast.add({ severity: 'error', summary: 'Error', detail: e?.error?.message ?? 'No se pudo eliminar', life: 3500 })
        });
      }
    });
  }
}
