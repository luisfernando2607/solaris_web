import { Component, inject, input, output, signal, effect, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { CiudadService } from '../../../../../core/services/ciudad.service';
import { EstadoProvinciaService } from '../../../../../core/services/estado-provincia.service';
import { Ciudad } from '../../../../../shared/models/catalogo.models';

@Component({
  selector: 'app-ciudad-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, SelectModule, ToastModule],
  providers: [MessageService],
  templateUrl: './ciudad-panel.component.html',
  styleUrls: ['./ciudad-panel.component.scss'],
})
export class CiudadPanelComponent implements OnInit {
  visible    = input<boolean>(false);
  ciudad     = input<Ciudad | null>(null);
  onCerrar   = output<void>();
  onGuardado = output<void>();

  private readonly fb            = inject(FormBuilder);
  private readonly service       = inject(CiudadService);
  private readonly estadoService = inject(EstadoProvinciaService);
  private readonly toast         = inject(MessageService);

  readonly guardando = signal(false);
  readonly error     = signal('');

  readonly estadosOptions = computed(() =>
    this.estadoService.estados().map(e => ({ label: e.nombre, value: e.id }))
  );

  readonly esEdicion = () => !!this.ciudad();
  readonly titulo    = () => this.esEdicion() ? 'Editar Ciudad' : 'Nueva Ciudad';

  form = this.fb.group({
    estadoProvinciaId: [null as number | null, Validators.required],
    codigo:            [''],
    nombre:            ['', [Validators.required, Validators.minLength(2)]],
    orden:             [0],
  });

  constructor() {
    effect(() => {
      const c = this.ciudad();
      if (c) {
        this.form.patchValue({
          estadoProvinciaId: c.estadoProvinciaId,
          codigo:            c.codigo ?? '',
          nombre:            c.nombre,
          orden:             c.orden,
        });
      } else {
        this.form.reset({ orden: 0 });
      }
      this.error.set('');
    });
  }

  ngOnInit(): void { this.estadoService.listar().subscribe(); }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.error.set('');
    this.guardando.set(true);
    const v = this.form.getRawValue();

    const payload = {
      estadoProvinciaId: v.estadoProvinciaId!,
      codigo:            v.codigo || undefined,
      nombre:            v.nombre!,
      orden:             v.orden ?? 0,
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
      this.service.actualizar(this.ciudad()!.id, payload).subscribe({ next: exito('Ciudad actualizada'), error: fallo });
    } else {
      this.service.crear(payload).subscribe({ next: exito('Ciudad creada correctamente'), error: fallo });
    }
  }

  invalid(campo: string): boolean {
    const c = this.form.get(campo);
    return !!(c?.invalid && c?.touched);
  }

  cerrar(): void { this.onCerrar.emit(); }
}
