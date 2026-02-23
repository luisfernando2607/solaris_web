export interface SelectItem {
  label: string;
  value: any;
}

export interface TableColumn {
  field: string;
  header: string;
  sortable?: boolean;
  width?: string;
}

export type EstadoUsuario = 0 | 1 | 2 | 3;

export const ESTADO_USUARIO_LABELS: Record<number, string> = {
  0: 'Inactivo',
  1: 'Activo',
  2: 'Bloqueado',
  3: 'Pendiente'
};

export const ESTADO_USUARIO_SEVERITY: Record<number, string> = {
  0: 'secondary',
  1: 'success',
  2: 'danger',
  3: 'warning'
};
