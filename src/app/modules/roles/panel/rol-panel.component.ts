import { Component, inject, input, output, signal, effect, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';

import { RolService } from '../../../core/services/rol.service';
import { Rol, Modulo, COLORES_ROL, ICONOS_ROL } from '../../../shared/models/rol.models';

@Component({
  selector: 'app-rol-panel',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    InputTextModule, TextareaModule, ButtonModule,
    CheckboxModule, ToastModule, TooltipModule,
  ],
  providers: [MessageService],
  templateUrl: './rol-panel.component.html',
  styleUrls: ['./rol-panel.component.scss']
})
export class RolPanelComponent implements OnInit {
  visible    = input<boolean>(false);
  rol        = input<Rol | null>(null);
  onCerrar   = output<void>();
  onGuardado = output<void>();

  private readonly fb         = inject(FormBuilder);
  private readonly rolService = inject(RolService);
  private readonly toast      = inject(MessageService);

  readonly guardando        = signal(false);
  readonly cargandoPermisos = signal(false);
  readonly error            = signal('');
  readonly modulos          = signal<Modulo[]>([]);
  readonly permisoIds       = signal<Set<number>>(new Set());

  readonly colores = COLORES_ROL;
  readonly iconos  = ICONOS_ROL;

  readonly esEdicion = () => !!this.rol();
  readonly titulo    = () => this.esEdicion() ? 'Editar Rol' : 'Nuevo Rol';

  readonly totalSeleccionados = computed(() => this.permisoIds().size);

  // Getters para el template (evita llamar .value en el HTML)
  get colorActual(): string  { return this.form.get('color')?.value ?? '#3b82f6'; }
  get iconoActual(): string  { return this.form.get('icono')?.value ?? 'pi pi-shield'; }
  get nombreActual(): string { return this.form.get('nombre')?.value ?? ''; }

  form = this.fb.group({
    codigo:      ['', [Validators.required, Validators.pattern(/^[A-Z0-9_]+$/)]],
    nombre:      ['', [Validators.required, Validators.minLength(2)]],
    descripcion: [''],
    nivel:       [10, [Validators.required, Validators.min(0), Validators.max(100)]],
    color:       ['#3b82f6'],
    icono:       ['pi pi-shield'],
  });

  constructor() {
    effect(() => {
      const r = this.rol();
      if (r) {
        this.form.patchValue({
          codigo:      r.codigo,
          nombre:      r.nombre,
          descripcion: r.descripcion ?? '',
          nivel:       r.nivel,
          color:       r.color ?? '#3b82f6',
          icono:       r.icono ?? 'pi pi-shield',
        });
        if (r.esSistema) this.form.get('codigo')?.disable();
        else             this.form.get('codigo')?.enable();
        this.cargarPermisosRol(r.id);
      } else {
        this.form.reset({ nivel: 10, color: '#3b82f6', icono: 'pi pi-shield' });
        this.form.get('codigo')?.enable();
        this.permisoIds.set(new Set());
      }
      this.error.set('');
    });
  }

  ngOnInit(): void { this.cargarModulosPermisos(); }

  // ── Carga de datos ────────────────────────────
  cargarModulosPermisos(): void {
    this.cargandoPermisos.set(true);
    this.rolService.obtenerModulosPermisos().subscribe({
      next: (res) => {
        const data = (res as any)?.data ?? res;
        this.modulos.set(Array.isArray(data) ? data : []);
        this.cargandoPermisos.set(false);
      },
      error: () => this.cargandoPermisos.set(false)
    });
  }

  cargarPermisosRol(rolId: number): void {
    this.rolService.obtenerPermisosRol(rolId).subscribe({
      next: (res) => {
        const ids = (res as any)?.data ?? res;
        this.permisoIds.set(new Set(Array.isArray(ids) ? ids : []));
      }
    });
  }

  // ── Helpers para template (sin arrow functions) ──
  tienePermiso(id: number): boolean {
    return this.permisoIds().has(id);
  }

  moduloCompleto(modulo: Modulo): boolean {
    return modulo.permisos.length > 0
      && modulo.permisos.every(p => this.permisoIds().has(p.id));
  }

  seleccionadosEnModulo(modulo: Modulo): number {
    return modulo.permisos.filter(p => this.permisoIds().has(p.id)).length;
  }

  // ── Acciones de permisos ──────────────────────
  togglePermiso(id: number): void {
    const set = new Set(this.permisoIds());
    set.has(id) ? set.delete(id) : set.add(id);
    this.permisoIds.set(set);
  }

  toggleModulo(modulo: Modulo): void {
    const completo = this.moduloCompleto(modulo);
    const set = new Set(this.permisoIds());
    modulo.permisos.forEach(p => completo ? set.delete(p.id) : set.add(p.id));
    this.permisoIds.set(set);
  }

  seleccionarTodos(): void {
    const todos = this.modulos().flatMap(m => m.permisos).map(p => p.id);
    this.permisoIds.set(new Set(todos));
  }

  limpiarTodos(): void {
    this.permisoIds.set(new Set());
  }

  // ── Apariencia ────────────────────────────────
  setColor(c: string): void  { this.form.get('color')?.setValue(c); }
  setIcono(ic: string): void { this.form.get('icono')?.setValue(ic); }

  onCodigoInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value.toUpperCase();
    this.form.get('codigo')?.setValue(val, { emitEvent: false });
  }

  // ── Guardar ───────────────────────────────────
  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.error.set('');
    this.guardando.set(true);
    const v        = this.form.getRawValue();
    const permisos = Array.from(this.permisoIds());

    const exito = (msg: string) => () => {
      this.toast.add({ severity: 'success', summary: '¡Listo!', detail: msg, life: 3000 });
      this.guardando.set(false);
      this.onGuardado.emit();
    };

    const fallo = (e: any) => {
      this.error.set(e?.error?.message ?? 'Ocurrió un error inesperado');
      this.guardando.set(false);
    };

    if (this.esEdicion()) {
      const id = this.rol()!.id;
      this.rolService.actualizar(id, {
        nombre:      v.nombre!,
        descripcion: v.descripcion ?? undefined,
        nivel:       v.nivel!,
        color:       v.color ?? undefined,
        icono:       v.icono ?? undefined,
      }).subscribe({
        next: () => {
          this.rolService.asignarPermisos(id, permisos).subscribe({
            next:  exito('Rol y permisos actualizados'),
            error: exito('Rol actualizado')
          });
        },
        error: fallo
      });
    } else {
      this.rolService.crear({
        codigo:      v.codigo!,
        nombre:      v.nombre!,
        descripcion: v.descripcion ?? undefined,
        nivel:       v.nivel!,
        color:       v.color ?? undefined,
        icono:       v.icono ?? undefined,
        permisoIds:  permisos,
      }).subscribe({ next: exito('Rol creado correctamente'), error: fallo });
    }
  }

  invalid(campo: string): boolean {
    const c = this.form.get(campo);
    return !!(c?.invalid && c?.touched);
  }

  cerrar(): void { this.onCerrar.emit(); }
}
