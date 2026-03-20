// ═══════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════
export enum EstadoProyecto {
  Borrador    = 1, Planificado = 2, EnEjecucion = 3,
  EnPausa     = 4, Completado  = 5, Cancelado   = 6,
}
export enum TipoProyecto {
  NuevaObra = 1, Mantenimiento = 2, Expansion = 3,
  Migracion = 4, Emergencia    = 5, Consultoria = 6,
}
export enum PrioridadProyecto { Baja = 1, Media = 2, Alta = 3, Critica = 4 }
export enum EstadoFase   { Pendiente = 1, EnCurso = 2, Completada = 3, EnPausa = 4 }
export enum EstadoHito   { Pendiente = 1, EnRiesgo = 2, Logrado = 3, Vencido = 4 }
export enum EstadoTarea  { Pendiente = 1, EnCurso = 2, Completada = 3, Bloqueada = 4, Cancelada = 5 }
export enum PrioridadTarea { Baja = 1, Media = 2, Alta = 3, Critica = 4 }
export enum TipoNodoWbs  { EntregablePrincipal = 1, Subentregable = 2, Paquete = 3, Actividad = 4 }
export enum TipoDependencia { FS = 1, SS = 2, FF = 3, SF = 4 }
export enum EstadoOrdenTrabajo { Borrador = 1, Asignada = 2, EnCurso = 3, Completada = 4, Cancelada = 5 }
export enum TipoPartida { ManoObra = 1, Materiales = 2, Subcontratos = 3, Equipos = 4, Indirectos = 5 }
export enum OrigenCosto  { Manual = 1, OrdenTrabajo = 2, Nomina = 3, Compra = 4 }
export enum TipoKpi      { SPI = 1, CPI = 2, CV = 3, SV = 4, EAC = 5, ETC = 6 }
export enum SeveridadAlerta  { Info = 1, Warning = 2, Critica = 3 }
export enum TipoAlerta       { RetrasoFecha = 1, SobrecostoPresup = 2, HitoVencido = 3, RecursoFaltante = 4 }
export enum TipoDocumento    { Contrato = 1, Plano = 2, Especificacion = 3, Acta = 4, Otro = 5 }

// ═══════════════════════════════════════════════════════
// DTOs — Proyecto
// ═══════════════════════════════════════════════════════
export interface ProyectoListDto {
  id: number; codigo: string; nombre: string;
  tipoProyecto: TipoProyecto; estado: EstadoProyecto; prioridad: PrioridadProyecto;
  fechaInicioPlan?: string; fechaFinPlan?: string;
  porcentajeAvancePlan: number; porcentajeAvanceReal: number;
  presupuestoTotal: number; costoRealTotal: number;
  gerenteProyectoNombre?: string; activo: boolean;
}
export interface ProyectoDto {
  id: number; empresaId: number; codigo: string; nombre: string; descripcion?: string;
  tipoProyecto: TipoProyecto; estado: EstadoProyecto; prioridad: PrioridadProyecto;
  fechaInicioPlan?: string; fechaFinPlan?: string;
  fechaInicioReal?: string; fechaFinReal?: string;
  monedaId?: number; monedaNombre?: string;
  presupuestoTotal: number; costoRealTotal: number;
  porcentajeAvancePlan: number; porcentajeAvanceReal: number;
  clienteId?: number; clienteNombre?: string;
  gerenteProyectoId?: number; gerenteProyectoNombre?: string;
  responsableId?: number; responsableNombre?: string;
  sucursalId?: number; sucursalNombre?: string;
  latitud?: number; longitud?: number; direccion?: string;
  activo: boolean; fechaCreacion: string;
  fases: ProyectoFaseDto[];
}
export interface ProyectoDashboardDto {
  id: number; codigo: string; nombre: string; estado: EstadoProyecto;
  porcentajeAvancePlan: number; porcentajeAvanceReal: number;
  presupuestoTotal: number; costoRealTotal: number;
  diasRestantes?: number; estaRetrasado: boolean;
  hitosCercanos: ProyectoHitoListDto[];
  alertasActivas: AlertaProyectoDto[];
  ultimosKpis: KpiProyectoDto[];
}

// ═══════════════════════════════════════════════════════
// DTOs — Fases
// ═══════════════════════════════════════════════════════
export interface ProyectoFaseDto {
  id: number; proyectoId: number; codigo: string; nombre: string; descripcion?: string;
  orden: number; fechaInicioPlan?: string; fechaFinPlan?: string;
  fechaInicioReal?: string; fechaFinReal?: string;
  porcentajeAvance: number; estado: EstadoFase; activo: boolean;
}

