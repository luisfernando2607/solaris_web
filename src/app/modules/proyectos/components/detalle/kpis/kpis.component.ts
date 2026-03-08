import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { ProyectoService } from '../../../services/proyecto.service';
import {
  KpiProyectoDto, AlertaProyectoDto,
  TipoKpi, SeveridadAlerta
} from '../../../models/proyecto.models';

@Component({
  selector: 'app-kpis',
  standalone: true,
  imports: [CommonModule, ButtonModule, ToastModule, TooltipModule],
  providers: [MessageService],
  template: `
<p-toast position="top-right" />
<div class="tab-section">

  <!-- KPIs -->
  <div class="section-block">
    <div class="tab-section-header">
      <div><h2 class="section-title">KPIs del Proyecto</h2><p class="section-sub">Métricas de Valor Ganado (EVM)</p></div>
      <p-button label="Recalcular" icon="pi pi-refresh" size="small" (onClick)="calcularKpis()" [loading]="calculando()" />
    </div>

    @if (cargandoKpis()) { <div class="loading-row"><i class="pi pi-spin pi-spinner"></i> Cargando KPIs...</div> }
    @else if (kpis().length === 0) { <div class="empty-state-mini">Sin KPIs calculados. Haz clic en "Recalcular".</div> }
    @else {
      <div class="kpis-grid">
        @for (kpi of kpisOrdenados(); track kpi.id) {
          <div class="kpi-card kpi-{{ kpi.semaforo }}">
            <div class="kpi-card-header">
              <span class="kpi-nombre">{{ kpi.nombre }}</span>
              <div class="kpi-semaforo kpi-dot-{{ kpi.semaforo }}"></div>
            </div>
            <div class="kpi-valor">{{ formatKpi(kpi) }}</div>
            @if (kpi.valorMeta !== undefined && kpi.valorMeta !== null) {
              <div class="kpi-meta">Meta: {{ formatKpiMeta(kpi) }}</div>
            }
            <div class="kpi-fecha">Calculado: {{ kpi.fechaCalculo | date:'dd/MM/yy HH:mm' }}</div>
          </div>
        }
      </div>
    }
  </div>

  <!-- Alertas -->
  <div class="section-block">
    <div class="tab-section-header">
      <div><h2 class="section-title">Alertas del Proyecto</h2><p class="section-sub">{{ alertasNoLeidas() }} sin leer</p></div>
      @if (alertasNoLeidas() > 0) {
        <button class="btn-sm btn-ghost" (click)="marcarTodasLeidas()"><i class="pi pi-check-circle"></i> Marcar todas leídas</button>
      }
    </div>

    @if (cargandoAlertas()) { <div class="loading-row"><i class="pi pi-spin pi-spinner"></i> Cargando alertas...</div> }
    @else if (alertas().length === 0) { <div class="empty-state-mini"><i class="pi pi-bell-slash"></i> Sin alertas activas.</div> }
    @else {
      <div class="alertas-list">
        @for (a of alertas(); track a.id) {
          <div class="alerta-row" [class.leida]="a.leida" [class.critica]="a.severidad === SeveridadAlerta.Critica">
            <div class="alerta-icon sev-{{ getSeveridadClass(a.severidad) }}">
              <i class="pi" [class.pi-exclamation-circle]="a.severidad === SeveridadAlerta.Critica" [class.pi-exclamation-triangle]="a.severidad === SeveridadAlerta.Warning" [class.pi-info-circle]="a.severidad === SeveridadAlerta.Info"></i>
            </div>
            <div class="alerta-body">
              <div class="alerta-titulo">{{ a.titulo }}</div>
              <div class="alerta-msg">{{ a.mensaje }}</div>
              <div class="alerta-fecha">{{ a.fechaAlerta | date:'dd/MM/yy HH:mm' }}</div>
            </div>
            @if (!a.leida) {
              <button class="icon-btn sm" (click)="marcarLeida(a)" pTooltip="Marcar leída">
                <i class="pi pi-eye"></i>
              </button>
            }
          </div>
        }
      </div>
    }
  </div>

</div>
  `,
  styles: [`
.tab-section{display:flex;flex-direction:column;gap:2rem}
.section-block{display:flex;flex-direction:column;gap:1rem}
.tab-section-header{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem}
.section-title{margin:0;font-size:1rem;font-weight:700;color:var(--text)}
.section-sub{margin:.25rem 0 0;font-size:.8rem;color:var(--text-muted)}
.loading-row{padding:1.5rem;text-align:center;color:var(--text-muted);display:flex;align-items:center;justify-content:center;gap:.5rem}
.empty-state-mini{padding:1.5rem;text-align:center;color:var(--text-muted);font-size:.85rem;display:flex;align-items:center;justify-content:center;gap:.5rem}
.kpis-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:1rem}
.kpi-card{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:1rem;display:flex;flex-direction:column;gap:.4rem;position:relative;overflow:hidden}
.kpi-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px}
.kpi-card.kpi-verde::before{background:#4ade80}
.kpi-card.kpi-amarillo::before{background:#fbbf24}
.kpi-card.kpi-rojo::before{background:#f87171}
.kpi-card-header{display:flex;align-items:center;justify-content:space-between}
.kpi-nombre{font-size:.78rem;font-weight:600;color:var(--text-muted)}
.kpi-semaforo{width:8px;height:8px;border-radius:50%}
.kpi-dot-verde{background:#4ade80}
.kpi-dot-amarillo{background:#fbbf24}
.kpi-dot-rojo{background:#f87171}
.kpi-valor{font-size:1.65rem;font-weight:800;color:var(--text);line-height:1}
.kpi-meta{font-size:.72rem;color:var(--text-muted)}
.kpi-fecha{font-size:.68rem;color:var(--text-muted);opacity:.7}
.alertas-list{display:flex;flex-direction:column;gap:.5rem}
.alerta-row{display:flex;align-items:flex-start;gap:.85rem;background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:.85rem 1rem;transition:all .2s}
.alerta-row.leida{opacity:.55}
.alerta-row.critica{border-color:rgba(239,68,68,.3);background:rgba(239,68,68,.03)}
.alerta-icon{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0}
.sev-red{background:rgba(239,68,68,.12);color:#f87171}
.sev-yellow{background:rgba(250,204,21,.12);color:#fbbf24}
.sev-blue{background:rgba(59,130,246,.12);color:#60a5fa}
.alerta-body{flex:1;display:flex;flex-direction:column;gap:.2rem}
.alerta-titulo{font-weight:600;font-size:.88rem;color:var(--text)}
.alerta-msg{font-size:.8rem;color:var(--text-muted)}
.alerta-fecha{font-size:.72rem;color:var(--text-muted);opacity:.7}
.icon-btn{width:28px;height:28px;border:1px solid var(--border);border-radius:6px;background:transparent;color:var(--text-muted);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s}
.icon-btn.sm{width:24px;height:24px;font-size:.7rem}
.icon-btn:hover{background:var(--primary-bg);color:var(--primary);border-color:var(--primary)}
.btn-sm{display:flex;align-items:center;gap:.4rem;padding:.4rem .85rem;border-radius:8px;font-size:.82rem;font-weight:500;cursor:pointer;transition:all .2s}
.btn-ghost{background:transparent;border:1px solid var(--border);color:var(--text-soft)}
.btn-ghost:hover{border-color:var(--primary);color:var(--primary)}
  `]
})
export class KpisComponent implements OnInit {
  private readonly route   = inject(ActivatedRoute);
  private readonly service = inject(ProyectoService);
  private readonly toast   = inject(MessageService);

