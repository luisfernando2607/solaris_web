import { Component, inject, input, output, signal, effect, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { ProyectoService } from '../../services/proyecto.service';
import {
  ProyectoListDto, EstadoProyecto, TipoProyecto, PrioridadProyecto,
  ESTADO_LABELS, TIPO_LABELS, PRIORIDAD_LABELS,
  CrearProyectoRequest, ActualizarProyectoRequest
} from '../../models/proyecto.models';

@Component({
  selector: 'app-proyecto-panel',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    InputTextModule, TextareaModule, ButtonModule, SelectModule,
    DatePickerModule, InputNumberModule, ToastModule
  ],
  providers: [MessageService],
  templateUrl: './proyecto-panel.component.html',
  styleUrls: ['./proyecto-panel.component.scss'],
})
export class ProyectoPanelComponent implements OnInit {
  visible    = input<boolean>(false);
  proyecto   = input<ProyectoListDto | null>(null);
  onCerrar   = output<void>();
  onGuardado = output<void>();

  private readonly fb      = inject(FormBuilder);
  private readonly service = inject(ProyectoService);
  private readonly toast   = inject(MessageService);

  readonly guardando = signal(false);
  readonly error     = signal('');

  readonly esEdicion = computed(() => !!this.proyecto());
  readonly titulo    = computed(() => this.esEdicion() ? 'Editar Proyecto' : 'Nuevo Proyecto');

    readonly tipoOpts      = Object.values(TipoProyecto).filter(v => typeof v === 'number').map(v => ({ label: TIPO_LABELS[v as TipoProyecto], value: v as TipoProyecto }));
    readonly prioridadOpts = Object.values(PrioridadProyecto).filter(v => typeof v === 'number').map(v => ({ label: PRIORIDAD_LABELS[v as PrioridadProyecto], value: v as PrioridadProyecto }));

  form = this.fb.group({
    codigo:          ['', Validators.required],
    nombre:          ['', [Validators.required, Validators.minLength(3)]],
    descripcion:     [''],
    tipoProyecto:    [TipoProyecto.NuevaObra, Validators.required],
    prioridad:       [PrioridadProyecto.Media, Validators.required],
    fechaInicioPlan: [null as Date | null],
    fechaFinPlan:    [null as Date | null],
    presupuestoTotal:[0],
    direccion:       [''],
  });

  constructor() {
    effect(() => {
      const p = this.proyecto();
      if (p) {
        this.service.getById(p.id).subscribe(full => {
          this.form.patchValue({
            codigo:          full.codigo,
            nombre:          full.nombre,
            descripcion:     full.descripcion ?? '',
            tipoProyecto:    full.tipoProyecto,
            prioridad:       full.prioridad,
            fechaInicioPlan: full.fechaInicioPlan ? new Date(full.fechaInicioPlan) : null,
            fechaFinPlan:    full.fechaFinPlan    ? new Date(full.fechaFinPlan)    : null,
            presupuestoTotal: full.presupuestoTotal,
            direccion:        full.direccion ?? '',
          });
        });
      } else {
        this.form.reset({ tipoProyecto: TipoProyecto.NuevaObra, prioridad: PrioridadProyecto.Media, presupuestoTotal: 0 });
      }
      this.error.set('');
    });
  }

  ngOnInit(): void {}

  private toDateOnly(d: Date | null | undefined): string | undefined {
    if (!d) return undefined;
    return d.toISOString().split('T')[0];
  }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.error.set(''); this.guardando.set(true);
    const v = this.form.getRawValue();

    const payload: CrearProyectoRequest = {
      codigo:          v.codigo!,
      nombre:          v.nombre!,
      descripcion:     v.descripcion || undefined,
      tipoProyecto:    v.tipoProyecto!,
      prioridad:       v.prioridad!,
      fechaInicioPlan: this.toDateOnly(v.fechaInicioPlan),
      fechaFinPlan:    this.toDateOnly(v.fechaFinPlan),
      presupuestoTotal: v.presupuestoTotal ?? 0,
      direccion:       v.direccion || undefined,
    };

    const exito = (msg: string) => () => {
      this.toast.add({ severity: 'success', summary: '¡Listo!', detail: msg, life: 3000 });
      this.guardando.set(false);
      this.onGuardado.emit();
    };
    const fallo = (e: any) => {
      this.error.set(e?.error?.message ?? 'Error inesperado');
      this.guardando.set(false);
    };

    if (this.esEdicion()) {
      this.service.actualizar(this.proyecto()!.id, payload as ActualizarProyectoRequest)
        .subscribe({ next: exito('Proyecto actualizado'), error: fallo });
    } else {
      this.service.crear(payload).subscribe({ next: exito('Proyecto creado'), error: fallo });
    }
  }

  invalid(campo: string): boolean {
    const c = this.form.get(campo);
    return !!(c?.invalid && c?.touched);
  }

  cerrar(): void { this.onCerrar.emit(); }
}
