import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import {
  ProyectoListDto, ProyectoDto, ProyectoDashboardDto,
  ProyectoFaseDto, ProyectoHitoDto, ProyectoDocumentoDto,
  WbsNodoDto, TareaListDto, TareaDto, TareaDependenciaDto,
  CuadrillaDto, PresupuestoDto, ResumenEjecucionDto, CostoRealDto,
  GanttDto, CentroCostoDto, OrdenTrabajoListDto, OrdenTrabajoDto,
  ReporteAvanceDto, KpiProyectoDto, AlertaProyectoDto,
  PresupuestoPartidaDto,
  CrearProyectoRequest, ActualizarProyectoRequest, FiltroProyectosRequest,
  CrearFaseRequest, ActualizarFaseRequest,
  CrearHitoRequest, ActualizarHitoRequest,
  CrearWbsNodoRequest, ActualizarWbsNodoRequest,
  CrearTareaRequest, ActualizarTareaRequest, CrearDependenciaRequest,
  CrearCuadrillaRequest, ActualizarCuadrillaRequest,
  CrearPresupuestoRequest, AgregarPartidaRequest, RegistrarCostoRealRequest,
  RegistrarProgresoGanttRequest,
  CrearCentroCostoRequest, ActualizarCentroCostoRequest,
  CrearOrdenTrabajoRequest, ActualizarOrdenTrabajoRequest,
  CrearReporteRequest,
  EstadoProyecto, EstadoFase, EstadoTarea, EstadoOrdenTrabajo,
  FiltroOTRequest, PagedResult,
} from '../models/proyecto.models';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProyectoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/proy`;

  // ── Signals globales ──────────────────────────────────
  readonly proyectos = signal<ProyectoListDto[]>([]);
  readonly total     = signal(0);
  readonly cargando  = signal(false);
  readonly dashboard = signal<ProyectoDashboardDto | null>(null);
  readonly alertasCount = signal(0);

  // ── Proyecto CRUD ──────────────────────────────────────
  listar(filtro: FiltroProyectosRequest): Observable<PagedResult<ProyectoListDto>> {
    let params = new HttpParams()
      .set('Pagina', filtro.pagina)
      .set('ElementosPorPagina', filtro.elementosPorPagina);
    if (filtro.busqueda)  params = params.set('Busqueda', filtro.busqueda);
    if (filtro.estado)    params = params.set('Estado', filtro.estado);
    if (filtro.tipo)      params = params.set('Tipo', filtro.tipo);
    if (filtro.gerenteId) params = params.set('GerenteId', filtro.gerenteId);
    this.cargando.set(true);
    return this.http.get<any>(`${this.base}/proyectos`, { params }).pipe(
      map(res => res?.data ?? res),
      tap({ next: r => { this.proyectos.set(r.items ?? []); this.total.set(r.total ?? 0); this.cargando.set(false); }, error: () => this.cargando.set(false) })
    );
  }
  getById(id: number): Observable<ProyectoDto> {
    return this.http.get<any>(`${this.base}/proyectos/${id}`).pipe(map(r => r?.data ?? r));
  }
  getDashboard(id: number): Observable<ProyectoDashboardDto> {
    return this.http.get<any>(`${this.base}/proyectos/${id}/dashboard`).pipe(
      map(r => r?.data ?? r), tap(d => this.dashboard.set(d))
    );
  }
  crear(req: CrearProyectoRequest): Observable<ProyectoDto> {
    return this.http.post<any>(`${this.base}/proyectos`, req).pipe(map(r => r?.data ?? r));
  }
  actualizar(id: number, req: ActualizarProyectoRequest): Observable<ProyectoDto> {
    return this.http.put<any>(`${this.base}/proyectos/${id}`, req).pipe(map(r => r?.data ?? r));
  }
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/proyectos/${id}`);
  }
  cambiarEstado(id: number, estado: EstadoProyecto): Observable<void> {
    return this.http.patch<void>(`${this.base}/proyectos/${id}/estado`, { id, estado });
  }
  actualizarAvance(id: number, avanceReal: number): Observable<void> {
    return this.http.patch<void>(`${this.base}/proyectos/${id}/avance`, { id, avanceReal });
  }

  // ── Fases ──────────────────────────────────────────────
  getFases(proyectoId: number): Observable<ProyectoFaseDto[]> {
    return this.http.get<any>(`${this.base}/proyectos/${proyectoId}/fases`).pipe(map(r => r?.data ?? r));
  }
  getFaseById(proyectoId: number, id: number): Observable<ProyectoFaseDto> {
    return this.http.get<any>(`${this.base}/proyectos/${proyectoId}/fases/${id}`).pipe(map(r => r?.data ?? r));
  }
  crearFase(proyectoId: number, req: CrearFaseRequest): Observable<ProyectoFaseDto> {
    return this.http.post<any>(`${this.base}/proyectos/${proyectoId}/fases`, req).pipe(map(r => r?.data ?? r));
  }
  actualizarFase(proyectoId: number, id: number, req: ActualizarFaseRequest): Observable<ProyectoFaseDto> {
    return this.http.put<any>(`${this.base}/proyectos/${proyectoId}/fases/${id}`, req).pipe(map(r => r?.data ?? r));
  }
  eliminarFase(proyectoId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/proyectos/${proyectoId}/fases/${id}`);
  }

  // ── Hitos ──────────────────────────────────────────────
  getHitos(proyectoId: number): Observable<ProyectoHitoDto[]> {
    return this.http.get<any>(`${this.base}/proyectos/${proyectoId}/hitos`).pipe(map(r => r?.data ?? r));
  }
  crearHito(proyectoId: number, req: CrearHitoRequest): Observable<ProyectoHitoDto> {
    return this.http.post<any>(`${this.base}/proyectos/${proyectoId}/hitos`, req).pipe(map(r => r?.data ?? r));
  }
  actualizarHito(proyectoId: number, id: number, req: ActualizarHitoRequest): Observable<ProyectoHitoDto> {
    return this.http.put<any>(`${this.base}/proyectos/${proyectoId}/hitos/${id}`, req).pipe(map(r => r?.data ?? r));
  }
  eliminarHito(proyectoId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/proyectos/${proyectoId}/hitos/${id}`);
  }
  marcarHitoLogrado(proyectoId: number, id: number, fechaReal: string): Observable<void> {
    return this.http.patch<void>(`${this.base}/proyectos/${proyectoId}/hitos/${id}/logrado`, { id, fechaReal });
  }

  // ── Documentos ──────────────────────────────────────────
  getDocumentos(proyectoId: number): Observable<ProyectoDocumentoDto[]> {
    return this.http.get<any>(`${this.base}/proyectos/${proyectoId}/documentos`).pipe(map(r => r?.data ?? r));
  }
  eliminarDocumento(proyectoId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/proyectos/${proyectoId}/documentos/${id}`);
  }

  // ── WBS ────────────────────────────────────────────────
  getWbs(proyectoId: number): Observable<WbsNodoDto[]> {
    return this.http.get<any>(`${this.base}/proyectos/${proyectoId}/wbs`).pipe(map(r => r?.data ?? r));
  }
  crearNodoWbs(proyectoId: number, req: CrearWbsNodoRequest): Observable<WbsNodoDto> {
    return this.http.post<any>(`${this.base}/proyectos/${proyectoId}/wbs`, req).pipe(map(r => r?.data ?? r));
  }
  actualizarNodoWbs(proyectoId: number, id: number, req: ActualizarWbsNodoRequest): Observable<WbsNodoDto> {
    return this.http.put<any>(`${this.base}/proyectos/${proyectoId}/wbs/${id}`, req).pipe(map(r => r?.data ?? r));
  }
  eliminarNodoWbs(proyectoId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/proyectos/${proyectoId}/wbs/${id}`);
  }

  // ── Tareas ─────────────────────────────────────────────
  getTareas(proyectoId: number): Observable<TareaListDto[]> {
    return this.http.get<any>(`${this.base}/proyectos/${proyectoId}/tareas`).pipe(map(r => r?.data ?? r));
  }
  getTareasByFase(proyectoId: number, faseId: number): Observable<TareaListDto[]> {
    return this.http.get<any>(`${this.base}/proyectos/${proyectoId}/tareas/por-fase/${faseId}`).pipe(map(r => r?.data ?? r));
  }
  getTareaById(proyectoId: number, id: number): Observable<TareaDto> {
    return this.http.get<any>(`${this.base}/proyectos/${proyectoId}/tareas/${id}`).pipe(map(r => r?.data ?? r));
  }
  crearTarea(proyectoId: number, req: CrearTareaRequest): Observable<TareaDto> {
    return this.http.post<any>(`${this.base}/proyectos/${proyectoId}/tareas`, req).pipe(map(r => r?.data ?? r));
  }
  actualizarTarea(proyectoId: number, id: number, req: ActualizarTareaRequest): Observable<TareaDto> {
    return this.http.put<any>(`${this.base}/proyectos/${proyectoId}/tareas/${id}`, req).pipe(map(r => r?.data ?? r));
  }
  eliminarTarea(proyectoId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/proyectos/${proyectoId}/tareas/${id}`);
  }
  cambiarEstadoTarea(proyectoId: number, id: number, estado: EstadoTarea): Observable<void> {
    return this.http.patch<void>(`${this.base}/proyectos/${proyectoId}/tareas/${id}/estado`, { id, estado });
  }
  actualizarAvanceTarea(proyectoId: number, id: number, porcentaje: number): Observable<void> {
    return this.http.patch<void>(`${this.base}/proyectos/${proyectoId}/tareas/${id}/avance`, { id, porcentaje });
  }
  agregarDependencia(proyectoId: number, tareaId: number, req: CrearDependenciaRequest): Observable<TareaDependenciaDto> {
    return this.http.post<any>(`${this.base}/proyectos/${proyectoId}/tareas/${tareaId}/dependencias`, req).pipe(map(r => r?.data ?? r));
  }
  eliminarDependencia(proyectoId: number, tareaId: number, depId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/proyectos/${proyectoId}/tareas/${tareaId}/dependencias/${depId}`);
  }

  // ── Cuadrillas ─────────────────────────────────────────
  getCuadrillas(proyectoId: number): Observable<CuadrillaDto[]> {
    return this.http.get<any>(`${this.base}/proyectos/${proyectoId}/cuadrillas`).pipe(map(r => r?.data ?? r));
  }
  crearCuadrilla(proyectoId: number, req: CrearCuadrillaRequest): Observable<CuadrillaDto> {
    return this.http.post<any>(`${this.base}/proyectos/${proyectoId}/cuadrillas`, req).pipe(map(r => r?.data ?? r));
  }
  actualizarCuadrilla(proyectoId: number, id: number, req: ActualizarCuadrillaRequest): Observable<CuadrillaDto> {
    return this.http.put<any>(`${this.base}/proyectos/${proyectoId}/cuadrillas/${id}`, req).pipe(map(r => r?.data ?? r));
  }
  eliminarCuadrilla(proyectoId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/proyectos/${proyectoId}/cuadrillas/${id}`);
  }
  agregarMiembro(proyectoId: number, cuadrillaId: number, empleadoId: number, rol?: string, fechaIngreso?: string): Observable<void> {
    return this.http.post<void>(`${this.base}/proyectos/${proyectoId}/cuadrillas/${cuadrillaId}/miembros`, { cuadrillaId, empleadoId, rol, fechaIngreso: fechaIngreso ?? new Date().toISOString().split('T')[0] });
  }
  removerMiembro(proyectoId: number, cuadrillaId: number, empleadoId: number, fechaSalida: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/proyectos/${proyectoId}/cuadrillas/${cuadrillaId}/miembros`, { body: { cuadrillaId, empleadoId, fechaSalida } });
  }

  // ── Presupuesto ────────────────────────────────────────
  getPresupuestos(proyectoId: number): Observable<PresupuestoDto[]> {
    return this.http.get<any>(`${this.base}/proyectos/${proyectoId}/presupuesto`).pipe(map(r => r?.data ?? r));
  }
  getPresupuestoActivo(proyectoId: number): Observable<PresupuestoDto | null> {
    return this.http.get<any>(`${this.base}/proyectos/${proyectoId}/presupuesto/activo`).pipe(map(r => r?.data ?? null));
  }
  getResumenEjecucion(proyectoId: number): Observable<ResumenEjecucionDto> {
    return this.http.get<any>(`${this.base}/proyectos/${proyectoId}/presupuesto/ejecucion`).pipe(map(r => r?.data ?? r));
  }
  getCostosReales(proyectoId: number): Observable<CostoRealDto[]> {
    return this.http.get<any>(`${this.base}/proyectos/${proyectoId}/presupuesto/costos`).pipe(map(r => r?.data ?? r));
  }
  crearPresupuesto(proyectoId: number, req: CrearPresupuestoRequest): Observable<PresupuestoDto> {
    return this.http.post<any>(`${this.base}/proyectos/${proyectoId}/presupuesto`, req).pipe(map(r => r?.data ?? r));
  }
  agregarPartida(proyectoId: number, presupuestoId: number, req: AgregarPartidaRequest): Observable<PresupuestoPartidaDto> {
    return this.http.post<any>(`${this.base}/proyectos/${proyectoId}/presupuesto/${presupuestoId}/partidas`, req).pipe(map(r => r?.data ?? r));
  }
  aprobarPresupuesto(proyectoId: number, presupuestoId: number): Observable<void> {
    return this.http.patch<void>(`${this.base}/proyectos/${proyectoId}/presupuesto/${presupuestoId}/aprobar`, {});
  }
  registrarCosto(proyectoId: number, req: RegistrarCostoRealRequest): Observable<CostoRealDto> {
    return this.http.post<any>(`${this.base}/proyectos/${proyectoId}/presupuesto/costos`, req).pipe(map(r => r?.data ?? r));
  }

  // ── Gantt ──────────────────────────────────────────────
  getGantt(proyectoId: number): Observable<GanttDto> {
    return this.http.get<any>(`${this.base}/proyectos/${proyectoId}/gantt`).pipe(map(r => r?.data ?? r));
  }
  capturarLineaBase(proyectoId: number): Observable<void> {
    return this.http.post<void>(`${this.base}/proyectos/${proyectoId}/gantt/linea-base`, { proyectoId });
  }
  registrarProgresoGantt(proyectoId: number, req: RegistrarProgresoGanttRequest): Observable<void> {
    return this.http.post<void>(`${this.base}/proyectos/${proyectoId}/gantt/progreso`, req);
  }

  // ── Centros de Costo ───────────────────────────────────
  getCentrosCosto(proyectoId: number): Observable<CentroCostoDto[]> {
    return this.http.get<any>(`${this.base}/proyectos/${proyectoId}/centros-costo`).pipe(map(r => r?.data ?? r));
  }
  crearCentroCosto(proyectoId: number, req: CrearCentroCostoRequest): Observable<CentroCostoDto> {
    return this.http.post<any>(`${this.base}/proyectos/${proyectoId}/centros-costo`, req).pipe(map(r => r?.data ?? r));
  }
  actualizarCentroCosto(proyectoId: number, id: number, req: ActualizarCentroCostoRequest): Observable<CentroCostoDto> {
    return this.http.put<any>(`${this.base}/proyectos/${proyectoId}/centros-costo/${id}`, req).pipe(map(r => r?.data ?? r));
  }
  eliminarCentroCosto(proyectoId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/proyectos/${proyectoId}/centros-costo/${id}`);
  }

  // ── Órdenes de Trabajo ─────────────────────────────────
  getOrdenes(filtro: FiltroOTRequest): Observable<PagedResult<OrdenTrabajoListDto>> {
    let params = new HttpParams().set('Pagina', filtro.pagina).set('ElementosPorPagina', filtro.elementosPorPagina);
    if (filtro.busqueda)    params = params.set('Busqueda', filtro.busqueda);
    if (filtro.estado)      params = params.set('Estado', filtro.estado);
    if (filtro.proyectoId)  params = params.set('ProyectoId', filtro.proyectoId);
    if (filtro.cuadrillaId) params = params.set('CuadrillaId', filtro.cuadrillaId);
    return this.http.get<any>(`${this.base}/ordenes-trabajo`, { params }).pipe(map(r => r?.data ?? r));
  }
  getOrdenesByProyecto(proyectoId: number): Observable<OrdenTrabajoListDto[]> {
    return this.http.get<any>(`${this.base}/proyectos/${proyectoId}/ordenes-trabajo`).pipe(map(r => r?.data ?? r));
  }
  getOrdenById(id: number): Observable<OrdenTrabajoDto> {
    return this.http.get<any>(`${this.base}/ordenes-trabajo/${id}`).pipe(map(r => r?.data ?? r));
  }
  crearOrden(req: CrearOrdenTrabajoRequest): Observable<OrdenTrabajoDto> {
    return this.http.post<any>(`${this.base}/ordenes-trabajo`, req).pipe(map(r => r?.data ?? r));
  }
  actualizarOrden(id: number, req: ActualizarOrdenTrabajoRequest): Observable<OrdenTrabajoDto> {
    return this.http.put<any>(`${this.base}/ordenes-trabajo/${id}`, req).pipe(map(r => r?.data ?? r));
  }
  eliminarOrden(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/ordenes-trabajo/${id}`);
  }
  cambiarEstadoOT(id: number, estado: EstadoOrdenTrabajo): Observable<void> {
    return this.http.patch<void>(`${this.base}/ordenes-trabajo/${id}/estado`, { id, estado });
  }
  completarActividad(otId: number, actividadId: number, observaciones?: string): Observable<void> {
    return this.http.patch<void>(`${this.base}/ordenes-trabajo/${otId}/actividades`, { otId, actividadId, observaciones });
  }

  // ── Reportes de Avance ─────────────────────────────────
  getReportes(proyectoId: number): Observable<ReporteAvanceDto[]> {
    return this.http.get<any>(`${this.base}/proyectos/${proyectoId}/reportes`).pipe(map(r => r?.data ?? r));
  }
  crearReporte(proyectoId: number, req: CrearReporteRequest): Observable<ReporteAvanceDto> {
    return this.http.post<any>(`${this.base}/proyectos/${proyectoId}/reportes`, req).pipe(map(r => r?.data ?? r));
  }

  // ── KPIs y Alertas ─────────────────────────────────────
  getKpis(proyectoId: number): Observable<KpiProyectoDto[]> {
    return this.http.get<any>(`${this.base}/proyectos/${proyectoId}/kpis`).pipe(map(r => r?.data ?? r));
  }
  calcularKpis(proyectoId: number): Observable<void> {
    return this.http.post<void>(`${this.base}/proyectos/${proyectoId}/kpis/calcular`, { proyectoId });
  }
  getAlertas(proyectoId: number): Observable<AlertaProyectoDto[]> {
    return this.http.get<any>(`${this.base}/proyectos/${proyectoId}/alertas`).pipe(map(r => r?.data ?? r));
  }
  getAlertasCount(): Observable<number> {
    return this.http.get<any>(`${this.base}/alertas/no-leidas-count`).pipe(
      map(r => r?.data ?? 0), tap(n => this.alertasCount.set(n))
    );
  }
  marcarAlertaLeida(proyectoId: number, alertaId: number): Observable<void> {
    return this.http.patch<void>(`${this.base}/proyectos/${proyectoId}/alertas/${alertaId}/leida`, {});
  }
  marcarTodasLeidas(proyectoId: number): Observable<void> {
    return this.http.patch<void>(`${this.base}/proyectos/${proyectoId}/alertas/marcar-todas-leidas`, {});
  }
}
