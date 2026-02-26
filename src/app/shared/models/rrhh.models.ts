// =====================================================================
// SOLARIS PLATFORM — Módulo RRHH — Modelos TypeScript
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
  activo: boolean;
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
