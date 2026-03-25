import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';

import { RrhhService } from '../../../../core/services/rrhh.service';
import { EmpleadoPanelComponent } from '../panel/empleado-panel.component';
import {
  Empleado, EmpleadoHistorial, EmpleadoHorario, SaldoVacaciones, Prestamo,
  Asistencia, EmpleadoRolPago, CapacitacionEmpleado, EvaluacionResumen,
  ESTADO_EMPLEADO_LABELS, TIPO_CONTRATO_LABELS, MODALIDAD_LABELS,
  ESTADO_PRESTAMO_LABELS, TIPO_PRESTAMO_LABELS, GENERO_LABELS, ESTADO_CIVIL_LABELS,
} from '../../../../shared/models/rrhh.models';

type Tab = 'info' | 'horario' | 'prestamos' | 'historial' | 'vacaciones' | 'asistencia' | 'nomina' | 'evaluaciones' | 'capacitaciones';

@Component({
  selector: 'app-empleado-ficha',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    ToastModule, ButtonModule, TagModule, TooltipModule, SelectModule,
    EmpleadoPanelComponent,
  ],
  providers: [MessageService],
  templateUrl: './empleado-ficha.component.html',
  styleUrls: ['./empleado-ficha.component.scss'],
})
export class EmpleadoFichaComponent implements OnInit {
  private readonly route   = inject(ActivatedRoute);
  private readonly router  = inject(Router);
  private readonly svc     = inject(RrhhService);
  private readonly toast   = inject(MessageService);

  readonly empleado          = signal<Empleado | null>(null);
  readonly cargando          = signal(true);
  readonly error             = signal('');

  readonly activeTab         = signal<Tab>('info');

  // Horario
  readonly horarios          = this.svc.horarios;
  readonly historialHorario  = signal<EmpleadoHorario[]>([]);
  readonly cargandoHorario   = signal(false);
  readonly modoAsignar       = signal(false);
  readonly horarioSelId      = signal<number | null>(null);
  readonly fechaAsignar      = signal('');
  readonly asignando         = signal(false);

  readonly horarioOpts = computed(() =>
    this.horarios().map(h => ({ label: h.nombre, value: h.id }))
  );
  readonly horarioVigente = computed(() =>
    this.historialHorario().find(h => h.vigente) ?? null
  );

  // Préstamos
  readonly prestamos         = signal<Prestamo[]>([]);
  readonly cargandoPrest     = signal(false);

  // Historial laboral
  readonly historialLaboral  = signal<EmpleadoHistorial[]>([]);
  readonly cargandoHistorial = signal(false);

  // Vacaciones
  readonly vacaciones        = signal<SaldoVacaciones | null>(null);
  readonly cargandoVac       = signal(false);
  readonly annoVac           = signal(new Date().getFullYear());

  // Asistencia
  readonly asistencias       = signal<Asistencia[]>([]);
  readonly cargandoAsist     = signal(false);
  readonly mesAsist          = signal(new Date().getMonth() + 1);
  readonly annoAsist         = signal(new Date().getFullYear());
  readonly mesesNombres      = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  // Nómina
  readonly rolesNomina       = signal<EmpleadoRolPago[]>([]);
  readonly cargandoNomina    = signal(false);

  // Evaluaciones
  readonly evaluaciones      = signal<EvaluacionResumen[]>([]);
  readonly cargandoEval      = signal(false);

  // Capacitaciones
  readonly capacitaciones    = signal<CapacitacionEmpleado[]>([]);
  readonly cargandoCap       = signal(false);

  // Panel edición
  readonly panelVisible      = signal(false);

  // Helpers de labels
  estadoLabel    = (e: number) => ESTADO_EMPLEADO_LABELS[e]  ?? '—';
  contratoLabel  = (e: number) => TIPO_CONTRATO_LABELS[e]    ?? '—';
  modalidadLabel = (e: number) => MODALIDAD_LABELS[e]        ?? '—';
  generoLabel    = (e?: number) => e ? (GENERO_LABELS[e]     ?? '—') : '—';
  civilLabel     = (e?: number) => e ? (ESTADO_CIVIL_LABELS[e] ?? '—') : '—';
  prestamoEstadoLabel = (e: number) => ESTADO_PRESTAMO_LABELS[e] ?? '—';
  prestamoTipoLabel   = (e: number) => TIPO_PRESTAMO_LABELS[e]  ?? '—';

