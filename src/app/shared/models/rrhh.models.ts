// =====================================================================
// SOLARIS Web Desktop — Módulo RRHH — Modelos TypeScript
// Patrón: usuario.models.ts + common.models.ts
// =====================================================================

// ─── Enums ────────────────────────────────────────────────────────────

export enum NivelJerarquico { Operativo = 1, Supervisor = 2, Gerencia = 3, Direccion = 4 }
export enum TipoContrato    { Indefinido = 1, PlazoFijo = 2, ObraCierta = 3, Pasantia = 4 }
export enum ModalidadTrabajo{ Presencial = 1, Remoto = 2, Hibrido = 3 }
export enum JornadaLaboral  { Completa = 1, Parcial = 2 }
export enum EstadoEmpleado  { Activo = 1, Licencia = 2, Vacaciones = 3, Egresado = 4 }
export enum Genero          { Masculino = 1, Femenino = 2, Otro = 3 }
export enum EstadoCivil     { Soltero = 1, Casado = 2, Divorciado = 3, Viudo = 4, UnionLibre = 5 }
export enum TipoCuenta      { Ahorros = 1, Corriente = 2 }
export enum TipoHorario       { Fijo = 1, Flexible = 2, Rotativo = 3 }
export enum EstadoCapacitacion{ Planificada = 1, EnCurso = 2, Finalizada = 3, Cancelada = 4 }
export enum EstadoPrestamo    { Pendiente = 1, Aprobado = 2, Rechazado = 3, EnPago = 4, Cancelado = 5 }
export enum TipoPrestamo      { Personal = 1, Quirografario = 2, Hipotecario = 3 }
export enum EstadoRequisicion { Borrador = 1, PendienteAprobacion = 2, Aprobada = 3, EnProceso = 4, Cerrada = 5, Cancelada = 6 }
export enum EtapaPostulacion  { Recibida = 1, Preseleccionada = 2, Entrevista = 3, Finalista = 4, Seleccionada = 5, Descartada = 6 }
export enum TipoConcepto      { Ingreso = 1, Descuento = 2, AportePatronal = 3 }
export enum EstadoPeriodo     { Abierto = 1, Cerrado = 2, Pagado = 3 }

// ─── Labels (mismo patrón que ESTADO_USUARIO_LABELS) ─────────────────

export const NIVEL_JERARQUICO_LABELS: Record<number, string> = {
  [NivelJerarquico.Operativo]:  'Operativo',
  [NivelJerarquico.Supervisor]: 'Supervisor',
  [NivelJerarquico.Gerencia]:   'Gerencia',
  [NivelJerarquico.Direccion]:  'Dirección',
};

export const TIPO_CONTRATO_LABELS: Record<number, string> = {
  [TipoContrato.Indefinido]: 'Indefinido',
  [TipoContrato.PlazoFijo]:  'Plazo Fijo',
  [TipoContrato.ObraCierta]: 'Obra Cierta',
  [TipoContrato.Pasantia]:   'Pasantía',
};

export const MODALIDAD_LABELS: Record<number, string> = {
  [ModalidadTrabajo.Presencial]: 'Presencial',
  [ModalidadTrabajo.Remoto]:     'Remoto',
  [ModalidadTrabajo.Hibrido]:    'Híbrido',
};

export const ESTADO_EMPLEADO_LABELS: Record<number, string> = {
  [EstadoEmpleado.Activo]:     'Activo',
  [EstadoEmpleado.Licencia]:   'En Licencia',
  [EstadoEmpleado.Vacaciones]: 'Vacaciones',
  [EstadoEmpleado.Egresado]:   'Egresado',
};

export const GENERO_LABELS: Record<number, string> = {
  [Genero.Masculino]: 'Masculino',
  [Genero.Femenino]:  'Femenino',
  [Genero.Otro]:      'Otro',
};

