export interface Empresa {
  id:                   number;
  codigo:               string;
  razonSocial:          string;
  nombreComercial?:     string;
  tipoIdentificacion:   string;
  numeroIdentificacion: string;
  email?:               string;
  telefono?:            string;
  direccionFiscal?:     string;
  logo?:                string;
  paginaWeb?:           string;
  zonaHoraria:          string;
  planContratado:       string;
  fechaInicioContrato:  string;
  fechaFinContrato?:    string;
  maxUsuarios:          number;
  estado:               number;
  activo:               boolean;
  totalUsuarios?:       number;
  totalSucursales?:     number;
}

export interface Sucursal {
  id:           number;
  empresaId:    number;
  codigo:       string;
  nombre:       string;
  direccion?:   string;
  telefono?:    string;
  email?:       string;
  esPrincipal:  boolean;
  activo:       boolean;
}

export interface CrearEmpresaRequest {
  codigo:               string;
  razonSocial:          string;
  nombreComercial?:     string;
  tipoIdentificacion:   string;
  numeroIdentificacion: string;
  email?:               string;
  telefono?:            string;
  direccionFiscal?:     string;
  paginaWeb?:           string;
  zonaHoraria:          string;
  planContratado:       string;
  fechaInicioContrato:  string;
  maxUsuarios:          number;
}

export interface ActualizarEmpresaRequest extends CrearEmpresaRequest {}

export interface CrearSucursalRequest {
  codigo:      string;
  nombre:      string;
  direccion?:  string;
  telefono?:   string;
  email?:      string;
  esPrincipal: boolean;
}

export const PLANES = [
  { label: 'Básico',       value: 'BASICO' },
  { label: 'Profesional',  value: 'PROFESIONAL' },
  { label: 'Empresarial',  value: 'EMPRESARIAL' },
  { label: 'Enterprise',   value: 'ENTERPRISE' },
];

export const ZONAS_HORARIAS = [
  'America/Guayaquil',
  'America/Bogota',
  'America/Lima',
  'America/Mexico_City',
  'America/Buenos_Aires',
  'America/Santiago',
  'America/Caracas',
  'America/La_Paz',
  'America/New_York',
  'Europe/Madrid',
];

export const TIPOS_ID = [
  { label: 'RUC',      value: 'RUC' },
  { label: 'NIT',      value: 'NIT' },
  { label: 'RFC',      value: 'RFC' },
  { label: 'CUIT',     value: 'CUIT' },
  { label: 'RUT',      value: 'RUT' },
  { label: 'Otro',     value: 'OTRO' },
];

export const ESTADO_EMPRESA: Record<number, { label: string; color: string }> = {
  0: { label: 'Inactiva',  color: '#64748b' },
  1: { label: 'Activa',    color: '#10b981' },
  2: { label: 'Suspendida',color: '#f59e0b' },
  3: { label: 'Prueba',    color: '#3b82f6' },
};

export const PLAN_COLOR: Record<string, string> = {
  BASICO:       '#64748b',
  PROFESIONAL:  '#3b82f6',
  EMPRESARIAL:  '#8b5cf6',
  ENTERPRISE:   '#f59e0b',
};
