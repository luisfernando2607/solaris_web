import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProyectoService } from '../../../../core/services/proyecto.service';
import {
  TareaListDto, TareaDto, CrearTareaRequest, ActualizarTareaRequest,
  ProyectoFaseDto, CuadrillaDto,
  EstadoTarea, PrioridadTarea, PrioridadProyecto,
  ESTADO_TAREA_LABELS, PRIORIDAD_LABELS, enumNums
} from  '../../../../shared/models/proyecto.models';

@Component({
  selector: 'app-tareas',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, ToastModule, TooltipModule, SelectModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  template: `
<p-toast position="top-right" />
<p-confirmDialog />

<div class="tab-section">
  <!-- Header -->
  <div class="tab-section-header">
    <div>
      <h2 class="section-title">Tareas del Proyecto</h2>
      <p class="section-sub">{{ tareasFiltradas().length }} de {{ tareas().length }} tareas</p>
    </div>
    <div class="header-actions">
      <p-select [options]="estadoFiltroOpts" [(ngModel)]="filtroEstado" (ngModelChange)="aplicarFiltro()" placeholder="Todos los estados" [showClear]="true" styleClass="filter-select-sm" />
      <p-button label="Nueva tarea" icon="pi pi-plus" size="small" (onClick)="abrirCrear()" />
    </div>
  </div>

  <!-- Tabla -->
  @if (cargando()) {
    <div class="loading-row"><i class="pi pi-spin pi-spinner"></i> Cargando...</div>
  } @else if (tareasFiltradas().length === 0) {
    <div class="empty-state"><i class="pi pi-check-square"></i><p>No hay tareas. Crea la primera tarea del proyecto.</p></div>
  } @else {
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Tarea</th>
            <th>Estado</th>
            <th>Prioridad</th>
            <th>Avance</th>
            <th>Fechas Plan</th>
            <th>Cuadrilla</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          @for (t of tareasFiltradas(); track t.id) {
            <tr>
              <td>
                <div class="cell-nombre">{{ t.nombre }}</div>
                @if (t.responsableNombre) { <div class="cell-sub"><i class="pi pi-user"></i> {{ t.responsableNombre }}</div> }
              </td>
              <td>
                <select class="estado-select estado-{{ getEstadoClass(t.estado) }}"
                  [value]="t.estado" (change)="cambiarEstado(t, +$any($event.target).value)">
                  @for (opt of estadoOpts; track opt.value) {
                    <option [value]="opt.value">{{ opt.label }}</option>
                  }
                </select>
              </td>
              <td><span class="badge prio-{{ getPrioridadClass(t.prioridad) }}">{{ PRIORIDAD_LABELS[t.prioridad] }}</span></td>
              <td>
                <div class="avance-cell">
                  <div class="avance-bar-sm"><div class="avance-fill-sm" [style.width.%]="t.porcentajeAvance"></div></div>
                  <span class="avance-num">{{ t.porcentajeAvance }}%</span>
                </div>
              </td>
              <td>
                <div class="fechas-cell">
                  <span>{{ t.fechaInicioPlan | date:'dd/MM/yy' }}</span>
                  <span class="date-sep">→</span>
                  <span>{{ t.fechaFinPlan | date:'dd/MM/yy' }}</span>
                </div>
              </td>
              <td>{{ t.cuadrillaNombre ?? '—' }}</td>
              <td>
                <div class="row-actions">
                  <button class="icon-btn" (click)="editar(t)" pTooltip="Editar"><i class="pi pi-pencil"></i></button>
                  <button class="icon-btn danger" (click)="confirmarEliminar(t)" pTooltip="Eliminar"><i class="pi pi-trash"></i></button>
                </div>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  }
</div>

<!-- Panel lateral -->
@if (panelVisible()) {
  <div class="side-panel-overlay" (click)="cerrar()"></div>
  <div class="side-panel">
    <div class="panel-header">
      <h3>{{ editando() ? 'Editar Tarea' : 'Nueva Tarea' }}</h3>
      <button class="panel-close" (click)="cerrar()"><i class="pi pi-times"></i></button>
    </div>
    <div class="panel-body">
      <div class="form-group">
        <label>Nombre *</label>
        <input type="text" class="form-input" [(ngModel)]="form.nombre" placeholder="Nombre de la tarea" />
      </div>
      <div class="form-group">
        <label>Descripción</label>
        <textarea class="form-input" [(ngModel)]="form.descripcion" rows="2"></textarea>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Prioridad</label>
          <p-select [options]="prioridadOpts" [(ngModel)]="form.prioridad" styleClass="form-select" />
        </div>
        <div class="form-group">
          <label>Cuadrilla</label>
          <p-select [options]="cuadrillaOpts" [(ngModel)]="form.cuadrillaId" [showClear]="true" styleClass="form-select" placeholder="Sin asignar" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Inicio Plan</label>
          <input type="date" class="form-input" [(ngModel)]="form.fechaInicioPlan" />
        </div>
        <div class="form-group">
          <label>Fin Plan</label>
          <input type="date" class="form-input" [(ngModel)]="form.fechaFinPlan" />
        </div>
      </div>
      <div class="form-group">
        <label>Duración (días)</label>
        <input type="number" class="form-input" [(ngModel)]="form.duracionDias" min="1" />
      </div>
      @if (editando()) {
        <div class="form-row">
          <div class="form-group">
            <label>Inicio Real</label>
            <input type="date" class="form-input" [(ngModel)]="formEdit.fechaInicioReal" />
          </div>
          <div class="form-group">
            <label>Fin Real</label>
            <input type="date" class="form-input" [(ngModel)]="formEdit.fechaFinReal" />
          </div>
        </div>
        <div class="form-group">
          <label>% Avance</label>
          <input type="range" class="form-range" [(ngModel)]="formEdit.avance" min="0" max="100" step="5" />
          <span class="range-label">{{ formEdit.avance }}%</span>
        </div>
      }
    </div>
    <div class="panel-footer">
      <button class="btn btn-ghost" (click)="cerrar()">Cancelar</button>
      <button class="btn btn-primary" (click)="guardar()" [disabled]="guardando()">
        @if (guardando()) { <i class="pi pi-spin pi-spinner"></i> } Guardar
      </button>
    </div>
  </div>
}
  `,
  styles: [`
.tab-section { display:flex; flex-direction:column; gap:1.25rem; }
.tab-section-header { display:flex; align-items:flex-start; justify-content:space-between; gap:1rem; }
.section-title { margin:0; font-size:1rem; font-weight:700; color:var(--text); }
.section-sub { margin:.25rem 0 0; font-size:.8rem; color:var(--text-muted); }
.header-actions { display:flex; align-items:center; gap:.75rem; }
.loading-row { padding:2rem; text-align:center; color:var(--text-muted); display:flex; align-items:center; justify-content:center; gap:.5rem; }
.empty-state { text-align:center; padding:3rem; color:var(--text-muted); display:flex; flex-direction:column; align-items:center; gap:1rem; }
.empty-state i { font-size:2.5rem; opacity:.4; }
.table-wrap { background:var(--surface); border:1px solid var(--border); border-radius:10px; overflow:hidden; }
.data-table { width:100%; border-collapse:collapse; }
.data-table th { padding:.6rem 1rem; font-size:.78rem; font-weight:600; color:var(--text-muted); text-align:left; background:var(--surface2); border-bottom:1px solid var(--border); }
.data-table td { padding:.65rem 1rem; font-size:.86rem; color:var(--text); border-bottom:1px solid var(--border); vertical-align:middle; }
.data-table tr:last-child td { border-bottom:none; }
.data-table tr:hover td { background:var(--surface2); }
.cell-nombre { font-weight:500; }
.cell-sub { font-size:.76rem; color:var(--text-muted); margin-top:.15rem; display:flex; align-items:center; gap:.25rem; }
.estado-select { border:1px solid var(--border); border-radius:6px; padding:3px 8px; font-size:.78rem; font-weight:600; background:transparent; cursor:pointer; }
.estado-green  { color:#4ade80; border-color:rgba(34,197,94,.3); }
.estado-blue   { color:#60a5fa; border-color:rgba(59,130,246,.3); }
.estado-gray   { color:#94a3b8; border-color:rgba(148,163,184,.3); }
.estado-yellow { color:#fbbf24; border-color:rgba(250,204,21,.3); }
.estado-red    { color:#f87171; border-color:rgba(239,68,68,.3); }
.badge { padding:2px 8px; border-radius:12px; font-size:.72rem; font-weight:600; }
.prio-red    { background:rgba(239,68,68,.12); color:#f87171; }
.prio-yellow { background:rgba(250,204,21,.12); color:#fbbf24; }
.prio-blue   { background:rgba(59,130,246,.12); color:#60a5fa; }
.prio-gray   { background:rgba(148,163,184,.12); color:#94a3b8; }
.avance-cell { display:flex; align-items:center; gap:.5rem; min-width:100px; }
.avance-bar-sm { flex:1; height:4px; background:var(--border); border-radius:2px; overflow:hidden; }
.avance-fill-sm { height:100%; background:var(--primary); border-radius:2px; }
.avance-num { font-size:.76rem; color:var(--text-muted); min-width:28px; text-align:right; }
.fechas-cell { display:flex; align-items:center; gap:.3rem; font-size:.8rem; color:var(--text-muted); }
.date-sep { color:var(--border2); }
.row-actions { display:flex; gap:.25rem; }
.icon-btn { width:28px; height:28px; border:1px solid var(--border); border-radius:6px; background:transparent; color:var(--text-muted); cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:.75rem; transition:all .2s; }
.icon-btn:hover { background:var(--primary-bg); color:var(--primary); border-color:var(--primary); }
.icon-btn.danger:hover { background:rgba(239,68,68,.1); color:#f87171; border-color:#f87171; }
.side-panel-overlay { position:fixed; inset:0; background:rgba(0,0,0,.4); z-index:40; }
.side-panel { position:fixed; right:0; top:0; bottom:0; width:440px; background:var(--surface); border-left:1px solid var(--border); z-index:50; display:flex; flex-direction:column; box-shadow:-8px 0 24px rgba(0,0,0,.3); }
.panel-header { display:flex; align-items:center; justify-content:space-between; padding:1.25rem 1.5rem; border-bottom:1px solid var(--border); }
.panel-header h3 { margin:0; font-size:1rem; font-weight:700; color:var(--text); }
.panel-close { background:transparent; border:none; color:var(--text-muted); cursor:pointer; font-size:1rem; padding:.25rem; }
.panel-body { flex:1; overflow-y:auto; padding:1.5rem; display:flex; flex-direction:column; gap:1rem; }
.panel-footer { padding:1rem 1.5rem; border-top:1px solid var(--border); display:flex; justify-content:flex-end; gap:.75rem; }
.form-group { display:flex; flex-direction:column; gap:.4rem; }
.form-group label { font-size:.82rem; font-weight:500; color:var(--text-soft); }
.form-input { background:var(--surface2); border:1px solid var(--border); border-radius:8px; padding:.55rem .8rem; color:var(--text); font-size:.9rem; width:100%; outline:none; }
.form-input:focus { border-color:var(--primary); }
.form-row { display:grid; grid-template-columns:1fr 1fr; gap:.75rem; }
.form-select { width:100%; }
.form-range { width:100%; accent-color:var(--primary); }
.range-label { font-size:.82rem; color:var(--text-muted); text-align:center; }
.filter-select-sm { min-width:160px; }
.btn { padding:.5rem 1.25rem; border-radius:8px; font-size:.88rem; font-weight:500; cursor:pointer; display:flex; align-items:center; gap:.4rem; border:none; }
.btn-primary { background:var(--primary); color:#fff; }
.btn-primary:disabled { opacity:.6; cursor:not-allowed; }
.btn-ghost { background:transparent; border:1px solid var(--border); color:var(--text-soft); }
  `]
})
export class TareasComponent implements OnInit {
  private readonly route   = inject(ActivatedRoute);
  private readonly service = inject(ProyectoService);
  private readonly toast   = inject(MessageService);
  private readonly confirm = inject(ConfirmationService);

