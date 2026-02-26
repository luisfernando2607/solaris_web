import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';

import { RrhhService } from '../../../../core/services/rrhh.service';
import { EmpleadoPanelComponent } from '../panel/empleado-panel.component';
import {
  EmpleadoListItem, Empleado,
  ESTADO_EMPLEADO_LABELS, EstadoEmpleado
} from '../../../../shared/models/rrhh.models';

@Component({
  selector: 'app-empleados-lista',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    ToastModule, ButtonModule, SelectModule,
    TagModule, ConfirmDialogModule, TooltipModule,
    EmpleadoPanelComponent,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './empleados-lista.component.html',
  styleUrls: ['./empleados-lista.component.scss']
})
export class EmpleadosListaComponent implements OnInit {
  private readonly rrhhService    = inject(RrhhService);
  private readonly toast          = inject(MessageService);
  private readonly confirmService = inject(ConfirmationService);

  readonly empleados    = this.rrhhService.empleados;
  readonly total        = this.rrhhService.total;
  readonly cargando     = this.rrhhService.cargandoEmp;
  readonly departamentos = this.rrhhService.departamentos;

  readonly busqueda       = signal('');
  readonly filtroEstado   = signal<number | null>(null);
  readonly filtroDeptId   = signal<number | null>(null);
  readonly panelVisible   = signal(false);
  readonly empleadoEdicion = signal<Empleado | null>(null);

  readonly estadoOpciones = [
    { label: 'Activo',      value: EstadoEmpleado.Activo     },
    { label: 'En Licencia', value: EstadoEmpleado.Licencia   },
    { label: 'Vacaciones',  value: EstadoEmpleado.Vacaciones },
    { label: 'Egresado',    value: EstadoEmpleado.Egresado   },
  ];

  readonly departamentosOpciones = computed(() =>
    this.departamentos().map(d => ({ label: d.nombre, value: d.id }))
  );

  readonly empleadosFiltrados = computed(() => {
    const q      = this.busqueda().toLowerCase().trim();
    const estado = this.filtroEstado();
    const deptId = this.filtroDeptId();
    return this.empleados().filter(e => {
      const matchQ     = !q ||
        e.nombreCompleto.toLowerCase().includes(q) ||
        e.codigo.toLowerCase().includes(q) ||
        e.numeroIdentificacion.toLowerCase().includes(q) ||
        (e.emailCorporativo ?? '').toLowerCase().includes(q);
      const matchEstado = estado == null || e.estado === estado;
      const matchDept   = !deptId || e.departamentoId === deptId;
      return matchQ && matchEstado && matchDept;
    });
  });

  etiquetaEstado(e: number) { return ESTADO_EMPLEADO_LABELS[e] ?? '—'; }
  severidadEstado(e: number): any {
    return ({ 1: 'success', 2: 'warn', 3: 'info', 4: 'secondary' } as any)[e] ?? 'secondary';
  }
  formatSalario(val: number) {
    return new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(val);
  }
  iniciales(nombre: string) {
    return nombre?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() ?? '?';
  }

  ngOnInit(): void {
    this.cargar();
    if (this.departamentos().length === 0) this.rrhhService.listarDepartamentos().subscribe();
    if (this.rrhhService.puestos().length === 0) this.rrhhService.listarPuestos().subscribe();
  }

  cargar(): void {
    this.rrhhService.listarEmpleados().subscribe({
      error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la lista', life: 3000 })
    });
  }

  abrirCrear(): void { this.empleadoEdicion.set(null); this.panelVisible.set(true); }

  abrirEditar(id: number): void {
    this.rrhhService.obtenerEmpleado(id).subscribe({
      next: res => { this.empleadoEdicion.set(res?.data ?? res as any); this.panelVisible.set(true); },
      error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el empleado', life: 3000 })
    });
  }

  cerrarPanel(): void { this.panelVisible.set(false); this.empleadoEdicion.set(null); }
  onGuardado():  void { this.cerrarPanel(); this.cargar(); }

  toggleActivo(e: EmpleadoListItem): void {
    const activar = e.estado !== 1;
    this.confirmService.confirm({
      message:     `¿Seguro que deseas ${activar ? 'activar' : 'desactivar'} a <strong>${e.nombreCompleto}</strong>?`,
      header:      'Confirmar acción',
      icon:        'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, confirmar', rejectLabel: 'Cancelar',
      accept: () => {
        const obs = activar
          ? this.rrhhService.activarEmpleado(e.id)
          : this.rrhhService.desactivarEmpleado(e.id);
        obs.subscribe({
          next:  () => { this.toast.add({ severity: activar ? 'success' : 'warn', summary: activar ? 'Activado' : 'Desactivado', detail: e.nombreCompleto, life: 2500 }); this.cargar(); },
          error: () =>  this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo completar la acción', life: 3000 })
        });
      }
    });
  }
}