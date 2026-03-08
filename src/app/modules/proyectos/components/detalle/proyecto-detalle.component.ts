import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { ProyectoService } from '../../services/proyecto.service';
import { ProyectoDto, ESTADO_LABELS, EstadoProyecto } from '../../models/proyecto.models';

@Component({
  selector: 'app-proyecto-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, ButtonModule, ToastModule, TooltipModule],
  providers: [MessageService],
  template: `
<p-toast position="top-right" />

@if (cargando()) {
  <div class="loading-wrap"><i class="pi pi-spin pi-spinner"></i><span>Cargando proyecto...</span></div>
} @else if (proyecto()) {
  <div class="detalle-layout">

    <!-- Header del proyecto -->
    <div class="detalle-header">
      <div class="header-left">
        <button class="btn-back" (click)="volver()" pTooltip="Volver a lista">
          <i class="pi pi-arrow-left"></i>
        </button>
        <div class="header-info">
          <div class="header-top">
            <span class="proyecto-codigo">{{ proyecto()!.codigo }}</span>
            <span class="badge estado-{{ getEstadoClass(proyecto()!.estado) }}">
              {{ ESTADO_LABELS[proyecto()!.estado] }}
            </span>
          </div>
          <h1 class="proyecto-nombre">{{ proyecto()!.nombre }}</h1>
          @if (proyecto()!.descripcion) {
            <p class="proyecto-desc">{{ proyecto()!.descripcion }}</p>
          }
        </div>
      </div>
      <div class="header-right">
        <div class="avance-wrap">
          <span class="avance-label">Avance Real</span>
          <div class="avance-bar">
            <div class="avance-fill" [style.width.%]="proyecto()!.porcentajeAvanceReal"></div>
          </div>
          <span class="avance-pct">{{ proyecto()!.porcentajeAvanceReal | number:'1.0-1' }}%</span>
        </div>
        <div class="header-meta">
          <span class="meta-item"><i class="pi pi-calendar"></i> {{ proyecto()!.fechaInicioPlan | date:'dd/MM/yy' }} → {{ proyecto()!.fechaFinPlan | date:'dd/MM/yy' }}</span>
          @if (proyecto()!.gerenteProyectoNombre) {
            <span class="meta-item"><i class="pi pi-user"></i> {{ proyecto()!.gerenteProyectoNombre }}</span>
          }
          <span class="meta-item"><i class="pi pi-dollar"></i> {{ proyecto()!.presupuestoTotal | currency:'USD':'symbol':'1.0-0' }}</span>
        </div>
        <div class="header-actions">
          <a [routerLink]="['../dashboard']" class="btn-sm btn-secondary">
            <i class="pi pi-chart-bar"></i> Dashboard
          </a>
        </div>
      </div>
    </div>

    <!-- Tabs de navegación -->
    <nav class="detalle-tabs">
      @for (tab of tabs; track tab.path) {
        <a class="tab-item" [routerLink]="[tab.path]" routerLinkActive="active">
          <i class="{{ tab.icon }}"></i>
          <span>{{ tab.label }}</span>
        </a>
      }
    </nav>

    <!-- Contenido de cada tab -->
    <div class="detalle-content">
      <router-outlet />
    </div>

  </div>
}
  `,
  styles: [`
.loading-wrap { display:flex; align-items:center; gap:.75rem; padding:2rem; color:var(--text-muted); }
.detalle-layout { display:flex; flex-direction:column; gap:0; height:100%; }
.detalle-header { background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:1.25rem 1.5rem; display:flex; align-items:flex-start; justify-content:space-between; gap:1.5rem; margin-bottom:1rem; }
.header-left { display:flex; align-items:flex-start; gap:1rem; }
.btn-back { width:36px; height:36px; border:1px solid var(--border); border-radius:8px; background:transparent; color:var(--text-muted); cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .2s; flex-shrink:0; margin-top:4px; }
.btn-back:hover { background:var(--primary-bg); color:var(--primary); border-color:var(--primary); }
.header-top { display:flex; align-items:center; gap:.75rem; margin-bottom:.25rem; }
.proyecto-codigo { font-family:'Courier New',monospace; font-size:.8rem; background:var(--surface2); border:1px solid var(--border); border-radius:6px; padding:2px 8px; color:var(--text-muted); }
.proyecto-nombre { margin:0 0 .25rem; font-size:1.25rem; font-weight:700; color:var(--text); }
.proyecto-desc { margin:0; font-size:.85rem; color:var(--text-muted); max-width:400px; }
.header-right { display:flex; flex-direction:column; align-items:flex-end; gap:.75rem; }
.avance-wrap { display:flex; align-items:center; gap:.6rem; }
.avance-label { font-size:.78rem; color:var(--text-muted); }
.avance-bar { width:120px; height:6px; background:var(--border); border-radius:3px; overflow:hidden; }
.avance-fill { height:100%; background:var(--primary); border-radius:3px; transition:width .4s; }
.avance-pct { font-size:.85rem; font-weight:600; color:var(--text); min-width:36px; text-align:right; }
.header-meta { display:flex; gap:1rem; flex-wrap:wrap; justify-content:flex-end; }
.meta-item { display:flex; align-items:center; gap:.35rem; font-size:.8rem; color:var(--text-muted); }
.meta-item i { font-size:.75rem; }
.header-actions { display:flex; gap:.5rem; }
.btn-sm { display:flex; align-items:center; gap:.4rem; padding:.4rem .9rem; border-radius:8px; font-size:.82rem; font-weight:500; text-decoration:none; cursor:pointer; transition:all .2s; }
.btn-secondary { background:var(--surface2); border:1px solid var(--border); color:var(--text-soft); }
.btn-secondary:hover { border-color:var(--primary); color:var(--primary); }
.badge { padding:3px 10px; border-radius:20px; font-size:.75rem; font-weight:600; }
.estado-blue   { background:rgba(59,130,246,.15); color:#60a5fa; }
.estado-green  { background:rgba(34,197,94,.15);  color:#4ade80; }
.estado-yellow { background:rgba(250,204,21,.15);  color:#fbbf24; }
.estado-gray   { background:rgba(148,163,184,.15); color:#94a3b8; }
.estado-red    { background:rgba(239,68,68,.15);   color:#f87171; }
.estado-teal   { background:rgba(20,184,166,.15);  color:#2dd4bf; }
.detalle-tabs { display:flex; gap:.25rem; background:var(--surface); border:1px solid var(--border); border-radius:10px; padding:.4rem; overflow-x:auto; margin-bottom:1rem; }
.tab-item { display:flex; align-items:center; gap:.4rem; padding:.5rem 1rem; border-radius:7px; text-decoration:none; color:var(--text-muted); font-size:.84rem; font-weight:500; white-space:nowrap; transition:all .2s; }
.tab-item i { font-size:.85rem; }
.tab-item:hover { background:var(--surface2); color:var(--text); }
.tab-item.active { background:var(--primary-bg); color:var(--primary); }
.detalle-content { flex:1; }
  `]
})
export class ProyectoDetalleComponent implements OnInit {
  private readonly route   = inject(ActivatedRoute);
  private readonly router  = inject(Router);
  private readonly service = inject(ProyectoService);
  private readonly toast   = inject(MessageService);

