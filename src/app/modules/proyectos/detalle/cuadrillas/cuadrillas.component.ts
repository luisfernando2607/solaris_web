import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProyectoService } from '../../../../core/services/proyecto.service';
import { CuadrillaDto, CrearCuadrillaRequest, ActualizarCuadrillaRequest } from '../../../../shared/models/proyecto.models';

@Component({
  selector: 'app-cuadrillas',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, ToastModule, TooltipModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  template: `
<p-toast position="top-right" />
<p-confirmDialog />
<div class="tab-section">
  <div class="tab-section-header">
    <div><h2 class="section-title">Cuadrillas de Trabajo</h2><p class="section-sub">{{ cuadrillas().length }} cuadrillas</p></div>
    <p-button label="Nueva cuadrilla" icon="pi pi-plus" size="small" (onClick)="abrirCrear()" />
  </div>
  @if (cargando()) { <div class="loading-row"><i class="pi pi-spin pi-spinner"></i> Cargando...</div> }
  @else if (cuadrillas().length === 0) { <div class="empty-state"><i class="pi pi-users"></i><p>Sin cuadrillas definidas.</p></div> }
  @else {
    <div class="cuadrillas-grid">
      @for (c of cuadrillas(); track c.id) {
        <div class="cuadrilla-card">
          <div class="card-header">
            <div class="card-title-wrap">
              <h3 class="card-nombre">{{ c.nombre }}</h3>
              @if (c.descripcion) { <p class="card-desc">{{ c.descripcion }}</p> }
            </div>
            <div class="card-actions">
              <button class="icon-btn" (click)="editar(c)" pTooltip="Editar"><i class="pi pi-pencil"></i></button>
              <button class="icon-btn danger" (click)="confirmarEliminar(c)" pTooltip="Eliminar"><i class="pi pi-trash"></i></button>
            </div>
          </div>
          <div class="card-meta">
            @if (c.liderNombre) { <span class="meta-chip"><i class="pi pi-star"></i> {{ c.liderNombre }}</span> }
            <span class="meta-chip"><i class="pi pi-users"></i> Cap. máx: {{ c.capacidadMaxima }}</span>
            <span class="meta-chip"><i class="pi pi-user-plus"></i> {{ c.miembros.length }} miembros</span>
          </div>
          @if (c.miembros.length) {
            <div class="miembros-list">
              @for (m of c.miembros; track m.id) {
                <div class="miembro-row">
                  <div class="miembro-avatar">{{ m.empleadoNombre.charAt(0).toUpperCase() }}</div>
                  <div class="miembro-info">
                    <span class="miembro-nombre">{{ m.empleadoNombre }}</span>
                    @if (m.rol) { <span class="miembro-rol">{{ m.rol }}</span> }
                  </div>
                  <span class="miembro-fecha">{{ m.fechaIngreso | date:'dd/MM/yy' }}</span>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  }
</div>

@if (panelVisible()) {
  <div class="side-panel-overlay" (click)="cerrar()"></div>
  <div class="side-panel">
    <div class="panel-header"><h3>{{ editando() ? 'Editar Cuadrilla' : 'Nueva Cuadrilla' }}</h3><button class="panel-close" (click)="cerrar()"><i class="pi pi-times"></i></button></div>
    <div class="panel-body">
      <div class="form-group"><label>Nombre *</label><input type="text" class="form-input" [(ngModel)]="form.nombre" /></div>
      <div class="form-group"><label>Descripción</label><textarea class="form-input" [(ngModel)]="form.descripcion" rows="2"></textarea></div>
      <div class="form-group"><label>Capacidad Máxima</label><input type="number" class="form-input" [(ngModel)]="form.capacidadMax" min="1" /></div>
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
.cuadrillas-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:1rem}
.cuadrilla-card{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:1.1rem;display:flex;flex-direction:column;gap:.85rem}
.card-header{display:flex;align-items:flex-start;justify-content:space-between;gap:.75rem}
.card-nombre{margin:0;font-size:.95rem;font-weight:700;color:var(--text)}
.card-desc{margin:.2rem 0 0;font-size:.78rem;color:var(--text-muted)}
.card-actions{display:flex;gap:.25rem;flex-shrink:0}
.card-meta{display:flex;gap:.5rem;flex-wrap:wrap}
.meta-chip{display:flex;align-items:center;gap:.3rem;font-size:.76rem;color:var(--text-muted);background:var(--surface2);border:1px solid var(--border);border-radius:12px;padding:2px 9px}
.miembros-list{display:flex;flex-direction:column;gap:.4rem;border-top:1px solid var(--border);padding-top:.75rem}
.miembro-row{display:flex;align-items:center;gap:.65rem}
.miembro-avatar{width:28px;height:28px;border-radius:50%;background:var(--primary-bg);color:var(--primary);display:flex;align-items:center;justify-content:center;font-size:.78rem;font-weight:700;flex-shrink:0}
.miembro-info{flex:1;display:flex;flex-direction:column}
.miembro-nombre{font-size:.84rem;font-weight:500;color:var(--text)}
.miembro-rol{font-size:.74rem;color:var(--text-muted)}
.miembro-fecha{font-size:.74rem;color:var(--text-muted)}
.icon-btn{width:28px;height:28px;border:1px solid var(--border);border-radius:6px;background:transparent;color:var(--text-muted);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:.75rem;transition:all .2s}
.icon-btn:hover{background:var(--primary-bg);color:var(--primary);border-color:var(--primary)}
.icon-btn.danger:hover{background:rgba(239,68,68,.1);color:#f87171;border-color:#f87171}
.side-panel-overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:40}
.side-panel{position:fixed;right:0;top:0;bottom:0;width:400px;background:var(--surface);border-left:1px solid var(--border);z-index:50;display:flex;flex-direction:column;box-shadow:-8px 0 24px rgba(0,0,0,.3)}
.panel-header{display:flex;align-items:center;justify-content:space-between;padding:1.25rem 1.5rem;border-bottom:1px solid var(--border)}
.panel-header h3{margin:0;font-size:1rem;font-weight:700;color:var(--text)}
.panel-close{background:transparent;border:none;color:var(--text-muted);cursor:pointer;font-size:1rem;padding:.25rem}
.panel-body{flex:1;overflow-y:auto;padding:1.5rem;display:flex;flex-direction:column;gap:1rem}
.panel-footer{padding:1rem 1.5rem;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:.75rem}
.form-group{display:flex;flex-direction:column;gap:.4rem}
.form-group label{font-size:.82rem;font-weight:500;color:var(--text-soft)}
.form-input{background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:.55rem .8rem;color:var(--text);font-size:.9rem;width:100%;outline:none}
.form-input:focus{border-color:var(--primary)}
.btn{padding:.5rem 1.25rem;border-radius:8px;font-size:.88rem;font-weight:500;cursor:pointer;display:flex;align-items:center;gap:.4rem;border:none}
.btn-primary{background:var(--primary);color:#fff}.btn-primary:disabled{opacity:.6;cursor:not-allowed}
.btn-ghost{background:transparent;border:1px solid var(--border);color:var(--text-soft)}
  `]
})
export class CuadrillasComponent implements OnInit {
  private readonly route   = inject(ActivatedRoute);
  private readonly service = inject(ProyectoService);
  private readonly toast   = inject(MessageService);
  private readonly confirm = inject(ConfirmationService);

