import { Component, inject, signal, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProyectoService } from '../../../services/proyecto.service';
import {
  ProyectoFaseDto, CrearFaseRequest, ActualizarFaseRequest,
  EstadoFase, ESTADO_FASE_LABELS, enumNums
} from '../../../models/proyecto.models';

@Component({
  selector: 'app-fases',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, ToastModule, TooltipModule, SelectModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  template: `
<p-toast position="top-right" />
<p-confirmDialog />

<div class="tab-section">
  <div class="tab-section-header">
    <div>
      <h2 class="section-title">Fases del Proyecto</h2>
      <p class="section-sub">{{ fases().length }} fases registradas</p>
    </div>
    <p-button label="Nueva fase" icon="pi pi-plus" size="small" (onClick)="abrirCrear()" />
  </div>

  @if (cargando()) {
    <div class="loading-row"><i class="pi pi-spin pi-spinner"></i> Cargando...</div>
  } @else if (fases().length === 0) {
    <div class="empty-state">
      <i class="pi pi-sitemap"></i>
      <p>No hay fases definidas. Crea la primera fase del proyecto.</p>
    </div>
  } @else {
    <div class="fases-grid">
      @for (fase of fases(); track fase.id) {
        <div class="fase-card">
          <div class="fase-card-header">
            <div class="fase-info">
              <span class="fase-codigo">{{ fase.codigo }}</span>
              <span class="badge estado-fase-{{ getEstadoClass(fase.estado) }}">{{ ESTADO_FASE_LABELS[fase.estado] }}</span>
            </div>
            <div class="fase-actions">
              <button class="icon-btn" (click)="editar(fase)" pTooltip="Editar"><i class="pi pi-pencil"></i></button>
              <button class="icon-btn danger" (click)="confirmarEliminar(fase)" pTooltip="Eliminar"><i class="pi pi-trash"></i></button>
            </div>
          </div>
          <h3 class="fase-nombre">{{ fase.nombre }}</h3>
          @if (fase.descripcion) { <p class="fase-desc">{{ fase.descripcion }}</p> }
          <div class="fase-avance">
            <div class="avance-bar"><div class="avance-fill" [style.width.%]="fase.porcentajeAvance"></div></div>
            <span class="avance-pct">{{ fase.porcentajeAvance }}%</span>
          </div>
          <div class="fase-fechas">
            <span><i class="pi pi-calendar-plus"></i> {{ fase.fechaInicioPlan | date:'dd/MM/yy' }}</span>
            <span><i class="pi pi-calendar-minus"></i> {{ fase.fechaFinPlan | date:'dd/MM/yy' }}</span>
          </div>
        </div>
      }
    </div>
  }
</div>

<!-- Panel lateral -->
@if (panelVisible()) {
  <div class="side-panel-overlay" (click)="cerrar()"></div>
  <div class="side-panel">
    <div class="panel-header">
      <h3>{{ editando() ? 'Editar Fase' : 'Nueva Fase' }}</h3>
      <button class="panel-close" (click)="cerrar()"><i class="pi pi-times"></i></button>
    </div>
    <div class="panel-body">
      <div class="form-group">
        <label>Código *</label>
        <input type="text" class="form-input" [(ngModel)]="form.codigo" placeholder="F-001" />
      </div>
      <div class="form-group">
        <label>Nombre *</label>
        <input type="text" class="form-input" [(ngModel)]="form.nombre" placeholder="Nombre de la fase" />
      </div>
      <div class="form-group">
        <label>Descripción</label>
        <textarea class="form-input" [(ngModel)]="form.descripcion" rows="2" placeholder="Descripción opcional"></textarea>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Orden</label>
          <input type="number" class="form-input" [(ngModel)]="form.orden" min="1" />
        </div>
        @if (editando()) {
          <div class="form-group">
            <label>Estado</label>
            <p-select [options]="estadoOpts" [(ngModel)]="formEdit.estado" styleClass="form-select" />
          </div>
        }
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Fecha Inicio Plan</label>
          <input type="date" class="form-input" [(ngModel)]="form.fechaInicioPlan" />
        </div>
        <div class="form-group">
          <label>Fecha Fin Plan</label>
          <input type="date" class="form-input" [(ngModel)]="form.fechaFinPlan" />
        </div>
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
          <input type="number" class="form-input" [(ngModel)]="formEdit.porcentajeAvance" min="0" max="100" />
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
.loading-row { padding:2rem; text-align:center; color:var(--text-muted); display:flex; align-items:center; justify-content:center; gap:.5rem; }
.empty-state { text-align:center; padding:3rem; color:var(--text-muted); display:flex; flex-direction:column; align-items:center; gap:1rem; }
.empty-state i { font-size:2.5rem; opacity:.4; }
.fases-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:1rem; }
.fase-card { background:var(--surface); border:1px solid var(--border); border-radius:10px; padding:1rem; display:flex; flex-direction:column; gap:.6rem; }
.fase-card-header { display:flex; align-items:center; justify-content:space-between; }
.fase-info { display:flex; align-items:center; gap:.5rem; }
.fase-codigo { font-family:'Courier New',monospace; font-size:.75rem; background:var(--surface2); border:1px solid var(--border); border-radius:5px; padding:2px 7px; color:var(--text-muted); }
.fase-actions { display:flex; gap:.25rem; }
.icon-btn { width:28px; height:28px; border:1px solid var(--border); border-radius:6px; background:transparent; color:var(--text-muted); cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:.75rem; transition:all .2s; }
.icon-btn:hover { background:var(--primary-bg); color:var(--primary); border-color:var(--primary); }
.icon-btn.danger:hover { background:rgba(239,68,68,.1); color:#f87171; border-color:#f87171; }
.fase-nombre { margin:0; font-size:.95rem; font-weight:600; color:var(--text); }
.fase-desc { margin:0; font-size:.8rem; color:var(--text-muted); }
.fase-avance { display:flex; align-items:center; gap:.5rem; }
.avance-bar { flex:1; height:4px; background:var(--border); border-radius:2px; overflow:hidden; }
.avance-fill { height:100%; background:var(--primary); border-radius:2px; }
.avance-pct { font-size:.78rem; color:var(--text-muted); min-width:28px; text-align:right; }
.fase-fechas { display:flex; gap:1rem; }
.fase-fechas span { display:flex; align-items:center; gap:.3rem; font-size:.78rem; color:var(--text-muted); }
.fase-fechas i { font-size:.72rem; }
.badge { padding:2px 8px; border-radius:12px; font-size:.72rem; font-weight:600; }
.estado-fase-green  { background:rgba(34,197,94,.12); color:#4ade80; }
.estado-fase-blue   { background:rgba(59,130,246,.12); color:#60a5fa; }
.estado-fase-yellow { background:rgba(250,204,21,.12); color:#fbbf24; }
.estado-fase-gray   { background:rgba(148,163,184,.12); color:#94a3b8; }
.side-panel-overlay { position:fixed; inset:0; background:rgba(0,0,0,.4); z-index:40; }
.side-panel { position:fixed; right:0; top:0; bottom:0; width:420px; background:var(--surface); border-left:1px solid var(--border); z-index:50; display:flex; flex-direction:column; box-shadow:-8px 0 24px rgba(0,0,0,.3); }
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
.btn { padding:.5rem 1.25rem; border-radius:8px; font-size:.88rem; font-weight:500; cursor:pointer; display:flex; align-items:center; gap:.4rem; border:none; }
.btn-primary { background:var(--primary); color:#fff; }
.btn-primary:disabled { opacity:.6; cursor:not-allowed; }
.btn-ghost { background:transparent; border:1px solid var(--border); color:var(--text-soft); }
  `]
})
export class FasesComponent implements OnInit {
  private readonly route   = inject(ActivatedRoute);
  private readonly service = inject(ProyectoService);
  private readonly toast   = inject(MessageService);
  private readonly confirm = inject(ConfirmationService);

