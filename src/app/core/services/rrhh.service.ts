import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  DepartamentoListItem, Departamento, CrearDepartamentoRequest, ActualizarDepartamentoRequest,
  PuestoListItem, Puesto, CrearPuestoRequest, ActualizarPuestoRequest,
  EmpleadoListItem, Empleado, CrearEmpleadoRequest, ActualizarEmpleadoRequest, CuentaSistema,
} from '../../shared/models/rrhh.models';

import {
  Horario, CrearHorarioRequest, ActualizarHorarioRequest,
  ConceptoNomina, CrearConceptoNominaRequest,
  PeriodoNomina, CrearPeriodoRequest,
  Prestamo, CrearPrestamoRequest,
  PlantillaEvaluacion, CrearPlantillaRequest,
  EvaluacionProceso,
  Capacitacion, CrearCapacitacionRequest, CapacitacionEmpleado,
  EvaluacionResumen,
  RequisicionPersonal, CrearRequisicionRequest,
  Candidato, CrearCandidatoRequest,
  ProcesoSeleccion,
  EmpleadoHistorial, EmpleadoHorario, SaldoVacaciones, Asistencia, EmpleadoRolPago,
} from '../../shared/models/rrhh.models';

interface ApiResponse<T> { success: boolean; data: T; message: string; total?: number; }
interface PaginatedData<T> { items: T[]; paginaActual: number; totalPaginas: number; totalElementos: number; elementosPorPagina: number; tienePaginaSiguiente: boolean; tienePaginaAnterior: boolean; }

