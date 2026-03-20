import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { RrhhService } from '../../../../core/services/rrhh.service';
import { TIPO_PRESTAMO_OPTIONS } from '../../../../shared/models/rrhh.models';

@Component({
  selector: 'app-prestamo-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, SelectModule, ToastModule],
  providers: [MessageService],
  templateUrl: './prestamo-panel.component.html',
  styleUrls: ['./prestamo-panel.component.scss'],
})
export class PrestamoPanelComponent {
  visible    = input<boolean>(false);
  onCerrar   = output<void>();
  onGuardado = output<void>();

  private readonly fb      = inject(FormBuilder);
  private readonly service = inject(RrhhService);
  private readonly toast   = inject(MessageService);

  readonly guardando   = signal(false);
  readonly error       = signal('');
  readonly tipoOptions = TIPO_PRESTAMO_OPTIONS;

  form = this.fb.group({
    empleadoId:      [null as number | null, Validators.required],
    tipo:            [1, Validators.required],
    montoSolicitado: [null as number | null, [Validators.required, Validators.min(1)]],
    numeroCuotas:    [1, [Validators.required, Validators.min(1)]],
    motivo:          [''],
    fechaSolicitud:  [new Date().toISOString().split('T')[0], Validators.required],
  });

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.error.set(''); this.guardando.set(true);
    const v = this.form.getRawValue();
    const req: any = { empresaId: 0, empleadoId: v.empleadoId!, tipo: v.tipo!,
      montoSolicitado: v.montoSolicitado!, numeroCuotas: v.numeroCuotas!,
      motivo: v.motivo || undefined, fechaSolicitud: v.fechaSolicitud! };
    this.service.crearPrestamo(req).subscribe({
      next: () => { this.toast.add({ severity: 'success', summary: '¡Listo!', detail: 'Préstamo registrado', life: 3000 }); this.guardando.set(false); this.onGuardado.emit(); },
      error: (e: any) => { this.error.set(e?.error?.message ?? 'Error inesperado'); this.guardando.set(false); }
    });
  }

  invalid(campo: string): boolean { const c = this.form.get(campo); return !!(c?.invalid && c?.touched); }
  cerrar(): void { this.onCerrar.emit(); }
}
