import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { RrhhService } from '../../../../core/services/rrhh.service';

@Component({
  selector: 'app-requisicion-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, SelectModule, ToastModule],
  providers: [MessageService],
  templateUrl: './requisicion-panel.component.html',
  styleUrls: ['./requisicion-panel.component.scss'],
})
export class RequisicionPanelComponent {
  visible    = input<boolean>(false);
  onCerrar   = output<void>();
  onGuardado = output<void>();

  private readonly fb      = inject(FormBuilder);
  private readonly service = inject(RrhhService);
  private readonly toast   = inject(MessageService);

  readonly guardando     = signal(false);
  readonly error         = signal('');
  readonly motivoOptions = [{ label: 'Plaza nueva', value: 1 }, { label: 'Reemplazo', value: 2 }, { label: 'Temporal', value: 3 }];

  form = this.fb.group({
    departamentoId:   [null as number | null, Validators.required],
    puestoId:         [null as number | null, Validators.required],
    solicitanteId:    [null as number | null, Validators.required],
    motivo:           [1, Validators.required],
    cantidadPlazas:   [1, Validators.required],
    fechaSolicitud:   [new Date().toISOString().split('T')[0], Validators.required],
    fechaRequerida:   [''],
    descripcionPerfil:[''],
  });

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.error.set(''); this.guardando.set(true);
    const v = this.form.getRawValue();
    const req: any = { empresaId: 0, departamentoId: v.departamentoId!, puestoId: v.puestoId!,
      solicitanteId: v.solicitanteId!, motivo: v.motivo!, cantidadPlazas: v.cantidadPlazas!,
      fechaSolicitud: v.fechaSolicitud!, fechaRequerida: v.fechaRequerida || undefined,
      descripcionPerfil: v.descripcionPerfil || undefined };
    this.service.crearRequisicion(req).subscribe({
      next: () => { this.toast.add({ severity: 'success', summary: '¡Listo!', detail: 'Requisición creada', life: 3000 }); this.guardando.set(false); this.onGuardado.emit(); },
      error: (e: any) => { this.error.set(e?.error?.message ?? 'Error'); this.guardando.set(false); }
    });
  }
  invalid(campo: string): boolean { const c = this.form.get(campo); return !!(c?.invalid && c?.touched); }
  cerrar(): void { this.onCerrar.emit(); }
}
