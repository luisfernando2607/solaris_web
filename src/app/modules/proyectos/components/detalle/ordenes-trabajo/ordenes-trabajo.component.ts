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
import { ProyectoService } from '../../../services/proyecto.service';
import {
  OrdenTrabajoListDto, OrdenTrabajoDto, CrearOrdenTrabajoRequest,
  CuadrillaDto, EstadoOrdenTrabajo,
  ESTADO_OT_LABELS, enumNums
} from '../../../models/proyecto.models';

@Component({
  selector: 'app-ordenes-trabajo-p',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, ToastModule, TooltipModule, SelectModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  template: `
<p-toast position="top-right" />
<p-confirmDialog />
<div class="tab-section">
  <div class="tab-section-header">
    <div><h2 class="section-title">Órdenes de Trabajo</h2><p class="section-sub">{{ ordenes().length }} órdenes</p></div>
    <p-button label="Nueva OT" icon="pi pi-plus" size="small" (onClick)="abrirCrear()" />
  </div>

  @if (cargando()) { <div class="loading-row"><i class="pi pi-spin pi-spinner"></i> Cargando...</div> }
  @else if (ordenes().length === 0) { <div class="empty-state"><i class="pi pi-wrench"></i><p>Sin órdenes de trabajo.</p></div> }
  @else {
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr><th>Código</th><th>Descripción</th><th>Estado</th><th>Cuadrilla</th><th>Fecha Prog.</th><th></th></tr>
        </thead>
        <tbody>
          @for (ot of ordenes(); track ot.id) {
            <tr>
              <td><span class="ot-codigo">{{ ot.codigo }}</span></td>
              <td><div class="cell-desc">{{ ot.descripcion }}</div></td>
              <td>
                <select class="estado-select estado-ot-{{ getEstadoClass(ot.estado) }}"
                  [value]="ot.estado" (change)="cambiarEstado(ot, +$any($event.target).value)">
                  @for (opt of estadoOpts; track opt.value) {
                    <option [value]="opt.value">{{ opt.label }}</option>
                  }
                </select>
              </td>
              <td>{{ ot.cuadrillaNombre ?? '—' }}</td>
              <td>{{ ot.fechaProgramada | date:'dd/MM/yy' }}</td>
              <td>
                <div class="row-actions">
                  <button class="icon-btn" (click)="verDetalle(ot)" pTooltip="Ver detalle"><i class="pi pi-eye"></i></button>
                  <button class="icon-btn danger" (click)="confirmarEliminar(ot)" pTooltip="Eliminar"><i class="pi pi-trash"></i></button>
                </div>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  }
</div>

<!-- Panel Nueva OT -->
@if (panelCrear()) {
  <div class="side-panel-overlay" (click)="panelCrear.set(false)"></div>
  <div class="side-panel">
    <div class="panel-header"><h3>Nueva Orden de Trabajo</h3><button class="panel-close" (click)="panelCrear.set(false)"><i class="pi pi-times"></i></button></div>
    <div class="panel-body">
      <div class="form-group"><label>Descripción *</label><textarea class="form-input" [(ngModel)]="form.descripcion" rows="3"></textarea></div>
      <div class="form-group"><label>Cuadrilla</label>
        <p-select [options]="cuadrillaOpts" [(ngModel)]="form.cuadrillaId" [showClear]="true" styleClass="form-select" placeholder="Sin asignar" />
      </div>
      <div class="form-group"><label>Fecha Programada</label><input type="date" class="form-input" [(ngModel)]="form.fechaInicioPlan" /></div>
      <div class="form-group"><label>Dirección del Sitio</label><input type="text" class="form-input" [(ngModel)]="form.direcSitio" placeholder="Dirección de trabajo" /></div>
    </div>
    <div class="panel-footer">
      <button class="btn btn-ghost" (click)="panelCrear.set(false)">Cancelar</button>
      <button class="btn btn-primary" (click)="guardar()" [disabled]="guardando()">@if (guardando()) { <i class="pi pi-spin pi-spinner"></i> } Crear OT</button>
    </div>
  </div>
}

<!-- Panel Detalle OT -->
@if (panelDetalle() && otDetalle()) {
  <div class="side-panel-overlay" (click)="panelDetalle.set(false)"></div>
  <div class="side-panel wide">
    <div class="panel-header">
      <div>
        <h3>{{ otDetalle()!.codigo }}</h3>
        <p class="panel-sub">{{ otDetalle()!.descripcion }}</p>
      </div>
      <button class="panel-close" (click)="panelDetalle.set(false)"><i class="pi pi-times"></i></button>
    </div>
    <div class="panel-body">
      <!-- Actividades -->
      <div class="detalle-section">
        <h4 class="detalle-section-title"><i class="pi pi-list-check"></i> Actividades</h4>
        @if (!otDetalle()!.actividades.length) { <p class="empty-mini">Sin actividades registradas.</p> }
        @for (act of otDetalle()!.actividades; track act.id) {
          <div class="actividad-row" [class.completada]="act.completada">
            <button class="check-btn" [class.checked]="act.completada" (click)="completarActividad(act.id)">
              <i class="pi" [class.pi-check-circle]="act.completada" [class.pi-circle]="!act.completada"></i>
            </button>
            <span class="act-nombre">{{ act.nombre }}</span>
          </div>
        }
      </div>
      <!-- Materiales -->
      <div class="detalle-section">
        <h4 class="detalle-section-title"><i class="pi pi-box"></i> Materiales</h4>
        @if (!otDetalle()!.materiales.length) { <p class="empty-mini">Sin materiales registrados.</p> }
        @else {
          <table class="mini-table">
            <thead><tr><th>Material</th><th>Plan</th><th>Real</th><th>Costo</th></tr></thead>
            <tbody>
              @for (m of otDetalle()!.materiales; track m.id) {
                <tr>
                  <td>{{ m.nombreMaterial }}</td>
                  <td class="num">{{ m.cantidadPlan }}</td>
                  <td class="num">{{ m.cantidadReal }}</td>
                  <td class="num">{{ m.costoTotal | currency:'USD':'symbol':'1.2-2' }}</td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    </div>
    <div class="panel-footer">
      <button class="btn btn-ghost" (click)="panelDetalle.set(false)">Cerrar</button>
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
.table-wrap{background:var(--surface);border:1px solid var(--border);border-radius:10px;overflow:hidden}
.data-table{width:100%;border-collapse:collapse}
.data-table th{padding:.6rem 1rem;font-size:.78rem;font-weight:600;color:var(--text-muted);text-align:left;background:var(--surface2);border-bottom:1px solid var(--border)}
.data-table td{padding:.6rem 1rem;font-size:.85rem;color:var(--text);border-bottom:1px solid var(--border);vertical-align:middle}
.data-table tr:last-child td{border-bottom:none}
.data-table tr:hover td{background:var(--surface2)}
.ot-codigo{font-family:'Courier New',monospace;font-size:.78rem;background:var(--surface2);border:1px solid var(--border);border-radius:5px;padding:2px 7px;color:var(--text-muted)}
.cell-desc{font-weight:500;max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.estado-select{border:1px solid var(--border);border-radius:6px;padding:3px 8px;font-size:.78rem;font-weight:600;background:transparent;cursor:pointer}
.estado-ot-blue{color:#60a5fa;border-color:rgba(59,130,246,.3)}
.estado-ot-green{color:#4ade80;border-color:rgba(34,197,94,.3)}
.estado-ot-gray{color:#94a3b8;border-color:rgba(148,163,184,.3)}
.estado-ot-yellow{color:#fbbf24;border-color:rgba(250,204,21,.3)}
.estado-ot-red{color:#f87171;border-color:rgba(239,68,68,.3)}
.row-actions{display:flex;gap:.25rem}
.icon-btn{width:28px;height:28px;border:1px solid var(--border);border-radius:6px;background:transparent;color:var(--text-muted);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:.75rem;transition:all .2s}
.icon-btn:hover{background:var(--primary-bg);color:var(--primary);border-color:var(--primary)}
.icon-btn.danger:hover{background:rgba(239,68,68,.1);color:#f87171;border-color:#f87171}
.side-panel-overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:40}
.side-panel{position:fixed;right:0;top:0;bottom:0;width:440px;background:var(--surface);border-left:1px solid var(--border);z-index:50;display:flex;flex-direction:column;box-shadow:-8px 0 24px rgba(0,0,0,.3)}
.side-panel.wide{width:560px}
.panel-header{display:flex;align-items:center;justify-content:space-between;padding:1.25rem 1.5rem;border-bottom:1px solid var(--border)}
.panel-header h3{margin:0;font-size:1rem;font-weight:700;color:var(--text)}
.panel-sub{margin:.15rem 0 0;font-size:.8rem;color:var(--text-muted)}
.panel-close{background:transparent;border:none;color:var(--text-muted);cursor:pointer;font-size:1rem;padding:.25rem;flex-shrink:0}
.panel-body{flex:1;overflow-y:auto;padding:1.5rem;display:flex;flex-direction:column;gap:1.25rem}
.panel-footer{padding:1rem 1.5rem;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:.75rem}
.form-group{display:flex;flex-direction:column;gap:.4rem}
.form-group label{font-size:.82rem;font-weight:500;color:var(--text-soft)}
.form-input{background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:.55rem .8rem;color:var(--text);font-size:.9rem;width:100%;outline:none}
.form-input:focus{border-color:var(--primary)}
.form-select{width:100%}
.detalle-section{display:flex;flex-direction:column;gap:.6rem}
.detalle-section-title{margin:0;font-size:.88rem;font-weight:600;color:var(--text);display:flex;align-items:center;gap:.4rem}
.empty-mini{font-size:.8rem;color:var(--text-muted);margin:0}
.actividad-row{display:flex;align-items:center;gap:.6rem;padding:.4rem .6rem;border-radius:7px;border:1px solid var(--border)}
.actividad-row.completada{opacity:.6}
.check-btn{background:transparent;border:none;cursor:pointer;font-size:1rem;padding:0;color:var(--text-muted);display:flex;align-items:center}
.check-btn.checked{color:#4ade80}
.act-nombre{font-size:.85rem;color:var(--text)}
.actividad-row.completada .act-nombre{text-decoration:line-through}
.mini-table{width:100%;border-collapse:collapse}
.mini-table th{padding:.4rem .6rem;font-size:.74rem;font-weight:600;color:var(--text-muted);background:var(--surface2);border-bottom:1px solid var(--border);text-align:left}
.mini-table td{padding:.4rem .6rem;font-size:.8rem;color:var(--text);border-bottom:1px solid var(--border)}
.num{text-align:right}
.btn{padding:.5rem 1.25rem;border-radius:8px;font-size:.88rem;font-weight:500;cursor:pointer;display:flex;align-items:center;gap:.4rem;border:none}
.btn-primary{background:var(--primary);color:#fff}.btn-primary:disabled{opacity:.6;cursor:not-allowed}
.btn-ghost{background:transparent;border:1px solid var(--border);color:var(--text-soft)}
  `]
})
export class OrdenesTrabajoPComponent implements OnInit {
  private readonly route   = inject(ActivatedRoute);
  private readonly service = inject(ProyectoService);
  private readonly toast   = inject(MessageService);
  private readonly confirm = inject(ConfirmationService);

