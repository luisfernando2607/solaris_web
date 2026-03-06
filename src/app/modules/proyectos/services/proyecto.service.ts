import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { tap, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import {
  ProyectoListDto, ProyectoDto, ProyectoDashboardDto,
  CrearProyectoRequest, ActualizarProyectoRequest,
  FiltroProyectosRequest, PagedResult, EstadoProyecto
} from '../models/proyecto.models';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProyectoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/proy/proyectos`;

  readonly proyectos = signal<ProyectoListDto[]>([]);
  readonly total     = signal(0);
  readonly cargando  = signal(false);
  readonly dashboard = signal<ProyectoDashboardDto | null>(null);

  listar(filtro: FiltroProyectosRequest): Observable<PagedResult<ProyectoListDto>> {
    let params = new HttpParams()
      .set('Pagina', filtro.pagina)
      .set('ElementosPorPagina', filtro.elementosPorPagina);
    if (filtro.busqueda)  params = params.set('Busqueda', filtro.busqueda);
    if (filtro.estado)    params = params.set('Estado', filtro.estado);
    if (filtro.tipo)      params = params.set('Tipo', filtro.tipo);
    if (filtro.gerenteId) params = params.set('GerenteId', filtro.gerenteId);

    this.cargando.set(true);
    return this.http.get<any>(this.base, { params }).pipe(
      map(res => res?.data ?? res),
      tap({
        next:  r  => { this.proyectos.set(r.items ?? []); this.total.set(r.total ?? 0); this.cargando.set(false); },
        error: () => this.cargando.set(false)
      })
    );
  }

  getById(id: number): Observable<ProyectoDto> {
    return this.http.get<any>(`${this.base}/${id}`).pipe(map(res => res?.data ?? res));
  }

  getDashboard(id: number): Observable<ProyectoDashboardDto> {
    return this.http.get<any>(`${this.base}/${id}/dashboard`).pipe(
      map(res => res?.data ?? res),
      tap(d => this.dashboard.set(d))
    );
  }

  crear(request: CrearProyectoRequest): Observable<ProyectoDto> {
    return this.http.post<any>(this.base, request).pipe(map(res => res?.data ?? res));
  }

  actualizar(id: number, request: ActualizarProyectoRequest): Observable<ProyectoDto> {
    return this.http.put<any>(`${this.base}/${id}`, request).pipe(map(res => res?.data ?? res));
  }

  cambiarEstado(id: number, estado: EstadoProyecto): Observable<void> {
    return this.http.patch<void>(`${this.base}/${id}/estado`, { estado });
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
