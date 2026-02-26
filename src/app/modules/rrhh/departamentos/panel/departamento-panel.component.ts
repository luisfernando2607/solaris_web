import { Component, inject, input, output, signal, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { RrhhService } from '../../../../core/services/rrhh.service';
import { Departamento } from '../../../../shared/models/rrhh.models';

@Component({
  selector: 'app-departamento-panel',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    InputTextModule, InputNumberModule, ButtonModule,
    SelectModule, TextareaModule, ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './departamento-panel.component.html',
  styleUrls: ['./departamento-panel.component.scss']
})
export class DepartamentoPanelComponent implements OnInit {
  // ── I/O — mismo patrón que UsuarioPanelComponent ──────────────────
  visible      = input<boolean>(false);
  departamento = input<Departamento | null>(null);
  onCerrar     = output<void>();
  onGuardado   = output<void>();

  private readonly fb          = inject(FormBuilder);
  private readonly rrhhService = inject(RrhhService);
  private readonly toast       = inject(MessageService);

  readonly cargando = signal(false);
  readonly error    = signal('');

  readonly esEdicion = () => !!this.departamento();
  readonly titulo    = () => this.esEdicion() ? 'Editar Departamento' : 'Nuevo Departamento';
  readonly subtitulo = () => this.esEdicion()
    ? `Modificando datos de ${this.departamento()?.nombre}`
    : 'Completa los datos para crear un nuevo departamento';

  form = this.fb.group({
    codigo:              ['', [Validators.required, Validators.maxLength(20)]],
    nombre:              ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    descripcion:         [''],
    departamentoPadreId: [null as number | null],
    presupuestoAnual:    [null as number | null],
  });

  constructor() {
    effect(() => {
      const d = this.departamento();
      if (d) {
        this.form.patchValue({
          codigo:              d.codigo,
          nombre:              d.nombre,
          descripcion:         d.descripcion ?? '',
          departamentoPadreId: d.departamentoPadreId ?? null,
          presupuestoAnual:    d.presupuestoAnual ?? null,
        });
        this.form.get('codigo')?.disable();
      } else {
        this.form.reset();
        this.form.get('codigo')?.enable();
      }
      this.error.set('');
    });
  }

  ngOnInit(): void {
    if (this.rrhhService.departamentos().length === 0) {
      this.rrhhService.listarDepartamentos().subscribe();
    }
  }

  get padresOptions() {
    return this.rrhhService.departamentos()
      .filter(d => d.id !== this.departamento()?.id)
      .map(d => ({ label: d.nombre, value: d.id }));
  }

  invalid(campo: string) {
    const c = this.form.get(campo);
    return c?.invalid && c?.touched;
  }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.error.set('');
    this.cargando.set(true);
    const v = this.form.getRawValue();

    const ok = () => {
      this.toast.add({ severity: 'success', summary: '¡Listo!',
        detail: this.esEdicion() ? 'Departamento actualizado' : 'Departamento creado correctamente', life: 3000 });
      this.cargando.set(false);
      this.onGuardado.emit();
    };
    const err = (e: any) => { this.error.set(e?.error?.message ?? 'Ocurrió un error inesperado'); this.cargando.set(false); };

    if (this.esEdicion()) {
      this.rrhhService.actualizarDepartamento(this.departamento()!.id, {
        nombre:              v.nombre!,
        descripcion:         v.descripcion || undefined,
        departamentoPadreId: v.departamentoPadreId ?? undefined,
        presupuestoAnual:    v.presupuestoAnual ?? undefined,
      }).subscribe({ next: ok, error: err });
    } else {
      this.rrhhService.crearDepartamento({
        empresaId:           1,
        codigo:              v.codigo!,
        nombre:              v.nombre!,
        descripcion:         v.descripcion || undefined,
        departamentoPadreId: v.departamentoPadreId ?? undefined,
        presupuestoAnual:    v.presupuestoAnual ?? undefined,
      }).subscribe({ next: ok, error: err });
    }
  }

  cerrar(): void { this.onCerrar.emit(); }
}
