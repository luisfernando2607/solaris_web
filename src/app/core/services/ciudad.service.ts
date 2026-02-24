import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/auth.models';
import { Ciudad, CrearCiudadRequest, ActualizarCiudadRequest } from '../../shared/models/catalogo.models';

@Injectable({ providedIn: 'root' })
export class CiudadService {
  private readonly http = inject(HttpClient);
  private readonly url  = `${environment.apiUrl}/catalogos/ciudades`;

  private _ciudades = signal<Ciudad[]>([]);
  private _cargando = signal<boolean>(false);

  readonly ciudades = this._ciudades.asReadonly();
  readonly cargando = this._cargando.asReadonly();

  listar(estadoId?: number): Observable<ApiResponse<Ciudad[]>> {
    this._cargando.set(true);
    let params = new HttpParams();
    if (estadoId) params = params.set('estadoProvinciaId', estadoId.toString());

    return this.http.get<ApiResponse<Ciudad[]>>(this.url, { params }).pipe(
      tap({
        next: (res) => {
          const data = (res as any)?.data ?? res;
          this._ciudades.set(Array.isArray(data) ? data : []);
          this._cargando.set(false);
        },
        error: () => this._cargando.set(false),
      })
    );
  }

  obtener(id: number): Observable<ApiResponse<Ciudad>> {
    return this.http.get<ApiResponse<Ciudad>>(`${this.url}/${id}`);
  }

  crear(data: CrearCiudadRequest): Observable<ApiResponse<Ciudad>> {
    return this.http.post<ApiResponse<Ciudad>>(this.url, data);
  }

  actualizar(id: number, data: ActualizarCiudadRequest): Observable<ApiResponse<Ciudad>> {
    return this.http.put<ApiResponse<Ciudad>>(`${this.url}/${id}`, data);
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
