import { Component, inject, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { MonedaService } from '../../../../../core/services/moneda.service';
import { Moneda } from '../../../../../shared/models/catalogo.models';

@Component({
  selector: 'app-moneda-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, ToastModule],
  providers: [MessageService],
  templateUrl: './moneda-panel.component.html',
  styleUrls: ['./moneda-panel.component.scss'],
})
export class MonedaPanelComponent {
  visible    = input<boolean>(false);
  moneda     = input<Moneda | null>(null);
  onCerrar   = output<void>();
  onGuardado = output<void>();

  private readonly fb      = inject(FormBuilder);
  private readonly service = inject(MonedaService);
  private readonly toast   = inject(MessageService);

  readonly guardando = signal(false);
  readonly error     = signal('');

  readonly esEdicion = () => !!this.moneda();
  readonly titulo    = () => this.esEdicion() ? 'Editar Moneda' : 'Nueva Moneda';

  form = this.fb.group({
    codigo:              ['', [Validators.required, Validators.maxLength(3)]],
    nombre:              ['', [Validators.required, Validators.minLength(2)]],
    simbolo:             ['', Validators.required],
    decimalesPermitidos: [2, [Validators.required, Validators.min(0), Validators.max(6)]],
    orden:               [0],
  });

  constructor() {
    effect(() => {
      const m = this.moneda();
      if (m) {
        this.form.patchValue({ codigo: m.codigo, nombre: m.nombre, simbolo: m.simbolo, decimalesPermitidos: m.decimalesPermitidos, orden: m.orden });
      } else {
        this.form.reset({ decimalesPermitidos: 2, orden: 0 });
      }
      this.error.set('');
    });
  }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.error.set(''); this.guardando.set(true);
    const v = this.form.getRawValue();
    const payload = { codigo: v.codigo!.toUpperCase(), nombre: v.nombre!, simbolo: v.simbolo!, decimalesPermitidos: v.decimalesPermitidos!, orden: v.orden ?? 0 };

    const exito = (msg: string) => () => { this.toast.add({ severity: 'success', summary: '¡Listo!', detail: msg, life: 3000 }); this.guardando.set(false); this.onGuardado.emit(); };
    const fallo = (e: any) => { this.error.set(e?.error?.message ?? 'Error inesperado'); this.guardando.set(false); };

    if (this.esEdicion()) {
      this.service.actualizar(this.moneda()!.id, payload).subscribe({ next: exito('Moneda actualizada'), error: fallo });
    } else {
      this.service.crear(payload).subscribe({ next: exito('Moneda creada'), error: fallo });
    }
  }

  invalid(campo: string): boolean { const c = this.form.get(campo); return !!(c?.invalid && c?.touched); }
  onCodigoInput(event: Event): void { const val = (event.target as HTMLInputElement).value.toUpperCase(); this.form.get('codigo')?.setValue(val, { emitEvent: false }); }
  cerrar(): void { this.onCerrar.emit(); }
}
