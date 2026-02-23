import { Component, inject, input, output, signal, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';

import { EmpresaService } from '../../../core/services/empresa.service';
import {
  Empresa, Sucursal, CrearSucursalRequest,
  PLANES, ZONAS_HORARIAS, TIPOS_ID, ESTADO_EMPRESA, PLAN_COLOR
} from '../../../shared/models/empresa.models';

@Component({
  selector: 'app-empresa-panel',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    InputTextModule, TextareaModule, ButtonModule,
    SelectModule, ToastModule, TooltipModule, TagModule,
  ],
  providers: [MessageService],
  templateUrl: './empresa-panel.component.html',
  styleUrls: ['./empresa-panel.component.scss']
})
export class EmpresaPanelComponent implements OnInit {
  visible    = input<boolean>(false);
  empresa    = input<Empresa | null>(null);
  onCerrar   = output<void>();
  onGuardado = output<void>();

  private readonly fb             = inject(FormBuilder);
  private readonly empresaService = inject(EmpresaService);
  private readonly toast          = inject(MessageService);

  readonly guardando   = signal(false);
  readonly error       = signal('');
  readonly sucursales  = signal<Sucursal[]>([]);
  readonly cargandoSuc = signal(false);
  readonly tabActiva   = signal<'datos'|'sucursales'>('datos');

  // Panel sucursal inline
  readonly sucursalForm     = signal(false);
  readonly sucursalEdicion  = signal<Sucursal | null>(null);
  readonly guardandoSuc     = signal(false);

  readonly planes        = PLANES;
  readonly zonasHorarias = ZONAS_HORARIAS.map(z => ({ label: z, value: z }));
  readonly tiposId       = TIPOS_ID;
  readonly estadoInfo    = ESTADO_EMPRESA;
  readonly planColor     = PLAN_COLOR;

  readonly esEdicion = () => !!this.empresa();
  readonly titulo    = () => this.esEdicion() ? 'Editar Empresa' : 'Nueva Empresa';

  form = this.fb.group({
    codigo:               ['', [Validators.required, Validators.pattern(/^[A-Z0-9_-]+$/)]],
    razonSocial:          ['', [Validators.required, Validators.minLength(3)]],
    nombreComercial:      [''],
    tipoIdentificacion:   ['RUC', Validators.required],
    numeroIdentificacion: ['', Validators.required],
    email:                ['', Validators.email],
    telefono:             [''],
    direccionFiscal:      [''],
    paginaWeb:            [''],
    zonaHoraria:          ['America/Guayaquil', Validators.required],
    planContratado:       ['BASICO', Validators.required],
    fechaInicioContrato:  ['', Validators.required],
    maxUsuarios:          [5, [Validators.required, Validators.min(1)]],
  });

  sForm = this.fb.group({
    codigo:      ['', Validators.required],
    nombre:      ['', [Validators.required, Validators.minLength(2)]],
    direccion:   [''],
    telefono:    [''],
    email:       ['', Validators.email],
    esPrincipal: [false],
  });

  constructor() {
    effect(() => {
      const e = this.empresa();
      if (e) {
        this.form.patchValue({
          codigo:               e.codigo,
          razonSocial:          e.razonSocial,
          nombreComercial:      e.nombreComercial ?? '',
          tipoIdentificacion:   e.tipoIdentificacion,
          numeroIdentificacion: e.numeroIdentificacion,
          email:                e.email ?? '',
          telefono:             e.telefono ?? '',
          direccionFiscal:      e.direccionFiscal ?? '',
          paginaWeb:            e.paginaWeb ?? '',
          zonaHoraria:          e.zonaHoraria,
          planContratado:       e.planContratado,
          fechaInicioContrato:  e.fechaInicioContrato?.split('T')[0] ?? '',
          maxUsuarios:          e.maxUsuarios,
        });
        this.cargarSucursales(e.id);
      } else {
        const hoy = new Date().toISOString().split('T')[0];
        this.form.reset({
          tipoIdentificacion: 'RUC',
          zonaHoraria:        'America/Guayaquil',
          planContratado:     'BASICO',
          fechaInicioContrato: hoy,
          maxUsuarios:        5,
        });
        this.sucursales.set([]);
      }
      this.tabActiva.set('datos');
      this.sucursalForm.set(false);
      this.error.set('');
    });
  }

  ngOnInit(): void {}

  cargarSucursales(empresaId: number): void {
    this.cargandoSuc.set(true);
    this.empresaService.listarSucursales(empresaId).subscribe({
      next: (res) => {
        const data = (res as any)?.data ?? res;
        this.sucursales.set(Array.isArray(data) ? data : []);
        this.cargandoSuc.set(false);
      },
      error: () => this.cargandoSuc.set(false)
    });
  }