export const ESTADO_CIVIL_LABELS: Record<number, string> = {
  [EstadoCivil.Soltero]:    'Soltero/a',
  [EstadoCivil.Casado]:     'Casado/a',
  [EstadoCivil.Divorciado]: 'Divorciado/a',
  [EstadoCivil.Viudo]:      'Viudo/a',
  [EstadoCivil.UnionLibre]: 'Unión Libre',
};

// ─── Select options ───────────────────────────────────────────────────

const toOptions = (labels: Record<number, string>) =>
  Object.entries(labels).map(([v, label]) => ({ label, value: +v }));

export const NIVEL_JERARQUICO_OPTIONS = toOptions(NIVEL_JERARQUICO_LABELS);
export const TIPO_CONTRATO_OPTIONS    = toOptions(TIPO_CONTRATO_LABELS);
export const MODALIDAD_OPTIONS        = toOptions(MODALIDAD_LABELS);
export const ESTADO_EMPLEADO_OPTIONS  = toOptions(ESTADO_EMPLEADO_LABELS);
export const GENERO_OPTIONS           = toOptions(GENERO_LABELS);
export const ESTADO_CIVIL_OPTIONS     = toOptions(ESTADO_CIVIL_LABELS);

export const TIPO_IDENTIFICACION_OPTIONS = [
  { label: 'Cédula',    value: 'CEDULA'    },
  { label: 'Pasaporte', value: 'PASAPORTE' },
  { label: 'RUC',       value: 'RUC'       },
];

export const JORNADA_OPTIONS = [
  { label: 'Completa', value: JornadaLaboral.Completa },
  { label: 'Parcial',  value: JornadaLaboral.Parcial  },
];

export const TIPO_CUENTA_OPTIONS = [
  { label: 'Cuenta de Ahorros', value: TipoCuenta.Ahorros   },
  { label: 'Cuenta Corriente',  value: TipoCuenta.Corriente },
];

// ─── Departamento ─────────────────────────────────────────────────────

export interface DepartamentoListItem {
  id: number;
  empresaId: number;
  departamentoPadreId?: number;
  departamentoPadreNombre?: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  responsableId?: number;
  responsableNombre?: string;
  presupuestoAnual?: number;
  nivel: number;
  activo: boolean;
}

export type Departamento = DepartamentoListItem;

export interface CrearDepartamentoRequest {
  empresaId: number;
  departamentoPadreId?: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  responsableId?: number;
  presupuestoAnual?: number;
}

export interface ActualizarDepartamentoRequest {
  departamentoPadreId?: number;
  nombre: string;
  descripcion?: string;
  responsableId?: number;
  presupuestoAnual?: number;
}

// ─── Puesto ───────────────────────────────────────────────────────────

export interface PuestoListItem {
  id: number;
  empresaId: number;
  departamentoId: number;
  departamentoNombre: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  nivelJerarquico: NivelJerarquico;
  bandaSalarialMin?: number;
  bandaSalarialMax?: number;
  requiereTitulo: boolean;
  activo: boolean;
}

export type Puesto = PuestoListItem;

export interface CrearPuestoRequest {
  empresaId: number;
  departamentoId: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  nivelJerarquico: number;
  bandaSalarialMin?: number;
  bandaSalarialMax?: number;
  requiereTitulo: boolean;
}

export interface ActualizarPuestoRequest {
  departamentoId: number;
  nombre: string;
  descripcion?: string;
  nivelJerarquico: number;
  bandaSalarialMin?: number;
  bandaSalarialMax?: number;
  requiereTitulo: boolean;
}

// ─── Empleado ─────────────────────────────────────────────────────────

export interface EmpleadoListItem {
  id: number;
  empresaId: number;
  codigo: string;
  tipoIdentificacion: string;
  numeroIdentificacion: string;
  nombreCompleto: string;
  nombres: string;
  apellidos: string;
  emailPersonal?: string;
  emailCorporativo?: string;
  telefonoCelular?: string;
  departamentoId?: number;
  departamentoNombre?: string;
  puestoId?: number;
  puestoNombre?: string;
  fechaIngreso: string;
  tipoContrato: TipoContrato;
  modalidadTrabajo: ModalidadTrabajo;
  salarioBase: number;
  estado: EstadoEmpleado;
  estadoNombre?: string;
  activo: boolean;
  usuarioId?: number;
  tieneCuenta?: boolean;
}

