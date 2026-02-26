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
import { PuestoPanelComponent } from '../panel/puesto-panel.component';
import { PuestoListItem, Puesto, NIVEL_JERARQUICO_LABELS } from '../../../../shared/models/rrhh.models';

interface GrupoDept {
  deptId:    number;
  deptNombre: string;
  puestos:   PuestoListItem[];
}

@Component({
  selector: 'app-puestos-lista',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    ToastModule, ButtonModule, SelectModule,
    ConfirmDialogModule, TooltipModule,
    PuestoPanelComponent,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './puestos-lista.component.html',
  styleUrls: ['./puestos-lista.component.scss']
})
export class PuestosListaComponent implements OnInit {
  private readonly rrhhService    = inject(RrhhService);
  private readonly toast          = inject(MessageService);
  private readonly confirmService = inject(ConfirmationService);

  readonly puestos       = this.rrhhService.puestos;
  readonly departamentos = this.rrhhService.departamentos;
  readonly cargando      = this.rrhhService.cargandoPuest;

  readonly busqueda      = signal('');
  readonly filtroDeptId  = signal<number | null>(null);
  readonly filtroNivel   = signal<number | null>(null);
  readonly filtroActivo  = signal<boolean | null>(null);
  readonly panelVisible  = signal(false);
  readonly puestoEdicion = signal<Puesto | null>(null);
  readonly deptIdInicial = signal<number | null>(null);

  /** Preferencia de vista persistida en sessionStorage */
  readonly vista = signal<'cards' | 'tabla'>(
    (sessionStorage.getItem('puestos-vista') as 'cards' | 'tabla') ?? 'cards'
  );

  readonly nivelesOpciones = [
    { label: 'Directivo',    value: 1 },
    { label: 'Mando medio',  value: 2 },
    { label: 'Técnico',      value: 3 },
    { label: 'Operativo',    value: 4 },
  ];

  readonly estadoOpciones = [
    { label: 'Activo',   value: true  },
    { label: 'Inactivo', value: false },
  ];

  readonly departamentosOpciones = computed(() =>
    this.departamentos().map(d => ({ label: d.nombre, value: d.id }))
  );

  readonly puestosFiltrados = computed(() => {
    const q      = this.busqueda().toLowerCase().trim();
    const deptId = this.filtroDeptId();
    const nivel  = this.filtroNivel();
    const activo = this.filtroActivo();
    return this.puestos().filter(p => {
      const matchQ     = !q || p.nombre.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q) || p.departamentoNombre.toLowerCase().includes(q);
      const matchDept  = !deptId || p.departamentoId === deptId;
      const matchNivel = nivel  == null || p.nivelJerarquico === nivel;
      const matchActivo = activo == null || p.activo === activo;
      return matchQ && matchDept && matchNivel && matchActivo;
    });
  });

  /** Agrupa puestos filtrados por departamento, preservando orden alfabético */
  readonly grupos = computed<GrupoDept[]>(() => {
    const map = new Map<number, GrupoDept>();
    for (const p of this.puestosFiltrados()) {
      if (!map.has(p.departamentoId)) {
        map.set(p.departamentoId, { deptId: p.departamentoId, deptNombre: p.departamentoNombre, puestos: [] });
      }
      map.get(p.departamentoId)!.puestos.push(p);
    }
    return [...map.values()].sort((a, b) => a.deptNombre.localeCompare(b.deptNombre));
  });

  nivelLabel(nivel: number) { return NIVEL_JERARQUICO_LABELS[nivel] ?? `N${nivel}`; }

  formatSalario(val?: number): string {
    if (!val) return '—';
    return new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(val);
  }

  iniciales(nombre: string) {
    return nombre?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() ?? '?';
  }

  ngOnInit(): void {
    this.cargar();
    if (this.departamentos().length === 0) this.rrhhService.listarDepartamentos().subscribe();
  }

  cargar(): void {
    this.rrhhService.listarPuestos().subscribe({
      error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la lista', life: 3000 })
    });
  }

  cambiarVista(v: 'cards' | 'tabla') {
    this.vista.set(v);
    sessionStorage.setItem('puestos-vista', v);
  }

  abrirCrear(): void {
    this.puestoEdicion.set(null);
    this.deptIdInicial.set(null);
    this.panelVisible.set(true);
  }

  /** Abre el panel con el departamento preseleccionado */
  abrirCrearEnDept(deptId: number): void {
    this.puestoEdicion.set(null);
    this.deptIdInicial.set(deptId);
    this.panelVisible.set(true);
  }

  abrirEditar(id: number): void {
    this.rrhhService.obtenerPuesto(id).subscribe({
      next:  res => { this.puestoEdicion.set(res?.data ?? res as any); this.deptIdInicial.set(null); this.panelVisible.set(true); },
      error: ()  => this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el puesto', life: 3000 })
    });
  }

  cerrarPanel(): void { this.panelVisible.set(false); this.puestoEdicion.set(null); this.deptIdInicial.set(null); }
  onGuardado():  void { this.cerrarPanel(); this.cargar(); }

  toggleActivo(p: PuestoListItem): void {
    const accion = p.activo ? 'desactivar' : 'activar';
    this.confirmService.confirm({
      message:     `¿Deseas ${accion} el puesto <strong>${p.nombre}</strong>?`,
      header:      'Confirmar acción',
      icon:        'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, confirmar', rejectLabel: 'Cancelar',
      accept: () => {
        const obs = p.activo
          ? this.rrhhService.desactivarPuesto(p.id)
          : this.rrhhService.activarPuesto(p.id);
        obs.subscribe({
          next:  () => { this.toast.add({ severity: p.activo ? 'warn' : 'success', summary: p.activo ? 'Desactivado' : 'Activado', detail: p.nombre, life: 2500 }); this.cargar(); },
          error: ()  => this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo completar la acción', life: 3000 })
        });
      }
    });
  }

  eliminar(p: PuestoListItem): void {
    this.confirmService.confirm({
      message:     `¿Seguro que deseas eliminar el puesto <strong>${p.nombre}</strong>?`,
      header:      'Confirmar eliminación',
      icon:        'pi pi-trash',
      acceptLabel: 'Sí, eliminar', rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.rrhhService.eliminarPuesto(p.id).subscribe({
        next:  () => { this.toast.add({ severity: 'success', summary: 'Eliminado', detail: p.nombre, life: 2500 }); this.cargar(); },
        error: ()  => this.toast.add({ severity: 'error',   summary: 'Error', detail: 'No se pudo eliminar', life: 3000 })
      })
    });
  }
}