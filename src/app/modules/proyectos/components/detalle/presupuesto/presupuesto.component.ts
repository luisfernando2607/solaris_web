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
  PresupuestoDto, ResumenEjecucionDto, CostoRealDto,
  AgregarPartidaRequest, RegistrarCostoRealRequest,
  TipoPartida, OrigenCosto,
  TIPO_PARTIDA_LABELS, enumNums
} from '../../../models/proyecto.models';

@Component({
  selector: 'app-presupuesto',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, ToastModule, TooltipModule, SelectModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  template: `
<p-toast position="top-right" />
<p-confirmDialog />

<div class="tab-section">

  <!-- Tabs internos: Partidas / Ejecución / Costos -->
  <div class="inner-tabs">
    @for (t of innerTabs; track t.key) {
      <button class="inner-tab" [class.active]="activeTab() === t.key" (click)="activeTab.set(t.key)">{{ t.label }}</button>
    }
    <div class="inner-tabs-spacer"></div>
    @if (!presupuesto()) {
      <p-button label="Nuevo presupuesto" icon="pi pi-plus" size="small" (onClick)="crearPresupuesto()" />
    } @else if (presupuesto()!.estado !== 2) {
      <p-button label="Aprobar" icon="pi pi-check" size="small" severity="success" (onClick)="aprobar()" />
      <p-button label="Nueva partida" icon="pi pi-plus" size="small" (onClick)="abrirPartida()" />
    }
  </div>

  @if (cargando()) {
    <div class="loading-row"><i class="pi pi-spin pi-spinner"></i> Cargando...</div>
  } @else if (!presupuesto()) {
    <div class="empty-state">
      <i class="pi pi-wallet"></i>
      <p>No hay presupuesto activo. Crea uno para comenzar.</p>
    </div>
  } @else {

    <!-- Presupuesto header -->
    <div class="presup-header">
      <div>
        <span class="presup-version">v{{ presupuesto()!.version }}</span>
        @if (presupuesto()!.descripcion) { <span class="presup-desc">{{ presupuesto()!.descripcion }}</span> }
      </div>
      <div class="presup-totales">
        <div class="total-card">
          <span class="total-label">Total Presupuestado</span>
          <span class="total-val">{{ presupuesto()!.totalGeneral | currency:'USD':'symbol':'1.0-0' }}</span>
        </div>
        @if (ejecucion()) {
          <div class="total-card ejecutado">
            <span class="total-label">Ejecutado</span>
            <span class="total-val">{{ ejecucion()!.totalEjecutado | currency:'USD':'symbol':'1.0-0' }}</span>
          </div>
          <div class="total-card saldo">
            <span class="total-label">Saldo</span>
            <span class="total-val">{{ ejecucion()!.saldo | currency:'USD':'symbol':'1.0-0' }}</span>
          </div>
          <div class="total-card pct">
            <span class="total-label">% Ejecución</span>
            <span class="total-val">{{ ejecucion()!.porcentajeEjecucion | number:'1.1-1' }}%</span>
          </div>
        }
      </div>
      <span class="badge estado-presup-{{ presupuesto()!.estado }}">
        {{ presupuesto()!.estado === 2 ? 'Aprobado' : 'Borrador' }}
      </span>
    </div>

    <!-- TAB: Partidas -->
    @if (activeTab() === 'partidas') {
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr><th>Tipo</th><th>Concepto</th><th>Cant.</th><th>P.Unit.</th><th>Subtotal</th><th>%</th><th>Total</th></tr>
          </thead>
          <tbody>
            @for (p of presupuesto()!.partidas; track p.id) {
              <tr>
                <td><span class="badge tipo-{{ p.tipo }}">{{ TIPO_PARTIDA_LABELS[p.tipo] }}</span></td>
                <td>{{ p.concepto }}</td>
                <td class="num">{{ p.cantidad }}</td>
                <td class="num">{{ p.precioUnitario | currency:'USD':'symbol':'1.2-2' }}</td>
                <td class="num">{{ p.subtotal | currency:'USD':'symbol':'1.2-2' }}</td>
                <td class="num">{{ p.porcentaje }}%</td>
                <td class="num bold">{{ p.total | currency:'USD':'symbol':'1.2-2' }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }

    <!-- TAB: Ejecución -->
    @if (activeTab() === 'ejecucion' && ejecucion()) {
      <div class="ejecucion-grid">
        @for (ep of ejecucion()!.porPartida; track ep.partidaId) {
          <div class="ej-card">
            <div class="ej-header">
              <span class="ej-nombre">{{ ep.concepto }}</span>
              <span class="badge tipo-{{ ep.tipo }}">{{ TIPO_PARTIDA_LABELS[ep.tipo] }}</span>
            </div>
            <div class="ej-bar-wrap">
              <div class="ej-bar"><div class="ej-fill" [style.width.%]="ep.porcentaje" [class.over]="ep.porcentaje > 100"></div></div>
              <span class="ej-pct">{{ ep.porcentaje | number:'1.0-1' }}%</span>
            </div>
            <div class="ej-nums">
              <div class="ej-num-item"><span>Presupuestado</span><span class="bold">{{ ep.presupuestado | currency:'USD':'symbol':'1.0-0' }}</span></div>
              <div class="ej-num-item"><span>Ejecutado</span><span>{{ ep.ejecutado | currency:'USD':'symbol':'1.0-0' }}</span></div>
              <div class="ej-num-item"><span>Saldo</span><span [class.negative]="ep.saldo < 0">{{ ep.saldo | currency:'USD':'symbol':'1.0-0' }}</span></div>
            </div>
          </div>
        }
      </div>
    }

    <!-- TAB: Costos Reales -->
    @if (activeTab() === 'costos') {
      <div class="tab-header-actions">
        <p-button label="Registrar costo" icon="pi pi-plus" size="small" (onClick)="abrirCosto()" />
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr><th>Fecha</th><th>Concepto</th><th>Origen</th><th class="num">Monto</th></tr>
          </thead>
          <tbody>
            @for (c of costos(); track c.id) {
              <tr>
                <td>{{ c.fecha | date:'dd/MM/yy' }}</td>
                <td>{{ c.concepto }}</td>
                <td>{{ c.origen }}</td>
                <td class="num bold">{{ c.monto | currency:'USD':'symbol':'1.2-2' }}</td>
              </tr>
            }
            @if (costos().length === 0) {
              <tr><td colspan="4" class="empty-cell">Sin costos registrados</td></tr>
            }
          </tbody>
        </table>
      </div>
    }
  }
</div>

<!-- Panel Nueva Partida -->
@if (panelPartida()) {
  <div class="side-panel-overlay" (click)="panelPartida.set(false)"></div>
  <div class="side-panel">
    <div class="panel-header">
      <h3>Nueva Partida</h3>
      <button class="panel-close" (click)="panelPartida.set(false)"><i class="pi pi-times"></i></button>
    </div>
    <div class="panel-body">
      <div class="form-group">
        <label>Tipo</label>
        <p-select [options]="tipoOpts" [(ngModel)]="formPartida.tipo" styleClass="form-select" />
      </div>
      <div class="form-group">
        <label>Concepto *</label>
        <input type="text" class="form-input" [(ngModel)]="formPartida.concepto" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Cantidad</label>
          <input type="number" class="form-input" [(ngModel)]="formPartida.cantidad" min="0" />
        </div>
        <div class="form-group">
          <label>Precio Unitario</label>
          <input type="number" class="form-input" [(ngModel)]="formPartida.precioUnitario" min="0" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Unidad</label>
          <input type="text" class="form-input" [(ngModel)]="formPartida.unidadMedida" placeholder="ej. m², hrs" />
        </div>
        <div class="form-group">
          <label>% Adicional</label>
          <input type="number" class="form-input" [(ngModel)]="formPartida.porcentaje" min="0" max="100" />
        </div>
      </div>
      <div class="calc-preview">
        Total estimado: <strong>{{ calcTotal() | currency:'USD':'symbol':'1.2-2' }}</strong>
      </div>
    </div>
    <div class="panel-footer">
      <button class="btn btn-ghost" (click)="panelPartida.set(false)">Cancelar</button>
      <button class="btn btn-primary" (click)="guardarPartida()" [disabled]="guardando()">
        @if (guardando()) { <i class="pi pi-spin pi-spinner"></i> } Guardar
      </button>
    </div>
  </div>
}

<!-- Panel Costo Real -->
@if (panelCosto()) {
  <div class="side-panel-overlay" (click)="panelCosto.set(false)"></div>
  <div class="side-panel">
    <div class="panel-header">
      <h3>Registrar Costo Real</h3>
      <button class="panel-close" (click)="panelCosto.set(false)"><i class="pi pi-times"></i></button>
    </div>
    <div class="panel-body">
      <div class="form-group">
        <label>Concepto *</label>
        <input type="text" class="form-input" [(ngModel)]="formCosto.concepto" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Monto *</label>
          <input type="number" class="form-input" [(ngModel)]="formCosto.monto" min="0" />
        </div>
        <div class="form-group">
          <label>Fecha</label>
          <input type="date" class="form-input" [(ngModel)]="formCosto.fechaRegistro" />
        </div>
      </div>
    </div>
    <div class="panel-footer">
      <button class="btn btn-ghost" (click)="panelCosto.set(false)">Cancelar</button>
      <button class="btn btn-primary" (click)="guardarCosto()" [disabled]="guardando()">
        @if (guardando()) { <i class="pi pi-spin pi-spinner"></i> } Guardar
      </button>
    </div>
  </div>
}
  `,
  styles: [`
.tab-section{display:flex;flex-direction:column;gap:1.25rem}
.inner-tabs{display:flex;align-items:center;gap:.5rem;border-bottom:1px solid var(--border);padding-bottom:.75rem}
.inner-tab{background:transparent;border:none;padding:.4rem .9rem;border-radius:7px;font-size:.85rem;font-weight:500;color:var(--text-muted);cursor:pointer;transition:all .2s}
.inner-tab.active{background:var(--primary-bg);color:var(--primary)}
.inner-tabs-spacer{flex:1}
.loading-row{padding:2rem;text-align:center;color:var(--text-muted);display:flex;align-items:center;justify-content:center;gap:.5rem}
.empty-state{text-align:center;padding:3rem;color:var(--text-muted);display:flex;flex-direction:column;align-items:center;gap:1rem}
.empty-state i{font-size:2.5rem;opacity:.4}
.presup-header{display:flex;align-items:center;gap:1.5rem;background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:1rem 1.25rem;flex-wrap:wrap}
.presup-version{font-family:'Courier New',monospace;font-size:.8rem;background:var(--surface2);border:1px solid var(--border);border-radius:5px;padding:2px 8px;color:var(--text-muted)}
.presup-desc{font-size:.85rem;color:var(--text-muted);margin-left:.5rem}
.presup-totales{display:flex;gap:1rem;flex:1;flex-wrap:wrap}
.total-card{display:flex;flex-direction:column;align-items:center;background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:.5rem 1rem;min-width:110px}
.total-label{font-size:.72rem;color:var(--text-muted)}
.total-val{font-size:1rem;font-weight:700;color:var(--text)}
.ejecutado .total-val{color:#4ade80}
.saldo .total-val{color:var(--primary)}
.pct .total-val{color:#fbbf24}
.badge{padding:2px 8px;border-radius:12px;font-size:.72rem;font-weight:600}
.estado-presup-1{background:rgba(250,204,21,.12);color:#fbbf24}
.estado-presup-2{background:rgba(34,197,94,.12);color:#4ade80}
.tipo-1{background:rgba(59,130,246,.1);color:#60a5fa}
.tipo-2{background:rgba(20,184,166,.1);color:#2dd4bf}
.tipo-3{background:rgba(168,85,247,.1);color:#c084fc}
.tipo-4{background:rgba(249,115,22,.1);color:#fb923c}
.tipo-5{background:rgba(148,163,184,.1);color:#94a3b8}
.table-wrap{background:var(--surface);border:1px solid var(--border);border-radius:10px;overflow:hidden}
.data-table{width:100%;border-collapse:collapse}
.data-table th{padding:.6rem 1rem;font-size:.78rem;font-weight:600;color:var(--text-muted);text-align:left;background:var(--surface2);border-bottom:1px solid var(--border)}
.data-table td{padding:.6rem 1rem;font-size:.85rem;color:var(--text);border-bottom:1px solid var(--border)}
.data-table tr:last-child td{border-bottom:none}
.num{text-align:right}.bold{font-weight:600}
.empty-cell{text-align:center;color:var(--text-muted);padding:2rem}
.ejecucion-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1rem}
.ej-card{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:1rem;display:flex;flex-direction:column;gap:.6rem}
.ej-header{display:flex;align-items:center;justify-content:space-between;gap:.5rem}
.ej-nombre{font-weight:600;font-size:.88rem;color:var(--text)}
.ej-bar-wrap{display:flex;align-items:center;gap:.5rem}
.ej-bar{flex:1;height:6px;background:var(--border);border-radius:3px;overflow:hidden}
.ej-fill{height:100%;background:var(--primary);border-radius:3px;transition:width .4s}
.ej-fill.over{background:#f87171}
.ej-pct{font-size:.78rem;color:var(--text-muted);min-width:36px;text-align:right}
.ej-nums{display:flex;justify-content:space-between}
.ej-num-item{display:flex;flex-direction:column;align-items:center;font-size:.76rem;color:var(--text-muted)}
.ej-num-item .bold{color:var(--text);font-weight:600}
.negative{color:#f87171}
.tab-header-actions{display:flex;justify-content:flex-end}
.calc-preview{background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:.75rem;font-size:.85rem;color:var(--text-muted)}
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
export class PresupuestoComponent implements OnInit {
  private readonly route   = inject(ActivatedRoute);
  private readonly service = inject(ProyectoService);
  private readonly toast   = inject(MessageService);

  readonly presupuesto  = signal<PresupuestoDto | null>(null);
  readonly ejecucion    = signal<ResumenEjecucionDto | null>(null);
  readonly costos       = signal<CostoRealDto[]>([]);
  readonly cargando     = signal(true);
  readonly activeTab    = signal<'partidas' | 'ejecucion' | 'costos'>('partidas');
  readonly panelPartida = signal(false);
  readonly panelCosto   = signal(false);
  readonly guardando    = signal(false);

  proyectoId = 0;
  readonly TIPO_PARTIDA_LABELS = TIPO_PARTIDA_LABELS;
  readonly tipoOpts = enumNums(TipoPartida).map(v => ({ label: TIPO_PARTIDA_LABELS[v as TipoPartida], value: v }));
  readonly innerTabs = [{ key: 'partidas', label: 'Partidas' }, { key: 'ejecucion', label: 'Ejecución' }, { key: 'costos', label: 'Costos Reales' }] as const;

  formPartida: Partial<AgregarPartidaRequest> = { tipo: TipoPartida.ManoObra, cantidad: 1, porcentaje: 0, precioUnitario: 0, orden: 1 };
  formCosto: Partial<RegistrarCostoRealRequest> = { origen: OrigenCosto.Manual, fechaRegistro: new Date().toISOString().split('T')[0] };

  calcTotal(): number {
    const sub = (this.formPartida.cantidad ?? 0) * (this.formPartida.precioUnitario ?? 0);
    return sub * (1 + (this.formPartida.porcentaje ?? 0) / 100);
  }

  ngOnInit(): void {
    this.proyectoId = Number(this.route.parent!.snapshot.paramMap.get('id'));
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.service.getPresupuestoActivo(this.proyectoId).subscribe({
      next: p => {
        this.presupuesto.set(p);
        if (p) {
          this.service.getResumenEjecucion(this.proyectoId).subscribe(e => this.ejecucion.set(e));
          this.service.getCostosReales(this.proyectoId).subscribe(c => this.costos.set(c));
        }
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }

  crearPresupuesto(): void {
    this.service.crearPresupuesto(this.proyectoId, { proyectoId: this.proyectoId, nombre: 'Presupuesto v1' }).subscribe({
      next: () => { this.toast.add({ severity: 'success', summary: 'OK', detail: 'Presupuesto creado' }); this.cargar(); },
      error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear' })
    });
  }

  aprobar(): void {
    if (!this.presupuesto()) return;
    this.service.aprobarPresupuesto(this.proyectoId, this.presupuesto()!.id).subscribe({
      next: () => { this.toast.add({ severity: 'success', summary: 'OK', detail: 'Presupuesto aprobado' }); this.cargar(); },
      error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo aprobar' })
    });
  }

  abrirPartida(): void {
    this.formPartida = { tipo: TipoPartida.ManoObra, cantidad: 1, porcentaje: 0, precioUnitario: 0, orden: (this.presupuesto()?.partidas.length ?? 0) + 1, presupuestoId: this.presupuesto()!.id };
    this.panelPartida.set(true);
  }

  guardarPartida(): void {
    if (!this.formPartida.concepto) { this.toast.add({ severity: 'warn', summary: 'Requerido', detail: 'El concepto es obligatorio' }); return; }
    this.guardando.set(true);
    this.service.agregarPartida(this.proyectoId, this.presupuesto()!.id, this.formPartida as AgregarPartidaRequest).subscribe({
      next: () => { this.toast.add({ severity: 'success', summary: 'OK', detail: 'Partida agregada' }); this.panelPartida.set(false); this.cargar(); this.guardando.set(false); },
      error: () => { this.toast.add({ severity: 'error', summary: 'Error', detail: 'Error al guardar' }); this.guardando.set(false); }
    });
  }

  abrirCosto(): void {
    this.formCosto = { origen: OrigenCosto.Manual, presupuestoId: this.presupuesto()!.id, fechaRegistro: new Date().toISOString().split('T')[0] };
    this.panelCosto.set(true);
  }

  guardarCosto(): void {
    if (!this.formCosto.concepto || !this.formCosto.monto) { this.toast.add({ severity: 'warn', summary: 'Requerido', detail: 'Concepto y monto son requeridos' }); return; }
    this.guardando.set(true);
    this.service.registrarCosto(this.proyectoId, this.formCosto as RegistrarCostoRealRequest).subscribe({
      next: () => { this.toast.add({ severity: 'success', summary: 'OK', detail: 'Costo registrado' }); this.panelCosto.set(false); this.cargar(); this.guardando.set(false); },
      error: () => { this.toast.add({ severity: 'error', summary: 'Error', detail: 'Error al guardar' }); this.guardando.set(false); }
    });
  }
}
