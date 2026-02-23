import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/auth.models';
import { Rol, Modulo, CrearRolRequest, ActualizarRolRequest } from '../../shared/models/rol.models';

@Injectable({ providedIn: 'root' })
export class RolService {
  private readonly http = inject(HttpClient);
  private readonly url  = `${environment.apiUrl}/Roles`;

  private _roles    = signal<Rol[]>([]);
  private _cargando = signal(false);

  readonly roles    = this._roles.asReadonly();
  readonly cargando = this._cargando.asReadonly();

  listar(): Observable<any> {
    this._cargando.set(true);
    return this.http.get<ApiResponse<any>>(this.url).pipe(
      tap({
        next: (res) => {
          const data  = res?.data ?? res;
          const lista = Array.isArray(data) ? data : (data?.items ?? []);
          this._roles.set(lista);
          this._cargando.set(false);
        },
        error: () => this._cargando.set(false)
      })
    );
  }

  obtener(id: number): Observable<ApiResponse<Rol>> {
    return this.http.get<ApiResponse<Rol>>(`${this.url}/${id}`);
  }

  crear(data: CrearRolRequest): Observable<ApiResponse<Rol>> {
    return this.http.post<ApiResponse<Rol>>(this.url, data);
  }

  actualizar(id: number, data: ActualizarRolRequest): Observable<ApiResponse<Rol>> {
    return this.http.put<ApiResponse<Rol>>(`${this.url}/${id}`, data);
  }

  eliminar(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.url}/${id}`);
  }

  obtenerModulosPermisos(): Observable<ApiResponse<Modulo[]>> {
    return this.http.get<ApiResponse<Modulo[]>>(`${this.url}/modulos-permisos`);
  }

  obtenerPermisosRol(id: number): Observable<ApiResponse<number[]>> {
    return this.http.get<ApiResponse<number[]>>(`${this.url}/${id}/permisos`);
  }

  asignarPermisos(id: number, permisoIds: number[]): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.url}/${id}/permisos`, { permisoIds });
  }
}