  severidadEstado(e: number): any {
    return ({ 1: 'success', 2: 'warn', 3: 'info', 4: 'secondary' } as any)[e] ?? 'secondary';
  }
  severidadPrestamo(e: number): any {
    return ({ 1: 'warn', 2: 'success', 3: 'danger', 4: 'info', 5: 'secondary' } as any)[e] ?? 'secondary';
  }

  formatCurrency(val?: number) {
    if (val == null) return '—';
    return new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(val);
  }
  iniciales(nombre: string) {
    return nombre?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() ?? '?';
  }
  fechaHoy() {
    return new Date().toISOString().slice(0, 10);
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.router.navigate(['../'], { relativeTo: this.route }); return; }
    this.cargarEmpleado(id);
    if (this.svc.horarios().length === 0) this.svc.listarHorarios().subscribe();
  }

  cargarEmpleado(id: number): void {
    this.cargando.set(true);
    this.svc.obtenerEmpleado(id).subscribe({
      next: res => {
        this.empleado.set(res?.data ?? null);
        this.cargando.set(false);
        this.cargarHorario(id);
      },
      error: () => {
        this.error.set('No se pudo cargar el empleado');
        this.cargando.set(false);
      }
    });
  }

  setTab(tab: Tab): void {
    this.activeTab.set(tab);
    const id = this.empleado()?.id;
    if (!id) return;
    if (tab === 'horario'    && this.historialHorario().length === 0)  this.cargarHorario(id);
    if (tab === 'prestamos'  && this.prestamos().length === 0)          this.cargarPrestamos(id);
    if (tab === 'historial'  && this.historialLaboral().length === 0)  this.cargarHistorial(id);
    if (tab === 'vacaciones' && !this.vacaciones())                     this.cargarVacaciones(id);
    if (tab === 'asistencia' && this.asistencias().length === 0)       this.cargarAsistencia(id);
    if (tab === 'nomina'          && this.rolesNomina().length === 0)        this.cargarNomina(id);
    if (tab === 'evaluaciones'    && this.evaluaciones().length === 0)       this.cargarEvaluaciones(id);
    if (tab === 'capacitaciones'  && this.capacitaciones().length === 0)     this.cargarCapacitaciones(id);
  }

  // ── Horario ───────────────────────────────────────────────────
  cargarHorario(id: number): void {
    this.cargandoHorario.set(true);
    this.svc.obtenerHorarioEmpleado(id).subscribe({
      next: r => { this.historialHorario.set(r?.data ?? []); this.cargandoHorario.set(false); },
      error: () => this.cargandoHorario.set(false),
    });
  }

  abrirAsignar(): void {
    this.horarioSelId.set(null);
    this.fechaAsignar.set(this.fechaHoy());
    this.modoAsignar.set(true);
  }

  confirmarAsignar(): void {
    const hId = this.horarioSelId();
    const fecha = this.fechaAsignar();
    const emp = this.empleado();
    if (!hId || !fecha || !emp) return;
    this.asignando.set(true);
    this.svc.asignarHorarioEmpleado(emp.id, { horarioId: hId, fechaInicio: fecha }).subscribe({
      next: () => {
        this.toast.add({ severity: 'success', summary: 'Horario asignado', life: 2500 });
        this.modoAsignar.set(false);
        this.asignando.set(false);
        this.historialHorario.set([]);
        this.cargarHorario(emp.id);
      },
      error: e => {
        this.toast.add({ severity: 'error', summary: 'Error', detail: e?.error?.message ?? 'No se pudo asignar', life: 3500 });
        this.asignando.set(false);
      }
    });
  }

  // ── Préstamos ─────────────────────────────────────────────────
  cargarPrestamos(id: number): void {
    this.cargandoPrest.set(true);
    this.svc.obtenerPrestamosEmpleado(id).subscribe({
      next: r => {
        const items = r?.data?.items ?? r?.data ?? [];
        this.prestamos.set(items);
        this.cargandoPrest.set(false);
      },
      error: () => this.cargandoPrest.set(false),
    });
  }

  // ── Historial laboral ─────────────────────────────────────────
  cargarHistorial(id: number): void {
    this.cargandoHistorial.set(true);
    this.svc.obtenerHistorialEmpleado(id).subscribe({
      next: r => { this.historialLaboral.set(r?.data ?? []); this.cargandoHistorial.set(false); },
      error: () => this.cargandoHistorial.set(false),
    });
  }

  // ── Vacaciones ────────────────────────────────────────────────
  cargarVacaciones(id: number): void {
    this.cargandoVac.set(true);
    this.svc.obtenerVacacionesEmpleado(id, this.annoVac()).subscribe({
      next: r => { this.vacaciones.set(r?.data ?? null); this.cargandoVac.set(false); },
      error: () => this.cargandoVac.set(false),
    });
  }

  cambiarAnnoVac(delta: number): void {
    this.annoVac.update(a => a + delta);
    const id = this.empleado()?.id;
    if (id) { this.vacaciones.set(null); this.cargarVacaciones(id); }
  }

  // ── Asistencia ────────────────────────────────────────────────
  cargarAsistencia(id: number): void {
    this.cargandoAsist.set(true);
    this.svc.obtenerAsistenciaEmpleado(id, this.annoAsist(), this.mesAsist()).subscribe({
      next: r => { this.asistencias.set(r?.data ?? []); this.cargandoAsist.set(false); },
      error: () => this.cargandoAsist.set(false),
    });
  }

  cambiarMesAsist(delta: number): void {
    let m = this.mesAsist() + delta;
    let a = this.annoAsist();
    if (m > 12) { m = 1; a++; }
    if (m < 1)  { m = 12; a--; }
    this.mesAsist.set(m); this.annoAsist.set(a);
    const id = this.empleado()?.id;
    if (id) { this.asistencias.set([]); this.cargarAsistencia(id); }
  }

  asistenciaEstadoColor(estado: number): string {
    return ({1:'ok', 2:'tardanza', 3:'ausencia', 4:'justificado', 5:'feriado'} as any)[estado] ?? 'ok';
  }
  countByEstado(estado: number): number {
    return this.asistencias().filter(a => a.estado === estado).length;
  }

  // ── Nómina / Roles de pago ────────────────────────────────────
  cargarNomina(id: number): void {
    this.cargandoNomina.set(true);
    this.svc.obtenerRolesPagoEmpleado(id).subscribe({
      next: r => { this.rolesNomina.set(r?.data ?? []); this.cargandoNomina.set(false); },
      error: () => this.cargandoNomina.set(false),
    });
  }

  nominaEstadoSeverity(estado: number): any {
    return ({1:'secondary', 2:'info', 3:'warn', 4:'success'} as any)[estado] ?? 'secondary';
  }

  // ── Evaluaciones ──────────────────────────────────────────────
  cargarEvaluaciones(id: number): void {
    this.cargandoEval.set(true);
    this.svc.obtenerEvaluacionesEmpleado(id).subscribe({
      next: r => { this.evaluaciones.set(r?.data ?? []); this.cargandoEval.set(false); },
      error: () => this.cargandoEval.set(false),
    });
  }

  evalEstadoSeverity(estado: number): any {
    return ({1:'warn', 2:'info', 3:'success'} as any)[estado] ?? 'secondary';
  }

  // ── Capacitaciones ────────────────────────────────────────────
  cargarCapacitaciones(id: number): void {
    this.cargandoCap.set(true);
    this.svc.obtenerCapacitacionesEmpleado(id).subscribe({
      next: r => { this.capacitaciones.set(r?.data ?? []); this.cargandoCap.set(false); },
      error: () => this.cargandoCap.set(false),
    });
  }

  capEstadoSeverity(estado: number): any {
    return ({1:'warn', 2:'info', 3:'success', 4:'danger'} as any)[estado] ?? 'secondary';
  }

  // ── Panel edición ─────────────────────────────────────────────
  abrirEditar(): void { this.panelVisible.set(true); }
  cerrarPanel(): void { this.panelVisible.set(false); }
  onGuardado(): void {
    this.panelVisible.set(false);
    const id = this.empleado()?.id;
    if (id) this.cargarEmpleado(id);
  }

  volver(): void { this.router.navigate(['../../empleados'], { relativeTo: this.route }); }
}