// ═══════════════════════════════════════════════════════
// DTOs — Hitos
// ═══════════════════════════════════════════════════════
export interface ProyectoHitoDto {
  id: number; proyectoId: number; nombre: string; descripcion?: string;
  fechaCompromiso: string; fechaReal?: string;
  estado: EstadoHito; porcentajePeso: number;
  responsableId?: number; responsableNombre?: string; orden: number; activo: boolean;
}
export interface ProyectoHitoListDto {
  id: number; nombre: string; fechaCompromiso: string;
  estado: EstadoHito; porcentajePeso: number; responsableNombre?: string; orden: number;
}

// ═══════════════════════════════════════════════════════
// DTOs — Documentos
// ═══════════════════════════════════════════════════════
export interface ProyectoDocumentoDto {
  id: number; proyectoId: number; tipoDocumento: TipoDocumento;
  nombre: string; descripcion?: string; urlStorage: string;
  nombreArchivoOriginal: string; extension: string; tamanoBytes: number;
  subidoPorNombre?: string; fechaSubida: string; activo: boolean;
}

// ═══════════════════════════════════════════════════════
// DTOs — WBS
// ═══════════════════════════════════════════════════════
export interface WbsNodoDto {
  id: number; proyectoId: number; faseId?: number; padreId?: number;
  codigoWbs: string; nombre: string; descripcion?: string;
  tipoNodo: TipoNodoWbs; nivel: number; orden: number;
  pesoRelativo: number; porcentajeAvance: number; esHoja: boolean;
  hijos: WbsNodoDto[];
  tareas: TareaListDto[];
}

// ═══════════════════════════════════════════════════════
// DTOs — Tareas
// ═══════════════════════════════════════════════════════
export interface TareaListDto {
  id: number; proyectoId: number; wbsNodoId?: number; faseId?: number;
  nombre: string; estado: EstadoTarea; prioridad: PrioridadTarea;
  fechaInicioPlan?: string; fechaFinPlan?: string;
  porcentajeAvance: number;
  responsableId?: number; responsableNombre?: string;
  cuadrillaId?: number; cuadrillaNombre?: string;
}
export interface TareaDto extends TareaListDto {
  descripcion?: string;
  fechaInicioReal?: string; fechaFinReal?: string;
  duracionDiasPlan: number; duracionDiasReal: number;
  dependenciasOrigen: TareaDependenciaDto[];
  dependenciasDestino: TareaDependenciaDto[];
}
export interface TareaDependenciaDto {
  id: number;
  tareaOrigenId: number; tareaOrigenNombre: string;
  tareaDestinoId: number; tareaDestinoNombre: string;
  tipoDependencia: TipoDependencia; desfase: number;
}

// ═══════════════════════════════════════════════════════
// DTOs — Cuadrillas
// ═══════════════════════════════════════════════════════
export interface CuadrillaDto {
  id: number; proyectoId: number; nombre: string; descripcion?: string;
  liderId?: number; liderNombre?: string; capacidadMaxima: number;
  miembros: CuadrillaMiembroDto[];
}
export interface CuadrillaMiembroDto {
  id: number; cuadrillaId: number;
  empleadoId: number; empleadoNombre: string;
  fechaIngreso: string; fechaSalida?: string; rol?: string;
}

// ═══════════════════════════════════════════════════════
// DTOs — Presupuesto
// ═══════════════════════════════════════════════════════
export interface PresupuestoDto {
  id: number; proyectoId: number; version: number; descripcion?: string;
  estado: number; totalGeneral: number;
  fechaAprobacion?: string; aprobadoPorId?: number;
  partidas: PresupuestoPartidaDto[];
}
export interface PresupuestoPartidaDto {
  id: number; presupuestoId: number; tipo: TipoPartida;
  concepto: string; descripcion?: string; codigoContable?: string;
  cantidad: number; unidadMedida?: string; precioUnitario: number;
  subtotal: number; porcentaje: number; total: number; orden: number;
}
export interface ResumenEjecucionDto {
  proyectoId: number; totalPresupuestado: number; totalEjecutado: number;
  saldo: number; porcentajeEjecucion: number;
  porPartida: EjecucionPartidaDto[];
}
export interface EjecucionPartidaDto {
  partidaId: number; concepto: string; tipo: TipoPartida;
  presupuestado: number; ejecutado: number; saldo: number; porcentaje: number;
}
export interface CostoRealDto {
  id: number; presupuestoId: number; partidaId?: number;
  origen: OrigenCosto; concepto: string; observaciones?: string;
  monto: number; fecha: string; ordenTrabajoId?: number;
}