  readonly tareas         = signal<TareaListDto[]>([]);
  readonly tareasFiltradas = signal<TareaListDto[]>([]);
  readonly cuadrillas     = signal<CuadrillaDto[]>([]);
  readonly cargando       = signal(true);
  readonly panelVisible   = signal(false);
  readonly editando       = signal(false);
  readonly guardando      = signal(false);

  filtroEstado: EstadoTarea | null = null;
  proyectoId = 0;

  readonly PRIORIDAD_LABELS = PRIORIDAD_LABELS;
  readonly ESTADO_TAREA_LABELS = ESTADO_TAREA_LABELS;

  readonly estadoOpts = enumNums(EstadoTarea).map(v => ({ label: ESTADO_TAREA_LABELS[v as EstadoTarea], value: v }));
  readonly estadoFiltroOpts = this.estadoOpts;
  readonly prioridadOpts = enumNums(PrioridadTarea).map(v => ({ label: PRIORIDAD_LABELS[v as PrioridadProyecto], value: v }));
  cuadrillaOpts: { label: string; value: number }[] = [];

  form: Partial<CrearTareaRequest> = { prioridad: PrioridadTarea.Media };
  formEdit: { fechaInicioReal?: string; fechaFinReal?: string; avance: number } = { avance: 0 };
  tareaEditar: TareaListDto | null = null;

