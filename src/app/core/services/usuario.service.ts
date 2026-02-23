import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Usuario,
  UsuarioListItem,
  CrearUsuarioRequest,
  ActualizarUsuarioRequest,
  PaginatedResult
} from '../../shared/models/usuario.models';
import { ApiResponse } from '../../shared/models/auth.models';

export interface UsuarioFiltros {
  busqueda?:  string;
  estado?:    number | null;
  rolId?:     number | null;
  pagina?:    number;
  tamano?:    number;
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly url  = `${environment.apiUrl}/Usuarios`;

  // ── Signals de estado ──────────────────────────
  private _usuarios  = signal<UsuarioListItem[]>([]);
  private _total     = signal<number>(0);
  private _cargando  = signal<boolean>(false);

  readonly usuarios  = this._usuarios.asReadonly();
  readonly total     = this._total.asReadonly();
  readonly cargando  = this._cargando.asReadonly();

  // ── CRUD ───────────────────────────────────────
  listar(filtros: UsuarioFiltros = {}): Observable<any> {
    this._cargando.set(true);
    let params = new HttpParams();
    if (filtros.busqueda)               params = params.set('busqueda',  filtros.busqueda);
    if (filtros.estado != null)         params = params.set('estado',    filtros.estado.toString());
    if (filtros.rolId  != null)         params = params.set('rolId',     filtros.rolId.toString());
    if (filtros.pagina != null)         params = params.set('pagina',    filtros.pagina.toString());
    if (filtros.tamano != null)         params = params.set('tamano',    filtros.tamano.toString());

    return this.http.get<ApiResponse<any>>(this.url, { params }).pipe(
      tap(res => {
        // Soporta respuesta directa array o paginada { items, totalCount }
        const data = res?.data ?? res;
        if (Array.isArray(data)) {
          this._usuarios.set(data);
          this._total.set(data.length);
        } else if (data?.items) {
          this._usuarios.set(data.items);
          this._total.set(data.totalCount ?? data.items.length);
        } else {
          this._usuarios.set([]);
          this._total.set(0);
        }
        this._cargando.set(false);
      })
    );
  }

  obtener(id: number): Observable<ApiResponse<Usuario>> {
    return this.http.get<ApiResponse<Usuario>>(`${this.url}/${id}`);
  }

  crear(data: CrearUsuarioRequest): Observable<ApiResponse<Usuario>> {
    return this.http.post<ApiResponse<Usuario>>(this.url, data);
  }

  actualizar(id: number, data: ActualizarUsuarioRequest): Observable<ApiResponse<Usuario>> {
    return this.http.put<ApiResponse<Usuario>>(`${this.url}/${id}`, data);
  }

  eliminar(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.url}/${id}`);
  }

  activar(id: number): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.url}/${id}/activar`, {});
  }

  desactivar(id: number): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.url}/${id}/desactivar`, {});
  }

  bloquear(id: number): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.url}/${id}/bloquear`, {});
  }

  resetearPassword(id: number, nuevaPassword: string): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(
      `${this.url}/${id}/resetear-password`,
      { nuevaPassword }
    );
  }

  asignarRoles(id: number, rolIds: number[]): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.url}/${id}/roles`, { rolIds });
  }
}
