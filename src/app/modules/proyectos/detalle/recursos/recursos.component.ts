import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProyectoService } from  '../../../../core/services/proyecto.service';
import {
  RecursoProyectoDto,
  CrearRecursoRequest,
  ActualizarHorasRecursoRequest,
} from  '../../../../shared/models/proyecto.models';

const ROL_LABELS: Record<number, string> = {
  1: 'Líder', 2: 'Gerente', 3: 'Técnico', 4: 'Supervisor', 5: 'Apoyo',
};

@Component({
  selector: 'app-recursos',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, ToastModule,
    TooltipModule, ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
<p-toast position="top-right" />
<p-confirmDialog />

<div class="tab-section">

  <!-- Header -->
  <div class="tab-section-header">
    <div>
      <h2 class="section-title">Recursos del Proyecto</h2>
      <p class="section-sub">{{ recursos().length }} recursos asignados · {{ totalHorasPlan() | number:'1.0-0' }} h plan</p>
    </div>
    <p-button label="Asignar recurso" icon="pi pi-user-plus" size="small" (onClick)="abrirAsignar()" />
  </div>

  <!-- Loading -->
  @if (cargando()) {
    <div class="loading-row"><i class="pi pi-spin pi-spinner"></i> Cargando recursos...</div>
  }

  <!-- Empty -->
  @else if (recursos().length === 0) {
    <div class="empty-state">
      <i class="pi pi-users"></i>
      <p>Sin recursos asignados al proyecto.</p>
      <p-button label="Asignar primer recurso" icon="pi pi-user-plus"
                severity="secondary" [outlined]="true" size="small" (onClick)="abrirAsignar()" />
    </div>
  }

  <!-- Tabla de recursos -->
  @else {
    <!-- Resumen rápido -->
    <div class="resumen-row">
      <div class="resumen-card">
        <span class="res-label">Total recursos</span>
        <span class="res-valor">{{ recursos().length }}</span>
      </div>
      <div class="resumen-card">
        <span class="res-label">Horas planificadas</span>
        <span class="res-valor">{{ totalHorasPlan() | number:'1.0-0' }} h</span>
      </div>
      <div class="resumen-card">
        <span class="res-label">Horas reales</span>
        <span class="res-valor">{{ totalHorasReal() | number:'1.0-0' }} h</span>
      </div>
      <div class="resumen-card">
        <span class="res-label">Costo estimado</span>
        <span class="res-valor">{{ formatMoney(totalCosto()) }}</span>
      </div>
    </div>

    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Empleado</th>
            <th>Rol</th>
            <th>Tarea</th>
            <th>Período</th>
            <th>Horas Plan</th>
            <th>Horas Real</th>
            <th>Costo/h</th>
            <th>Observaciones</th>
            <th class="th-actions">Acciones</th>
          </tr>
        </thead>
        <tbody>
          @for (r of recursos(); track r.id) {
            <tr [class.row-editando]="recursoTimesheet?.id === r.id">
              <!-- Empleado -->
              <td>
                <div class="empleado-cell">
                  <div class="emp-avatar">{{ (r.empleadoNombre ?? 'U').charAt(0).toUpperCase() }}</div>
                  <div class="emp-info">
                    <span class="emp-nombre">{{ r.empleadoNombre ?? 'Empleado #' + r.empleadoId }}</span>
                  </div>
                </div>
              </td>
              <!-- Rol -->
              <td>
                <span class="rol-badge rol-{{ r.rolProyecto }}">
                  {{ ROL_LABELS[r.rolProyecto] ?? 'Técnico' }}
                </span>
              </td>
              <!-- Tarea -->
              <td>
                <span class="sub-text">{{ r.tareaNombre ?? '—' }}</span>
              </td>
              <!-- Período -->
              <td>
                <div class="periodo-cell">
                  @if (r.fechaInicio) {
                    <span class="date-chip"><i class="pi pi-calendar"></i> {{ r.fechaInicio | date:'dd/MM/yy' }}</span>
                  }
                  @if (r.fechaFin) {
                    <span class="date-chip end"><i class="pi pi-flag"></i> {{ r.fechaFin | date:'dd/MM/yy' }}</span>
                  }
                </div>
              </td>
              <!-- Horas Plan -->
              <td><span class="horas-chip plan">{{ r.horasPlan | number:'1.0-1' }} h</span></td>
              <!-- Horas Real -->
              <td>
                <span class="horas-chip real" [class.over]="r.horasReal > r.horasPlan">
                  {{ r.horasReal | number:'1.0-1' }} h
                </span>
              </td>
              <!-- Costo/h -->
              <td><span class="sub-text">{{ formatMoney(r.costoHora) }}/h</span></td>
              <!-- Observaciones -->
              <td><span class="obs-text" [title]="r.observaciones ?? ''">{{ r.observaciones ? (r.observaciones.length > 30 ? r.observaciones.slice(0,30) + '…' : r.observaciones) : '—' }}</span></td>
              <!-- Acciones -->
              <td class="td-actions">
                <div class="actions-wrap">
                  <button class="icon-btn" (click)="abrirTimesheet(r)"
                          pTooltip="Registrar horas reales" tooltipPosition="top">
                    <i class="pi pi-clock"></i>
                  </button>
                  <button class="icon-btn danger" (click)="confirmarEliminar(r)"
                          pTooltip="Liberar recurso" tooltipPosition="top">
                    <i class="pi pi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  }

</div>

<!-- Panel — Asignar recurso -->
@if (panelAsignar()) {
  <div class="side-panel-overlay" (click)="cerrarPaneles()"></div>
  <div class="side-panel">
    <div class="panel-header">
      <h3>Asignar Recurso</h3>
      <button class="panel-close" (click)="cerrarPaneles()"><i class="pi pi-times"></i></button>
    </div>
    <div class="panel-body">

      <div class="form-group">
        <label>ID de Empleado *</label>
        <input type="number" class="form-input" [(ngModel)]="formAsignar.empleadoId"
               placeholder="ID del empleado" min="1" />
        <span class="form-hint">Ingresa el ID del empleado a asignar.</span>
      </div>

      <div class="form-group">
        <label>Rol en el Proyecto</label>
        <select class="form-input form-select-native" [(ngModel)]="formAsignar.rolProyecto">
          @for (rol of rolesOpts; track rol.value) {
            <option [value]="rol.value">{{ rol.label }}</option>
          }
        </select>
      </div>

      <div class="form-group">
        <label>ID de Tarea (opcional)</label>
        <input type="number" class="form-input" [(ngModel)]="formAsignar.tareaId"
               placeholder="Dejar vacío para asignar al proyecto" />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Fecha Inicio</label>
          <input type="date" class="form-input" [(ngModel)]="formAsignar.fechaInicio" />
        </div>
        <div class="form-group">
          <label>Fecha Fin</label>
          <input type="date" class="form-input" [(ngModel)]="formAsignar.fechaFin" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Horas Planificadas</label>
          <input type="number" class="form-input" [(ngModel)]="formAsignar.horasPlan"
                 min="0" step="0.5" />
        </div>
        <div class="form-group">
          <label>Costo por Hora ($)</label>
          <input type="number" class="form-input" [(ngModel)]="formAsignar.costoHora"
                 min="0" step="0.01" />
        </div>
      </div>

      <div class="form-group">
        <label>Observaciones</label>
        <textarea class="form-input" [(ngModel)]="formAsignar.observaciones" rows="2"></textarea>
      </div>

      @if (errorAsignar()) {
        <div class="form-error"><i class="pi pi-exclamation-circle"></i> {{ errorAsignar() }}</div>
      }

    </div>
    <div class="panel-footer">
      <button class="btn btn-ghost" (click)="cerrarPaneles()">Cancelar</button>
      <button class="btn btn-primary" (click)="guardarAsignacion()" [disabled]="guardandoAsignar()">
        @if (guardandoAsignar()) { <i class="pi pi-spin pi-spinner"></i> }
        Asignar
      </button>
    </div>
  </div>
}

<!-- Panel — Timesheet (registrar horas reales) -->
@if (panelTimesheet()) {
  <div class="side-panel-overlay" (click)="cerrarPaneles()"></div>
  <div class="side-panel side-panel-sm">
    <div class="panel-header">
      <h3>Registrar Horas Reales</h3>
      <button class="panel-close" (click)="cerrarPaneles()"><i class="pi pi-times"></i></button>
    </div>
    <div class="panel-body">

      @if (recursoTimesheet) {
        <div class="recurso-info-box">
          <div class="emp-avatar lg">{{ (recursoTimesheet.empleadoNombre ?? 'U').charAt(0).toUpperCase() }}</div>
          <div>
            <div class="emp-nombre">{{ recursoTimesheet.empleadoNombre ?? 'Empleado #' + recursoTimesheet.empleadoId }}</div>
            <div class="sub-text">Plan: {{ recursoTimesheet.horasPlan | number:'1.0-1' }} h · Real actual: {{ recursoTimesheet.horasReal | number:'1.0-1' }} h</div>
          </div>
        </div>
      }

      <div class="form-group">
        <label>Horas Reales trabajadas *</label>
        <input type="number" class="form-input" [(ngModel)]="formTimesheet.horasReal"
               min="0" step="0.5" placeholder="0.0" />
      </div>

      <div class="form-group">
        <label>Observaciones</label>
        <textarea class="form-input" [(ngModel)]="formTimesheet.observaciones" rows="3"
                  placeholder="Novedades o comentarios del trabajo realizado"></textarea>
      </div>

      @if (errorTimesheet()) {
        <div class="form-error"><i class="pi pi-exclamation-circle"></i> {{ errorTimesheet() }}</div>
      }

    </div>
    <div class="panel-footer">
      <button class="btn btn-ghost" (click)="cerrarPaneles()">Cancelar</button>
      <button class="btn btn-primary" (click)="guardarTimesheet()" [disabled]="guardandoTimesheet()">
        @if (guardandoTimesheet()) { <i class="pi pi-spin pi-spinner"></i> }
        Guardar
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
.loading-row { padding:2rem; text-align:center; color:var(--text-muted); display:flex; align-items:center; justify-content:center; gap:.5rem; }
.empty-state { text-align:center; padding:3rem; color:var(--text-muted); display:flex; flex-direction:column; align-items:center; gap:1rem; }
.empty-state i { font-size:2.5rem; opacity:.4; }

/* Resumen */
.resumen-row { display:grid; grid-template-columns:repeat(4,1fr); gap:.75rem; }
.resumen-card { background:var(--surface); border:1px solid var(--border); border-radius:10px; padding:.85rem 1rem; display:flex; flex-direction:column; gap:.2rem; }
.res-label { font-size:.74rem; color:var(--text-muted); }
.res-valor { font-size:1.2rem; font-weight:700; color:var(--text); }

/* Tabla */
.table-wrap { overflow-x:auto; border:1px solid var(--border); border-radius:10px; }
.data-table { width:100%; border-collapse:collapse; }
.data-table th { background:var(--surface2); padding:.6rem .85rem; text-align:left; font-size:.76rem; font-weight:600; color:var(--text-muted); white-space:nowrap; border-bottom:1px solid var(--border); }
.data-table td { padding:.65rem .85rem; border-bottom:1px solid var(--border); vertical-align:middle; }
.data-table tr:last-child td { border-bottom:none; }
.data-table tr:hover td { background:var(--surface2); }
.data-table tr.row-editando td { background:rgba(var(--primary-rgb),.05); }
.th-actions { width:80px; text-align:center; }
.td-actions { text-align:center; }

/* Celdas */
.empleado-cell { display:flex; align-items:center; gap:.6rem; }
.emp-avatar { width:30px; height:30px; border-radius:50%; background:var(--primary-bg); color:var(--primary); display:flex; align-items:center; justify-content:center; font-size:.8rem; font-weight:700; flex-shrink:0; }
.emp-avatar.lg { width:40px; height:40px; font-size:1rem; }
.emp-nombre { font-size:.86rem; font-weight:500; color:var(--text); }
.sub-text { font-size:.8rem; color:var(--text-muted); }

.rol-badge { padding:2px 9px; border-radius:12px; font-size:.72rem; font-weight:600; }
.rol-badge.rol-1 { background:rgba(168,85,247,.12); color:#c084fc; }
.rol-badge.rol-2 { background:rgba(59,130,246,.12); color:#60a5fa; }
.rol-badge.rol-3 { background:rgba(20,184,166,.12); color:#2dd4bf; }
.rol-badge.rol-4 { background:rgba(249,115,22,.12); color:#fb923c; }
.rol-badge.rol-5 { background:rgba(148,163,184,.12); color:#94a3b8; }

.periodo-cell { display:flex; flex-direction:column; gap:.2rem; }
.date-chip { display:flex; align-items:center; gap:.25rem; font-size:.74rem; color:var(--text-muted); }
.date-chip i { font-size:.7rem; }
.date-chip.end { color:var(--text-muted); opacity:.75; }

.horas-chip { padding:2px 9px; border-radius:12px; font-size:.78rem; font-weight:600; }
.horas-chip.plan { background:rgba(59,130,246,.1); color:#60a5fa; }
.horas-chip.real { background:rgba(34,197,94,.1); color:#4ade80; }
.horas-chip.real.over { background:rgba(239,68,68,.1); color:#f87171; }
.obs-text { font-size:.78rem; color:var(--text-muted); }

.actions-wrap { display:flex; gap:.3rem; justify-content:center; }
.icon-btn { width:28px; height:28px; border:1px solid var(--border); border-radius:6px; background:transparent; color:var(--text-muted); cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:.75rem; transition:all .2s; }
.icon-btn:hover { background:var(--primary-bg); color:var(--primary); border-color:var(--primary); }
.icon-btn.danger:hover { background:rgba(239,68,68,.1); color:#f87171; border-color:#f87171; }

/* Panel */
.side-panel-overlay { position:fixed; inset:0; background:rgba(0,0,0,.4); z-index:40; }
.side-panel { position:fixed; right:0; top:0; bottom:0; width:440px; background:var(--surface); border-left:1px solid var(--border); z-index:50; display:flex; flex-direction:column; box-shadow:-8px 0 24px rgba(0,0,0,.3); }
.side-panel-sm { width:380px; }
.panel-header { display:flex; align-items:center; justify-content:space-between; padding:1.25rem 1.5rem; border-bottom:1px solid var(--border); }
.panel-header h3 { margin:0; font-size:1rem; font-weight:700; color:var(--text); }
.panel-close { background:transparent; border:none; color:var(--text-muted); cursor:pointer; font-size:1rem; padding:.25rem; }
.panel-body { flex:1; overflow-y:auto; padding:1.5rem; display:flex; flex-direction:column; gap:1rem; }
.panel-footer { padding:1rem 1.5rem; border-top:1px solid var(--border); display:flex; justify-content:flex-end; gap:.75rem; }
.form-group { display:flex; flex-direction:column; gap:.4rem; }
.form-group label { font-size:.82rem; font-weight:500; color:var(--text-soft); }
.form-input { background:var(--surface2); border:1px solid var(--border); border-radius:8px; padding:.55rem .8rem; color:var(--text); font-size:.9rem; width:100%; outline:none; }
.form-input:focus { border-color:var(--primary); }
.form-select-native { appearance:none; cursor:pointer; }
.form-hint { font-size:.75rem; color:var(--text-muted); }
.form-row { display:grid; grid-template-columns:1fr 1fr; gap:.75rem; }
.form-error { display:flex; align-items:center; gap:.5rem; color:#f87171; font-size:.83rem; background:rgba(239,68,68,.08); border:1px solid rgba(239,68,68,.2); border-radius:8px; padding:.6rem .9rem; }
.recurso-info-box { display:flex; align-items:center; gap:.85rem; background:var(--surface2); border:1px solid var(--border); border-radius:10px; padding:.85rem 1rem; }
.btn { padding:.5rem 1.25rem; border-radius:8px; font-size:.88rem; font-weight:500; cursor:pointer; display:flex; align-items:center; gap:.4rem; border:none; }
.btn-primary { background:var(--primary); color:#fff; }
.btn-primary:disabled { opacity:.6; cursor:not-allowed; }
.btn-ghost { background:transparent; border:1px solid var(--border); color:var(--text-soft); }

@media (max-width: 768px) {
  .resumen-row { grid-template-columns:1fr 1fr; }
}
  `]
})
export class RecursosComponent implements OnInit {
  private readonly route   = inject(ActivatedRoute);
  private readonly service = inject(ProyectoService);
  private readonly toast   = inject(MessageService);
  private readonly confirm = inject(ConfirmationService);

  readonly recursos         = signal<RecursoProyectoDto[]>([]);
  readonly cargando         = signal(true);
  readonly panelAsignar     = signal(false);
  readonly panelTimesheet   = signal(false);
  readonly guardandoAsignar = signal(false);
  readonly guardandoTimesheet = signal(false);
  readonly errorAsignar     = signal('');
  readonly errorTimesheet   = signal('');
  proyectoId = 0;

  readonly ROL_LABELS = ROL_LABELS;
  readonly rolesOpts = Object.entries(ROL_LABELS).map(([k, v]) => ({ value: Number(k), label: v }));

  recursoTimesheet: RecursoProyectoDto | null = null;

  formAsignar: CrearRecursoRequest = this.emptyFormAsignar();
  formTimesheet: ActualizarHorasRecursoRequest = { horasReal: 0, observaciones: '' };

  // Computed totales
  readonly totalHorasPlan = computed(() => this.recursos().reduce((a, r) => a + r.horasPlan, 0));
  readonly totalHorasReal = computed(() => this.recursos().reduce((a, r) => a + r.horasReal, 0));
  readonly totalCosto     = computed(() => this.recursos().reduce((a, r) => a + r.horasPlan * r.costoHora, 0));

  ngOnInit(): void {
    this.proyectoId = Number(this.route.parent!.snapshot.paramMap.get('id'));
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.service.getRecursos(this.proyectoId).subscribe({
      next: r => { this.recursos.set(r); this.cargando.set(false); },
      error: () => this.cargando.set(false)
    });
  }

  abrirAsignar(): void {
    this.formAsignar = this.emptyFormAsignar();
    this.errorAsignar.set('');
    this.panelAsignar.set(true);
  }

  guardarAsignacion(): void {
    if (!this.formAsignar.empleadoId) {
      this.errorAsignar.set('El ID del empleado es obligatorio'); return;
    }
    this.errorAsignar.set('');
    this.guardandoAsignar.set(true);

    this.service.crearRecurso(this.proyectoId, this.formAsignar).subscribe({
      next: () => {
        this.toast.add({ severity: 'success', summary: '¡Listo!', detail: 'Recurso asignado', life: 2500 });
        this.cerrarPaneles();
        this.cargar();
        this.guardandoAsignar.set(false);
      },
      error: (e) => {
        this.errorAsignar.set(e?.error?.message ?? 'No se pudo asignar el recurso');
        this.guardandoAsignar.set(false);
      }
    });
  }

  abrirTimesheet(r: RecursoProyectoDto): void {
    this.recursoTimesheet = r;
    this.formTimesheet = { horasReal: r.horasReal, observaciones: r.observaciones ?? '' };
    this.errorTimesheet.set('');
    this.panelTimesheet.set(true);
  }

  guardarTimesheet(): void {
    if (this.formTimesheet.horasReal < 0) {
      this.errorTimesheet.set('Las horas no pueden ser negativas'); return;
    }
    this.errorTimesheet.set('');
    this.guardandoTimesheet.set(true);

    this.service.actualizarHorasRecurso(this.proyectoId, this.recursoTimesheet!.id, this.formTimesheet).subscribe({
      next: () => {
        this.toast.add({ severity: 'success', summary: 'OK', detail: 'Horas actualizadas', life: 2500 });
        // Optimistic update
        this.recursos.update(arr => arr.map(r =>
          r.id === this.recursoTimesheet!.id
            ? { ...r, horasReal: this.formTimesheet.horasReal, observaciones: this.formTimesheet.observaciones }
            : r
        ));
        this.cerrarPaneles();
        this.guardandoTimesheet.set(false);
      },
      error: (e) => {
        this.errorTimesheet.set(e?.error?.message ?? 'No se pudo actualizar');
        this.guardandoTimesheet.set(false);
      }
    });
  }

  confirmarEliminar(r: RecursoProyectoDto): void {
    this.confirm.confirm({
      message: `¿Liberar a <strong>${r.empleadoNombre ?? 'este empleado'}</strong> del proyecto?`,
      header: 'Confirmar',
      icon: 'pi pi-user-minus',
      acceptLabel: 'Liberar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.service.eliminarRecurso(this.proyectoId, r.id).subscribe({
          next: () => {
            this.toast.add({ severity: 'success', summary: 'OK', detail: 'Recurso liberado', life: 2500 });
            this.recursos.update(arr => arr.filter(x => x.id !== r.id));
          },
          error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo liberar', life: 3000 })
        });
      }
    });
  }

  cerrarPaneles(): void {
    this.panelAsignar.set(false);
    this.panelTimesheet.set(false);
    this.recursoTimesheet = null;
  }

  formatMoney(v: number): string {
    return new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
  }

  private emptyFormAsignar(): CrearRecursoRequest {
    return {
      empleadoId: 0, rolProyecto: 3, tareaId: undefined,
      fechaInicio: new Date().toISOString().split('T')[0],
      fechaFin: undefined, horasPlan: 40, costoHora: 0, observaciones: ''
    };
  }
}
