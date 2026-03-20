import { Component, inject, signal, OnInit } from '@angular/core';
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
  ProyectoHitoDto, CrearHitoRequest, ActualizarHitoRequest,
  EstadoHito, enumNums
} from  '../../../../shared/models/proyecto.models';

const HITO_LABELS: Record<EstadoHito, string> = {
  [EstadoHito.Pendiente]: 'Pendiente', [EstadoHito.EnRiesgo]: 'En Riesgo',
  [EstadoHito.Logrado]: 'Logrado', [EstadoHito.Vencido]: 'Vencido',
};

@Component({
  selector: 'app-hitos',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, ToastModule, TooltipModule, SelectModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  template: `
<p-toast position="top-right" />
<p-confirmDialog />
<div class="tab-section">
  <div class="tab-section-header">
    <div><h2 class="section-title">Hitos del Proyecto</h2><p class="section-sub">{{ hitos().length }} hitos definidos</p></div>
    <p-button label="Nuevo hito" icon="pi pi-plus" size="small" (onClick)="abrirCrear()" />
  </div>
  @if (cargando()) { <div class="loading-row"><i class="pi pi-spin pi-spinner"></i> Cargando...</div> }
  @else if (hitos().length === 0) {
    <div class="empty-state"><i class="pi pi-flag"></i><p>Sin hitos definidos.</p></div>
  } @else {
    <div class="timeline">
      @for (h of hitos(); track h.id) {
        <div class="hito-row" [class.logrado]="h.estado === EstadoHito.Logrado" [class.vencido]="h.estado === EstadoHito.Vencido" [class.riesgo]="h.estado === EstadoHito.EnRiesgo">
          <div class="hito-dot"><i class="pi" [class.pi-check]="h.estado === EstadoHito.Logrado" [class.pi-times]="h.estado === EstadoHito.Vencido" [class.pi-exclamation-triangle]="h.estado === EstadoHito.EnRiesgo" [class.pi-circle]="h.estado === EstadoHito.Pendiente"></i></div>
          <div class="hito-body">
            <div class="hito-header">
              <span class="hito-nombre">{{ h.nombre }}</span>
              <span class="badge hito-{{ getEstadoClass(h.estado) }}">{{ HITO_LABELS[h.estado] }}</span>
            </div>
            <div class="hito-meta">
              <span><i class="pi pi-calendar"></i> Compromiso: {{ h.fechaCompromiso | date:'dd/MM/yyyy' }}</span>
              @if (h.responsableNombre) { <span><i class="pi pi-user"></i> {{ h.responsableNombre }}</span> }
              <span><i class="pi pi-percentage"></i> Peso: {{ h.porcentajePeso }}%</span>
            </div>
          </div>
          <div class="hito-actions">
            @if (h.estado !== EstadoHito.Logrado) {
              <button class="icon-btn success" (click)="marcarLogrado(h)" pTooltip="Marcar logrado"><i class="pi pi-check-circle"></i></button>
            }
            <button class="icon-btn" (click)="editar(h)" pTooltip="Editar"><i class="pi pi-pencil"></i></button>
            <button class="icon-btn danger" (click)="confirmarEliminar(h)" pTooltip="Eliminar"><i class="pi pi-trash"></i></button>
          </div>
        </div>
      }
    </div>
  }
</div>

@if (panelVisible()) {
  <div class="side-panel-overlay" (click)="cerrar()"></div>
  <div class="side-panel">
    <div class="panel-header"><h3>{{ editando() ? 'Editar Hito' : 'Nuevo Hito' }}</h3><button class="panel-close" (click)="cerrar()"><i class="pi pi-times"></i></button></div>
    <div class="panel-body">
      <div class="form-group"><label>Nombre *</label><input type="text" class="form-input" [(ngModel)]="form.nombre" /></div>
      <div class="form-group"><label>Descripción</label><textarea class="form-input" [(ngModel)]="form.descripcion" rows="2"></textarea></div>
      <div class="form-row">
        <div class="form-group"><label>Fecha Compromiso *</label><input type="date" class="form-input" [(ngModel)]="form.fechaCompromiso" /></div>
        <div class="form-group"><label>Peso (%)</label><input type="number" class="form-input" [(ngModel)]="form.porcentajePeso" min="0" max="100" /></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Orden</label><input type="number" class="form-input" [(ngModel)]="form.orden" min="1" /></div>
        @if (editando()) {
          <div class="form-group"><label>Estado</label><p-select [options]="estadoOpts" [(ngModel)]="formEdit.estado" styleClass="form-select" /></div>
        }
      </div>
    </div>
    <div class="panel-footer">
      <button class="btn btn-ghost" (click)="cerrar()">Cancelar</button>
      <button class="btn btn-primary" (click)="guardar()" [disabled]="guardando()">@if (guardando()) { <i class="pi pi-spin pi-spinner"></i> } Guardar</button>
    </div>
  </div>
}
  `,
  styles: [`
.tab-section{display:flex;flex-direction:column;gap:1.25rem}
.tab-section-header{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem}
.section-title{margin:0;font-size:1rem;font-weight:700;color:var(--text)}
.section-sub{margin:.25rem 0 0;font-size:.8rem;color:var(--text-muted)}
.loading-row{padding:2rem;text-align:center;color:var(--text-muted);display:flex;align-items:center;justify-content:center;gap:.5rem}
.empty-state{text-align:center;padding:3rem;color:var(--text-muted);display:flex;flex-direction:column;align-items:center;gap:1rem}
.empty-state i{font-size:2.5rem;opacity:.4}
.timeline{display:flex;flex-direction:column;gap:.75rem}
.hito-row{display:flex;align-items:center;gap:1rem;background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:1rem 1.25rem;transition:border-color .2s}
.hito-row.logrado{border-color:rgba(34,197,94,.3)}
.hito-row.vencido{border-color:rgba(239,68,68,.3)}
.hito-row.riesgo{border-color:rgba(250,204,21,.3)}
.hito-dot{width:32px;height:32px;border-radius:50%;background:var(--surface2);border:2px solid var(--border);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:.85rem}
.logrado .hito-dot{background:rgba(34,197,94,.15);border-color:#4ade80;color:#4ade80}
.vencido .hito-dot{background:rgba(239,68,68,.15);border-color:#f87171;color:#f87171}
.riesgo .hito-dot{background:rgba(250,204,21,.15);border-color:#fbbf24;color:#fbbf24}
.hito-body{flex:1}
.hito-header{display:flex;align-items:center;gap:.75rem;margin-bottom:.35rem}
.hito-nombre{font-weight:600;font-size:.92rem;color:var(--text)}
.hito-meta{display:flex;gap:1rem;flex-wrap:wrap}
.hito-meta span{display:flex;align-items:center;gap:.3rem;font-size:.78rem;color:var(--text-muted)}
.hito-actions{display:flex;gap:.35rem}
.badge{padding:2px 8px;border-radius:12px;font-size:.72rem;font-weight:600}
.hito-green{background:rgba(34,197,94,.12);color:#4ade80}
.hito-blue{background:rgba(59,130,246,.12);color:#60a5fa}
.hito-yellow{background:rgba(250,204,21,.12);color:#fbbf24}
.hito-red{background:rgba(239,68,68,.12);color:#f87171}
.hito-gray{background:rgba(148,163,184,.12);color:#94a3b8}
.icon-btn{width:28px;height:28px;border:1px solid var(--border);border-radius:6px;background:transparent;color:var(--text-muted);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:.75rem;transition:all .2s}
.icon-btn:hover{background:var(--primary-bg);color:var(--primary);border-color:var(--primary)}
.icon-btn.danger:hover{background:rgba(239,68,68,.1);color:#f87171;border-color:#f87171}
.icon-btn.success:hover{background:rgba(34,197,94,.1);color:#4ade80;border-color:#4ade80}
.side-panel-overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:40}
.side-panel{position:fixed;right:0;top:0;bottom:0;width:420px;background:var(--surface);border-left:1px solid var(--border);z-index:50;display:flex;flex-direction:column;box-shadow:-8px 0 24px rgba(0,0,0,.3)}
.panel-header{display:flex;align-items:center;justify-content:space-between;padding:1.25rem 1.5rem;border-bottom:1px solid var(--border)}
.panel-header h3{margin:0;font-size:1rem;font-weight:700;color:var(--text)}
.panel-close{background:transparent;border:none;color:var(--text-muted);cursor:pointer;font-size:1rem;padding:.25rem}
.panel-body{flex:1;overflow-y:auto;padding:1.5rem;display:flex;flex-direction:column;gap:1rem}
.panel-footer{padding:1rem 1.5rem;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:.75rem}
.form-group{display:flex;flex-direction:column;gap:.4rem}
.form-group label{font-size:.82rem;font-weight:500;color:var(--text-soft)}
.form-input{background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:.55rem .8rem;color:var(--text);font-size:.9rem;width:100%;outline:none}
.form-input:focus{border-color:var(--primary)}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:.75rem}
.form-select{width:100%}
.btn{padding:.5rem 1.25rem;border-radius:8px;font-size:.88rem;font-weight:500;cursor:pointer;display:flex;align-items:center;gap:.4rem;border:none}
.btn-primary{background:var(--primary);color:#fff}
.btn-primary:disabled{opacity:.6;cursor:not-allowed}
.btn-ghost{background:transparent;border:1px solid var(--border);color:var(--text-soft)}
  `]
})
export class HitosComponent implements OnInit {
  private readonly route   = inject(ActivatedRoute);
  private readonly service = inject(ProyectoService);
  private readonly toast   = inject(MessageService);
  private readonly confirm = inject(ConfirmationService);

