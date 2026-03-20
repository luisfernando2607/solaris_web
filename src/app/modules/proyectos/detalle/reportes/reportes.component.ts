import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProyectoService } from '../../../../core/services/proyecto.service';
import { ReporteAvanceDto, CrearReporteRequest } from  '../../../../shared/models/proyecto.models';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, ToastModule],
  providers: [MessageService],
  template: `
<p-toast position="top-right" />
<div class="tab-section">
  <div class="tab-section-header">
    <div><h2 class="section-title">Reportes de Avance</h2><p class="section-sub">{{ reportes().length }} reportes</p></div>
    <p-button label="Nuevo reporte" icon="pi pi-plus" size="small" (onClick)="panelVisible.set(true)" />
  </div>
  @if (cargando()) { <div class="loading-row"><i class="pi pi-spin pi-spinner"></i> Cargando...</div> }
  @else if (reportes().length === 0) { <div class="empty-state"><i class="pi pi-file-pdf"></i><p>Sin reportes de avance.</p></div> }
  @else {
    <div class="reportes-list">
      @for (r of reportes(); track r.id) {
        <div class="reporte-card">
          <div class="reporte-header">
            <div class="reporte-fecha">{{ r.fechaReporte | date:'dd/MM/yyyy' }}</div>
            <h3 class="reporte-titulo">{{ r.titulo }}</h3>
          </div>
          <div class="reporte-kpis">
            <div class="kpi-item">
              <span class="kpi-label">Avance General</span>
              <div class="kpi-bar"><div class="kpi-fill" [style.width.%]="r.avanceGeneral"></div></div>
              <span class="kpi-val">{{ r.avanceGeneral }}%</span>
            </div>
            <div class="kpi-item">
              <span class="kpi-label">Avance Costo</span>
              <div class="kpi-bar"><div class="kpi-fill cost" [style.width.%]="r.avanceCosto"></div></div>
              <span class="kpi-val">{{ r.avanceCosto }}%</span>
            </div>
          </div>
          @if (r.observaciones) { <p class="reporte-obs">{{ r.observaciones }}</p> }
          @if (r.fotos.length) {
            <div class="fotos-row">
              @for (f of r.fotos.slice(0,4); track f.id) {
                <div class="foto-thumb" [title]="f.descripcion ?? f.nombreArchivo">
                  <i class="pi pi-image"></i>
                </div>
              }
              @if (r.fotos.length > 4) { <div class="foto-more">+{{ r.fotos.length - 4 }}</div> }
            </div>
          }
        </div>
      }
    </div>
  }
</div>

@if (panelVisible()) {
  <div class="side-panel-overlay" (click)="panelVisible.set(false)"></div>
  <div class="side-panel">
    <div class="panel-header"><h3>Nuevo Reporte de Avance</h3><button class="panel-close" (click)="panelVisible.set(false)"><i class="pi pi-times"></i></button></div>
    <div class="panel-body">
      <div class="form-group"><label>Título *</label><input type="text" class="form-input" [(ngModel)]="form.titulo" /></div>
      <div class="form-group"><label>Fecha Reporte</label><input type="date" class="form-input" [(ngModel)]="form.fechaReporte" /></div>
      <div class="form-row">
        <div class="form-group"><label>% Avance Plan</label><input type="number" class="form-input" [(ngModel)]="form.porcentajeAvancePlan" min="0" max="100" /></div>
        <div class="form-group"><label>% Avance Real</label><input type="number" class="form-input" [(ngModel)]="form.porcentajeAvanceReal" min="0" max="100" /></div>
      </div>
      <div class="form-group"><label>Observaciones</label><textarea class="form-input" [(ngModel)]="form.observaciones" rows="3"></textarea></div>
    </div>
    <div class="panel-footer">
      <button class="btn btn-ghost" (click)="panelVisible.set(false)">Cancelar</button>
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
.reportes-list{display:flex;flex-direction:column;gap:.85rem}
.reporte-card{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:1.1rem;display:flex;flex-direction:column;gap:.75rem}
.reporte-header{display:flex;align-items:flex-start;gap:1rem}
.reporte-fecha{font-size:.78rem;color:var(--text-muted);background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:2px 9px;white-space:nowrap}
.reporte-titulo{margin:0;font-size:.95rem;font-weight:600;color:var(--text)}
.reporte-kpis{display:flex;flex-direction:column;gap:.5rem}
.kpi-item{display:flex;align-items:center;gap:.6rem}
.kpi-label{font-size:.76rem;color:var(--text-muted);min-width:100px}
.kpi-bar{flex:1;height:6px;background:var(--border);border-radius:3px;overflow:hidden}
.kpi-fill{height:100%;background:var(--primary);border-radius:3px;transition:width .4s}
.kpi-fill.cost{background:#4ade80}
.kpi-val{font-size:.78rem;font-weight:600;color:var(--text);min-width:32px;text-align:right}
.reporte-obs{margin:0;font-size:.82rem;color:var(--text-muted);font-style:italic}
.fotos-row{display:flex;gap:.5rem}
.foto-thumb{width:42px;height:42px;background:var(--surface2);border:1px solid var(--border);border-radius:7px;display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:.9rem}
.foto-more{width:42px;height:42px;background:var(--surface2);border:1px dashed var(--border);border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:.75rem;color:var(--text-muted)}
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
.btn{padding:.5rem 1.25rem;border-radius:8px;font-size:.88rem;font-weight:500;cursor:pointer;display:flex;align-items:center;gap:.4rem;border:none}
.btn-primary{background:var(--primary);color:#fff}.btn-primary:disabled{opacity:.6;cursor:not-allowed}
.btn-ghost{background:transparent;border:1px solid var(--border);color:var(--text-soft)}
  `]
})
export class ReportesComponent implements OnInit {
  private readonly route   = inject(ActivatedRoute);
  private readonly service = inject(ProyectoService);
  private readonly toast   = inject(MessageService);

  readonly reportes     = signal<ReporteAvanceDto[]>([]);
  readonly cargando     = signal(true);
  readonly panelVisible = signal(false);
  readonly guardando    = signal(false);
  proyectoId = 0;

  form: Partial<CrearReporteRequest> = {
    porcentajeAvancePlan: 0, porcentajeAvanceReal: 0,
    fechaReporte: new Date().toISOString().split('T')[0]
  };

  ngOnInit(): void {
    this.proyectoId = Number(this.route.parent!.snapshot.paramMap.get('id'));
    this.cargar();
  }
  cargar(): void {
    this.cargando.set(true);
    this.service.getReportes(this.proyectoId).subscribe({ next: r => { this.reportes.set(r); this.cargando.set(false); }, error: () => this.cargando.set(false) });
  }
  guardar(): void {
    if (!this.form.titulo) { this.toast.add({ severity: 'warn', summary: 'Requerido', detail: 'El título es obligatorio' }); return; }
    this.guardando.set(true);
    this.service.crearReporte(this.proyectoId, { ...this.form, proyectoId: this.proyectoId } as CrearReporteRequest).subscribe({
      next: () => { this.toast.add({ severity: 'success', summary: 'OK', detail: 'Reporte creado' }); this.panelVisible.set(false); this.cargar(); this.guardando.set(false); },
      error: () => { this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear' }); this.guardando.set(false); }
    });
  }
}