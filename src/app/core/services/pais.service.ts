import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/auth.models';
import { Pais, CrearPaisRequest, ActualizarPaisRequest } from '../../shared/models/catalogo.models';

@Injectable({ providedIn: 'root' })
export class PaisService {
  private readonly http = inject(HttpClient);
  private readonly url  = `${environment.apiUrl}/catalogos/paises`;

  private _paises   = signal<Pais[]>([]);
  private _cargando = signal<boolean>(false);

  readonly paises   = this._paises.asReadonly();
  readonly cargando = this._cargando.asReadonly();

  listar(): Observable<ApiResponse<Pais[]>> {
    this._cargando.set(true);
    return this.http.get<ApiResponse<Pais[]>>(this.url).pipe(
      tap({
        next: (res) => {
          const data = (res as any)?.data ?? res;
          this._paises.set(Array.isArray(data) ? data : []);
          this._cargando.set(false);
        },
        error: () => this._cargando.set(false),
      })
    );
  }

  obtener(id: number): Observable<ApiResponse<Pais>> {
    return this.http.get<ApiResponse<Pais>>(`${this.url}/${id}`);
  }

  crear(data: CrearPaisRequest): Observable<ApiResponse<Pais>> {
    return this.http.post<ApiResponse<Pais>>(this.url, data);
  }

  actualizar(id: number, data: ActualizarPaisRequest): Observable<ApiResponse<Pais>> {
    return this.http.put<ApiResponse<Pais>>(`${this.url}/${id}`, data);
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
