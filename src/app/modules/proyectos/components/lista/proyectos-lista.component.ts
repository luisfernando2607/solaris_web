import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { MessageService, ConfirmationService } from 'primeng/api';

import { ProyectoService } from '../../services/proyecto.service';
import {
  ProyectoListDto, EstadoProyecto, TipoProyecto, PrioridadProyecto,
  ESTADO_LABELS, TIPO_LABELS, PRIORIDAD_LABELS,
  FiltroProyectosRequest, enumNums
} from '../../models/proyecto.models';
import { ProyectoPanelComponent } from '../panel/proyecto-panel.component';

@Component({
  selector: 'app-proyectos-lista',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ToastModule, ButtonModule,
    TooltipModule, ConfirmDialogModule, SelectModule, ProyectoPanelComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './proyectos-lista.component.html',
  styleUrls: ['./proyectos-lista.component.scss'],
})
export class ProyectosListaComponent implements OnInit {
  private readonly service = inject(ProyectoService);
  private readonly router  = inject(Router);
  private readonly toast   = inject(MessageService);
  private readonly confirm = inject(ConfirmationService);

  readonly proyectos = this.service.proyectos;
  readonly total     = this.service.total;
  readonly cargando  = this.service.cargando;

  readonly busqueda     = signal('');
  readonly filtroEstado = signal<EstadoProyecto | null>(null);
  readonly filtroTipo   = signal<TipoProyecto | null>(null);
  readonly pagina       = signal(1);
  readonly porPagina    = 20;

  readonly panelVisible = signal(false);
  readonly proyectoEdit = signal<ProyectoListDto | null>(null);

  // Object.values en enums numéricos devuelve también las keys string → filtrar solo números
  readonly estadoOpts = enumNums(EstadoProyecto).map(v => ({
    label: ESTADO_LABELS[v as EstadoProyecto], value: v as EstadoProyecto
  }));
  readonly tipoOpts = enumNums(TipoProyecto).map(v => ({
    label: TIPO_LABELS[v as TipoProyecto], value: v as TipoProyecto
  }));

  readonly ESTADO_LABELS    = ESTADO_LABELS;
  readonly TIPO_LABELS      = TIPO_LABELS;
  readonly PRIORIDAD_LABELS = PRIORIDAD_LABELS;
  readonly EstadoProyecto   = EstadoProyecto;

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    const filtro: FiltroProyectosRequest = {
      busqueda:           this.busqueda() || undefined,
      estado:             this.filtroEstado() ?? undefined,
      tipo:               this.filtroTipo() ?? undefined,
      pagina:             this.pagina(),
      elementosPorPagina: this.porPagina,
    };
    this.service.listar(filtro).subscribe();
  }

  buscar(): void { this.pagina.set(1); this.cargar(); }
  limpiarFiltros(): void {
    this.busqueda.set(''); this.filtroEstado.set(null); this.filtroTipo.set(null);
    this.pagina.set(1); this.cargar();
  }

  verDetalle(p: ProyectoListDto): void   { this.router.navigate(['/proyectos', p.id, 'detalle']); }
  verDashboard(p: ProyectoListDto): void { this.router.navigate(['/proyectos', p.id, 'dashboard']); }
  abrirCrear(): void  { this.proyectoEdit.set(null); this.panelVisible.set(true); }
  abrirEditar(p: ProyectoListDto): void { this.proyectoEdit.set(p); this.panelVisible.set(true); }
  cerrarPanel(): void { this.panelVisible.set(false); }
  onGuardado(): void  { this.panelVisible.set(false); this.cargar(); }

  cambiarEstado(p: ProyectoListDto, estado: EstadoProyecto): void {
    this.service.cambiarEstado(p.id, estado).subscribe({
      next: () => { this.toast.add({ severity: 'success', summary: 'Estado actualizado', detail: p.nombre, life: 2500 }); this.cargar(); }
    });
  }

  eliminar(p: ProyectoListDto): void {
    this.confirm.confirm({
      message: `¿Eliminar el proyecto <strong>${p.nombre}</strong>? Esta acción no se puede deshacer.`,
      header: 'Confirmar eliminación', icon: 'pi pi-trash',
      acceptButtonStyleClass: 'p-button-danger', acceptLabel: 'Eliminar', rejectLabel: 'Cancelar',
      accept: () => {
        this.service.eliminar(p.id).subscribe({
          next:  () => { this.toast.add({ severity: 'success', summary: 'Eliminado', detail: p.nombre, life: 2500 }); this.cargar(); },
          error: (e) => this.toast.add({ severity: 'error', summary: 'Error', detail: e?.error?.message ?? 'No se pudo eliminar', life: 3500 })
        });
      }
    });
  }

  getEstadoClass(estado: EstadoProyecto): string {
    const m: Record<EstadoProyecto, string> = {
      [EstadoProyecto.Borrador]:    'gray',
      [EstadoProyecto.Planificado]: 'blue',
      [EstadoProyecto.EnEjecucion]: 'green',
      [EstadoProyecto.EnPausa]:     'yellow',
      [EstadoProyecto.Completado]:  'teal',
      [EstadoProyecto.Cancelado]:   'red',
    };
    return m[estado] ?? 'gray';
  }

  getPrioridadClass(p: PrioridadProyecto): string {
    const m: Record<PrioridadProyecto, string> = {
      [PrioridadProyecto.Baja]:    'low',
      [PrioridadProyecto.Media]:   'mid',
      [PrioridadProyecto.Alta]:    'high',
      [PrioridadProyecto.Critica]: 'crit',
    };
    return m[p] ?? 'low';
  }

  formatMoney(v: number): string {
    return new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
  }

  get totalPaginas(): number { return Math.ceil(this.total() / this.porPagina); }
  anterior(): void { if (this.pagina() > 1) { this.pagina.update(p => p - 1); this.cargar(); } }
  siguiente(): void { if (this.pagina() < this.totalPaginas) { this.pagina.update(p => p + 1); this.cargar(); } }
}