export interface CuentaSistema {
  usuarioId: number;
  email: string;
  nombreUsuario?: string;
  nombreCompleto: string;
  estadoNombre: string;
  activo: boolean;
  ultimoAcceso?: string;
  roles: string[];
}

export interface Empleado extends EmpleadoListItem {
  segundoNombre?: string;
  segundoApellido?: string;
  fechaNacimiento?: string;
  genero?: Genero;
  estadoCivil?: EstadoCivil;
  telefonoFijo?: string;
  direccion?: string;
  jefeDirectoId?: number;
  jefeDirectoNombre?: string;
  jornadaLaboral: JornadaLaboral;
  horasSemanales: number;
  numeroSeguroSocial?: string;
  bancoId?: number;
  bancoNombre?: string;
  tipoCuenta?: TipoCuenta;
  numeroCuenta?: string;
}

export interface CrearEmpleadoRequest {
  empresaId: number;
  tipoIdentificacion: string;
  numeroIdentificacion: string;
  nombres: string;
  apellidos: string;
  segundoNombre?: string;
  segundoApellido?: string;
  fechaNacimiento?: string;
  genero?: number;
  estadoCivil?: number;
  emailPersonal?: string;
  emailCorporativo?: string;
  telefonoCelular?: string;
  telefonoFijo?: string;
  direccion?: string;
  departamentoId?: number;
  puestoId?: number;
  jefeDirectoId?: number;
  fechaIngreso: string;
  tipoContrato: number;
  modalidadTrabajo: number;
  jornadaLaboral: number;
  horasSemanales: number;
  salarioBase: number;
  numeroSeguroSocial?: string;
  bancoId?: number;
  tipoCuenta?: number;
  numeroCuenta?: string;
}

export interface ActualizarEmpleadoRequest {
  nombres: string;
  apellidos: string;
  segundoNombre?: string;
  segundoApellido?: string;
  fechaNacimiento?: string;
  genero?: number;
  estadoCivil?: number;
  emailPersonal?: string;
  emailCorporativo?: string;
  telefonoCelular?: string;
  telefonoFijo?: string;
  direccion?: string;
  departamentoId?: number;
  puestoId?: number;
  jefeDirectoId?: number;
  tipoContrato: number;
  modalidadTrabajo: number;
  jornadaLaboral: number;
  horasSemanales: number;
  salarioBase: number;
  estado: number;
  numeroSeguroSocial?: string;
  bancoId?: number;
  tipoCuenta?: number;
  numeroCuenta?: string;
}

export const TIPO_HORARIO_LABELS: Record<number, string> = {
  [TipoHorario.Fijo]:      'Fijo',
  [TipoHorario.Flexible]:  'Flexible',
  [TipoHorario.Rotativo]:  'Rotativo',
};
export const ESTADO_CAPACITACION_LABELS: Record<number, string> = {
  [EstadoCapacitacion.Planificada]: 'Planificada',
  [EstadoCapacitacion.EnCurso]:     'En Curso',
  [EstadoCapacitacion.Finalizada]:  'Finalizada',
  [EstadoCapacitacion.Cancelada]:   'Cancelada',
};
export const ESTADO_PRESTAMO_LABELS: Record<number, string> = {
  [EstadoPrestamo.Pendiente]:  'Pendiente',
  [EstadoPrestamo.Aprobado]:   'Aprobado',
  [EstadoPrestamo.Rechazado]:  'Rechazado',
  [EstadoPrestamo.EnPago]:     'En Pago',
  [EstadoPrestamo.Cancelado]:  'Cancelado',
};
export const TIPO_PRESTAMO_LABELS: Record<number, string> = {
  [TipoPrestamo.Personal]:       'Personal',
  [TipoPrestamo.Quirografario]:  'Quirografario',
  [TipoPrestamo.Hipotecario]:    'Hipotecario',
};
export const ESTADO_REQUISICION_LABELS: Record<number, string> = {
  [EstadoRequisicion.Borrador]:             'Borrador',
  [EstadoRequisicion.PendienteAprobacion]:  'Pendiente Aprobación',
  [EstadoRequisicion.Aprobada]:             'Aprobada',
  [EstadoRequisicion.EnProceso]:            'En Proceso',
  [EstadoRequisicion.Cerrada]:              'Cerrada',
  [EstadoRequisicion.Cancelada]:            'Cancelada',
};
export const TIPO_CONCEPTO_LABELS: Record<number, string> = {
  [TipoConcepto.Ingreso]:          'Ingreso',
  [TipoConcepto.Descuento]:        'Descuento',
  [TipoConcepto.AportePatronal]:   'Aporte Patronal',
};


