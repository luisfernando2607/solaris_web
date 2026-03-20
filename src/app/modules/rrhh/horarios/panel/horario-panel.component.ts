import { Component, inject, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { RrhhService } from '../../../../core/services/rrhh.service';
import { Horario, TIPO_HORARIO_OPTIONS } from '../../../../shared/models/rrhh.models';

@Component({
  selector: 'app-horario-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, SelectModule, ToastModule],
  providers: [MessageService],
  templateUrl: './horario-panel.component.html',
  styleUrls: ['./horario-panel.component.scss'],
})
export class HorarioPanelComponent {
  visible    = input<boolean>(false);
  horario    = input<Horario | null>(null);
  onCerrar   = output<void>();
  onGuardado = output<void>();

  private readonly fb      = inject(FormBuilder);
  private readonly service = inject(RrhhService);
  private readonly toast   = inject(MessageService);

  readonly guardando  = signal(false);
  readonly error      = signal('');
  readonly tipoOptions = TIPO_HORARIO_OPTIONS;

  readonly esEdicion = () => !!this.horario();
  readonly titulo    = () => this.esEdicion() ? 'Editar Horario' : 'Nuevo Horario';

  form = this.fb.group({
    codigo:               ['', Validators.required],
    nombre:               ['', [Validators.required, Validators.minLength(2)]],
    descripcion:          [''],
    tipo:                 [1, Validators.required],
    horaEntrada:          [''],
    horaSalida:           [''],
    horasDiarias:         [8, Validators.required],
    toleranciaEntradaMin: [0],
    toleranciaSalidaMin:  [0],
  });

  constructor() {
    effect(() => {
      const h = this.horario();
      if (h) {
        this.form.patchValue({
          codigo: h.codigo, nombre: h.nombre, descripcion: h.descripcion ?? '',
          tipo: h.tipo, horaEntrada: h.horaEntrada ?? '', horaSalida: h.horaSalida ?? '',
          horasDiarias: h.horasDiarias,
          toleranciaEntradaMin: h.toleranciaEntradaMin,
          toleranciaSalidaMin:  h.toleranciaSalidaMin,
        });
      } else {
        this.form.reset({ tipo: 1, horasDiarias: 8, toleranciaEntradaMin: 0, toleranciaSalidaMin: 0 });
      }
      this.error.set('');
    });
  }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.error.set(''); this.guardando.set(true);
    const v = this.form.getRawValue();

    const payload = {
      codigo: v.codigo!, nombre: v.nombre!, descripcion: v.descripcion || undefined,
      tipo: v.tipo!, horaEntrada: v.horaEntrada || undefined, horaSalida: v.horaSalida || undefined,
      horasDiarias: v.horasDiarias!, diasLaborables: '[1,2,3,4,5]',
      toleranciaEntradaMin: v.toleranciaEntradaMin ?? 0,
      toleranciaSalidaMin:  v.toleranciaSalidaMin  ?? 0,
    };

    const exito = (msg: string) => () => {
      this.toast.add({ severity: 'success', summary: '¡Listo!', detail: msg, life: 3000 });
      this.guardando.set(false); this.onGuardado.emit();
    };
    const fallo = (e: any) => { this.error.set(e?.error?.message ?? 'Error inesperado'); this.guardando.set(false); };

    if (this.esEdicion()) {
      this.service.actualizarHorario(this.horario()!.id, payload).subscribe({ next: exito('Horario actualizado'), error: fallo });
    } else {
      const req = { ...payload, empresaId: 0 }; // empresaId lo inyecta el backend desde el JWT
      this.service.crearHorario(req as any).subscribe({ next: exito('Horario creado'), error: fallo });
    }
  }

  invalid(campo: string): boolean { const c = this.form.get(campo); return !!(c?.invalid && c?.touched); }
  cerrar(): void { this.onCerrar.emit(); }
}