  readonly cargando   = signal(true);
  readonly proyecto   = signal<ProyectoDto | null>(null);
  readonly proyectoId = signal(0);

  readonly ESTADO_LABELS = ESTADO_LABELS;
  readonly EstadoProyecto = EstadoProyecto;

  readonly tabs = [
    { path: 'fases',      label: 'Fases',        icon: 'pi pi-sitemap' },
    { path: 'hitos',      label: 'Hitos',        icon: 'pi pi-flag' },
    { path: 'wbs',        label: 'WBS',          icon: 'pi pi-list-check' },
    { path: 'tareas',     label: 'Tareas',       icon: 'pi pi-check-square' },
    { path: 'cuadrillas', label: 'Cuadrillas',   icon: 'pi pi-users' },
    { path: 'presupuesto',label: 'Presupuesto',  icon: 'pi pi-wallet' },
    { path: 'gantt',      label: 'Gantt',        icon: 'pi pi-calendar' },
    { path: 'ordenes',    label: 'Órd. Trabajo', icon: 'pi pi-wrench' },
    { path: 'reportes',   label: 'Reportes',     icon: 'pi pi-file-pdf' },
    { path: 'kpis',       label: 'KPIs',         icon: 'pi pi-chart-line' },
  ];

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.proyectoId.set(id);
    this.service.getById(id).subscribe({
      next: p => { this.proyecto.set(p); this.cargando.set(false); },
      error: () => { this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el proyecto' }); this.cargando.set(false); }
    });
  }

  volver(): void { this.router.navigate(['/proyectos/lista']); }

  getEstadoClass(estado: EstadoProyecto): string {
    const m: Record<EstadoProyecto, string> = {
      [EstadoProyecto.Borrador]: 'gray', [EstadoProyecto.Planificado]: 'blue',
      [EstadoProyecto.EnEjecucion]: 'green', [EstadoProyecto.EnPausa]: 'yellow',
      [EstadoProyecto.Completado]: 'teal', [EstadoProyecto.Cancelado]: 'red',
    };
    return m[estado] ?? 'gray';
  }
}