  readonly cuadrillas   = signal<CuadrillaDto[]>([]);
  readonly cargando     = signal(true);
  readonly panelVisible = signal(false);
  readonly editando     = signal(false);
  readonly guardando    = signal(false);
  proyectoId = 0;
  cuadrillaEditar: CuadrillaDto | null = null;
  form: Partial<CrearCuadrillaRequest> = { capacidadMax: 5 };

  ngOnInit(): void {
    this.proyectoId = Number(this.route.parent!.snapshot.paramMap.get('id'));
    this.cargar();
  }
  cargar(): void {
    this.cargando.set(true);
    this.service.getCuadrillas(this.proyectoId).subscribe({ next: c => { this.cuadrillas.set(c); this.cargando.set(false); }, error: () => this.cargando.set(false) });
  }
  abrirCrear(): void { this.editando.set(false); this.form = { proyectoId: this.proyectoId, capacidadMax: 5 }; this.panelVisible.set(true); }
  editar(c: CuadrillaDto): void { this.editando.set(true); this.cuadrillaEditar = c; this.form = { proyectoId: this.proyectoId, nombre: c.nombre, descripcion: c.descripcion, capacidadMax: c.capacidadMaxima }; this.panelVisible.set(true); }
  guardar(): void {
    if (!this.form.nombre) { this.toast.add({ severity: 'warn', summary: 'Requerido', detail: 'El nombre es obligatorio' }); return; }
    this.guardando.set(true);
    const obs = this.editando() && this.cuadrillaEditar
      ? this.service.actualizarCuadrilla(this.proyectoId, this.cuadrillaEditar.id, this.form as ActualizarCuadrillaRequest)
      : this.service.crearCuadrilla(this.proyectoId, this.form as CrearCuadrillaRequest);
    obs.subscribe({ next: () => { this.toast.add({ severity: 'success', summary: 'OK', detail: 'Cuadrilla guardada' }); this.cerrar(); this.cargar(); this.guardando.set(false); }, error: () => { this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar' }); this.guardando.set(false); } });
  }
  confirmarEliminar(c: CuadrillaDto): void {
    this.confirm.confirm({ message: `¿Eliminar la cuadrilla "${c.nombre}"?`, header: 'Confirmar', icon: 'pi pi-exclamation-triangle', acceptLabel: 'Eliminar', rejectLabel: 'Cancelar', accept: () => this.service.eliminarCuadrilla(this.proyectoId, c.id).subscribe({ next: () => { this.toast.add({ severity: 'success', summary: 'OK', detail: 'Cuadrilla eliminada' }); this.cargar(); }, error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar' }) }) });
  }
  cerrar(): void { this.panelVisible.set(false); }
}