  ngOnInit(): void {
    this.proyectoId = Number(this.route.parent!.snapshot.paramMap.get('id'));
    this.cargar();
    this.service.getCuadrillas(this.proyectoId).subscribe(c => {
      this.cuadrillas.set(c);
      this.cuadrillaOpts = c.map(q => ({ label: q.nombre, value: q.id }));
    });
  }

  cargar(): void {
    this.cargando.set(true);
    this.service.getTareas(this.proyectoId).subscribe({
      next: t => { this.tareas.set(t); this.aplicarFiltro(); this.cargando.set(false); },
      error: () => this.cargando.set(false)
    });
  }

  aplicarFiltro(): void {
    this.tareasFiltradas.set(
      this.filtroEstado ? this.tareas().filter(t => t.estado === this.filtroEstado) : [...this.tareas()]
    );
  }

  abrirCrear(): void {
    this.editando.set(false);
    this.form = { proyectoId: this.proyectoId, prioridad: PrioridadTarea.Media };
    this.formEdit = { avance: 0 };
    this.panelVisible.set(true);
  }

  editar(t: TareaListDto): void {
    this.editando.set(true);
    this.tareaEditar = t;
    this.form = { proyectoId: this.proyectoId, nombre: t.nombre, prioridad: t.prioridad, cuadrillaId: t.cuadrillaId, fechaInicioPlan: t.fechaInicioPlan, fechaFinPlan: t.fechaFinPlan };
    this.formEdit = { avance: t.porcentajeAvance };
    this.panelVisible.set(true);
  }