  readonly ordenes      = signal<OrdenTrabajoListDto[]>([]);
  readonly cuadrillas   = signal<CuadrillaDto[]>([]);
  readonly cargando     = signal(true);
  readonly panelCrear   = signal(false);
  readonly panelDetalle = signal(false);
  readonly guardando    = signal(false);
  readonly otDetalle    = signal<OrdenTrabajoDto | null>(null);
  proyectoId = 0;

  readonly ESTADO_OT_LABELS = ESTADO_OT_LABELS;
  readonly estadoOpts = enumNums(EstadoOrdenTrabajo).map(v => ({ label: ESTADO_OT_LABELS[v as EstadoOrdenTrabajo], value: v }));
  cuadrillaOpts: { label: string; value: number }[] = [];

  form: Partial<CrearOrdenTrabajoRequest> = { actividades: [], materiales: [] };

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
    this.service.getOrdenesByProyecto(this.proyectoId).subscribe({ next: o => { this.ordenes.set(o); this.cargando.set(false); }, error: () => this.cargando.set(false) });
  }
  abrirCrear(): void { this.form = { proyectoId: this.proyectoId, actividades: [], materiales: [] }; this.panelCrear.set(true); }
  guardar(): void {
    if (!this.form.descripcion) { this.toast.add({ severity: 'warn', summary: 'Requerido', detail: 'La descripción es obligatoria' }); return; }
    this.guardando.set(true);
    this.service.crearOrden(this.form as CrearOrdenTrabajoRequest).subscribe({ next: () => { this.toast.add({ severity: 'success', summary: 'OK', detail: 'OT creada' }); this.panelCrear.set(false); this.cargar(); this.guardando.set(false); }, error: () => { this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear' }); this.guardando.set(false); } });
  }
  verDetalle(ot: OrdenTrabajoListDto): void {
    this.service.getOrdenById(ot.id).subscribe({ next: d => { this.otDetalle.set(d); this.panelDetalle.set(true); }, error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar' }) });
  }
  cambiarEstado(ot: OrdenTrabajoListDto, estado: EstadoOrdenTrabajo): void {
    this.service.cambiarEstadoOT(ot.id, estado).subscribe({ next: () => { ot.estado = estado; this.ordenes.update(o => [...o]); }, error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cambiar estado' }) });
  }
  completarActividad(actId: number): void {
    const ot = this.otDetalle();
    if (!ot) return;
    this.service.completarActividad(ot.id, actId).subscribe({ next: () => { const act = ot.actividades?.find(a => a.id === actId); if (act) act.completada = !act.completada; this.otDetalle.update(d => d ? { ...d } : null); }, error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar' }) });
  }
  confirmarEliminar(ot: OrdenTrabajoListDto): void {
    this.confirm.confirm({ message: `¿Eliminar la OT "${ot.codigo}"?`, header: 'Confirmar', icon: 'pi pi-exclamation-triangle', acceptLabel: 'Eliminar', rejectLabel: 'Cancelar', accept: () => this.service.eliminarOrden(ot.id).subscribe({ next: () => { this.toast.add({ severity: 'success', summary: 'OK', detail: 'OT eliminada' }); this.cargar(); }, error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar' }) }) });
  }
  getEstadoClass(e: EstadoOrdenTrabajo): string {
    const m: Record<EstadoOrdenTrabajo, string> = { [EstadoOrdenTrabajo.Borrador]: 'gray', [EstadoOrdenTrabajo.Asignada]: 'blue', [EstadoOrdenTrabajo.EnCurso]: 'yellow', [EstadoOrdenTrabajo.Completada]: 'green', [EstadoOrdenTrabajo.Cancelada]: 'red' };
    return m[e] ?? 'gray';
  }
}