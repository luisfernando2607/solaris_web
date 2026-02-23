import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/auth.models';
import {
  Empresa, Sucursal,
  CrearEmpresaRequest, ActualizarEmpresaRequest,
  CrearSucursalRequest
} from '../../shared/models/empresa.models';

@Injectable({ providedIn: 'root' })
export class EmpresaService {
  private readonly http = inject(HttpClient);
  private readonly url  = `${environment.apiUrl}/Empresas`;

  private _empresas  = signal<Empresa[]>([]);
  private _cargando  = signal(false);

  readonly empresas  = this._empresas.asReadonly();
  readonly cargando  = this._cargando.asReadonly();

  listar(): Observable<any> {
    this._cargando.set(true);
    return this.http.get<ApiResponse<any>>(this.url).pipe(
      tap({
        next: (res) => {
          const data  = (res as any)?.data ?? res;
          const lista = Array.isArray(data) ? data : (data?.items ?? []);
          this._empresas.set(lista);
          this._cargando.set(false);
        },
        error: () => this._cargando.set(false)
      })
    );
  }

  obtener(id: number): Observable<ApiResponse<Empresa>> {
    return this.http.get<ApiResponse<Empresa>>(`${this.url}/${id}`);
  }

  crear(data: CrearEmpresaRequest): Observable<ApiResponse<Empresa>> {
    return this.http.post<ApiResponse<Empresa>>(this.url, data);
  }

  actualizar(id: number, data: ActualizarEmpresaRequest): Observable<ApiResponse<Empresa>> {
    return this.http.put<ApiResponse<Empresa>>(`${this.url}/${id}`, data);
  }

  eliminar(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.url}/${id}`);
  }

  activar(id: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.url}/${id}/activar`, {});
  }

  desactivar(id: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.url}/${id}/desactivar`, {});
  }

  // Sucursales
  listarSucursales(empresaId: number): Observable<ApiResponse<Sucursal[]>> {
    return this.http.get<ApiResponse<Sucursal[]>>(`${this.url}/${empresaId}/sucursales`);
  }

  crearSucursal(empresaId: number, data: CrearSucursalRequest): Observable<ApiResponse<Sucursal>> {
    return this.http.post<ApiResponse<Sucursal>>(`${this.url}/${empresaId}/sucursales`, data);
  }

  actualizarSucursal(empresaId: number, sucursalId: number, data: CrearSucursalRequest): Observable<ApiResponse<Sucursal>> {
    return this.http.put<ApiResponse<Sucursal>>(`${this.url}/${empresaId}/sucursales/${sucursalId}`, data);
  }

  eliminarSucursal(empresaId: number, sucursalId: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.url}/${empresaId}/sucursales/${sucursalId}`);
  }
}
