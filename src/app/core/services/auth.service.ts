import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../environments/environment';
import {
  LoginRequest,
  LoginResponse,
  UsuarioAuth,
  ApiResponse,
  RefreshTokenRequest
} from '../../shared/models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http   = inject(HttpClient);
  private readonly router = inject(Router);

  // ── Signals de estado ──────────────────────────
  private _usuario   = signal<UsuarioAuth | null>(this.cargarUsuarioStorage());
  private _token     = signal<string | null>(localStorage.getItem('solaris_token'));
  private _cargando  = signal<boolean>(false);

  // ── Signals públicos (readonly) ────────────────
  readonly usuario   = this._usuario.asReadonly();
  readonly token     = this._token.asReadonly();
  readonly cargando  = this._cargando.asReadonly();

  // ── Computed ───────────────────────────────────
  readonly estaAutenticado = computed(() => {
    const tok = this._token();
    if (!tok) return false;
    try {
      const decoded: any = jwtDecode(tok);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  });

  readonly esAdmin = computed(() =>
    this._usuario()?.roles?.includes('SUPER_ADMIN') ||
    this._usuario()?.roles?.includes('ADMIN_EMPRESA') || false
  );

  readonly permisos = computed(() => this._usuario()?.permisos ?? []);

  // ── Métodos ────────────────────────────────────
  login(credenciales: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    this._cargando.set(true);
    return this.http.post<ApiResponse<LoginResponse>>(
      `${environment.apiUrl}/Auth/login`, credenciales
    ).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.guardarSesion(res.data);
        }
        this._cargando.set(false);
      }),
      catchError(err => {
        this._cargando.set(false);
        return throwError(() => err);
      })
    );
  }

  logout(): void {
    this.limpiarSesion();
    this.router.navigate(['/auth/login']);
  }

  tienePermiso(permiso: string): boolean {
    return this.permisos().includes(permiso);
  }

  tieneAlgunPermiso(permisos: string[]): boolean {
    return permisos.some(p => this.tienePermiso(p));
  }

  refreshToken(): Observable<ApiResponse<LoginResponse>> {
    const refreshToken = localStorage.getItem('solaris_refresh_token') ?? '';
    return this.http.post<ApiResponse<LoginResponse>>(
      `${environment.apiUrl}/Auth/refresh-token`,
      { RefreshToken: refreshToken } as RefreshTokenRequest
    ).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.guardarSesion(res.data);
        }
      })
    );
  }

  // ── Privados ───────────────────────────────────
  private guardarSesion(data: LoginResponse): void {
    localStorage.setItem('solaris_token', data.token);
    localStorage.setItem('solaris_refresh_token', data.refreshToken);
    localStorage.setItem('solaris_usuario', JSON.stringify(data.usuario));
    this._token.set(data.token);
    this._usuario.set(data.usuario);
  }

  private limpiarSesion(): void {
    localStorage.removeItem('solaris_token');
    localStorage.removeItem('solaris_refresh_token');
    localStorage.removeItem('solaris_usuario');
    this._token.set(null);
    this._usuario.set(null);
  }

  private cargarUsuarioStorage(): UsuarioAuth | null {
    try {
      const raw = localStorage.getItem('solaris_usuario');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
