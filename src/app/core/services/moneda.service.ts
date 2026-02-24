import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/auth.models';
import { Moneda, CrearMonedaRequest, ActualizarMonedaRequest } from '../../shared/models/catalogo.models';

@Injectable({ providedIn: 'root' })
export class MonedaService {
  private readonly http = inject(HttpClient);
  private readonly url  = `${environment.apiUrl}/catalogos/monedas`;

  private _monedas  = signal<Moneda[]>([]);
  private _cargando = signal<boolean>(false);

  readonly monedas  = this._monedas.asReadonly();
  readonly cargando = this._cargando.asReadonly();

  listar(): Observable<ApiResponse<Moneda[]>> {
    this._cargando.set(true);
    return this.http.get<ApiResponse<Moneda[]>>(this.url).pipe(
      tap({
        next: (res) => {
          const data = (res as any)?.data ?? res;
          this._monedas.set(Array.isArray(data) ? data : []);
          this._cargando.set(false);
        },
        error: () => this._cargando.set(false),
      })
    );
  }

  obtener(id: number): Observable<ApiResponse<Moneda>> {
    return this.http.get<ApiResponse<Moneda>>(`${this.url}/${id}`);
  }

  crear(data: CrearMonedaRequest): Observable<ApiResponse<Moneda>> {
    return this.http.post<ApiResponse<Moneda>>(this.url, data);
  }

  actualizar(id: number, data: ActualizarMonedaRequest): Observable<ApiResponse<Moneda>> {
    return this.http.put<ApiResponse<Moneda>>(`${this.url}/${id}`, data);
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
