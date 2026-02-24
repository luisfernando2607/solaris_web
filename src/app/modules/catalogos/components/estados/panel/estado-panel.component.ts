import { Component, inject, input, output, signal, effect, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { EstadoProvinciaService } from '../../../../../core/services/estado-provincia.service';
import { PaisService } from '../../../../../core/services/pais.service';
import { EstadoProvincia } from '../../../../../shared/models/catalogo.models';

@Component({
  selector: 'app-estado-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, SelectModule, ToastModule],
  providers: [MessageService],
  templateUrl: './estado-panel.component.html',
  styleUrls: ['./estado-panel.component.scss'],
})
export class EstadoPanelComponent implements OnInit {
  visible    = input<boolean>(false);
  estado     = input<EstadoProvincia | null>(null);
  onCerrar   = output<void>();
  onGuardado = output<void>();

  private readonly fb         = inject(FormBuilder);
  private readonly service    = inject(EstadoProvinciaService);
  private readonly paisService = inject(PaisService);
  private readonly toast      = inject(MessageService);

  readonly guardando = signal(false);
  readonly error     = signal('');

  readonly paisesOptions = computed(() =>
    this.paisService.paises().map(p => ({ label: `${p.bandera ?? ''} ${p.nombre}`, value: p.id }))
  );

  readonly esEdicion = () => !!this.estado();
  readonly titulo    = () => this.esEdicion() ? 'Editar Estado / Provincia' : 'Nuevo Estado / Provincia';

  form = this.fb.group({
    paisId: [null as number | null, Validators.required],
    codigo: ['', Validators.required],
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    orden:  [0],
  });

  constructor() {
    effect(() => {
      const e = this.estado();
      if (e) {
        this.form.patchValue({ paisId: e.paisId, codigo: e.codigo, nombre: e.nombre, orden: e.orden });
      } else {
        this.form.reset({ orden: 0 });
      }
      this.error.set('');
    });
  }

  ngOnInit(): void { this.paisService.listar().subscribe(); }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.error.set('');
    this.guardando.set(true);
    const v = this.form.getRawValue();

    const payload = {
      paisId: v.paisId!,
      codigo: v.codigo!,
      nombre: v.nombre!,
      orden:  v.orden ?? 0,
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
      this.service.actualizar(this.estado()!.id, payload)
        .subscribe({ next: exito('Estado actualizado'), error: fallo });
    } else {
      this.service.crear(payload)
        .subscribe({ next: exito('Estado creado correctamente'), error: fallo });
    }
  }

  invalid(campo: string): boolean {
    const c = this.form.get(campo);
    return !!(c?.invalid && c?.touched);
  }

  cerrar(): void { this.onCerrar.emit(); }
}
