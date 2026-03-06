// ═══════════════════════════════════════════════════════
// ENUMS — numéricos para coincidir con el backend
// ═══════════════════════════════════════════════════════
export enum EstadoProyecto {
  Borrador    = 1,
  Planificado = 2,
  EnEjecucion = 3,
  EnPausa     = 4,
  Completado  = 5,
  Cancelado   = 6,
}
export enum TipoProyecto {
  NuevaObra     = 1,
  Mantenimiento = 2,
  Expansion     = 3,
  Migracion     = 4,
  Emergencia    = 5,
  Consultoria   = 6,
}
export enum PrioridadProyecto {
  Baja    = 1,
  Media   = 2,
  Alta    = 3,
  Critica = 4,
}
export enum TipoKpi {
  SPI = 1, CPI = 2, CV = 3, SV = 4, EAC = 5, ETC = 6
}
export enum EstadoHito    { Pendiente = 1, EnRiesgo = 2, Logrado = 3, Vencido = 4 }
export enum SeveridadAlerta { Info = 1, Warning = 2, Critica = 3 }
export enum TipoAlerta    { RetrasoFecha = 1, SobrecostoPresup = 2, HitoVencido = 3, RecursoFaltante = 4 }

// ═══════════════════════════════════════════════════════
// DTOs
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
export interface ProyectoFaseDto {
  id: number; proyectoId: number; codigo: string; nombre: string; descripcion?: string;
  orden: number; fechaInicioPlan?: string; fechaFinPlan?: string;
  porcentajeAvance: number; estado: string; activo: boolean;
}
export interface ProyectoHitoListDto {
  id: number; nombre: string; fechaCompromiso: string;
  estado: EstadoHito; porcentajePeso: number; responsableNombre?: string; orden: number;
}
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
export interface FiltroProyectosRequest {
  busqueda?: string;
  estado?: EstadoProyecto;
  tipo?: TipoProyecto;
  gerenteId?: number;
  pagina: number;
  elementosPorPagina: number;
}
export interface PagedResult<T> { items: T[]; total: number; }

// ═══════════════════════════════════════════════════════
// HELPERS UI
// ═══════════════════════════════════════════════════════
export const ESTADO_LABELS: Record<EstadoProyecto, string> = {
  [EstadoProyecto.Borrador]:    'Borrador',
  [EstadoProyecto.Planificado]: 'Planificado',
  [EstadoProyecto.EnEjecucion]: 'En Ejecución',
  [EstadoProyecto.EnPausa]:     'En Pausa',
  [EstadoProyecto.Completado]:  'Completado',
  [EstadoProyecto.Cancelado]:   'Cancelado',
};
export const TIPO_LABELS: Record<TipoProyecto, string> = {
  [TipoProyecto.NuevaObra]:     'Nueva Obra',
  [TipoProyecto.Mantenimiento]: 'Mantenimiento',
  [TipoProyecto.Expansion]:     'Expansión',
  [TipoProyecto.Migracion]:     'Migración',
  [TipoProyecto.Emergencia]:    'Emergencia',
  [TipoProyecto.Consultoria]:   'Consultoría',
};
export const PRIORIDAD_LABELS: Record<PrioridadProyecto, string> = {
  [PrioridadProyecto.Baja]:    'Baja',
  [PrioridadProyecto.Media]:   'Media',
  [PrioridadProyecto.Alta]:    'Alta',
  [PrioridadProyecto.Critica]: 'Crítica',
};
// Helper para filtrar enums numéricos con Object.values
export function enumNums<T extends object>(e: T): number[] {
  return Object.values(e).filter(v => typeof v === 'number') as number[];
}