  readonly fases       = signal<ProyectoFaseDto[]>([]);
  readonly cargando    = signal(true);
  readonly panelVisible = signal(false);
  readonly editando    = signal(false);
  readonly guardando   = signal(false);
  proyectoId = 0;

  readonly ESTADO_FASE_LABELS = ESTADO_FASE_LABELS;

  readonly estadoOpts = enumNums(EstadoFase).map(v => ({ label: ESTADO_FASE_LABELS[v as EstadoFase], value: v }));

  form: Partial<CrearFaseRequest> = { orden: 1 };
  formEdit: Partial<ActualizarFaseRequest> = {};
  faseEditar: ProyectoFaseDto | null = null;

  ngOnInit(): void {
    this.proyectoId = Number(this.route.parent!.snapshot.paramMap.get('id'));
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.service.getFases(this.proyectoId).subscribe({
      next: f => { this.fases.set(f); this.cargando.set(false); },
      error: () => this.cargando.set(false)
    });
  }

  abrirCrear(): void {
    this.editando.set(false);
    this.form = { proyectoId: this.proyectoId, orden: this.fases().length + 1 };
    this.formEdit = {};
    this.panelVisible.set(true);
  }

  editar(fase: ProyectoFaseDto): void {
    this.editando.set(true);
    this.faseEditar = fase;
    this.form = { proyectoId: this.proyectoId, codigo: fase.codigo, nombre: fase.nombre, descripcion: fase.descripcion, orden: fase.orden, fechaInicioPlan: fase.fechaInicioPlan, fechaFinPlan: fase.fechaFinPlan };
    this.formEdit = { id: fase.id, estado: fase.estado, porcentajeAvance: fase.porcentajeAvance, fechaInicioReal: fase.fechaInicioReal, fechaFinReal: fase.fechaFinReal };
    this.panelVisible.set(true);
  }