// ═══════════════════════════════════════════════════════
// DTOs — Gantt
// ═══════════════════════════════════════════════════════
export interface GanttDto {
  proyectoId: number; proyectoNombre: string;
  fechaInicio: string; fechaFin: string;
  fases: GanttFaseDto[];
}
export interface GanttFaseDto {
  faseId: number; faseNombre: string;
  fechaInicio: string; fechaFin: string; porcentajeAvance: number;
  tareas: GanttTareaDto[];
}
export interface GanttTareaDto {
  tareaId: number; tareaNombre: string;
  fechaInicioPlan?: string; fechaFinPlan?: string;
  fechaInicioReal?: string; fechaFinReal?: string;
  fechaInicioBase?: string; fechaFinBase?: string;
  porcentajeAvance: number; estado: EstadoTarea;
  dependencias: number[];
}

// ═══════════════════════════════════════════════════════
// DTOs — Centros de Costo
// ═══════════════════════════════════════════════════════
export interface CentroCostoDto {
  id: number; proyectoId: number; codigo: string;
  nombre: string; descripcion?: string; presupuestoAnual: number;
}

// ═══════════════════════════════════════════════════════
// DTOs — Órdenes de Trabajo
// ═══════════════════════════════════════════════════════
export interface OrdenTrabajoListDto {
  id: number; proyectoId: number; codigo: string;
  descripcion: string; estado: EstadoOrdenTrabajo;
  fechaProgramada?: string; fechaInicioEjecucion?: string; fechaFinEjecucion?: string;
  cuadrillaId?: number; cuadrillaNombre?: string;
  tecnicoAsignadoId?: number; tecnicoAsignadoNombre?: string;
}
export interface OrdenTrabajoDto extends OrdenTrabajoListDto {
  tareaId?: number;
  latitud?: number; longitud?: number; direccion?: string;
  observacionesCierre?: string; urlFirmaDigital?: string;
  primerIntento: boolean;
  actividades: OtActividadDto[];
  materiales: OtMaterialDto[];
}
export interface OtActividadDto {
  id: number; ordenTrabajoId: number; nombre: string;
  descripcion?: string; orden: number; completada: boolean;
  fechaComplecion?: string; observaciones?: string;
}
export interface OtMaterialDto {
  id: number; ordenTrabajoId: number;
  nombreMaterial: string; codigoMaterial?: string;
  unidadMedida?: string; cantidadPlan: number; cantidadReal: number;
  costoUnitario: number; costoTotal: number;
}

// ═══════════════════════════════════════════════════════
// DTOs — Reportes de Avance
// ═══════════════════════════════════════════════════════
export interface ReporteAvanceDto {
  id: number; proyectoId: number;
  fechaReporte: string; titulo: string;
  avanceGeneral: number; avanceCosto: number;
  observaciones?: string; creadoPorId: number;
  fotos: ReporteAvanceFotoDto[];
}
export interface ReporteAvanceFotoDto {
  id: number; reporteId: number; urlStorage: string;
  nombreArchivo: string; descripcion?: string;
  latitud?: number; longitud?: number; orden: number;
}

// ═══════════════════════════════════════════════════════
// DTOs — KPIs y Alertas
// ═══════════════════════════════════════════════════════
export interface KpiProyectoDto {
  id: number; proyectoId: number; tipoKpi: TipoKpi; nombre: string;
  valor: number; valorMeta?: number; fechaCalculo: string;
  semaforo: 'verde' | 'amarillo' | 'rojo';
}
export interface AlertaProyectoDto {
  id: number; proyectoId: number; tipoAlerta: TipoAlerta;
  severidad: SeveridadAlerta; titulo: string; mensaje: string;
  fechaAlerta: string; leida: boolean; resuelta: boolean;
}

