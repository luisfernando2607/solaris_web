import { Component, inject, input, output, signal, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { RrhhService } from '../../../../core/services/rrhh.service';
import { Puesto, NIVEL_JERARQUICO_OPTIONS } from '../../../../shared/models/rrhh.models';

@Component({
  selector: 'app-puesto-panel',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    InputTextModule, InputNumberModule, ButtonModule,
    SelectModule, CheckboxModule, TextareaModule, ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './puesto-panel.component.html',
  styleUrls: ['./puesto-panel.component.scss']
})
export class PuestoPanelComponent implements OnInit {
  visible        = input<boolean>(false);
  puesto         = input<Puesto | null>(null);
  deptIdInicial  = input<number | null>(null);   // ← preselección desde el grupo
  onCerrar       = output<void>();
  onGuardado     = output<void>();

  private readonly fb          = inject(FormBuilder);
  private readonly rrhhService = inject(RrhhService);
  private readonly toast       = inject(MessageService);

  readonly cargando       = signal(false);
  readonly error          = signal('');
  readonly nivelesOptions = NIVEL_JERARQUICO_OPTIONS;

  readonly esEdicion = () => !!this.puesto();
  readonly titulo    = () => this.esEdicion() ? 'Editar Puesto' : 'Nuevo Puesto';
  readonly subtitulo = () => this.esEdicion()
    ? `Modificando datos de ${this.puesto()?.nombre}`
    : 'Completa los datos para crear un nuevo puesto';

  form = this.fb.group({
    departamentoId:   [null as number | null, Validators.required],
    codigo:           ['', [Validators.required, Validators.maxLength(20)]],
    nombre:           ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    descripcion:      [''],
    nivelJerarquico:  [1, Validators.required],
    bandaSalarialMin: [null as number | null],
    bandaSalarialMax: [null as number | null],
    requiereTitulo:   [false],
  });

  constructor() {
    effect(() => {
      const p = this.puesto();
      if (p) {
        this.form.patchValue({
          departamentoId:   p.departamentoId,
          codigo:           p.codigo,
          nombre:           p.nombre,
          descripcion:      p.descripcion ?? '',
          nivelJerarquico:  p.nivelJerarquico,
          bandaSalarialMin: p.bandaSalarialMin ?? null,
          bandaSalarialMax: p.bandaSalarialMax ?? null,
          requiereTitulo:   p.requiereTitulo,
        });
        this.form.get('codigo')?.disable();
      } else {
        // Resetear, aplicando deptIdInicial si viene del botón del grupo
        this.form.reset({ nivelJerarquico: 1, requiereTitulo: false });
        const deptId = this.deptIdInicial();
        if (deptId) this.form.get('departamentoId')?.setValue(deptId);
        this.form.get('codigo')?.enable();
      }
      this.error.set('');
    });
  }

  ngOnInit(): void {
    if (this.rrhhService.departamentos().length === 0) this.rrhhService.listarDepartamentos().subscribe();
  }

  get departamentosOptions() {
    return this.rrhhService.departamentos().map(d => ({ label: d.nombre, value: d.id }));
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

    const ok  = () => {
      this.toast.add({ severity: 'success', summary: '¡Listo!',
        detail: this.esEdicion() ? 'Puesto actualizado' : 'Puesto creado correctamente', life: 3000 });
      this.cargando.set(false);
      this.onGuardado.emit();
    };
    const err = (e: any) => { this.error.set(e?.error?.message ?? 'Ocurrió un error inesperado'); this.cargando.set(false); };

    if (this.esEdicion()) {
      this.rrhhService.actualizarPuesto(this.puesto()!.id, {
        departamentoId:   v.departamentoId!,
        nombre:           v.nombre!,
        descripcion:      v.descripcion || undefined,
        nivelJerarquico:  v.nivelJerarquico!,
        bandaSalarialMin: v.bandaSalarialMin ?? undefined,
        bandaSalarialMax: v.bandaSalarialMax ?? undefined,
        requiereTitulo:   v.requiereTitulo ?? false,
      }).subscribe({ next: ok, error: err });
    } else {
      this.rrhhService.crearPuesto({
        empresaId:        1,
        departamentoId:   v.departamentoId!,
        codigo:           v.codigo!,
        nombre:           v.nombre!,
        descripcion:      v.descripcion || undefined,
        nivelJerarquico:  v.nivelJerarquico!,
        bandaSalarialMin: v.bandaSalarialMin ?? undefined,
        bandaSalarialMax: v.bandaSalarialMax ?? undefined,
        requiereTitulo:   v.requiereTitulo ?? false,
      }).subscribe({ next: ok, error: err });
    }
  }

  cerrar(): void { this.onCerrar.emit(); }
}