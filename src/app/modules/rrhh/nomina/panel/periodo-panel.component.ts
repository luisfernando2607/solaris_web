import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { RrhhService } from '../../../../core/services/rrhh.service';

@Component({
  selector: 'app-periodo-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, ToastModule],
  providers: [MessageService],
  templateUrl: './periodo-panel.component.html',
  styleUrls: ['./periodo-panel.component.scss'],
})
export class PeriodoPanelComponent {
  visible    = input<boolean>(false);
  onCerrar   = output<void>();
  onGuardado = output<void>();

  private readonly fb      = inject(FormBuilder);
  private readonly service = inject(RrhhService);
  private readonly toast   = inject(MessageService);

  readonly guardando = signal(false);
  readonly error     = signal('');

  form = this.fb.group({
    anno:          [new Date().getFullYear(), Validators.required],
    numeroPeriodo: [1, Validators.required],
    tipoPeriodo:   [1, Validators.required],
    descripcion:   ['', Validators.required],
    fechaInicio:   ['', Validators.required],
    fechaFin:      ['', Validators.required],
    fechaPago:     [''],
  });

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.error.set(''); this.guardando.set(true);
    const v = this.form.getRawValue();
    const req: any = { empresaId: 0, anno: v.anno!, numeroPeriodo: v.numeroPeriodo!,
      tipoPeriodo: v.tipoPeriodo!, descripcion: v.descripcion!,
      fechaInicio: v.fechaInicio!, fechaFin: v.fechaFin!, fechaPago: v.fechaPago || undefined };
    this.service.crearPeriodo(req).subscribe({
      next: () => { this.toast.add({ severity: 'success', summary: '¡Listo!', detail: 'Período creado', life: 3000 }); this.guardando.set(false); this.onGuardado.emit(); },
      error: (e: any) => { this.error.set(e?.error?.message ?? 'Error'); this.guardando.set(false); }
    });
  }
  cerrar(): void { this.onCerrar.emit(); }
}
