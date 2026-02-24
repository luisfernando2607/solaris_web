import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/auth.models';
import { FormaPago, CrearFormaPagoRequest, ActualizarFormaPagoRequest } from '../../shared/models/catalogo.models';

@Injectable({ providedIn: 'root' })
export class FormaPagoService {
  private readonly http = inject(HttpClient);
  private readonly url  = `${environment.apiUrl}/catalogos/formas-pago`;

  private _formasPago = signal<FormaPago[]>([]);
  private _cargando   = signal<boolean>(false);

  readonly formasPago = this._formasPago.asReadonly();
  readonly cargando   = this._cargando.asReadonly();

  listar(): Observable<ApiResponse<FormaPago[]>> {
    this._cargando.set(true);
    return this.http.get<ApiResponse<FormaPago[]>>(this.url).pipe(
      tap({
        next: (res) => {
          const data = (res as any)?.data ?? res;
          this._formasPago.set(Array.isArray(data) ? data : []);
          this._cargando.set(false);
        },
        error: () => this._cargando.set(false),
      })
    );
  }

  obtener(id: number): Observable<ApiResponse<FormaPago>> {
    return this.http.get<ApiResponse<FormaPago>>(`${this.url}/${id}`);
  }

  crear(data: CrearFormaPagoRequest): Observable<ApiResponse<FormaPago>> {
    return this.http.post<ApiResponse<FormaPago>>(this.url, data);
  }

  actualizar(id: number, data: ActualizarFormaPagoRequest): Observable<ApiResponse<FormaPago>> {
    return this.http.put<ApiResponse<FormaPago>>(`${this.url}/${id}`, data);
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