  guardar(): void {
    if (!this.form.nombre) { this.toast.add({ severity: 'warn', summary: 'Requerido', detail: 'El nombre es obligatorio' }); return; }
    this.guardando.set(true);
    if (this.editando() && this.tareaEditar) {
      const req = { ...this.form, id: this.tareaEditar.id } as ActualizarTareaRequest;
      this.service.actualizarTarea(this.proyectoId, this.tareaEditar.id, req).subscribe({
        next: () => {
          if (this.formEdit.avance !== this.tareaEditar!.porcentajeAvance) {
            this.service.actualizarAvanceTarea(this.proyectoId, this.tareaEditar!.id, this.formEdit.avance).subscribe();
          }
          this.toast.add({ severity: 'success', summary: 'OK', detail: 'Tarea actualizada' });
          this.cerrar(); this.cargar(); this.guardando.set(false);
        },
        error: () => { this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar' }); this.guardando.set(false); }
      });
    } else {
      this.service.crearTarea(this.proyectoId, this.form as CrearTareaRequest).subscribe({
        next: () => { this.toast.add({ severity: 'success', summary: 'OK', detail: 'Tarea creada' }); this.cerrar(); this.cargar(); this.guardando.set(false); },
        error: () => { this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear' }); this.guardando.set(false); }
      });
    }
  }

  cambiarEstado(tarea: TareaListDto, estado: EstadoTarea): void {
    this.service.cambiarEstadoTarea(this.proyectoId, tarea.id, estado).subscribe({
      next: () => { tarea.estado = estado; this.tareas.update(t => [...t]); },
      error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cambiar estado' })
    });
  }

  confirmarEliminar(t: TareaListDto): void {
    this.confirm.confirm({
      message: `¿Eliminar la tarea "${t.nombre}"?`, header: 'Confirmar', icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar', rejectLabel: 'Cancelar',
      accept: () => this.service.eliminarTarea(this.proyectoId, t.id).subscribe({
        next: () => { this.toast.add({ severity: 'success', summary: 'OK', detail: 'Tarea eliminada' }); this.cargar(); },
        error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar' })
      })
    });
  }

  cerrar(): void { this.panelVisible.set(false); }

  getEstadoClass(e: EstadoTarea): string {
    const m: Record<EstadoTarea, string> = { [EstadoTarea.Pendiente]: 'gray', [EstadoTarea.EnCurso]: 'blue', [EstadoTarea.Completada]: 'green', [EstadoTarea.Bloqueada]: 'yellow', [EstadoTarea.Cancelada]: 'red' };
    return m[e] ?? 'gray';
  }
  getPrioridadClass(p: PrioridadTarea): string {
    const m: Record<PrioridadTarea, string> = { [PrioridadTarea.Baja]: 'gray', [PrioridadTarea.Media]: 'blue', [PrioridadTarea.Alta]: 'yellow', [PrioridadTarea.Critica]: 'red' };
    return m[p] ?? 'gray';
  }
}