export const TIPO_HORARIO_OPTIONS         = toOptions(TIPO_HORARIO_LABELS);
export const ESTADO_CAPACITACION_OPTIONS  = toOptions(ESTADO_CAPACITACION_LABELS);
export const ESTADO_PRESTAMO_OPTIONS      = toOptions(ESTADO_PRESTAMO_LABELS);
export const TIPO_PRESTAMO_OPTIONS        = toOptions(TIPO_PRESTAMO_LABELS);
export const ESTADO_REQUISICION_OPTIONS   = toOptions(ESTADO_REQUISICION_LABELS);
export const TIPO_CONCEPTO_OPTIONS        = toOptions(TIPO_CONCEPTO_LABELS);

// ─── Horario ──────────────────────────────────────────────────────────

export interface Horario {
  id: number;
  empresaId: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo: TipoHorario;
  horaEntrada?: string;
  horaSalida?: string;
  horasDiarias: number;
  diasLaborables?: string;
  toleranciaEntradaMin: number;
  toleranciaSalidaMin: number;
}

export interface CrearHorarioRequest {
  empresaId: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo: number;
  horaEntrada?: string;
  horaSalida?: string;
  horasDiarias: number;
  diasLaborables?: string;
  toleranciaEntradaMin: number;
  toleranciaSalidaMin: number;
}

export interface ActualizarHorarioRequest {
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo: number;
  horaEntrada?: string;
  horaSalida?: string;
  horasDiarias: number;
  diasLaborables?: string;
  toleranciaEntradaMin: number;
  toleranciaSalidaMin: number;
}

// ─── Nómina ───────────────────────────────────────────────────────────

export interface ConceptoNomina {
  id: number;
  empresaId: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo: TipoConcepto;
  formaCalculo: number;
  porcentaje?: number;
  valorFijo?: number;
  esObligatorio: boolean;
  esSistema: boolean;
  activo: boolean;
}

export interface CrearConceptoNominaRequest {
  empresaId: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo: number;
  formaCalculo: number;
  porcentaje?: number;
  valorFijo?: number;
  esObligatorio: boolean;
}

export interface PeriodoNomina {
  id: number;
  empresaId: number;
  anno: number;
  numeroPeriodo: number;
  tipoPeriodo: number;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  fechaPago?: string;
  estado: EstadoPeriodo;
}

export interface CrearPeriodoRequest {
  empresaId: number;
  anno: number;
  numeroPeriodo: number;
  tipoPeriodo: number;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  fechaPago?: string;
}

// ─── Préstamo ─────────────────────────────────────────────────────────

export interface Prestamo {
  id: number;
  empresaId: number;
  empleadoId: number;
  empleadoNombre?: string;
  numero: string;
  tipo: TipoPrestamo;
  montoSolicitado: number;
  montoAprobado?: number;
  numeroCuotas: number;
  cuotaMensual?: number;
  fechaSolicitud: string;
  fechaAprobacion?: string;
  fechaPrimerDescuento?: string;
  motivo?: string;
  estado: EstadoPrestamo;
  saldoPendiente: number;
}

