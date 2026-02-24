import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/auth.models';
import { Banco, CrearBancoRequest, ActualizarBancoRequest } from '../../shared/models/catalogo.models';

@Injectable({ providedIn: 'root' })
export class BancoService {
  private readonly http = inject(HttpClient);
  private readonly url  = `${environment.apiUrl}/catalogos/bancos`;

  private _bancos   = signal<Banco[]>([]);
  private _cargando = signal<boolean>(false);

  readonly bancos   = this._bancos.asReadonly();
  readonly cargando = this._cargando.asReadonly();

  listar(): Observable<ApiResponse<Banco[]>> {
    this._cargando.set(true);
    return this.http.get<ApiResponse<Banco[]>>(this.url).pipe(
      tap({
        next: (res) => {
          const data = (res as any)?.data ?? res;
          this._bancos.set(Array.isArray(data) ? data : []);
          this._cargando.set(false);
        },
        error: () => this._cargando.set(false),
      })
    );
  }

  obtener(id: number): Observable<ApiResponse<Banco>> {
    return this.http.get<ApiResponse<Banco>>(`${this.url}/${id}`);
  }

  crear(data: CrearBancoRequest): Observable<ApiResponse<Banco>> {
    return this.http.post<ApiResponse<Banco>>(this.url, data);
  }

  actualizar(id: number, data: ActualizarBancoRequest): Observable<ApiResponse<Banco>> {
    return this.http.put<ApiResponse<Banco>>(`${this.url}/${id}`, data);
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