  readonly hitos        = signal<ProyectoHitoDto[]>([]);
  readonly cargando     = signal(true);
  readonly panelVisible = signal(false);
  readonly editando     = signal(false);
  readonly guardando    = signal(false);
  proyectoId = 0;
  hitoEditar: ProyectoHitoDto | null = null;

  readonly EstadoHito   = EstadoHito;
  readonly HITO_LABELS  = HITO_LABELS;
  readonly estadoOpts   = enumNums(EstadoHito).map(v => ({ label: HITO_LABELS[v as EstadoHito], value: v }));

  form: Partial<CrearHitoRequest> = { porcentajePeso: 0, orden: 1 };
  formEdit: Partial<ActualizarHitoRequest> = {};

  ngOnInit(): void {
    this.proyectoId = Number(this.route.parent!.snapshot.paramMap.get('id'));
    this.cargar();
  }
  cargar(): void {
    this.cargando.set(true);
    this.service.getHitos(this.proyectoId).subscribe({ next: h => { this.hitos.set(h); this.cargando.set(false); }, error: () => this.cargando.set(false) });
  }
  abrirCrear(): void { this.editando.set(false); this.form = { proyectoId: this.proyectoId, porcentajePeso: 0, orden: this.hitos().length + 1 }; this.formEdit = {}; this.panelVisible.set(true); }
  editar(h: ProyectoHitoDto): void {
    this.editando.set(true); this.hitoEditar = h;
    this.form = { proyectoId: this.proyectoId, nombre: h.nombre, descripcion: h.descripcion, fechaCompromiso: h.fechaCompromiso, porcentajePeso: h.porcentajePeso, orden: h.orden };
    this.formEdit = { id: h.id, estado: h.estado };
    this.panelVisible.set(true);
  }
  guardar(): void {
    if (!this.form.nombre || !this.form.fechaCompromiso) { this.toast.add({ severity: 'warn', summary: 'Requerido', detail: 'Nombre y fecha son obligatorios' }); return; }
    this.guardando.set(true);
    const obs = this.editando() && this.hitoEditar
      ? this.service.actualizarHito(this.proyectoId, this.hitoEditar.id, { ...this.form, ...this.formEdit } as ActualizarHitoRequest)
      : this.service.crearHito(this.proyectoId, this.form as CrearHitoRequest);
    obs.subscribe({ next: () => { this.toast.add({ severity: 'success', summary: 'OK', detail: 'Hito guardado' }); this.cerrar(); this.cargar(); this.guardando.set(false); }, error: () => { this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar' }); this.guardando.set(false); } });
  }
  marcarLogrado(h: ProyectoHitoDto): void {
    const hoy = new Date().toISOString().split('T')[0];
    this.service.marcarHitoLogrado(this.proyectoId, h.id, hoy).subscribe({ next: () => { this.toast.add({ severity: 'success', summary: 'OK', detail: 'Hito marcado como logrado' }); this.cargar(); }, error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar' }) });
  }
  confirmarEliminar(h: ProyectoHitoDto): void {
    this.confirm.confirm({ message: `¿Eliminar el hito "${h.nombre}"?`, header: 'Confirmar', icon: 'pi pi-exclamation-triangle', acceptLabel: 'Eliminar', rejectLabel: 'Cancelar', accept: () => this.service.eliminarHito(this.proyectoId, h.id).subscribe({ next: () => { this.toast.add({ severity: 'success', summary: 'OK', detail: 'Hito eliminado' }); this.cargar(); }, error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar' }) }) });
  }
  cerrar(): void { this.panelVisible.set(false); }
  getEstadoClass(e: EstadoHito): string {
    const m: Record<EstadoHito, string> = { [EstadoHito.Pendiente]: 'gray', [EstadoHito.EnRiesgo]: 'yellow', [EstadoHito.Logrado]: 'green', [EstadoHito.Vencido]: 'red' };
    return m[e] ?? 'gray';
  }
}
