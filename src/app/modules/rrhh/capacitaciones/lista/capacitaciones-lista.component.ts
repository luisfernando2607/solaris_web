import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { MessageService, ConfirmationService } from 'primeng/api';
import { RrhhService } from '../../../../core/services/rrhh.service';
import { Capacitacion, ESTADO_CAPACITACION_LABELS, ESTADO_CAPACITACION_OPTIONS } from '../../../../shared/models/rrhh.models';
import { CapacitacionPanelComponent } from '../panel/capacitacion-panel.component';

@Component({
  selector: 'app-capacitaciones-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastModule, ButtonModule, TooltipModule,
            ConfirmDialogModule, SelectModule, CapacitacionPanelComponent],
  providers: [MessageService, ConfirmationService],
  templateUrl: './capacitaciones-lista.component.html',
  styleUrls: ['./capacitaciones-lista.component.scss'],
})
export class CapacitacionesListaComponent implements OnInit {
  private readonly service = inject(RrhhService);
  private readonly toast   = inject(MessageService);
  private readonly confirm = inject(ConfirmationService);

  readonly capacitaciones = this.service.capacitaciones;
  readonly cargando       = this.service.cargandoCap;

  readonly busqueda     = signal('');
  readonly filtroEstado = signal<number | null>(null);
  readonly panelVisible = signal(false);
  readonly capEdicion   = signal<Capacitacion | null>(null);

  readonly estadoOptions = ESTADO_CAPACITACION_OPTIONS;
  readonly estadoLabel   = (e: number) => ESTADO_CAPACITACION_LABELS[e] ?? '—';

  readonly capFiltradas = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    const e = this.filtroEstado();
    return this.capacitaciones().filter((c: Capacitacion) => {
      const matchEst   = e ? c.estado === e : true;
      const matchQuery = !q || c.nombre.toLowerCase().includes(q) || c.codigo.toLowerCase().includes(q);
      return matchEst && matchQuery;
    });
  });

  ngOnInit(): void { this.cargar(); }
  cargar(): void { this.service.listarCapacitaciones().subscribe(); }
  abrirCrear(): void { this.capEdicion.set(null); this.panelVisible.set(true); }
  abrirEditar(c: Capacitacion): void { this.capEdicion.set(c); this.panelVisible.set(true); }
  cerrarPanel(): void { this.panelVisible.set(false); }
  onGuardado(): void { this.panelVisible.set(false); this.cargar(); }

  cambiarEstado(c: Capacitacion, estado: number): void {
    this.service.cambiarEstadoCapacitacion(c.id, estado).subscribe({
      next: () => this.toast.add({ severity: 'success', summary: 'Estado actualizado', detail: c.nombre, life: 2500 }),
      error: (e: any) => this.toast.add({ severity: 'error', summary: 'Error', detail: e?.error?.message ?? 'Error', life: 3500 })
    });
  }

  eliminar(c: Capacitacion): void {
    this.confirm.confirm({
      message: `¿Eliminar la capacitación <strong>${c.nombre}</strong>?`,
      header: 'Confirmar eliminación', icon: 'pi pi-trash',
      acceptButtonStyleClass: 'p-button-danger', acceptLabel: 'Eliminar', rejectLabel: 'Cancelar',
      accept: () => {
        this.service.eliminarCapacitacion(c.id).subscribe({
          next: () => { this.toast.add({ severity: 'success', summary: 'Eliminado', detail: c.nombre, life: 2500 }); this.cargar(); },
          error: (e: any) => this.toast.add({ severity: 'error', summary: 'Error', detail: e?.error?.message ?? 'Error', life: 3500 })
        });
      }
    });
  }
}
