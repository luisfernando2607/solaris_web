// =============================================
// MODELOS - MÓDULO CATÁLOGOS
// =============================================

// ─── PAÍS ────────────────────────────────────
export interface Pais {
  id:               number;
  codigo:           string;   // ISO 3166-1 alpha-3
  codigoIso2:       string;   // ISO 3166-1 alpha-2
  nombre:           string;
  nombreIngles?:    string;
  codigoTelefonico?: string;
  bandera?:         string;
  activo:           boolean;
  orden:            number;
}

export interface CrearPaisRequest {
  codigo:           string;
  codigoIso2:       string;
  nombre:           string;
  nombreIngles?:    string;
  codigoTelefonico?: string;
  bandera?:         string;
  orden?:           number;
}

export interface ActualizarPaisRequest extends CrearPaisRequest {}

// ─── ESTADO / PROVINCIA ───────────────────────
export interface EstadoProvincia {
  id:       number;
  paisId:   number;
  paisNombre?: string;
  codigo:   string;
  nombre:   string;
  activo:   boolean;
  orden:    number;
}

export interface CrearEstadoRequest {
  paisId:   number;
  codigo:   string;
  nombre:   string;
  orden?:   number;
}

export interface ActualizarEstadoRequest extends CrearEstadoRequest {}

// ─── CIUDAD ───────────────────────────────────
export interface Ciudad {
  id:                  number;
  estadoProvinciaId:   number;
  estadoProvinciaNombre?: string;
  paisNombre?:         string;
  codigo?:             string;
  nombre:              string;
  activo:              boolean;
  orden:               number;
}

export interface CrearCiudadRequest {
  estadoProvinciaId: number;
  codigo?:           string;
  nombre:            string;
  orden?:            number;
}

export interface ActualizarCiudadRequest extends CrearCiudadRequest {}

// ─── MONEDA ───────────────────────────────────
export interface Moneda {
  id:                  number;
  codigo:              string;   // ISO 4217
  nombre:              string;
  simbolo:             string;
  decimalesPermitidos: number;
  activo:              boolean;
  orden:               number;
}

export interface CrearMonedaRequest {
  codigo:              string;
  nombre:              string;
  simbolo:             string;
  decimalesPermitidos: number;
  orden?:              number;
}

export interface ActualizarMonedaRequest extends CrearMonedaRequest {}

// ─── TIPO IDENTIFICACIÓN ──────────────────────
export interface TipoIdentificacion {
  id:              number;
  paisId?:         number;
  paisNombre?:     string;
  codigo:          string;
  nombre:          string;
  longitud?:       number;
  patron?:         string;
  aplicaPersona:   boolean;
  aplicaEmpresa:   boolean;
  activo:          boolean;
  orden:           number;
}

export interface CrearTipoIdentificacionRequest {
  paisId?:         number;
  codigo:          string;
  nombre:          string;
  longitud?:       number;
  patron?:         string;
  aplicaPersona:   boolean;
  aplicaEmpresa:   boolean;
  orden?:          number;
}

export interface ActualizarTipoIdentificacionRequest extends CrearTipoIdentificacionRequest {}

// ─── IMPUESTO ─────────────────────────────────
export interface Impuesto {
  id:           number;
  empresaId?:   number;
  codigo:       string;
  nombre:       string;
  porcentaje:   number;
  tipoImpuesto: string;   // IVA, RETENCION, RETENCION_IVA, ICE
  esRetencion:  boolean;
  activo:       boolean;
  orden:        number;
}

export interface CrearImpuestoRequest {
  empresaId?:   number;
  codigo:       string;
  nombre:       string;
  porcentaje:   number;
  tipoImpuesto: string;
  esRetencion:  boolean;
  orden?:       number;
}

export interface ActualizarImpuestoRequest extends CrearImpuestoRequest {}

// ─── FORMA DE PAGO ────────────────────────────
export interface FormaPago {
  id:                  number;
  empresaId?:          number;
  codigo:              string;
  nombre:              string;
  tipo:                string;   // EFECTIVO, TARJETA, TRANSFERENCIA, CHEQUE, CREDITO
  diasCredito:         number;
  requiereBanco:       boolean;
  requiereReferencia:  boolean;
  activo:              boolean;
  orden:               number;
}

export interface CrearFormaPagoRequest {
  empresaId?:          number;
  codigo:              string;
  nombre:              string;
  tipo:                string;
  diasCredito:         number;
  requiereBanco:       boolean;
  requiereReferencia:  boolean;
  orden?:              number;
}

export interface ActualizarFormaPagoRequest extends CrearFormaPagoRequest {}

// ─── BANCO ────────────────────────────────────
export interface Banco {
  id:           number;
  paisId?:      number;
  paisNombre?:  string;
  codigo:       string;
  nombre:       string;
  nombreCorto?: string;
  activo:       boolean;
  orden:        number;
}

export interface CrearBancoRequest {
  paisId?:      number;
  codigo:       string;
  nombre:       string;
  nombreCorto?: string;
  orden?:       number;
}

export interface ActualizarBancoRequest extends CrearBancoRequest {}

// ─── CONSTANTES COMPARTIDAS ───────────────────
export const TIPOS_IMPUESTO = [
  { label: 'IVA',            value: 'IVA' },
  { label: 'Retención',      value: 'RETENCION' },
  { label: 'Retención IVA',  value: 'RETENCION_IVA' },
  { label: 'ICE',            value: 'ICE' },
];

export const TIPOS_FORMA_PAGO = [
  { label: 'Efectivo',       value: 'EFECTIVO' },
  { label: 'Tarjeta',        value: 'TARJETA' },
  { label: 'Transferencia',  value: 'TRANSFERENCIA' },
  { label: 'Cheque',         value: 'CHEQUE' },
  { label: 'Crédito',        value: 'CREDITO' },
];

export const TIPO_IMPUESTO_COLOR: Record<string, string> = {
  IVA:            '#3b82f6',
  RETENCION:      '#f59e0b',
  RETENCION_IVA:  '#8b5cf6',
  ICE:            '#ef4444',
};

export const TIPO_FORMA_PAGO_COLOR: Record<string, string> = {
  EFECTIVO:      '#10b981',
  TARJETA:       '#3b82f6',
  TRANSFERENCIA: '#8b5cf6',
  CHEQUE:        '#f59e0b',
  CREDITO:       '#ef4444',
};