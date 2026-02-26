import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  DepartamentoListItem, Departamento, CrearDepartamentoRequest, ActualizarDepartamentoRequest,
  PuestoListItem, Puesto, CrearPuestoRequest, ActualizarPuestoRequest,
  EmpleadoListItem, Empleado, CrearEmpleadoRequest, ActualizarEmpleadoRequest,
} from '../../shared/models/rrhh.models';

interface ApiResponse<T> { success: boolean; data: T; message: string; total?: number; }
interface PaginatedData<T> { items: T[]; paginaActual: number; totalPaginas: number; totalElementos: number; elementosPorPagina: number; tienePaginaSiguiente: boolean; tienePaginaAnterior: boolean; }

@Injectable({ providedIn: 'root' })
export class RrhhService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/rrhh`;

  // ── Departamentos ──────────────────────────────────────────────────
  private _departamentos   = signal<DepartamentoListItem[]>([]);
  private _cargandoDept    = signal(false);
  readonly departamentos   = this._departamentos.asReadonly();
  readonly cargandoDept    = this._cargandoDept.asReadonly();

  listarDepartamentos(): Observable<ApiResponse<DepartamentoListItem[]>> {
    this._cargandoDept.set(true);
    return this.http.get<ApiResponse<DepartamentoListItem[]>>(`${this.base}/departamentos`).pipe(
      tap({ next: r => { this._departamentos.set(r?.data ?? []); this._cargandoDept.set(false); },
            error: () => this._cargandoDept.set(false) })
    );
  }

  obtenerDepartamento(id: number): Observable<ApiResponse<Departamento>> {
    return this.http.get<ApiResponse<Departamento>>(`${this.base}/departamentos/${id}`);
  }

  crearDepartamento(req: CrearDepartamentoRequest): Observable<ApiResponse<Departamento>> {
    return this.http.post<ApiResponse<Departamento>>(`${this.base}/departamentos`, req).pipe(
      tap(r => { if (r?.success && r.data) this._departamentos.update(l => [...l, r.data]); })
    );
  }

  actualizarDepartamento(id: number, req: ActualizarDepartamentoRequest): Observable<ApiResponse<Departamento>> {
    return this.http.put<ApiResponse<Departamento>>(`${this.base}/departamentos/${id}`, req).pipe(
      tap(r => { if (r?.success && r.data) this._departamentos.update(l => l.map(d => d.id === id ? { ...d, ...r.data } : d)); })
    );
  }

  eliminarDepartamento(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/departamentos/${id}`).pipe(
      tap(r => { if (r?.success) this._departamentos.update(l => l.filter(d => d.id !== id)); })
    );
  }

  activarDepartamento(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.base}/departamentos/${id}/activar`, {}).pipe(
      tap(r => { if (r?.success) this._departamentos.update(l => l.map(d => d.id === id ? { ...d, activo: true } : d)); })
    );
  }

  desactivarDepartamento(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.base}/departamentos/${id}/desactivar`, {}).pipe(
      tap(r => { if (r?.success) this._departamentos.update(l => l.map(d => d.id === id ? { ...d, activo: false } : d)); })
    );
  }

  // ── Puestos ───────────────────────────────────────────────────────
  private _puestos       = signal<PuestoListItem[]>([]);
  private _cargandoPuest = signal(false);
  readonly puestos       = this._puestos.asReadonly();
  readonly cargandoPuest = this._cargandoPuest.asReadonly();

  listarPuestos(departamentoId?: number): Observable<ApiResponse<PuestoListItem[]>> {
    this._cargandoPuest.set(true);
    const qs = departamentoId ? `?departamentoId=${departamentoId}` : '';
    return this.http.get<ApiResponse<PuestoListItem[]>>(`${this.base}/puestos${qs}`).pipe(
      tap({ next: r => { this._puestos.set(r?.data ?? []); this._cargandoPuest.set(false); },
            error: () => this._cargandoPuest.set(false) })
    );
  }

  obtenerPuesto(id: number): Observable<ApiResponse<Puesto>> {
    return this.http.get<ApiResponse<Puesto>>(`${this.base}/puestos/${id}`);
  }

  crearPuesto(req: CrearPuestoRequest): Observable<ApiResponse<Puesto>> {
    return this.http.post<ApiResponse<Puesto>>(`${this.base}/puestos`, req).pipe(
      tap(r => { if (r?.success && r.data) this._puestos.update(l => [...l, r.data]); })
    );
  }

  actualizarPuesto(id: number, req: ActualizarPuestoRequest): Observable<ApiResponse<Puesto>> {
    return this.http.put<ApiResponse<Puesto>>(`${this.base}/puestos/${id}`, req).pipe(
      tap(r => { if (r?.success && r.data) this._puestos.update(l => l.map(p => p.id === id ? { ...p, ...r.data } : p)); })
    );
  }

  eliminarPuesto(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/puestos/${id}`).pipe(
      tap(r => { if (r?.success) this._puestos.update(l => l.filter(p => p.id !== id)); })
    );
  }

  activarPuesto(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.base}/puestos/${id}/activar`, {}).pipe(
      tap(r => { if (r?.success) this._puestos.update(l => l.map(p => p.id === id ? { ...p, activo: true } : p)); })
    );
  }

  desactivarPuesto(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.base}/puestos/${id}/desactivar`, {}).pipe(
      tap(r => { if (r?.success) this._puestos.update(l => l.map(p => p.id === id ? { ...p, activo: false } : p)); })
    );
  }

  // ── Empleados ─────────────────────────────────────────────────────
  private _empleados    = signal<EmpleadoListItem[]>([]);
  private _totalEmp     = signal(0);
  private _cargandoEmp  = signal(false);
  readonly empleados    = this._empleados.asReadonly();
  readonly total        = this._totalEmp.asReadonly();
  readonly cargandoEmp  = this._cargandoEmp.asReadonly();

  listarEmpleados(): Observable<ApiResponse<PaginatedData<EmpleadoListItem>>> {
    this._cargandoEmp.set(true);
    return this.http.get<ApiResponse<PaginatedData<EmpleadoListItem>>>(`${this.base}/empleados`).pipe(
      tap({ next: r => {
        const paginated = r?.data as any;
        const items = paginated?.items ?? (Array.isArray(r?.data) ? r.data : []);
        this._empleados.set(items);
        this._totalEmp.set(paginated?.totalElementos ?? items.length);
        this._cargandoEmp.set(false);
      }, error: () => this._cargandoEmp.set(false) })
    );
  }

  obtenerEmpleado(id: number): Observable<ApiResponse<Empleado>> {
    return this.http.get<ApiResponse<Empleado>>(`${this.base}/empleados/${id}`);
  }

  crearEmpleado(req: CrearEmpleadoRequest): Observable<ApiResponse<Empleado>> {
    return this.http.post<ApiResponse<Empleado>>(`${this.base}/empleados`, req).pipe(
      tap(r => { if (r?.success && r.data) { this._empleados.update(l => [...l, r.data]); this._totalEmp.update(t => t + 1); } })
    );
  }

  actualizarEmpleado(id: number, req: ActualizarEmpleadoRequest): Observable<ApiResponse<Empleado>> {
    return this.http.put<ApiResponse<Empleado>>(`${this.base}/empleados/${id}`, req).pipe(
      tap(r => { if (r?.success && r.data) this._empleados.update(l => l.map(e => e.id === id ? { ...e, ...r.data } : e)); })
    );
  }

  activarEmpleado(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.base}/empleados/${id}/activar`, {}).pipe(
      tap(r => { if (r?.success) this._empleados.update(l => l.map(e => e.id === id ? { ...e, activo: true, estado: 1 } : e)); })
    );
  }

  desactivarEmpleado(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.base}/empleados/${id}/desactivar`, {}).pipe(
      tap(r => { if (r?.success) this._empleados.update(l => l.map(e => e.id === id ? { ...e, activo: false } : e)); })
    );
  }
}