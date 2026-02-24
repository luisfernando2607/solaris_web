import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/auth.models';
import { Impuesto, CrearImpuestoRequest, ActualizarImpuestoRequest } from '../../shared/models/catalogo.models';

@Injectable({ providedIn: 'root' })
export class ImpuestoService {
  private readonly http = inject(HttpClient);
  private readonly url  = `${environment.apiUrl}/catalogos/impuestos`;

  private _impuestos = signal<Impuesto[]>([]);
  private _cargando  = signal<boolean>(false);

  readonly impuestos = this._impuestos.asReadonly();
  readonly cargando  = this._cargando.asReadonly();

  listar(): Observable<ApiResponse<Impuesto[]>> {
    this._cargando.set(true);
    return this.http.get<ApiResponse<Impuesto[]>>(this.url).pipe(
      tap({
        next: (res) => {
          const data = (res as any)?.data ?? res;
          this._impuestos.set(Array.isArray(data) ? data : []);
          this._cargando.set(false);
        },
        error: () => this._cargando.set(false),
      })
    );
  }

  obtener(id: number): Observable<ApiResponse<Impuesto>> {
    return this.http.get<ApiResponse<Impuesto>>(`${this.url}/${id}`);
  }

  crear(data: CrearImpuestoRequest): Observable<ApiResponse<Impuesto>> {
    return this.http.post<ApiResponse<Impuesto>>(this.url, data);
  }

  actualizar(id: number, data: ActualizarImpuestoRequest): Observable<ApiResponse<Impuesto>> {
    return this.http.put<ApiResponse<Impuesto>>(`${this.url}/${id}`, data);
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
