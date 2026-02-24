import { Component, inject, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { FormaPagoService } from '../../../../../core/services/forma-pago.service';
import { FormaPago, TIPOS_FORMA_PAGO } from '../../../../../shared/models/catalogo.models';

@Component({
  selector: 'app-forma-pago-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, SelectModule, CheckboxModule, ToastModule],
  providers: [MessageService],
  templateUrl: './forma-pago-panel.component.html',
  styleUrls: ['./forma-pago-panel.component.scss'],
})
export class FormaPagoPanelComponent {
  visible    = input<boolean>(false);
  formaPago  = input<FormaPago | null>(null);
  onCerrar   = output<void>();
  onGuardado = output<void>();

  private readonly fb      = inject(FormBuilder);
  private readonly service = inject(FormaPagoService);
  private readonly toast   = inject(MessageService);

  readonly guardando    = signal(false);
  readonly error        = signal('');
  readonly tiposPago    = TIPOS_FORMA_PAGO;

  readonly esEdicion = () => !!this.formaPago();
  readonly titulo    = () => this.esEdicion() ? 'Editar Forma de Pago' : 'Nueva Forma de Pago';

  form = this.fb.group({
    codigo:             ['', Validators.required],
    nombre:             ['', [Validators.required, Validators.minLength(2)]],
    tipo:               ['EFECTIVO', Validators.required],
    diasCredito:        [0, [Validators.required, Validators.min(0)]],
    requiereBanco:      [false],
    requiereReferencia: [false],
    orden:              [0],
  });

  constructor() {
    effect(() => {
      const f = this.formaPago();
      if (f) {
        this.form.patchValue({ codigo: f.codigo, nombre: f.nombre, tipo: f.tipo, diasCredito: f.diasCredito, requiereBanco: f.requiereBanco, requiereReferencia: f.requiereReferencia, orden: f.orden });
      } else {
        this.form.reset({ tipo: 'EFECTIVO', diasCredito: 0, requiereBanco: false, requiereReferencia: false, orden: 0 });
      }
      this.error.set('');
    });
  }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.error.set(''); this.guardando.set(true);
    const v = this.form.getRawValue();
    const payload = { codigo: v.codigo!, nombre: v.nombre!, tipo: v.tipo!, diasCredito: v.diasCredito!, requiereBanco: v.requiereBanco ?? false, requiereReferencia: v.requiereReferencia ?? false, orden: v.orden ?? 0 };

    const exito = (msg: string) => () => { this.toast.add({ severity: 'success', summary: '¡Listo!', detail: msg, life: 3000 }); this.guardando.set(false); this.onGuardado.emit(); };
    const fallo = (e: any) => { this.error.set(e?.error?.message ?? 'Error inesperado'); this.guardando.set(false); };

    if (this.esEdicion()) {
      this.service.actualizar(this.formaPago()!.id, payload).subscribe({ next: exito('Forma de pago actualizada'), error: fallo });
    } else {
      this.service.crear(payload).subscribe({ next: exito('Forma de pago creada'), error: fallo });
    }
  }

  invalid(campo: string): boolean { const c = this.form.get(campo); return !!(c?.invalid && c?.touched); }
  cerrar(): void { this.onCerrar.emit(); }
}
