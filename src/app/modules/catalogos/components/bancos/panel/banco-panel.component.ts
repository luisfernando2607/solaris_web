import { Component, inject, input, output, signal, effect, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { BancoService } from '../../../../../core/services/banco.service';
import { PaisService } from '../../../../../core/services/pais.service';
import { Banco } from '../../../../../shared/models/catalogo.models';

@Component({
  selector: 'app-banco-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, SelectModule, ToastModule],
  providers: [MessageService],
  templateUrl: './banco-panel.component.html',
  styleUrls: ['./banco-panel.component.scss'],
})
export class BancoPanelComponent implements OnInit {
  visible    = input<boolean>(false);
  banco      = input<Banco | null>(null);
  onCerrar   = output<void>();
  onGuardado = output<void>();

  private readonly fb          = inject(FormBuilder);
  private readonly service     = inject(BancoService);
  private readonly paisService = inject(PaisService);
  private readonly toast       = inject(MessageService);

  readonly guardando = signal(false);
  readonly error     = signal('');

  readonly paisesOptions = computed(() => [
    { label: '— Sin país específico —', value: null },
    ...this.paisService.paises().map(p => ({ label: `${p.bandera ?? ''} ${p.nombre}`, value: p.id }))
  ]);

  readonly esEdicion = () => !!this.banco();
  readonly titulo    = () => this.esEdicion() ? 'Editar Banco' : 'Nuevo Banco';

  form = this.fb.group({
    paisId:      [null as number | null],
    codigo:      ['', Validators.required],
    nombre:      ['', [Validators.required, Validators.minLength(2)]],
    nombreCorto: [''],
    orden:       [0],
  });

  constructor() {
    effect(() => {
      const b = this.banco();
      if (b) {
        this.form.patchValue({ paisId: b.paisId ?? null, codigo: b.codigo, nombre: b.nombre, nombreCorto: b.nombreCorto ?? '', orden: b.orden });
      } else {
        this.form.reset({ orden: 0 });
      }
      this.error.set('');
    });
  }

  ngOnInit(): void { this.paisService.listar().subscribe(); }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.error.set(''); this.guardando.set(true);
    const v = this.form.getRawValue();
    const payload = { paisId: v.paisId ?? undefined, codigo: v.codigo!, nombre: v.nombre!, nombreCorto: v.nombreCorto || undefined, orden: v.orden ?? 0 };

    const exito = (msg: string) => () => { this.toast.add({ severity: 'success', summary: '¡Listo!', detail: msg, life: 3000 }); this.guardando.set(false); this.onGuardado.emit(); };
    const fallo = (e: any) => { this.error.set(e?.error?.message ?? 'Error inesperado'); this.guardando.set(false); };

    if (this.esEdicion()) {
      this.service.actualizar(this.banco()!.id, payload).subscribe({ next: exito('Banco actualizado'), error: fallo });
    } else {
      this.service.crear(payload).subscribe({ next: exito('Banco creado'), error: fallo });
    }
  }

  invalid(campo: string): boolean { const c = this.form.get(campo); return !!(c?.invalid && c?.touched); }
  cerrar(): void { this.onCerrar.emit(); }
}
