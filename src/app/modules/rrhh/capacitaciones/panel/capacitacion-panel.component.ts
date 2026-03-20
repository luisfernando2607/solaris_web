import { Component, inject, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { RrhhService } from '../../../../core/services/rrhh.service';
import { Capacitacion } from '../../../../shared/models/rrhh.models';

@Component({
  selector: 'app-capacitacion-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, SelectModule, ToastModule],
  providers: [MessageService],
  templateUrl: './capacitacion-panel.component.html',
  styleUrls: ['./capacitacion-panel.component.scss'],
})
export class CapacitacionPanelComponent {
  visible      = input<boolean>(false);
  capacitacion = input<Capacitacion | null>(null);
  onCerrar     = output<void>();
  onGuardado   = output<void>();

  private readonly fb      = inject(FormBuilder);
  private readonly service = inject(RrhhService);
  private readonly toast   = inject(MessageService);

  readonly guardando = signal(false);
  readonly error     = signal('');
  readonly esEdicion = () => !!this.capacitacion();
  readonly titulo    = () => this.esEdicion() ? 'Editar Capacitación' : 'Nueva Capacitación';

  readonly tipoOptions = [{ label: 'Interna', value: 1 }, { label: 'Externa', value: 2 }, { label: 'Virtual', value: 3 }];
  readonly modalidadOptions = [{ label: 'Presencial', value: 1 }, { label: 'Virtual', value: 2 }, { label: 'Híbrida', value: 3 }];

  form = this.fb.group({
    codigo:       ['', Validators.required],
    nombre:       ['', Validators.required],
    descripcion:  [''],
    tipo:         [1, Validators.required],
    modalidad:    [1, Validators.required],
    instructor:   [''],
    institucion:  [''],
    fechaInicio:  ['', Validators.required],
    fechaFin:     ['', Validators.required],
    horasDuracion:[null as number | null],
    costo:        [null as number | null],
    cupos:        [null as number | null],
  });

  constructor() {
    effect(() => {
      const c = this.capacitacion();
      if (c) {
        this.form.patchValue({ codigo: c.codigo, nombre: c.nombre, descripcion: c.descripcion ?? '',
          tipo: c.tipo, modalidad: c.modalidad, instructor: c.instructor ?? '',
          institucion: c.institucion ?? '', fechaInicio: c.fechaInicio, fechaFin: c.fechaFin,
          horasDuracion: c.horasDuracion ?? null, costo: c.costo ?? null, cupos: c.cupos ?? null });
      } else { this.form.reset({ tipo: 1, modalidad: 1 }); }
      this.error.set('');
    });
  }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.error.set(''); this.guardando.set(true);
    const v = this.form.getRawValue();
    const req: any = { empresaId: 0, codigo: v.codigo!, nombre: v.nombre!,
      descripcion: v.descripcion || undefined, tipo: v.tipo!, modalidad: v.modalidad!,
      instructor: v.instructor || undefined, institucion: v.institucion || undefined,
      fechaInicio: v.fechaInicio!, fechaFin: v.fechaFin!,
      horasDuracion: v.horasDuracion ?? undefined, costo: v.costo ?? undefined, cupos: v.cupos ?? undefined };
    const ok  = (msg: string) => () => { this.toast.add({ severity: 'success', summary: '¡Listo!', detail: msg, life: 3000 }); this.guardando.set(false); this.onGuardado.emit(); };
    const err = (e: any) => { this.error.set(e?.error?.message ?? 'Error'); this.guardando.set(false); };
    if (this.esEdicion()) {
      this.service.actualizarCapacitacion(this.capacitacion()!.id, req).subscribe({ next: ok('Capacitación actualizada'), error: err });
    } else {
      this.service.crearCapacitacion(req).subscribe({ next: ok('Capacitación creada'), error: err });
    }
  }

  invalid(c: string): boolean { const f = this.form.get(c); return !!(f?.invalid && f?.touched); }
  cerrar(): void { this.onCerrar.emit(); }
}