// ═══════════════════════════════════════════════════════
// REQUESTS
// ═══════════════════════════════════════════════════════
export interface CrearProyectoRequest {
  codigo: string; nombre: string; descripcion?: string;
  tipoProyecto: TipoProyecto; prioridad: PrioridadProyecto;
  fechaInicioPlan?: string; fechaFinPlan?: string;
  monedaId?: number; presupuestoTotal: number;
  clienteId?: number; gerenteProyectoId?: number;
  responsableId?: number; sucursalId?: number;
  latitud?: number; longitud?: number; direccion?: string;
  empresaId?: number;
}
export interface ActualizarProyectoRequest extends CrearProyectoRequest {
  fechaInicioReal?: string; fechaFinReal?: string;
}
export interface CrearFaseRequest {
  proyectoId: number; codigo: string; nombre: string; descripcion?: string;
  orden: number; fechaInicioPlan?: string; fechaFinPlan?: string;
}
export interface ActualizarFaseRequest extends CrearFaseRequest {
  id: number; estado: EstadoFase; porcentajeAvance: number;
  fechaInicioReal?: string; fechaFinReal?: string;
}
export interface CrearHitoRequest {
  proyectoId: number; nombre: string; descripcion?: string;
  fechaCompromiso: string; porcentajePeso: number;
  responsableId?: number; orden: number;
}
export interface ActualizarHitoRequest extends CrearHitoRequest { id: number; estado: EstadoHito; }
export interface CrearWbsNodoRequest {
  proyectoId: number; faseId?: number; padreId?: number;
  codigo: string; nombre: string; descripcion?: string;
  tipoNodo: TipoNodoWbs; orden: number; porcentajePeso: number;
}
export interface ActualizarWbsNodoRequest extends CrearWbsNodoRequest { id: number; }
export interface CrearTareaRequest {
  proyectoId: number; wbsNodoId?: number; cuadrillaId?: number;
  responsableId?: number; nombre: string; descripcion?: string;
  prioridad: PrioridadTarea; fechaInicioPlan?: string; fechaFinPlan?: string;
  duracionDias?: number;
}
export interface ActualizarTareaRequest extends CrearTareaRequest {
  id: number; fechaInicioReal?: string; fechaFinReal?: string;
}
export interface CrearDependenciaRequest {
  tareaOrigenId: number; tareaDestinoId: number;
  tipoDependencia: TipoDependencia; desfase?: number;
}
export interface CrearCuadrillaRequest {
  proyectoId: number; nombre: string; descripcion?: string;
  liderId?: number; capacidadMax: number;
}
export interface ActualizarCuadrillaRequest extends CrearCuadrillaRequest { id: number; }
export interface CrearPresupuestoRequest {
  proyectoId: number; nombre?: string; descripcion?: string;
}
export interface AgregarPartidaRequest {
  presupuestoId: number; tipo: TipoPartida; concepto: string;
  descripcion?: string; codigoContable?: string;
  cantidad: number; unidadMedida?: string; precioUnitario: number;
  porcentaje: number; orden: number;
}
export interface RegistrarCostoRealRequest {
  presupuestoId: number; partidaId?: number; origen: OrigenCosto;
  concepto: string; descripcion?: string; monto: number;
  fechaRegistro: string; ordenTrabajoId?: number;
}
export interface RegistrarProgresoGanttRequest {
  tareaId: number; fechaProgreso: string;
  porcentajeAvance: number; horasTrabajadas?: number; observaciones?: string;
}
export interface CrearCentroCostoRequest {
  proyectoId: number; codigo: string; nombre: string;
  descripcion?: string; presupuestoAsignado: number;
}
export interface ActualizarCentroCostoRequest extends CrearCentroCostoRequest { id: number; }
export interface CrearOrdenTrabajoRequest {
  proyectoId: number; tareaId?: number; cuadrillaId?: number;
  tecnicoResponsableId?: number; titulo?: string; descripcion?: string;
  fechaInicioPlan?: string; latitud?: number; longitud?: number;
  direcSitio?: string;
  actividades: { nombre: string; descripcion?: string }[];
  materiales: { nombreMaterial: string; codigoMaterial?: string; unidadMedida?: string; cantidadPlan: number; costoUnitario: number }[];
}
export interface ActualizarOrdenTrabajoRequest extends Partial<CrearOrdenTrabajoRequest> {
  id: number; observacionesSupervisor?: string;
}
export interface CrearReporteRequest {
  proyectoId: number; fechaReporte: string; titulo: string;
  porcentajeAvancePlan: number; porcentajeAvanceReal: number;
  observaciones?: string;
}

// ═══════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════
export interface FiltroProyectosRequest {
  busqueda?: string; estado?: EstadoProyecto; tipo?: TipoProyecto;
  gerenteId?: number; pagina: number; elementosPorPagina: number;
}
export interface FiltroOTRequest {
  busqueda?: string; estado?: EstadoOrdenTrabajo;
  proyectoId?: number; cuadrillaId?: number;
  pagina: number; elementosPorPagina: number;
}
export interface PagedResult<T> { items: T[]; total: number; }

