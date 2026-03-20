import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { ProyectoService } from  '../../../../core/services/proyecto.service';
import { GanttDto, GanttTareaDto, EstadoTarea } from  '../../../../shared/models/proyecto.models';

@Component({
  selector: 'app-gantt',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, ToastModule, TooltipModule],
  providers: [MessageService],
  template: `
<p-toast position="top-right" />
<div class="tab-section">
  <div class="tab-section-header">
    <div><h2 class="section-title">Diagrama Gantt</h2><p class="section-sub">Cronograma del proyecto</p></div>
    <div class="header-actions">
      <button class="btn-sm btn-ghost" (click)="capturarLineaBase()" pTooltip="Capturar línea base actual">
        <i class="pi pi-camera"></i> Línea Base
      </button>
      <button class="btn-sm btn-ghost" (click)="cargar()">
        <i class="pi pi-refresh" [class.spinning]="cargando()"></i> Actualizar
      </button>
    </div>
  </div>

  @if (cargando()) { <div class="loading-row"><i class="pi pi-spin pi-spinner"></i> Cargando Gantt...</div> }
  @else if (!gantt()) { <div class="empty-state"><i class="pi pi-calendar"></i><p>Sin datos de Gantt disponibles. Primero crea fases y tareas con fechas.</p></div> }
  @else {
    <!-- Leyenda -->
    <div class="gantt-legend">
      <span class="legend-item"><span class="dot plan"></span> Planificado</span>
      <span class="legend-item"><span class="dot real"></span> Real</span>
      <span class="legend-item"><span class="dot base"></span> Línea Base</span>
    </div>

    <!-- Cabecera de meses -->
    <div class="gantt-container">
      <div class="gantt-labels-col">
        <div class="gantt-col-header">Tarea</div>
      </div>
      <div class="gantt-chart-col" #chartCol>
        <div class="months-header">
          @for (mes of meses(); track mes.label) {
            <div class="month-cell" [style.width.px]="mes.width">{{ mes.label }}</div>
          }
        </div>

        @for (fase of gantt()!.fases; track fase.faseId) {
          <!-- Fila de Fase -->
          <div class="gantt-phase-row">
            <div class="gantt-labels-col fase-label">
              <i class="pi pi-sitemap"></i> {{ fase.faseNombre }}
              <span class="fase-pct">{{ fase.porcentajeAvance }}%</span>
            </div>
            <div class="gantt-bar-area">
              <div class="fase-bar"
                [style.left.%]="getLeft(fase.fechaInicio)"
                [style.width.%]="getWidth(fase.fechaInicio, fase.fechaFin)">
              </div>
            </div>
          </div>

          <!-- Filas de Tareas -->
          @for (tarea of fase.tareas; track tarea.tareaId) {
            <div class="gantt-task-row">
              <div class="gantt-labels-col task-label">
                <span class="task-dot estado-{{ getEstadoClass(tarea.estado) }}"></span>
                <span class="task-nombre" [title]="tarea.tareaNombre">{{ tarea.tareaNombre }}</span>
                <span class="task-pct">{{ tarea.porcentajeAvance }}%</span>
              </div>
              <div class="gantt-bar-area">
                @if (tarea.fechaInicioBase && tarea.fechaFinBase) {
                  <div class="bar-base"
                    [style.left.%]="getLeft(tarea.fechaInicioBase)"
                    [style.width.%]="getWidth(tarea.fechaInicioBase, tarea.fechaFinBase)">
                  </div>
                }
                @if (tarea.fechaInicioPlan && tarea.fechaFinPlan) {
                  <div class="bar-plan"
                    [style.left.%]="getLeft(tarea.fechaInicioPlan)"
                    [style.width.%]="getWidth(tarea.fechaInicioPlan, tarea.fechaFinPlan)"
                    [pTooltip]="tarea.tareaNombre + ' — Plan'">
                    <div class="bar-progress" [style.width.%]="tarea.porcentajeAvance"></div>
                  </div>
                }
                @if (tarea.fechaInicioReal && tarea.fechaFinReal) {
                  <div class="bar-real"
                    [style.left.%]="getLeft(tarea.fechaInicioReal)"
                    [style.width.%]="getWidth(tarea.fechaInicioReal, tarea.fechaFinReal)"
                    [pTooltip]="tarea.tareaNombre + ' — Real'">
                  </div>
                }
                <!-- Línea de hoy -->
                <div class="today-line" [style.left.%]="getTodayLeft()"></div>
              </div>
            </div>
          }
        }
      </div>
    </div>
  }
</div>
  `,
  styles: [`
.tab-section{display:flex;flex-direction:column;gap:1.25rem}
.tab-section-header{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem}
.section-title{margin:0;font-size:1rem;font-weight:700;color:var(--text)}
.section-sub{margin:.25rem 0 0;font-size:.8rem;color:var(--text-muted)}
.header-actions{display:flex;gap:.5rem}
.loading-row{padding:2rem;text-align:center;color:var(--text-muted);display:flex;align-items:center;justify-content:center;gap:.5rem}
.empty-state{text-align:center;padding:3rem;color:var(--text-muted);display:flex;flex-direction:column;align-items:center;gap:1rem}
.empty-state i{font-size:2.5rem;opacity:.4}
.gantt-legend{display:flex;gap:1.25rem}
.legend-item{display:flex;align-items:center;gap:.4rem;font-size:.78rem;color:var(--text-muted)}
.dot{width:12px;height:8px;border-radius:3px}
.dot.plan{background:var(--primary)}
.dot.real{background:#4ade80}
.dot.base{background:#fbbf24;opacity:.7}
.gantt-container{background:var(--surface);border:1px solid var(--border);border-radius:10px;overflow:auto}
.gantt-labels-col{width:220px;min-width:220px;padding:.45rem .75rem;border-right:1px solid var(--border);font-size:.8rem;display:flex;align-items:center;gap:.4rem;color:var(--text);flex-shrink:0}
.gantt-col-header{font-weight:600;color:var(--text-muted);background:var(--surface2);height:32px;line-height:32px}
.gantt-chart-col{flex:1;overflow-x:auto}
.months-header{display:flex;border-bottom:1px solid var(--border);background:var(--surface2)}
.month-cell{height:32px;line-height:32px;padding:0 .5rem;font-size:.75rem;color:var(--text-muted);font-weight:600;border-right:1px solid var(--border);white-space:nowrap}
.gantt-phase-row{display:flex;border-bottom:1px solid var(--border);background:var(--surface2)}
.fase-label{font-weight:600;font-size:.78rem;color:var(--text)}
.fase-pct{margin-left:auto;font-size:.72rem;color:var(--text-muted)}
.gantt-task-row{display:flex;border-bottom:1px solid var(--border)}
.gantt-task-row:hover{background:var(--surface2)}
.task-label{font-size:.78rem;color:var(--text-muted);gap:.3rem}
.task-nombre{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;max-width:160px}
.task-pct{margin-left:auto;font-size:.7rem;flex-shrink:0}
.task-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.estado-green{background:#4ade80}
.estado-blue{background:#60a5fa}
.estado-gray{background:#94a3b8}
.estado-yellow{background:#fbbf24}
.estado-red{background:#f87171}
.gantt-bar-area{flex:1;position:relative;height:32px;min-width:600px}
.fase-bar{position:absolute;top:8px;height:16px;background:rgba(59,130,246,.25);border:1px solid rgba(59,130,246,.5);border-radius:4px}
.bar-base{position:absolute;top:14px;height:4px;background:#fbbf24;opacity:.6;border-radius:2px}
.bar-plan{position:absolute;top:6px;height:14px;background:var(--primary);border-radius:4px;overflow:hidden;min-width:4px}
.bar-progress{height:100%;background:rgba(255,255,255,.3);border-radius:4px}
.bar-real{position:absolute;top:21px;height:6px;background:#4ade80;border-radius:3px;min-width:4px}
.today-line{position:absolute;top:0;bottom:0;width:2px;background:rgba(239,68,68,.6);z-index:2}
.btn-sm{display:flex;align-items:center;gap:.4rem;padding:.4rem .85rem;border-radius:8px;font-size:.82rem;font-weight:500;cursor:pointer;transition:all .2s}
.btn-ghost{background:transparent;border:1px solid var(--border);color:var(--text-soft)}
.btn-ghost:hover{border-color:var(--primary);color:var(--primary)}
.spinning{animation:spin 1s linear infinite}
@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
  `]
})
export class GanttComponent implements OnInit {
  private readonly route   = inject(ActivatedRoute);
  private readonly service = inject(ProyectoService);
  private readonly toast   = inject(MessageService);

