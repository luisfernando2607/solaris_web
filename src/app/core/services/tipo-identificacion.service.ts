import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/auth.models';
import {
  TipoIdentificacion,
  CrearTipoIdentificacionRequest,
  ActualizarTipoIdentificacionRequest
} from '../../shared/models/catalogo.models';

@Injectable({ providedIn: 'root' })
export class TipoIdentificacionService {
  private readonly http = inject(HttpClient);
  private readonly url  = `${environment.apiUrl}/catalogos/tipos-identificacion`;

  private _tipos    = signal<TipoIdentificacion[]>([]);
  private _cargando = signal<boolean>(false);

  readonly tipos    = this._tipos.asReadonly();
  readonly cargando = this._cargando.asReadonly();

  listar(): Observable<ApiResponse<TipoIdentificacion[]>> {
    this._cargando.set(true);
    return this.http.get<ApiResponse<TipoIdentificacion[]>>(this.url).pipe(
      tap({
        next: (res) => {
          const data = (res as any)?.data ?? res;
          this._tipos.set(Array.isArray(data) ? data : []);
          this._cargando.set(false);
        },
        error: () => this._cargando.set(false),
      })
    );
  }

  obtener(id: number): Observable<ApiResponse<TipoIdentificacion>> {
    return this.http.get<ApiResponse<TipoIdentificacion>>(`${this.url}/${id}`);
  }

  crear(data: CrearTipoIdentificacionRequest): Observable<ApiResponse<TipoIdentificacion>> {
    return this.http.post<ApiResponse<TipoIdentificacion>>(this.url, data);
  }

  actualizar(id: number, data: ActualizarTipoIdentificacionRequest): Observable<ApiResponse<TipoIdentificacion>> {
    return this.http.put<ApiResponse<TipoIdentificacion>>(`${this.url}/${id}`, data);
  }

  eliminar(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.url}/${id}`);
  }

  activar(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.url}/${id}/activar`, {});
  }

  desactivar(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.url}/${id}/desactivar`, {});
  }
}