  // ── Guardar empresa ───────────────────────────
  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.error.set('');
    this.guardando.set(true);
    const v = this.form.getRawValue();

    const payload = {
      codigo:               v.codigo!,
      razonSocial:          v.razonSocial!,
      nombreComercial:      v.nombreComercial || undefined,
      tipoIdentificacion:   v.tipoIdentificacion!,
      numeroIdentificacion: v.numeroIdentificacion!,
      email:                v.email || undefined,
      telefono:             v.telefono || undefined,
      direccionFiscal:      v.direccionFiscal || undefined,
      paginaWeb:            v.paginaWeb || undefined,
      zonaHoraria:          v.zonaHoraria!,
      planContratado:       v.planContratado!,
      fechaInicioContrato:  v.fechaInicioContrato!,
      maxUsuarios:          v.maxUsuarios!,
    };

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
      this.empresaService.actualizar(this.empresa()!.id, payload)
        .subscribe({ next: exito('Empresa actualizada'), error: fallo });
    } else {
      this.empresaService.crear(payload)
        .subscribe({ next: exito('Empresa creada correctamente'), error: fallo });
    }
  }

  // ── Sucursales ────────────────────────────────
  abrirNuevaSucursal(): void {
    this.sucursalEdicion.set(null);
    this.sForm.reset({ esPrincipal: false });
    this.sucursalForm.set(true);
  }

  abrirEditarSucursal(s: Sucursal): void {
    this.sucursalEdicion.set(s);
    this.sForm.patchValue({
      codigo:      s.codigo,
      nombre:      s.nombre,
      direccion:   s.direccion ?? '',
      telefono:    s.telefono ?? '',
      email:       s.email ?? '',
      esPrincipal: s.esPrincipal,
    });
    this.sucursalForm.set(true);
  }

  guardarSucursal(): void {
    if (this.sForm.invalid) { this.sForm.markAllAsTouched(); return; }
    const empresaId = this.empresa()!.id;
    const v         = this.sForm.getRawValue();
    const payload: CrearSucursalRequest = {
      codigo:      v.codigo!,
      nombre:      v.nombre!,
      direccion:   v.direccion || undefined,
      telefono:    v.telefono || undefined,
      email:       v.email || undefined,
      esPrincipal: v.esPrincipal ?? false,
    };

    this.guardandoSuc.set(true);
    const s = this.sucursalEdicion();

    const ok = () => {
      this.toast.add({ severity: 'success', summary: '¡Listo!',
        detail: s ? 'Sucursal actualizada' : 'Sucursal creada', life: 2500 });
      this.guardandoSuc.set(false);
      this.sucursalForm.set(false);
      this.cargarSucursales(empresaId);
    };
    const err = (e: any) => {
      this.toast.add({ severity: 'error', summary: 'Error',
        detail: e?.error?.message ?? 'No se pudo guardar', life: 3000 });
      this.guardandoSuc.set(false);
    };

    if (s) {
      this.empresaService.actualizarSucursal(empresaId, s.id, payload)
        .subscribe({ next: ok, error: err });
    } else {
      this.empresaService.crearSucursal(empresaId, payload)
        .subscribe({ next: ok, error: err });
    }
  }

  eliminarSucursal(s: Sucursal): void {
    if (s.esPrincipal) {
      this.toast.add({ severity: 'warn', summary: 'No permitido',
        detail: 'No se puede eliminar la sucursal principal', life: 3000 });
      return;
    }
    this.empresaService.eliminarSucursal(this.empresa()!.id, s.id).subscribe({
      next: () => {
        this.toast.add({ severity: 'success', summary: 'Eliminada', detail: s.nombre, life: 2000 });
        this.cargarSucursales(this.empresa()!.id);
      }
    });
  }

  // ── Helpers ───────────────────────────────────
  invalid(campo: string): boolean {
    const c = this.form.get(campo);
    return !!(c?.invalid && c?.touched);
  }

  sInvalid(campo: string): boolean {
    const c = this.sForm.get(campo);
    return !!(c?.invalid && c?.touched);
  }

  planLabel(plan: string): string {
    return this.planes.find(p => p.value === plan)?.label ?? plan;
  }

  get codigoActual(): string { return this.form.get('codigo')?.value ?? ''; }
  get razonSocialActual(): string { return this.form.get('razonSocial')?.value ?? ''; }
  get planActual(): string { return this.form.get('planContratado')?.value ?? 'BASICO'; }

  onCodigoInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value.toUpperCase();
    this.form.get('codigo')?.setValue(val, { emitEvent: false });
  }

  cerrar(): void { this.onCerrar.emit(); }
}
