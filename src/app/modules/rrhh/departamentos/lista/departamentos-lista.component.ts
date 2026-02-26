import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';

import { RrhhService } from '../../../../core/services/rrhh.service';
import { DepartamentoPanelComponent } from '../panel/departamento-panel.component';
import { DepartamentoListItem, Departamento } from '../../../../shared/models/rrhh.models';

@Component({
  selector: 'app-departamentos-lista',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    ToastModule, ButtonModule, SelectModule,
    ConfirmDialogModule, TooltipModule,
    DepartamentoPanelComponent,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './departamentos-lista.component.html',
  styleUrls: ['./departamentos-lista.component.scss']
})
export class DepartamentosListaComponent implements OnInit {
  private readonly rrhhService    = inject(RrhhService);
  private readonly toast          = inject(MessageService);
  private readonly confirmService = inject(ConfirmationService);

  readonly departamentos = this.rrhhService.departamentos;
  readonly cargando      = this.rrhhService.cargandoDept;

  readonly busqueda    = signal('');
  readonly filtroNivel  = signal<number | null>(null);
  readonly filtroActivo = signal<boolean | null>(null);
  readonly panelVisible        = signal(false);
  readonly departamentoEdicion = signal<Departamento | null>(null);

  readonly nivelOpciones = [
    { label: 'Principal',   value: 1 },
    { label: 'Secundario',  value: 2 },
    { label: 'Terciario',   value: 3 },
  ];

  readonly estadoOpciones = [
    { label: 'Activo',   value: true  },
    { label: 'Inactivo', value: false },
  ];

  readonly departamentosFiltrados = computed(() => {
    const q      = this.busqueda().toLowerCase().trim();
    const nivel  = this.filtroNivel();
    const activo = this.filtroActivo();

    return this.departamentos().filter(d => {
      const matchQ = !q ||
        d.nombre.toLowerCase().includes(q) ||
        d.codigo.toLowerCase().includes(q) ||
        (d.descripcion ?? '').toLowerCase().includes(q) ||
        (d.responsableNombre ?? '').toLowerCase().includes(q);
      const matchNivel  = nivel  == null || d.nivel  === nivel;
      const matchActivo = activo == null || d.activo === activo;
      return matchQ && matchNivel && matchActivo;
    });
  });

  iniciales(nombre: string) {
    return nombre?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() ?? '?';
  }

  nivelLabel(nivel: number): string {
    return ({ 1: 'Principal', 2: 'Secundario', 3: 'Terciario' } as Record<number, string>)[nivel] ?? `Nivel ${nivel}`;
  }

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.rrhhService.listarDepartamentos().subscribe({
      error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la lista', life: 3000 })
    });
  }

  abrirCrear(): void { this.departamentoEdicion.set(null); this.panelVisible.set(true); }

  abrirEditar(id: number): void {
    this.rrhhService.obtenerDepartamento(id).subscribe({
      next:  res => { this.departamentoEdicion.set(res?.data ?? res as any); this.panelVisible.set(true); },
      error: ()  => this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el departamento', life: 3000 })
    });
  }

  cerrarPanel(): void { this.panelVisible.set(false); this.departamentoEdicion.set(null); }
  onGuardado():  void { this.cerrarPanel(); this.cargar(); }

  toggleActivo(d: DepartamentoListItem): void {
    const accion = d.activo ? 'desactivar' : 'activar';
    this.confirmService.confirm({
      message:     `¿Deseas ${accion} el departamento <strong>${d.nombre}</strong>?`,
      header:      'Confirmar acción',
      icon:        'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, confirmar',
      rejectLabel: 'Cancelar',
      accept: () => {
        const obs = d.activo
          ? this.rrhhService.desactivarDepartamento(d.id)
          : this.rrhhService.activarDepartamento(d.id);
        obs.subscribe({
          next:  () => {
            this.toast.add({ severity: d.activo ? 'warn' : 'success', summary: d.activo ? 'Desactivado' : 'Activado', detail: d.nombre, life: 2500 });
            this.cargar();
          },
          error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo completar la acción', life: 3000 })
        });
      }
    });
  }

  eliminar(d: DepartamentoListItem): void {
    this.confirmService.confirm({
      message:     `¿Seguro que deseas eliminar el departamento <strong>${d.nombre}</strong>?`,
      header:      'Confirmar eliminación',
      icon:        'pi pi-trash',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.rrhhService.eliminarDepartamento(d.id).subscribe({
        next:  () => { this.toast.add({ severity: 'success', summary: 'Eliminado', detail: d.nombre, life: 2500 }); this.cargar(); },
        error: ()  => this.toast.add({ severity: 'error',   summary: 'Error', detail: 'No se pudo eliminar', life: 3000 })
      })
    });
  }
}