  readonly gantt    = signal<GanttDto | null>(null);
  readonly cargando = signal(true);
  proyectoId = 0;

  private inicio = new Date();
  private fin    = new Date();
  private totalDias = 1;

  readonly meses = computed(() => {
    if (!this.gantt()) return [];
    const meses: { label: string; width: number }[] = [];
    const cur = new Date(this.inicio);
    cur.setDate(1);
    while (cur <= this.fin) {
      const label = cur.toLocaleDateString('es', { month: 'short', year: '2-digit' });
      const diasEnMes = new Date(cur.getFullYear(), cur.getMonth() + 1, 0).getDate();
      const pct = (diasEnMes / this.totalDias) * 100;
      meses.push({ label, width: Math.max(pct * 6, 60) });
      cur.setMonth(cur.getMonth() + 1);
    }
    return meses;
  });

  ngOnInit(): void {
    this.proyectoId = Number(this.route.parent!.snapshot.paramMap.get('id'));
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.service.getGantt(this.proyectoId).subscribe({
      next: g => {
        this.gantt.set(g);
        this.inicio = new Date(g.fechaInicio);
        this.fin    = new Date(g.fechaFin);
        this.totalDias = Math.max(1, (this.fin.getTime() - this.inicio.getTime()) / 86400000);
        this.cargando.set(false);
      },
      error: () => { this.gantt.set(null); this.cargando.set(false); }
    });
  }

  getLeft(fecha: string): number {
    if (!fecha) return 0;
    const d = new Date(fecha);
    const dias = (d.getTime() - this.inicio.getTime()) / 86400000;
    return Math.max(0, (dias / this.totalDias) * 100);
  }

  getWidth(inicio: string, fin: string): number {
    if (!inicio || !fin) return 0;
    const dias = (new Date(fin).getTime() - new Date(inicio).getTime()) / 86400000;
    return Math.max(0.5, (dias / this.totalDias) * 100);
  }

  getTodayLeft(): number {
    const hoy = new Date();
    const dias = (hoy.getTime() - this.inicio.getTime()) / 86400000;
    return Math.max(0, Math.min(100, (dias / this.totalDias) * 100));
  }

  capturarLineaBase(): void {
    this.service.capturarLineaBase(this.proyectoId).subscribe({
      next: () => { this.toast.add({ severity: 'success', summary: 'OK', detail: 'Línea base capturada' }); this.cargar(); },
      error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo capturar' })
    });
  }

  getEstadoClass(e: EstadoTarea): string {
    const m: Record<EstadoTarea, string> = { [EstadoTarea.Pendiente]: 'gray', [EstadoTarea.EnCurso]: 'blue', [EstadoTarea.Completada]: 'green', [EstadoTarea.Bloqueada]: 'yellow', [EstadoTarea.Cancelada]: 'red' };
    return m[e] ?? 'gray';
  }
}