export interface CrearPrestamoRequest {
  empresaId: number;
  empleadoId: number;
  tipo: number;
  montoSolicitado: number;
  numeroCuotas: number;
  motivo?: string;
  fechaSolicitud: string;
}

// ─── Evaluaciones ─────────────────────────────────────────────────────

export interface PlantillaEvaluacion {
  id: number;
  empresaId: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo: number;
  escalaMin: number;
  escalaMax: number;
  instrucciones?: string;
  activo: boolean;
  criterios?: PlantillaCriterio[];
}

export interface PlantillaCriterio {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  peso: number;
  orden: number;
  criterioPadreId?: number;
  hijos?: PlantillaCriterio[];
}

export interface CrearPlantillaRequest {
  empresaId: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo: number;
  escalaMin: number;
  escalaMax: number;
  instrucciones?: string;
  criterios: CrearCriterioRequest[];
}

export interface CrearCriterioRequest {
  codigo: string;
  nombre: string;
  descripcion?: string;
  peso: number;
  orden: number;
  criterioPadreId?: number;
}

export interface EvaluacionProceso {
  id: number;
  empresaId: number;
  nombre: string;
  descripcion?: string;
  anno: number;
  periodo?: string;
  fechaInicio: string;
  fechaFin: string;
  estado: number;
  estadoNombre?: string;
  totalEvaluaciones: number;
  completadas: number;
}

// ─── Capacitaciones ───────────────────────────────────────────────────

export interface Capacitacion {
  id: number;
  empresaId: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo: number;
  modalidad: number;
  instructor?: string;
  institucion?: string;
  fechaInicio: string;
  fechaFin: string;
  horasDuracion?: number;
  costo?: number;
  cupos?: number;
  estado: EstadoCapacitacion;
}

export interface CrearCapacitacionRequest {
  empresaId: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo: number;
  modalidad: number;
  instructor?: string;
  institucion?: string;
  fechaInicio: string;
  fechaFin: string;
  horasDuracion?: number;
  costo?: number;
  cupos?: number;
}

// ─── Selección ────────────────────────────────────────────────────────

export interface RequisicionPersonal {
  id: number;
  empresaId: number;
  numero: string;
  departamentoId: number;
  departamentoNombre?: string;
  puestoId: number;
  puestoNombre?: string;
  solicitanteId: number;
  solicitanteNombre?: string;
  motivo: number;
  cantidadPlazas: number;
  fechaSolicitud: string;
  fechaRequerida?: string;
  salarioOfrecidoMin?: number;
  salarioOfrecidoMax?: number;
  descripcionPerfil?: string;
  estado: EstadoRequisicion;
}

export interface CrearRequisicionRequest {
  empresaId: number;
  departamentoId: number;
  puestoId: number;
  solicitanteId: number;
  motivo: number;
  cantidadPlazas: number;
  fechaSolicitud: string;
  fechaRequerida?: string;
  salarioOfrecidoMin?: number;
  salarioOfrecidoMax?: number;
  descripcionPerfil?: string;
  requisitos?: string;
}

export interface Candidato {
  id: number;
  empresaId: number;
  primerNombre: string;
  primerApellido: string;
  email: string;
  telefono?: string;
  cvUrl?: string;
  linkedinUrl?: string;
  nivelEducacion?: number;
  estado: number;
}

export interface CrearCandidatoRequest {
  empresaId: number;
  primerNombre: string;
  primerApellido: string;
  email: string;
  telefono?: string;
  cvUrl?: string;
  linkedinUrl?: string;
  nivelEducacion?: number;
}

export interface ProcesoSeleccion {
  id: number;
  empresaId: number;
  requisicionId: number;
  requisicionNumero?: string;
  responsableId: number;
  responsableNombre?: string;
  fechaInicio: string;
  fechaCierre?: string;
  estado: number;
  observaciones?: string;
}