  readonly kpis           = signal<KpiProyectoDto[]>([]);
  readonly alertas        = signal<AlertaProyectoDto[]>([]);
  readonly cargandoKpis   = signal(true);
  readonly cargandoAlertas = signal(true);
  readonly calculando     = signal(false);
  proyectoId = 0;

  readonly SeveridadAlerta = SeveridadAlerta;

  readonly alertasNoLeidas = computed(() => this.alertas().filter(a => !a.leida).length);

  readonly kpisOrdenados = computed(() => {
    const orden = [TipoKpi.SPI, TipoKpi.CPI, TipoKpi.CV, TipoKpi.SV, TipoKpi.EAC, TipoKpi.ETC];
    return orden.map(k => this.kpis().find(x => x.tipoKpi === k)).filter(Boolean) as KpiProyectoDto[];
  });

  ngOnInit(): void {
    this.proyectoId = Number(this.route.parent!.snapshot.paramMap.get('id'));
    this.cargar();
  }

  cargar(): void {
    this.service.getKpis(this.proyectoId).subscribe({ next: k => { this.kpis.set(k); this.cargandoKpis.set(false); }, error: () => this.cargandoKpis.set(false) });
    this.service.getAlertas(this.proyectoId).subscribe({ next: a => { this.alertas.set(a); this.cargandoAlertas.set(false); }, error: () => this.cargandoAlertas.set(false) });
  }

  calcularKpis(): void {
    this.calculando.set(true);
    this.service.calcularKpis(this.proyectoId).subscribe({
      next: () => {
        this.service.getKpis(this.proyectoId).subscribe({ next: k => { this.kpis.set(k); this.calculando.set(false); this.toast.add({ severity: 'success', summary: 'OK', detail: 'KPIs recalculados' }); }, error: () => this.calculando.set(false) });
      },
      error: () => { this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo recalcular' }); this.calculando.set(false); }
    });
  }

  marcarLeida(a: AlertaProyectoDto): void {
    this.service.marcarAlertaLeida(this.proyectoId, a.id).subscribe({
      next: () => { a.leida = true; this.alertas.update(arr => [...arr]); },
      error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar' })
    });
  }

  marcarTodasLeidas(): void {
    this.service.marcarTodasLeidas(this.proyectoId).subscribe({
      next: () => { this.alertas.update(arr => arr.map(a => ({ ...a, leida: true }))); this.toast.add({ severity: 'success', summary: 'OK', detail: 'Todas las alertas marcadas como leídas' }); },
      error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar' })
    });
  }

  formatKpi(kpi: KpiProyectoDto): string {
    if ([TipoKpi.SPI, TipoKpi.CPI].includes(kpi.tipoKpi)) return kpi.valor.toFixed(2);
    if ([TipoKpi.CV, TipoKpi.SV, TipoKpi.EAC, TipoKpi.ETC].includes(kpi.tipoKpi)) {
      return new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(kpi.valor);
    }
    return kpi.valor.toFixed(2);
  }

  formatKpiMeta(kpi: KpiProyectoDto): string {
    if (!kpi.valorMeta) return '';
    return [TipoKpi.CV, TipoKpi.SV, TipoKpi.EAC, TipoKpi.ETC].includes(kpi.tipoKpi)
      ? new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(kpi.valorMeta)
      : kpi.valorMeta.toFixed(2);
  }

  getSeveridadClass(s: SeveridadAlerta): string {
    const m: Record<SeveridadAlerta, string> = { [SeveridadAlerta.Info]: 'blue', [SeveridadAlerta.Warning]: 'yellow', [SeveridadAlerta.Critica]: 'red' };
    return m[s] ?? 'blue';
  }
}
