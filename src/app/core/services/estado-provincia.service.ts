import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/auth.models';
import { EstadoProvincia, CrearEstadoRequest, ActualizarEstadoRequest } from '../../shared/models/catalogo.models';

@Injectable({ providedIn: 'root' })
export class EstadoProvinciaService {
  private readonly http = inject(HttpClient);
  private readonly url  = `${environment.apiUrl}/catalogos/estados-provincias`;

  private _estados  = signal<EstadoProvincia[]>([]);
  private _cargando = signal<boolean>(false);

  readonly estados  = this._estados.asReadonly();
  readonly cargando = this._cargando.asReadonly();

  listar(paisId?: number): Observable<ApiResponse<EstadoProvincia[]>> {
    this._cargando.set(true);
    let params = new HttpParams();
    if (paisId) params = params.set('paisId', paisId.toString());

    return this.http.get<ApiResponse<EstadoProvincia[]>>(this.url, { params }).pipe(
      tap({
        next: (res) => {
          const data = (res as any)?.data ?? res;
          this._estados.set(Array.isArray(data) ? data : []);
          this._cargando.set(false);
        },
        error: () => this._cargando.set(false),
      })
    );
  }

  obtener(id: number): Observable<ApiResponse<EstadoProvincia>> {
    return this.http.get<ApiResponse<EstadoProvincia>>(`${this.url}/${id}`);
  }

  crear(data: CrearEstadoRequest): Observable<ApiResponse<EstadoProvincia>> {
    return this.http.post<ApiResponse<EstadoProvincia>>(this.url, data);
  }

  actualizar(id: number, data: ActualizarEstadoRequest): Observable<ApiResponse<EstadoProvincia>> {
    return this.http.put<ApiResponse<EstadoProvincia>>(`${this.url}/${id}`, data);
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
