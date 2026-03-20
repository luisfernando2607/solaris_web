import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { ProyectoService } from '../../../core/services/proyecto.service';
import {
  ProyectoDashboardDto, EstadoProyecto, KpiProyectoDto,
  ESTADO_LABELS, SeveridadAlerta, EstadoHito, TipoKpi
} from '../../../shared/models/proyecto.models';

@Component({
  selector: 'app-proyecto-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, TooltipModule, ToastModule],
  providers: [MessageService],
  templateUrl: './proyecto-dashboard.component.html',
  styleUrls: ['./proyecto-dashboard.component.scss'],
})
export class ProyectoDashboardComponent implements OnInit {
  private readonly route   = inject(ActivatedRoute);
  private readonly router  = inject(Router);
  private readonly service = inject(ProyectoService);
  private readonly toast   = inject(MessageService);

  readonly cargando   = signal(true);
  readonly dashboard  = signal<ProyectoDashboardDto | null>(null);
  readonly proyectoId = signal<number>(0);

  readonly ESTADO_LABELS   = ESTADO_LABELS;
  readonly EstadoProyecto  = EstadoProyecto;
  readonly SeveridadAlerta = SeveridadAlerta;
  readonly EstadoHito      = EstadoHito;
  readonly TipoKpi         = TipoKpi;

  // KPIs ordenados por TipoKpi numérico: SPI=1, CPI=2, CV=3, SV=4, EAC=5, ETC=6
  readonly kpisOrdenados = computed(() => {
    const orden = [TipoKpi.SPI, TipoKpi.CPI, TipoKpi.CV, TipoKpi.SV, TipoKpi.EAC, TipoKpi.ETC];
    const kpis  = this.dashboard()?.ultimosKpis ?? [];
    return orden.map(k => kpis.find(x => x.tipoKpi === k)).filter(Boolean) as KpiProyectoDto[];
  });

  readonly alertasCriticas = computed(() =>
    (this.dashboard()?.alertasActivas ?? []).filter(a => a.severidad === SeveridadAlerta.Critica)
  );

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.proyectoId.set(id);
    this.cargar(id);
  }

  cargar(id: number): void {
    this.cargando.set(true);
    this.service.getDashboard(id).subscribe({
      next:  d  => { this.dashboard.set(d); this.cargando.set(false); },
      error: () => { this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el dashboard', life: 3000 }); this.cargando.set(false); }
    });
  }

  volver(): void { this.router.navigate(['/proyectos/lista']); }

  getEstadoClass(estado: EstadoProyecto): string {
    const m: Record<EstadoProyecto, string> = {
      [EstadoProyecto.Borrador]:    'gray',
      [EstadoProyecto.Planificado]: 'blue',
      [EstadoProyecto.EnEjecucion]: 'green',
      [EstadoProyecto.EnPausa]:     'yellow',
      [EstadoProyecto.Completado]:  'teal',
      [EstadoProyecto.Cancelado]:   'red',
    };
    return m[estado] ?? 'gray';
  }

  getKpiColor(kpi: KpiProyectoDto): string {
    if (kpi.semaforo === 'verde')    return 'green';
    if (kpi.semaforo === 'amarillo') return 'yellow';
    return 'red';
  }

  getSeveridadClass(s: SeveridadAlerta): string {
    if (s === SeveridadAlerta.Critica) return 'crit';
    if (s === SeveridadAlerta.Warning) return 'warn';
    return 'info';
  }

  getHitoClass(estado: EstadoHito): string {
    const m: Record<EstadoHito, string> = {
      [EstadoHito.Pendiente]: 'blue',
      [EstadoHito.EnRiesgo]:  'yellow',
      [EstadoHito.Logrado]:   'green',
      [EstadoHito.Vencido]:   'red',
    };
    return m[estado] ?? 'gray';
  }

  formatMoney(v: number): string {
    return new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
  }

  getDesviacion(): number {
    const d = this.dashboard();
    if (!d) return 0;
    return d.porcentajeAvanceReal - d.porcentajeAvancePlan;
  }

  getCostoDesviacion(): number {
    const d = this.dashboard();
    if (!d || !d.presupuestoTotal) return 0;
    return ((d.costoRealTotal - d.presupuestoTotal) / d.presupuestoTotal) * 100;
  }

  verDetalle(): void {
    this.router.navigate(['/proyectos', this.proyectoId(), 'detalle']);
  }
}
