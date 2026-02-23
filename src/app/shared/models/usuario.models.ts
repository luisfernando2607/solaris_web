export interface Usuario {
  id: number;
  empresaId: number;
  empresaNombre?: string;
  sucursalId?: number;
  sucursalNombre?: string;
  codigo?: string;
  email: string;
  nombreUsuario?: string;
  nombres: string;
  apellidos: string;
  nombreCompleto?: string;
  telefono?: string;
  celular?: string;
  estado: number;
  estadoNombre?: string;
  activo: boolean;
  emailVerificado: boolean;
  twoFactorHabilitado: boolean;
  requiereCambioPassword: boolean;
  ultimoAcceso?: string;
  idiomaPreferido: string;
  temaPreferido: string;
  roles?: string[];
  fechaCreacion?: string;
}

export interface UsuarioListItem {
  id: number;
  email: string;
  nombreCompleto: string;
  empresaNombre?: string;
  sucursalNombre: string;
  estado: number;
  estadoNombre: string;
  activo: boolean;
  roles?: string[];
  ultimoAcceso?: string;
}

export interface CrearUsuarioRequest {
  empresaId: number;
  sucursalId?: number;
  email: string;
  nombres: string;
  apellidos: string;
  password: string;
  nombreUsuario?: string;
  telefono?: string;
  celular?: string;
  rolIds?: number[];
}

export interface ActualizarUsuarioRequest {
  nombres: string;
  apellidos: string;
  telefono?: string;
  celular?: string;
  nombreUsuario?: string;
  sucursalId?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
