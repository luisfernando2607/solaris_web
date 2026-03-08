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
import { WbsNodoDto, CrearWbsNodoRequest, TipoNodoWbs, enumNums } from '../../../models/proyecto.models';

const TIPO_NODO_LABELS: Record<TipoNodoWbs, string> = {
  [TipoNodoWbs.EntregablePrincipal]: 'Entregable', [TipoNodoWbs.Subentregable]: 'Sub-entregable',
  [TipoNodoWbs.Paquete]: 'Paquete de Trabajo', [TipoNodoWbs.Actividad]: 'Actividad',
};

@Component({
  selector: 'app-wbs',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, ToastModule, TooltipModule, SelectModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  template: `
<p-toast position="top-right" />
<p-confirmDialog />
<div class="tab-section">
  <div class="tab-section-header">
    <div><h2 class="section-title">Estructura de Desglose de Trabajo (WBS)</h2><p class="section-sub">{{ totalNodos() }} nodos</p></div>
    <p-button label="Nuevo nodo raíz" icon="pi pi-plus" size="small" (onClick)="abrirCrear(null)" />
  </div>
  @if (cargando()) { <div class="loading-row"><i class="pi pi-spin pi-spinner"></i> Cargando...</div> }
  @else if (arbol().length === 0) { <div class="empty-state"><i class="pi pi-list-check"></i><p>Sin nodos WBS definidos.</p></div> }
  @else {
    <div class="wbs-tree">
      @for (nodo of arbol(); track nodo.id) {
        <ng-container *ngTemplateOutlet="nodoTpl; context: { $implicit: nodo, nivel: 0 }"></ng-container>
      }
    </div>
  }
</div>

<ng-template #nodoTpl let-nodo let-nivel="nivel">
  <div class="wbs-nodo" [style.margin-left.px]="nivel * 24">
    <div class="nodo-row">
      <div class="nodo-expand" (click)="toggleExpand(nodo)">
        @if (nodo.hijos?.length) { <i class="pi" [class.pi-chevron-down]="expandidos.has(nodo.id)" [class.pi-chevron-right]="!expandidos.has(nodo.id)"></i> }
        @else { <span class="nodo-leaf"></span> }
      </div>
      <div class="nodo-codigo">{{ nodo.codigoWbs }}</div>
      <div class="nodo-info">
        <span class="nodo-nombre">{{ nodo.nombre }}</span>
        <span class="badge nodo-tipo-{{ nodo.tipoNodo }}">{{ getTipoLabel(nodo.tipoNodo) }}</span>
      </div>
      <div class="nodo-avance">
        <div class="bar-mini"><div class="fill-mini" [style.width.%]="nodo.porcentajeAvance"></div></div>
        <span class="pct-mini">{{ nodo.porcentajeAvance }}%</span>
      </div>
      <div class="nodo-actions">
        <button class="icon-btn sm" (click)="abrirCrear(nodo)" pTooltip="Agregar hijo"><i class="pi pi-plus"></i></button>
        <button class="icon-btn sm" (click)="editar(nodo)" pTooltip="Editar"><i class="pi pi-pencil"></i></button>
        <button class="icon-btn sm danger" (click)="confirmarEliminar(nodo)" pTooltip="Eliminar"><i class="pi pi-trash"></i></button>
      </div>
    </div>
  </div>
  @if (expandidos.has(nodo.id) && nodo.hijos?.length) {
    @for (hijo of nodo.hijos; track hijo.id) {
      <ng-container *ngTemplateOutlet="nodoTpl; context: { $implicit: hijo, nivel: nivel + 1 }"></ng-container>
    }
  }
</ng-template>

@if (panelVisible()) {
  <div class="side-panel-overlay" (click)="cerrar()"></div>
  <div class="side-panel">
    <div class="panel-header"><h3>{{ editando() ? 'Editar Nodo' : padreSeleccionado() ? 'Agregar hijo a: ' + padreSeleccionado()!.nombre : 'Nuevo Nodo Raíz' }}</h3><button class="panel-close" (click)="cerrar()"><i class="pi pi-times"></i></button></div>
    <div class="panel-body">
      <div class="form-group"><label>Código WBS *</label><input type="text" class="form-input" [(ngModel)]="form.codigo" placeholder="1.1.2" /></div>
      <div class="form-group"><label>Nombre *</label><input type="text" class="form-input" [(ngModel)]="form.nombre" /></div>
      <div class="form-group"><label>Tipo</label><p-select [options]="tipoOpts" [(ngModel)]="form.tipoNodo" styleClass="form-select" /></div>
      <div class="form-row">
        <div class="form-group"><label>Orden</label><input type="number" class="form-input" [(ngModel)]="form.orden" min="1" /></div>
        <div class="form-group"><label>Peso Relativo (%)</label><input type="number" class="form-input" [(ngModel)]="form.porcentajePeso" min="0" max="100" /></div>
      </div>
      <div class="form-group"><label>Descripción</label><textarea class="form-input" [(ngModel)]="form.descripcion" rows="2"></textarea></div>
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
.wbs-tree{display:flex;flex-direction:column;gap:.3rem}
.wbs-nodo{display:flex;flex-direction:column}
.nodo-row{display:flex;align-items:center;gap:.75rem;background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:.6rem .9rem;transition:border-color .2s}
.nodo-row:hover{border-color:var(--border2)}
.nodo-expand{width:20px;cursor:pointer;color:var(--text-muted);font-size:.8rem;display:flex;align-items:center;justify-content:center}
.nodo-leaf{width:20px;display:block}
.nodo-codigo{font-family:'Courier New',monospace;font-size:.78rem;background:var(--surface2);border:1px solid var(--border);border-radius:5px;padding:1px 7px;color:var(--text-muted);white-space:nowrap}
.nodo-info{flex:1;display:flex;align-items:center;gap:.6rem}
.nodo-nombre{font-weight:500;font-size:.88rem;color:var(--text)}
.nodo-avance{display:flex;align-items:center;gap:.4rem;min-width:90px}
.bar-mini{width:60px;height:4px;background:var(--border);border-radius:2px;overflow:hidden}
.fill-mini{height:100%;background:var(--primary);border-radius:2px}
.pct-mini{font-size:.75rem;color:var(--text-muted);min-width:28px}
.nodo-actions{display:flex;gap:.25rem}
.badge{padding:2px 7px;border-radius:10px;font-size:.7rem;font-weight:600}
.nodo-tipo-1{background:rgba(59,130,246,.1);color:#60a5fa}
.nodo-tipo-2{background:rgba(20,184,166,.1);color:#2dd4bf}
.nodo-tipo-3{background:rgba(168,85,247,.1);color:#c084fc}
.nodo-tipo-4{background:rgba(249,115,22,.1);color:#fb923c}
.icon-btn{width:28px;height:28px;border:1px solid var(--border);border-radius:6px;background:transparent;color:var(--text-muted);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s}
.icon-btn.sm{width:24px;height:24px;font-size:.7rem}
.icon-btn:hover{background:var(--primary-bg);color:var(--primary);border-color:var(--primary)}
.icon-btn.danger:hover{background:rgba(239,68,68,.1);color:#f87171;border-color:#f87171}
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
.btn-primary{background:var(--primary);color:#fff}.btn-primary:disabled{opacity:.6;cursor:not-allowed}
.btn-ghost{background:transparent;border:1px solid var(--border);color:var(--text-soft)}
  `]
})
export class WbsComponent implements OnInit {
  private readonly route   = inject(ActivatedRoute);
  private readonly service = inject(ProyectoService);
  private readonly toast   = inject(MessageService);
  private readonly confirm = inject(ConfirmationService);