export const ESTADO_LABELS: Record<EstadoProyecto, string> = {
  [EstadoProyecto.Borrador]: 'Borrador', [EstadoProyecto.Planificado]: 'Planificado',
  [EstadoProyecto.EnEjecucion]: 'En Ejecución', [EstadoProyecto.EnPausa]: 'En Pausa',
  [EstadoProyecto.Completado]: 'Completado', [EstadoProyecto.Cancelado]: 'Cancelado',
};
export const TIPO_LABELS: Record<TipoProyecto, string> = {
  [TipoProyecto.NuevaObra]: 'Nueva Obra', [TipoProyecto.Mantenimiento]: 'Mantenimiento',
  [TipoProyecto.Expansion]: 'Expansión', [TipoProyecto.Migracion]: 'Migración',
  [TipoProyecto.Emergencia]: 'Emergencia', [TipoProyecto.Consultoria]: 'Consultoría',
};
export const PRIORIDAD_LABELS: Record<PrioridadProyecto, string> = {
  [PrioridadProyecto.Baja]: 'Baja', [PrioridadProyecto.Media]: 'Media',
  [PrioridadProyecto.Alta]: 'Alta', [PrioridadProyecto.Critica]: 'Crítica',
};
export const ESTADO_FASE_LABELS: Record<EstadoFase, string> = {
  [EstadoFase.Pendiente]: 'Pendiente', [EstadoFase.EnCurso]: 'En Curso',
  [EstadoFase.Completada]: 'Completada', [EstadoFase.EnPausa]: 'En Pausa',
};
export const ESTADO_TAREA_LABELS: Record<EstadoTarea, string> = {
  [EstadoTarea.Pendiente]: 'Pendiente', [EstadoTarea.EnCurso]: 'En Curso',
  [EstadoTarea.Completada]: 'Completada', [EstadoTarea.Bloqueada]: 'Bloqueada',
  [EstadoTarea.Cancelada]: 'Cancelada',
};
export const ESTADO_OT_LABELS: Record<EstadoOrdenTrabajo, string> = {
  [EstadoOrdenTrabajo.Borrador]: 'Borrador', [EstadoOrdenTrabajo.Asignada]: 'Asignada',
  [EstadoOrdenTrabajo.EnCurso]: 'En Curso', [EstadoOrdenTrabajo.Completada]: 'Completada',
  [EstadoOrdenTrabajo.Cancelada]: 'Cancelada',
};
export const TIPO_PARTIDA_LABELS: Record<TipoPartida, string> = {
  [TipoPartida.ManoObra]: 'Mano de Obra', [TipoPartida.Materiales]: 'Materiales',
  [TipoPartida.Subcontratos]: 'Subcontratos', [TipoPartida.Equipos]: 'Equipos',
  [TipoPartida.Indirectos]: 'Costos Indirectos',
};
export function enumNums<T extends object>(e: T): number[] {
  return Object.values(e).filter(v => typeof v === 'number') as number[];
}

// ── DTOs — Recursos del Proyecto ────────────────────────
// Agregar después de CuadrillaMiembroDto

export interface RecursoProyectoDto {
  id: number;
  proyectoId: number;
  empleadoId: number;
  empleadoNombre?: string;
  tareaId?: number;
  tareaNombre?: string;
  rolProyecto: number;           // 1=Líder, 2=Gerente, 3=Técnico, 4=Supervisor, 5=Apoyo
  fechaInicio?: string;
  fechaFin?: string;
  horasPlan: number;
  horasReal: number;
  costoHora: number;
  observaciones?: string;
  activo: boolean;
}

// ── REQUESTS — Recursos ─────────────────────────────────
// Agregar después de ActualizarCuadrillaRequest

export interface CrearRecursoRequest {
  empleadoId: number;
  rolProyecto: number;
  tareaId?: number;
  fechaInicio?: string;
  fechaFin?: string;
  horasPlan: number;
  costoHora: number;
  observaciones?: string;
}

export interface ActualizarHorasRecursoRequest {
  horasReal: number;
  observaciones?: string;
}

// ── REQUESTS — Documentos ───────────────────────────────
// El service ya tiene getDocumentos y eliminarDocumento.
// Solo falta crearDocumento. Agrega esta interface:

export interface CrearDocumentoRequest {
  proyectoId: number;
  nombre: string;
  tipoDocumento: TipoDocumento;  // importar TipoDocumento del mismo archivo
  descripcion?: string;
  urlStorage: string;
  nombreArchivoOriginal: string;
  extension: string;
  tamanoBytes: number;
}