  guardar(): void {
    if (!this.form.codigo || !this.form.nombre) { this.toast.add({ severity: 'warn', summary: 'Requerido', detail: 'Código y nombre son obligatorios' }); return; }
    this.guardando.set(true);
    if (this.editando() && this.faseEditar) {
      const req: ActualizarFaseRequest = { ...this.form as CrearFaseRequest, ...this.formEdit as any };
      this.service.actualizarFase(this.proyectoId, this.faseEditar.id, req).subscribe({
        next: () => { this.toast.add({ severity: 'success', summary: 'OK', detail: 'Fase actualizada' }); this.cerrar(); this.cargar(); this.guardando.set(false); },
        error: () => { this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar' }); this.guardando.set(false); }
      });
    } else {
      this.service.crearFase(this.proyectoId, this.form as CrearFaseRequest).subscribe({
        next: () => { this.toast.add({ severity: 'success', summary: 'OK', detail: 'Fase creada' }); this.cerrar(); this.cargar(); this.guardando.set(false); },
        error: () => { this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear' }); this.guardando.set(false); }
      });
    }
  }

  confirmarEliminar(fase: ProyectoFaseDto): void {
    this.confirm.confirm({
      message: `¿Eliminar la fase "${fase.nombre}"?`, header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle', acceptLabel: 'Eliminar', rejectLabel: 'Cancelar',
      accept: () => this.service.eliminarFase(this.proyectoId, fase.id).subscribe({
        next: () => { this.toast.add({ severity: 'success', summary: 'OK', detail: 'Fase eliminada' }); this.cargar(); },
        error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar' })
      })
    });
  }

  cerrar(): void { this.panelVisible.set(false); }

  getEstadoClass(estado: EstadoFase): string {
    const m: Record<EstadoFase, string> = { [EstadoFase.Pendiente]: 'gray', [EstadoFase.EnCurso]: 'blue', [EstadoFase.Completada]: 'green', [EstadoFase.EnPausa]: 'yellow' };
    return m[estado] ?? 'gray';
  }
}
