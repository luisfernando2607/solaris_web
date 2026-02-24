import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { MessageService, ConfirmationService } from 'primeng/api';

import { CiudadService } from '../../../../../core/services/ciudad.service';
import { EstadoProvinciaService } from '../../../../../core/services/estado-provincia.service';
import { Ciudad } from '../../../../../shared/models/catalogo.models';
import { CiudadPanelComponent } from '../panel/ciudad-panel.component';

@Component({
  selector: 'app-ciudades-lista',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    ToastModule, ButtonModule, TooltipModule, ConfirmDialogModule, SelectModule,
    CiudadPanelComponent,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './ciudades-lista.component.html',
  styleUrls: ['./ciudades-lista.component.scss'],
})
export class CiudadesListaComponent implements OnInit {
  private readonly service        = inject(CiudadService);
  private readonly estadoService  = inject(EstadoProvinciaService);
  private readonly toast          = inject(MessageService);
  private readonly confirm        = inject(ConfirmationService);

  readonly ciudades = this.service.ciudades;
  readonly cargando = this.service.cargando;
  readonly estados  = this.estadoService.estados;

  readonly busqueda      = signal('');
  readonly filtroEstadoId = signal<number | null>(null);
  readonly panelVisible  = signal(false);
  readonly ciudadEdicion = signal<Ciudad | null>(null);

  readonly estadosOptions = computed(() =>
    this.estados().map(e => ({ label: e.nombre, value: e.id }))
  );

  readonly ciudadesFiltradas = computed(() => {
    const q  = this.busqueda().toLowerCase().trim();
    const eid = this.filtroEstadoId();
    return this.ciudades().filter(c => {
      const matchEstado = eid ? c.estadoProvinciaId === eid : true;
      const matchQuery  = !q || c.nombre.toLowerCase().includes(q) || (c.codigo?.toLowerCase().includes(q) ?? false);
      return matchEstado && matchQuery;
    });
  });

  ngOnInit(): void {
    this.estadoService.listar().subscribe();
    this.cargar();
  }

  cargar(): void { this.service.listar(this.filtroEstadoId() ?? undefined).subscribe(); }

  abrirCrear(): void { this.ciudadEdicion.set(null); this.panelVisible.set(true); }
  abrirEditar(c: Ciudad): void { this.ciudadEdicion.set(c); this.panelVisible.set(true); }
  cerrarPanel(): void { this.panelVisible.set(false); }
  onGuardado(): void { this.panelVisible.set(false); this.cargar(); }

  toggleActivo(ciudad: Ciudad): void {
    const accion = ciudad.activo ? this.service.desactivar(ciudad.id) : this.service.activar(ciudad.id);
    accion.subscribe({
      next: () => {
        this.toast.add({
          severity: ciudad.activo ? 'warn' : 'success',
          summary: ciudad.activo ? 'Desactivada' : 'Activada',
          detail: ciudad.nombre, life: 2500
        });
        this.cargar();
      }
    });
  }

  eliminar(ciudad: Ciudad): void {
    this.confirm.confirm({
      message: `¿Eliminar la ciudad <strong>${ciudad.nombre}</strong>?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-trash',
      acceptButtonStyleClass: 'p-button-danger',
      acceptLabel: 'Eliminar', rejectLabel: 'Cancelar',
      accept: () => {
        this.service.eliminar(ciudad.id).subscribe({
          next: () => {
            this.toast.add({ severity: 'success', summary: 'Eliminada', detail: ciudad.nombre, life: 2500 });
            this.cargar();
          },
          error: (e) => this.toast.add({ severity: 'error', summary: 'Error',
            detail: e?.error?.message ?? 'No se pudo eliminar', life: 3500 })
        });
      }
    });
  }
}