  readonly arbol        = signal<WbsNodoDto[]>([]);
  readonly cargando     = signal(true);
  readonly panelVisible = signal(false);
  readonly editando     = signal(false);
  readonly guardando    = signal(false);
  readonly padreSeleccionado = signal<WbsNodoDto | null>(null);
  proyectoId = 0;
  expandidos = new Set<number>();
  nodoEditar: WbsNodoDto | null = null;

  readonly TIPO_NODO_LABELS = TIPO_NODO_LABELS;
  readonly tipoOpts = enumNums(TipoNodoWbs).map(v => ({ label: TIPO_NODO_LABELS[v as TipoNodoWbs], value: v }));

  form: Partial<CrearWbsNodoRequest & { porcentajePeso: number }> = { tipoNodo: TipoNodoWbs.Paquete, orden: 1, porcentajePeso: 0 };

  getTipoLabel(tipo: TipoNodoWbs): string { return TIPO_NODO_LABELS[tipo]; }

  totalNodos(): number {
    const contar = (nodos: WbsNodoDto[]): number => nodos.reduce((acc, n) => acc + 1 + contar(n.hijos ?? []), 0);
    return contar(this.arbol());
  }

  ngOnInit(): void {
    this.proyectoId = Number(this.route.parent!.snapshot.paramMap.get('id'));
    this.cargar();
  }
  cargar(): void {
    this.cargando.set(true);
    this.service.getWbs(this.proyectoId).subscribe({ next: a => { this.arbol.set(a); this.expandidos = new Set(a.map(n => n.id)); this.cargando.set(false); }, error: () => this.cargando.set(false) });
  }
  toggleExpand(nodo: WbsNodoDto): void { this.expandidos.has(nodo.id) ? this.expandidos.delete(nodo.id) : this.expandidos.add(nodo.id); this.arbol.update(a => [...a]); }
  abrirCrear(padre: WbsNodoDto | null): void {
    this.editando.set(false); this.nodoEditar = null; this.padreSeleccionado.set(padre);
    this.form = { proyectoId: this.proyectoId, padreId: padre?.id, tipoNodo: TipoNodoWbs.Paquete, orden: 1, porcentajePeso: 0 };
    this.panelVisible.set(true);
  }
  editar(n: WbsNodoDto): void {
    this.editando.set(true); this.nodoEditar = n; this.padreSeleccionado.set(null);
    this.form = { proyectoId: this.proyectoId, padreId: n.padreId, codigo: n.codigoWbs, nombre: n.nombre, descripcion: n.descripcion, tipoNodo: n.tipoNodo, orden: n.orden, porcentajePeso: n.pesoRelativo };
    this.panelVisible.set(true);
  }
  guardar(): void {
    if (!this.form.codigo || !this.form.nombre) { this.toast.add({ severity: 'warn', summary: 'Requerido', detail: 'Código y nombre requeridos' }); return; }
    this.guardando.set(true);
    const obs = this.editando() && this.nodoEditar
      ? this.service.actualizarNodoWbs(this.proyectoId, this.nodoEditar.id, this.form as any)
      : this.service.crearNodoWbs(this.proyectoId, this.form as CrearWbsNodoRequest);
    obs.subscribe({ next: () => { this.toast.add({ severity: 'success', summary: 'OK', detail: 'Nodo guardado' }); this.cerrar(); this.cargar(); this.guardando.set(false); }, error: () => { this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar' }); this.guardando.set(false); } });
  }
  confirmarEliminar(n: WbsNodoDto): void {
    this.confirm.confirm({ message: `¿Eliminar el nodo "${n.nombre}"?`, header: 'Confirmar', icon: 'pi pi-exclamation-triangle', acceptLabel: 'Eliminar', rejectLabel: 'Cancelar', accept: () => this.service.eliminarNodoWbs(this.proyectoId, n.id).subscribe({ next: () => { this.toast.add({ severity: 'success', summary: 'OK', detail: 'Nodo eliminado' }); this.cargar(); }, error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar' }) }) });
  }
  cerrar(): void { this.panelVisible.set(false); }
}