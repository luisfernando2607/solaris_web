export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  expiracion: string;
  usuario: UsuarioAuth;
}

export interface UsuarioAuth {
  id: number;
  email: string;
  nombreCompleto: string;
  empresaId: number;
  empresaNombre: string;
  sucursalId: number;
  sucursalNombre: string;
  roles: string[];
  permisos: string[];
  idiomaPreferido: string;
  temaPreferido: string;
  requiereCambioPassword: boolean;
  twoFactorHabilitado: boolean;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
  timestamp: string;
}

export interface RefreshTokenRequest {
  RefreshToken: string;
}
