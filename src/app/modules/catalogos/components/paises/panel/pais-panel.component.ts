import { Component, inject, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { PaisService } from '../../../../../core/services/pais.service';
import { Pais } from '../../../../../shared/models/catalogo.models';

@Component({
  selector: 'app-pais-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, ToastModule],
  providers: [MessageService],
  templateUrl: './pais-panel.component.html',
  styleUrls: ['./pais-panel.component.scss'],
})
export class PaisPanelComponent {
  visible    = input<boolean>(false);
  pais       = input<Pais | null>(null);
  onCerrar   = output<void>();
  onGuardado = output<void>();

  private readonly fb      = inject(FormBuilder);
  private readonly service = inject(PaisService);
  private readonly toast   = inject(MessageService);

  readonly guardando = signal(false);
  readonly error     = signal('');

  readonly esEdicion = () => !!this.pais();
  readonly titulo    = () => this.esEdicion() ? 'Editar País' : 'Nuevo País';

  form = this.fb.group({
    codigo:           ['', [Validators.required, Validators.minLength(2), Validators.maxLength(3)]],
    codigoIso2:       ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
    nombre:           ['', [Validators.required, Validators.minLength(2)]],
    nombreIngles:     [''],
    codigoTelefonico: [''],
    bandera:          [''],
    orden:            [0],
  });

  constructor() {
    effect(() => {
      const p = this.pais();
      if (p) {
        this.form.patchValue({
          codigo:           p.codigo,
          codigoIso2:       p.codigoIso2,
          nombre:           p.nombre,
          nombreIngles:     p.nombreIngles ?? '',
          codigoTelefonico: p.codigoTelefonico ?? '',
          bandera:          p.bandera ?? '',
          orden:            p.orden,
        });
      } else {
        this.form.reset({ orden: 0 });
      }
      this.error.set('');
    });
  }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.error.set('');
    this.guardando.set(true);
    const v = this.form.getRawValue();

    const payload = {
      codigo:           v.codigo!.toUpperCase(),
      codigoIso2:       v.codigoIso2!.toUpperCase(),
      nombre:           v.nombre!,
      nombreIngles:     v.nombreIngles || undefined,
      codigoTelefonico: v.codigoTelefonico || undefined,
      bandera:          v.bandera || undefined,
      orden:            v.orden ?? 0,
    };

    const exito = (msg: string) => () => {
      this.toast.add({ severity: 'success', summary: '¡Listo!', detail: msg, life: 3000 });
      this.guardando.set(false);
      this.onGuardado.emit();
    };
    const fallo = (e: any) => {
      this.error.set(e?.error?.message ?? 'Ocurrió un error inesperado');
      this.guardando.set(false);
    };

    if (this.esEdicion()) {
      this.service.actualizar(this.pais()!.id, payload)
        .subscribe({ next: exito('País actualizado'), error: fallo });
    } else {
      this.service.crear(payload)
        .subscribe({ next: exito('País creado correctamente'), error: fallo });
    }
  }

  invalid(campo: string): boolean {
    const c = this.form.get(campo);
    return !!(c?.invalid && c?.touched);
  }

  onUpperInput(campo: string, event: Event): void {
    const val = (event.target as HTMLInputElement).value.toUpperCase();
    this.form.get(campo)?.setValue(val, { emitEvent: false });
  }

  cerrar(): void { this.onCerrar.emit(); }
}
