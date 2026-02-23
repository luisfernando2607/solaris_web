import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';

import { EmpresaService } from '../../../core/services/empresa.service';
import { EmpresaPanelComponent } from '../panel/empresa-panel.component';
import { Empresa, ESTADO_EMPRESA, PLAN_COLOR } from '../../../shared/models/empresa.models';

@Component({
  selector: 'app-empresas-lista',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    ToastModule, ButtonModule, TagModule,
    ConfirmDialogModule, TooltipModule,
    EmpresaPanelComponent,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './empresas-lista.component.html',
  styleUrls: ['./empresas-lista.component.scss']
})
export class EmpresasListaComponent implements OnInit {
  private readonly empresaService = inject(EmpresaService);
  private readonly toast          = inject(MessageService);
  private readonly confirmService = inject(ConfirmationService);

  readonly empresas  = this.empresaService.empresas;
  readonly cargando  = this.empresaService.cargando;

  busqueda      = signal('');
  filtroEstado  = signal<number | null>(null);
  panelVisible  = signal(false);
  empresaEdicion = signal<Empresa | null>(null);

  readonly estadoInfo = ESTADO_EMPRESA;
  readonly planColor  = PLAN_COLOR;

  readonly empresasFiltradas = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    const e = this.filtroEstado();
    return this.empresas().filter(emp => {
      const matchQ = !q || emp.razonSocial.toLowerCase().includes(q)
                        || emp.codigo.toLowerCase().includes(q)
                        || emp.numeroIdentificacion.includes(q)
                        || (emp.nombreComercial?.toLowerCase().includes(q) ?? false);
      const matchE = e === null || emp.estado === e;
      return matchQ && matchE;
    });
  });

  readonly estadosFiltro = [
    { label: 'Todas',      value: null },
    { label: 'Activas',    value: 1 },
    { label: 'Inactivas',  value: 0 },
    { label: 'Suspendidas',value: 2 },
    { label: 'Prueba',     value: 3 },
  ];

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.empresaService.listar().subscribe({
      error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar empresas', life: 3000 })
    });
  }

  abrirCrear():             void { this.empresaEdicion.set(null); this.panelVisible.set(true); }
  abrirEditar(e: Empresa):  void { this.empresaEdicion.set(e);    this.panelVisible.set(true); }
  cerrarPanel():            void { this.panelVisible.set(false); this.empresaEdicion.set(null); }
  onGuardado():             void { this.cerrarPanel(); this.cargar(); }

  toggleActivo(emp: Empresa): void {
    const obs = emp.activo
      ? this.empresaService.desactivar(emp.id)
      : this.empresaService.activar(emp.id);
    obs.subscribe({
      next:  () => { this.toast.add({ severity: 'success', summary: 'Actualizado', detail: emp.razonSocial, life: 2000 }); this.cargar(); },
      error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar', life: 3000 })
    });
  }

  eliminar(emp: Empresa): void {
    this.confirmService.confirm({
      message:     `¿Seguro que deseas eliminar <strong>${emp.razonSocial}</strong>? Esta acción no se puede deshacer.`,
      header:      'Eliminar empresa',
      icon:        'pi pi-trash',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.empresaService.eliminar(emp.id).subscribe({
          next:  () => { this.toast.add({ severity: 'success', summary: 'Eliminada', detail: emp.razonSocial, life: 2500 }); this.cargar(); },
          error: (e) => this.toast.add({ severity: 'error', summary: 'Error', detail: e?.error?.message ?? 'No se pudo eliminar', life: 3000 })
        });
      }
    });
  }

  estadoLabel(e: number): string { return ESTADO_EMPRESA[e]?.label ?? 'Desconocido'; }
  estadoColor(e: number): string { return ESTADO_EMPRESA[e]?.color ?? '#64748b'; }
}
