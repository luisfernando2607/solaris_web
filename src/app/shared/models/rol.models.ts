export interface Rol {
  id:          number;
  codigo:      string;
  nombre:      string;
  descripcion?: string;
  esSistema:   boolean;
  nivel:       number;
  color?:      string;
  icono?:      string;
  activo:      boolean;
  totalUsuarios?: number;
  totalPermisos?: number;
}

export interface Modulo {
  id:       number;
  codigo:   string;
  nombre:   string;
  icono?:   string;
  permisos: Permiso[];
}

export interface Permiso {
  id:          number;
  moduloId:    number;
  codigo:      string;
  nombre:      string;
  descripcion?: string;
  seleccionado?: boolean;
}

export interface CrearRolRequest {
  codigo:      string;
  nombre:      string;
  descripcion?: string;
  nivel:       number;
  color?:      string;
  icono?:      string;
  permisoIds?: number[];
}

export interface ActualizarRolRequest {
  nombre:      string;
  descripcion?: string;
  nivel:       number;
  color?:      string;
  icono?:      string;
}

export const COLORES_ROL = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#10b981',
  '#f59e0b', '#ef4444', '#06b6d4', '#6366f1',
  '#84cc16', '#f97316',
];

export const ICONOS_ROL = [
  'pi pi-shield',     'pi pi-star',      'pi pi-briefcase',
  'pi pi-user',       'pi pi-eye',       'pi pi-cog',
  'pi pi-lock',       'pi pi-id-card',   'pi pi-users',
  'pi pi-key',
];