@Injectable({ providedIn: 'root' })
export class RrhhService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/rrhh`;

  // ── Departamentos ──────────────────────────────────────────────────
  private _departamentos   = signal<DepartamentoListItem[]>([]);
  private _cargandoDept    = signal(false);
  readonly departamentos   = this._departamentos.asReadonly();
  readonly cargandoDept    = this._cargandoDept.asReadonly();

  listarDepartamentos(): Observable<ApiResponse<DepartamentoListItem[]>> {
    this._cargandoDept.set(true);
    return this.http.get<ApiResponse<DepartamentoListItem[]>>(`${this.base}/departamentos`).pipe(
      tap({ next: r => { this._departamentos.set(r?.data ?? []); this._cargandoDept.set(false); },
            error: () => this._cargandoDept.set(false) })
    );
  }

  obtenerDepartamento(id: number): Observable<ApiResponse<Departamento>> {
    return this.http.get<ApiResponse<Departamento>>(`${this.base}/departamentos/${id}`);
  }

  crearDepartamento(req: CrearDepartamentoRequest): Observable<ApiResponse<Departamento>> {
    return this.http.post<ApiResponse<Departamento>>(`${this.base}/departamentos`, req).pipe(
      tap(r => { if (r?.success && r.data) this._departamentos.update(l => [...l, r.data]); })
    );
  }

  actualizarDepartamento(id: number, req: ActualizarDepartamentoRequest): Observable<ApiResponse<Departamento>> {
    return this.http.put<ApiResponse<Departamento>>(`${this.base}/departamentos/${id}`, req).pipe(
      tap(r => { if (r?.success && r.data) this._departamentos.update(l => l.map(d => d.id === id ? { ...d, ...r.data } : d)); })
    );
  }

  eliminarDepartamento(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/departamentos/${id}`).pipe(
      tap(r => { if (r?.success) this._departamentos.update(l => l.filter(d => d.id !== id)); })
    );
  }

  activarDepartamento(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.base}/departamentos/${id}/activar`, {}).pipe(
      tap(r => { if (r?.success) this._departamentos.update(l => l.map(d => d.id === id ? { ...d, activo: true } : d)); })
    );
  }

  desactivarDepartamento(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.base}/departamentos/${id}/desactivar`, {}).pipe(
      tap(r => { if (r?.success) this._departamentos.update(l => l.map(d => d.id === id ? { ...d, activo: false } : d)); })
    );
  }

  // ── Puestos ───────────────────────────────────────────────────────
  private _puestos       = signal<PuestoListItem[]>([]);
  private _cargandoPuest = signal(false);
  readonly puestos       = this._puestos.asReadonly();
  readonly cargandoPuest = this._cargandoPuest.asReadonly();

  listarPuestos(departamentoId?: number): Observable<ApiResponse<PuestoListItem[]>> {
    this._cargandoPuest.set(true);
    const qs = departamentoId ? `?departamentoId=${departamentoId}` : '';
    return this.http.get<ApiResponse<PuestoListItem[]>>(`${this.base}/puestos${qs}`).pipe(
      tap({ next: r => { this._puestos.set(r?.data ?? []); this._cargandoPuest.set(false); },
            error: () => this._cargandoPuest.set(false) })
    );
  }

  obtenerPuesto(id: number): Observable<ApiResponse<Puesto>> {
    return this.http.get<ApiResponse<Puesto>>(`${this.base}/puestos/${id}`);
  }

  crearPuesto(req: CrearPuestoRequest): Observable<ApiResponse<Puesto>> {
    return this.http.post<ApiResponse<Puesto>>(`${this.base}/puestos`, req).pipe(
      tap(r => { if (r?.success && r.data) this._puestos.update(l => [...l, r.data]); })
    );
  }

  actualizarPuesto(id: number, req: ActualizarPuestoRequest): Observable<ApiResponse<Puesto>> {
    return this.http.put<ApiResponse<Puesto>>(`${this.base}/puestos/${id}`, req).pipe(
      tap(r => { if (r?.success && r.data) this._puestos.update(l => l.map(p => p.id === id ? { ...p, ...r.data } : p)); })
    );
  }

  eliminarPuesto(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/puestos/${id}`).pipe(
      tap(r => { if (r?.success) this._puestos.update(l => l.filter(p => p.id !== id)); })
    );
  }

  activarPuesto(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.base}/puestos/${id}/activar`, {}).pipe(
      tap(r => { if (r?.success) this._puestos.update(l => l.map(p => p.id === id ? { ...p, activo: true } : p)); })
    );
  }

  desactivarPuesto(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.base}/puestos/${id}/desactivar`, {}).pipe(
      tap(r => { if (r?.success) this._puestos.update(l => l.map(p => p.id === id ? { ...p, activo: false } : p)); })
    );
  }

  // ── Empleados ─────────────────────────────────────────────────────
  private _empleados    = signal<EmpleadoListItem[]>([]);
  private _totalEmp     = signal(0);
  private _cargandoEmp  = signal(false);
  readonly empleados    = this._empleados.asReadonly();
  readonly total        = this._totalEmp.asReadonly();
  readonly cargandoEmp  = this._cargandoEmp.asReadonly();

  listarEmpleados(): Observable<ApiResponse<PaginatedData<EmpleadoListItem>>> {
    this._cargandoEmp.set(true);
    return this.http.get<ApiResponse<PaginatedData<EmpleadoListItem>>>(`${this.base}/empleados`).pipe(
      tap({ next: r => {
        const paginated = r?.data as any;
        const items = paginated?.items ?? (Array.isArray(r?.data) ? r.data : []);
        this._empleados.set(items);
        this._totalEmp.set(paginated?.totalElementos ?? items.length);
        this._cargandoEmp.set(false);
      }, error: () => this._cargandoEmp.set(false) })
    );
  }

  obtenerEmpleado(id: number): Observable<ApiResponse<Empleado>> {
    return this.http.get<ApiResponse<Empleado>>(`${this.base}/empleados/${id}`);
  }

  crearEmpleado(req: CrearEmpleadoRequest): Observable<ApiResponse<Empleado>> {
    return this.http.post<ApiResponse<Empleado>>(`${this.base}/empleados`, req).pipe(
      tap(r => { if (r?.success && r.data) { this._empleados.update(l => [...l, r.data]); this._totalEmp.update(t => t + 1); } })
    );
  }

  actualizarEmpleado(id: number, req: ActualizarEmpleadoRequest): Observable<ApiResponse<Empleado>> {
    return this.http.put<ApiResponse<Empleado>>(`${this.base}/empleados/${id}`, req).pipe(
      tap(r => { if (r?.success && r.data) this._empleados.update(l => l.map(e => e.id === id ? { ...e, ...r.data } : e)); })
    );
  }

  activarEmpleado(id: number): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.base}/empleados/${id}/activar`, {}).pipe(
      tap(r => { if (r?.success) this._empleados.update(l => l.map(e => e.id === id ? { ...e, activo: true, estado: 1 } : e)); })
    );
  }

  desactivarEmpleado(id: number): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.base}/empleados/${id}/desactivar`, {}).pipe(
      tap(r => { if (r?.success) this._empleados.update(l => l.map(e => e.id === id ? { ...e, activo: false, estado: 4 } : e)); })
    );
  }

  eliminarEmpleado(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/empleados/${id}`).pipe(
      tap(r => { if (r?.success) { this._empleados.update(l => l.filter(e => e.id !== id)); this._totalEmp.update(t => t - 1); } })
    );
  }

  // ── Cuenta de sistema ─────────────────────────────────────────────
  obtenerCuentaEmpleado(id: number): Observable<ApiResponse<CuentaSistema>> {
    return this.http.get<ApiResponse<CuentaSistema>>(`${this.base}/empleados/${id}/cuenta`);
  }

  crearCuentaEmpleado(id: number, data: { email: string; nombreUsuario?: string; password: string; rolesIds: number[] }): Observable<ApiResponse<CuentaSistema>> {
    return this.http.post<ApiResponse<CuentaSistema>>(`${this.base}/empleados/${id}/crear-cuenta`, data);
  }

  vincularUsuarioEmpleado(id: number, emailONombreUsuario: string): Observable<ApiResponse<CuentaSistema>> {
    return this.http.post<ApiResponse<CuentaSistema>>(`${this.base}/empleados/${id}/vincular-usuario`, { emailONombreUsuario });
  }

  desvincularUsuarioEmpleado(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/empleados/${id}/vincular-usuario`);
  }

  // ── Horarios ──────────────────────────────────────────────────────
  private _horarios      = signal<Horario[]>([]);
  private _cargandoHor   = signal(false);
  readonly horarios      = this._horarios.asReadonly();
  readonly cargandoHor   = this._cargandoHor.asReadonly();

  listarHorarios(): Observable<ApiResponse<Horario[]>> {
    this._cargandoHor.set(true);
    return this.http.get<ApiResponse<Horario[]>>(`${this.base}/horarios`).pipe(
      tap({ next: r => { this._horarios.set(r?.data ?? []); this._cargandoHor.set(false); },
            error: () => this._cargandoHor.set(false) })
    );
  }

  obtenerHorario(id: number): Observable<ApiResponse<Horario>> {
    return this.http.get<ApiResponse<Horario>>(`${this.base}/horarios/${id}`);
  }

  crearHorario(req: CrearHorarioRequest): Observable<ApiResponse<Horario>> {
    return this.http.post<ApiResponse<Horario>>(`${this.base}/horarios`, req).pipe(
      tap(r => { if (r?.success && r.data) this._horarios.update(l => [...l, r.data]); })
    );
  }

  actualizarHorario(id: number, req: ActualizarHorarioRequest): Observable<ApiResponse<Horario>> {
    return this.http.put<ApiResponse<Horario>>(`${this.base}/horarios/${id}`, req).pipe(
      tap(r => { if (r?.success && r.data) this._horarios.update(l => l.map(h => h.id === id ? { ...h, ...r.data } : h)); })
    );
  }

  eliminarHorario(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/horarios/${id}`).pipe(
      tap(r => { if (r?.success) this._horarios.update(l => l.filter(h => h.id !== id)); })
    );
  }

  // ── ConceptoNomina ────────────────────────────────────────────────
  private _conceptos      = signal<ConceptoNomina[]>([]);
  private _cargandoConc   = signal(false);
  readonly conceptos      = this._conceptos.asReadonly();
  readonly cargandoConc   = this._cargandoConc.asReadonly();

  listarConceptos(): Observable<ApiResponse<ConceptoNomina[]>> {
    this._cargandoConc.set(true);
    return this.http.get<ApiResponse<ConceptoNomina[]>>(`${this.base}/nomina/conceptos`).pipe(
      tap({ next: r => { this._conceptos.set(r?.data ?? []); this._cargandoConc.set(false); },
            error: () => this._cargandoConc.set(false) })
    );
  }

  crearConcepto(req: CrearConceptoNominaRequest): Observable<ApiResponse<ConceptoNomina>> {
    return this.http.post<ApiResponse<ConceptoNomina>>(`${this.base}/nomina/conceptos`, req).pipe(
      tap(r => { if (r?.success && r.data) this._conceptos.update(l => [...l, r.data]); })
    );
  }

  actualizarConcepto(id: number, req: CrearConceptoNominaRequest): Observable<ApiResponse<ConceptoNomina>> {
    return this.http.put<ApiResponse<ConceptoNomina>>(`${this.base}/nomina/conceptos/${id}`, req).pipe(
      tap(r => { if (r?.success && r.data) this._conceptos.update(l => l.map(c => c.id === id ? { ...c, ...r.data } : c)); })
    );
  }

  eliminarConcepto(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/nomina/conceptos/${id}`).pipe(
      tap(r => { if (r?.success) this._conceptos.update(l => l.filter(c => c.id !== id)); })
    );
  }

  // ── Periodos Nómina ───────────────────────────────────────────────
  private _periodos      = signal<PeriodoNomina[]>([]);
  private _cargandoPer   = signal(false);
  readonly periodos      = this._periodos.asReadonly();
  readonly cargandoPer   = this._cargandoPer.asReadonly();

  listarPeriodos(anno?: number): Observable<ApiResponse<PeriodoNomina[]>> {
    this._cargandoPer.set(true);
    const qs = anno ? `?anno=${anno}` : '';
    return this.http.get<ApiResponse<PeriodoNomina[]>>(`${this.base}/nomina/periodos${qs}`).pipe(
      tap({ next: r => { this._periodos.set(r?.data ?? []); this._cargandoPer.set(false); },
            error: () => this._cargandoPer.set(false) })
    );
  }

  crearPeriodo(req: CrearPeriodoRequest): Observable<ApiResponse<PeriodoNomina>> {
    return this.http.post<ApiResponse<PeriodoNomina>>(`${this.base}/nomina/periodos`, req).pipe(
      tap(r => { if (r?.success && r.data) this._periodos.update(l => [...l, r.data]); })
    );
  }

  // ── Préstamos ─────────────────────────────────────────────────────
  private _prestamos      = signal<Prestamo[]>([]);
  private _cargandoPrest  = signal(false);
  readonly prestamos      = this._prestamos.asReadonly();
  readonly cargandoPrest  = this._cargandoPrest.asReadonly();

  listarPrestamos(): Observable<ApiResponse<any>> {
    this._cargandoPrest.set(true);
    return this.http.get<ApiResponse<any>>(`${this.base}/prestamos`).pipe(
      tap({ next: r => {
        const items = r?.data?.items ?? r?.data ?? [];
        this._prestamos.set(items);
        this._cargandoPrest.set(false);
      }, error: () => this._cargandoPrest.set(false) })
    );
  }

  obtenerPrestamo(id: number): Observable<ApiResponse<Prestamo>> {
    return this.http.get<ApiResponse<Prestamo>>(`${this.base}/prestamos/${id}`);
  }

  crearPrestamo(req: CrearPrestamoRequest): Observable<ApiResponse<Prestamo>> {
    return this.http.post<ApiResponse<Prestamo>>(`${this.base}/prestamos`, req).pipe(
      tap(r => { if (r?.success && r.data) this._prestamos.update(l => [...l, r.data]); })
    );
  }

  aprobarPrestamo(id: number, observacion?: string): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.base}/prestamos/${id}/aprobar`, { aprobado: true, observacion }).pipe(
      tap(r => { if (r?.success) this._prestamos.update(l => l.map(p => p.id === id ? { ...p, estado: 2 } : p)); })
    );
  }

  rechazarPrestamo(id: number, motivo?: string): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.base}/prestamos/${id}/rechazar`, { motivo }).pipe(
      tap(r => { if (r?.success) this._prestamos.update(l => l.map(p => p.id === id ? { ...p, estado: 3 } : p)); })
    );
  }

  // ── Evaluaciones — Plantillas ─────────────────────────────────────
  private _plantillas      = signal<PlantillaEvaluacion[]>([]);
  private _cargandoPlant   = signal(false);
  readonly plantillas      = this._plantillas.asReadonly();
  readonly cargandoPlant   = this._cargandoPlant.asReadonly();

  listarPlantillas(): Observable<ApiResponse<PlantillaEvaluacion[]>> {
    this._cargandoPlant.set(true);
    return this.http.get<ApiResponse<PlantillaEvaluacion[]>>(`${this.base}/evaluaciones/plantillas`).pipe(
      tap({ next: r => { this._plantillas.set(r?.data ?? []); this._cargandoPlant.set(false); },
            error: () => this._cargandoPlant.set(false) })
    );
  }

  crearPlantilla(req: CrearPlantillaRequest): Observable<ApiResponse<PlantillaEvaluacion>> {
    return this.http.post<ApiResponse<PlantillaEvaluacion>>(`${this.base}/evaluaciones/plantillas`, req).pipe(
      tap(r => { if (r?.success && r.data) this._plantillas.update(l => [...l, r.data]); })
    );
  }

  eliminarPlantilla(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/evaluaciones/plantillas/${id}`).pipe(
      tap(r => { if (r?.success) this._plantillas.update(l => l.filter(p => p.id !== id)); })
    );
  }

  // ── Evaluaciones — Procesos ───────────────────────────────────────
  private _procesos      = signal<EvaluacionProceso[]>([]);
  private _cargandoProc  = signal(false);
  readonly procesos      = this._procesos.asReadonly();
  readonly cargandoProc  = this._cargandoProc.asReadonly();

  listarProcesos(): Observable<ApiResponse<EvaluacionProceso[]>> {
    this._cargandoProc.set(true);
    return this.http.get<ApiResponse<EvaluacionProceso[]>>(`${this.base}/evaluaciones/procesos`).pipe(
      tap({ next: r => { this._procesos.set(r?.data ?? []); this._cargandoProc.set(false); },
            error: () => this._cargandoProc.set(false) })
    );
  }

  // ── Capacitaciones ────────────────────────────────────────────────
  private _capacitaciones   = signal<Capacitacion[]>([]);
  private _cargandoCap      = signal(false);
  readonly capacitaciones   = this._capacitaciones.asReadonly();
  readonly cargandoCap      = this._cargandoCap.asReadonly();

  listarCapacitaciones(): Observable<ApiResponse<any>> {
    this._cargandoCap.set(true);
    return this.http.get<ApiResponse<any>>(`${this.base}/capacitaciones`).pipe(
      tap({ next: r => {
        const items = r?.data?.items ?? r?.data ?? [];
        this._capacitaciones.set(items);
        this._cargandoCap.set(false);
      }, error: () => this._cargandoCap.set(false) })
    );
  }

  crearCapacitacion(req: CrearCapacitacionRequest): Observable<ApiResponse<Capacitacion>> {
    return this.http.post<ApiResponse<Capacitacion>>(`${this.base}/capacitaciones`, req).pipe(
      tap(r => { if (r?.success && r.data) this._capacitaciones.update(l => [...l, r.data]); })
    );
  }

  actualizarCapacitacion(id: number, req: CrearCapacitacionRequest): Observable<ApiResponse<Capacitacion>> {
    return this.http.put<ApiResponse<Capacitacion>>(`${this.base}/capacitaciones/${id}`, req).pipe(
      tap(r => { if (r?.success && r.data) this._capacitaciones.update(l => l.map(c => c.id === id ? { ...c, ...r.data } : c)); })
    );
  }

  eliminarCapacitacion(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/capacitaciones/${id}`).pipe(
      tap(r => { if (r?.success) this._capacitaciones.update(l => l.filter(c => c.id !== id)); })
    );
  }

  cambiarEstadoCapacitacion(id: number, estado: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.base}/capacitaciones/${id}/estado`, { estado }).pipe(
      tap(r => { if (r?.success) this._capacitaciones.update(l => l.map(c => c.id === id ? { ...c, estado } : c)); })
    );
  }

  obtenerCapacitacionesEmpleado(empleadoId: number): Observable<ApiResponse<CapacitacionEmpleado[]>> {
    return this.http.get<ApiResponse<CapacitacionEmpleado[]>>(`${this.base}/empleados/${empleadoId}/capacitaciones`);
  }

  obtenerEvaluacionesEmpleado(empleadoId: number): Observable<ApiResponse<EvaluacionResumen[]>> {
    return this.http.get<ApiResponse<EvaluacionResumen[]>>(`${this.base}/empleados/${empleadoId}/evaluaciones`);
  }

  // ── Requisiciones ─────────────────────────────────────────────────
  private _requisiciones   = signal<RequisicionPersonal[]>([]);
  private _cargandoReq     = signal(false);
  readonly requisiciones   = this._requisiciones.asReadonly();
  readonly cargandoReq     = this._cargandoReq.asReadonly();

  listarRequisiciones(): Observable<ApiResponse<RequisicionPersonal[]>> {
    this._cargandoReq.set(true);
    return this.http.get<ApiResponse<RequisicionPersonal[]>>(`${this.base}/requisiciones`).pipe(
      tap({ next: r => { this._requisiciones.set(r?.data ?? []); this._cargandoReq.set(false); },
            error: () => this._cargandoReq.set(false) })
    );
  }

  crearRequisicion(req: CrearRequisicionRequest): Observable<ApiResponse<RequisicionPersonal>> {
    return this.http.post<ApiResponse<RequisicionPersonal>>(`${this.base}/requisiciones`, req).pipe(
      tap(r => { if (r?.success && r.data) this._requisiciones.update(l => [...l, r.data]); })
    );
  }

  eliminarRequisicion(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/requisiciones/${id}`).pipe(
      tap(r => { if (r?.success) this._requisiciones.update(l => l.filter(r => r.id !== id)); })
    );
  }

  // ── Candidatos ────────────────────────────────────────────────────
  private _candidatos     = signal<Candidato[]>([]);
  private _cargandoCand   = signal(false);
  readonly candidatos     = this._candidatos.asReadonly();
  readonly cargandoCand   = this._cargandoCand.asReadonly();

  listarCandidatos(): Observable<ApiResponse<Candidato[]>> {
    this._cargandoCand.set(true);
    return this.http.get<ApiResponse<Candidato[]>>(`${this.base}/candidatos`).pipe(
      tap({ next: r => { this._candidatos.set(r?.data ?? []); this._cargandoCand.set(false); },
            error: () => this._cargandoCand.set(false) })
    );
  }

  crearCandidato(req: CrearCandidatoRequest): Observable<ApiResponse<Candidato>> {
    return this.http.post<ApiResponse<Candidato>>(`${this.base}/candidatos`, req).pipe(
      tap(r => { if (r?.success && r.data) this._candidatos.update(l => [...l, r.data]); })
    );
  }

  actualizarCandidato(id: number, req: Partial<CrearCandidatoRequest>): Observable<ApiResponse<Candidato>> {
    return this.http.put<ApiResponse<Candidato>>(`${this.base}/candidatos/${id}`, req).pipe(
      tap(r => { if (r?.success && r.data) this._candidatos.update(l => l.map(c => c.id === id ? { ...c, ...r.data } : c)); })
    );
  }

  eliminarCandidato(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/candidatos/${id}`).pipe(
      tap(r => { if (r?.success) this._candidatos.update(l => l.filter(c => c.id !== id)); })
    );
  }

  // ── Ficha empleado — endpoints por empleado ───────────────────
  obtenerHistorialEmpleado(id: number): Observable<ApiResponse<EmpleadoHistorial[]>> {
    return this.http.get<ApiResponse<EmpleadoHistorial[]>>(`${this.base}/empleados/${id}/historial`);
  }

  obtenerHorarioEmpleado(id: number): Observable<ApiResponse<EmpleadoHorario[]>> {
    return this.http.get<ApiResponse<EmpleadoHorario[]>>(`${this.base}/empleados/${id}/horario`);
  }

  asignarHorarioEmpleado(id: number, req: { horarioId: number; fechaInicio: string; motivo?: string }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.base}/empleados/${id}/horario`, req);
  }

  obtenerPrestamosEmpleado(id: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.base}/empleados/${id}/prestamos`);
  }

  obtenerVacacionesEmpleado(id: number, anno: number): Observable<ApiResponse<SaldoVacaciones>> {
    return this.http.get<ApiResponse<SaldoVacaciones>>(`${this.base}/empleados/${id}/vacaciones/${anno}`);
  }

  obtenerAsistenciaEmpleado(id: number, anno: number, mes: number): Observable<ApiResponse<Asistencia[]>> {
    return this.http.get<ApiResponse<Asistencia[]>>(`${this.base}/asistencia/empleado/${id}?anno=${anno}&mes=${mes}`);
  }

  obtenerRolesPagoEmpleado(id: number): Observable<ApiResponse<EmpleadoRolPago[]>> {
    return this.http.get<ApiResponse<EmpleadoRolPago[]>>(`${this.base}/empleados/${id}/roles-pago`);
  }

  // ── Procesos de Selección ─────────────────────────────────────────
  private _procesosSeleccion   = signal<ProcesoSeleccion[]>([]);
  private _cargandoProcesoSel  = signal(false);
  readonly procesosSeleccion   = this._procesosSeleccion.asReadonly();
  readonly cargandoProcesoSel  = this._cargandoProcesoSel.asReadonly();

  listarProcesosSeleccion(): Observable<ApiResponse<ProcesoSeleccion[]>> {
    this._cargandoProcesoSel.set(true);
    return this.http.get<ApiResponse<ProcesoSeleccion[]>>(`${this.base}/procesos-seleccion`).pipe(
      tap({ next: r => { this._procesosSeleccion.set(r?.data ?? []); this._cargandoProcesoSel.set(false); },
            error: () => this._cargandoProcesoSel.set(false) })
    );
  }
  
  
}

