import { Component, inject, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { ImpuestoService } from '../../../../../core/services/impuesto.service';
import { Impuesto, TIPOS_IMPUESTO } from '../../../../../shared/models/catalogo.models';

@Component({
  selector: 'app-impuesto-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, SelectModule, CheckboxModule, ToastModule],
  providers: [MessageService],
  templateUrl: './impuesto-panel.component.html',
  styleUrls: ['./impuesto-panel.component.scss'],
})
export class ImpuestoPanelComponent {
  visible    = input<boolean>(false);
  impuesto   = input<Impuesto | null>(null);
  onCerrar   = output<void>();
  onGuardado = output<void>();

  private readonly fb      = inject(FormBuilder);
  private readonly service = inject(ImpuestoService);
  private readonly toast   = inject(MessageService);

  readonly guardando     = signal(false);
  readonly error         = signal('');
  readonly tiposImpuesto = TIPOS_IMPUESTO;

  readonly esEdicion = () => !!this.impuesto();
  readonly titulo    = () => this.esEdicion() ? 'Editar Impuesto' : 'Nuevo Impuesto';

  form = this.fb.group({
    codigo:       ['', Validators.required],
    nombre:       ['', [Validators.required, Validators.minLength(2)]],
    porcentaje:   [0, [Validators.required, Validators.min(0), Validators.max(100)]],
    tipoImpuesto: ['IVA', Validators.required],
    esRetencion:  [false],
    orden:        [0],
  });

  constructor() {
    effect(() => {
      const i = this.impuesto();
      if (i) {
        this.form.patchValue({ codigo: i.codigo, nombre: i.nombre, porcentaje: i.porcentaje, tipoImpuesto: i.tipoImpuesto, esRetencion: i.esRetencion, orden: i.orden });
      } else {
        this.form.reset({ porcentaje: 0, tipoImpuesto: 'IVA', esRetencion: false, orden: 0 });
      }
      this.error.set('');
    });
  }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.error.set(''); this.guardando.set(true);
    const v = this.form.getRawValue();
    const payload = { codigo: v.codigo!, nombre: v.nombre!, porcentaje: v.porcentaje!, tipoImpuesto: v.tipoImpuesto!, esRetencion: v.esRetencion ?? false, orden: v.orden ?? 0 };

    const exito = (msg: string) => () => { this.toast.add({ severity: 'success', summary: '¡Listo!', detail: msg, life: 3000 }); this.guardando.set(false); this.onGuardado.emit(); };
    const fallo = (e: any) => { this.error.set(e?.error?.message ?? 'Error inesperado'); this.guardando.set(false); };

    if (this.esEdicion()) {
      this.service.actualizar(this.impuesto()!.id, payload).subscribe({ next: exito('Impuesto actualizado'), error: fallo });
    } else {
      this.service.crear(payload).subscribe({ next: exito('Impuesto creado'), error: fallo });
    }
  }

  invalid(campo: string): boolean { const c = this.form.get(campo); return !!(c?.invalid && c?.touched); }
  cerrar(): void { this.onCerrar.emit(); }
}
