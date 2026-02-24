import { Component, inject, input, output, signal, effect, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { TipoIdentificacionService } from '../../../../../core/services/tipo-identificacion.service';
import { PaisService } from '../../../../../core/services/pais.service';
import { TipoIdentificacion } from '../../../../../shared/models/catalogo.models';

@Component({
  selector: 'app-tipo-identificacion-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, SelectModule, CheckboxModule, ToastModule],
  providers: [MessageService],
  templateUrl: './tipo-identificacion-panel.component.html',
  styleUrls: ['./tipo-identificacion-panel.component.scss'],
})
export class TipoIdentificacionPanelComponent implements OnInit {
  visible    = input<boolean>(false);
  tipo       = input<TipoIdentificacion | null>(null);
  onCerrar   = output<void>();
  onGuardado = output<void>();

  private readonly fb          = inject(FormBuilder);
  private readonly service     = inject(TipoIdentificacionService);
  private readonly paisService = inject(PaisService);
  private readonly toast       = inject(MessageService);

  readonly guardando = signal(false);
  readonly error     = signal('');

  readonly paisesOptions = computed(() => [
    { label: '— Global (sin país) —', value: null },
    ...this.paisService.paises().map(p => ({ label: `${p.bandera ?? ''} ${p.nombre}`, value: p.id }))
  ]);

  readonly esEdicion = () => !!this.tipo();
  readonly titulo    = () => this.esEdicion() ? 'Editar Tipo Identificación' : 'Nuevo Tipo Identificación';

  form = this.fb.group({
    paisId:        [null as number | null],
    codigo:        ['', Validators.required],
    nombre:        ['', [Validators.required, Validators.minLength(2)]],
    longitud:      [null as number | null],
    patron:        [''],
    aplicaPersona: [true],
    aplicaEmpresa: [true],
    orden:         [0],
  });

  constructor() {
    effect(() => {
      const t = this.tipo();
      if (t) {
        this.form.patchValue({
          paisId: t.paisId ?? null, codigo: t.codigo, nombre: t.nombre,
          longitud: t.longitud ?? null, patron: t.patron ?? '',
          aplicaPersona: t.aplicaPersona, aplicaEmpresa: t.aplicaEmpresa, orden: t.orden
        });
      } else {
        this.form.reset({ aplicaPersona: true, aplicaEmpresa: true, orden: 0 });
      }
      this.error.set('');
    });
  }

  ngOnInit(): void { this.paisService.listar().subscribe(); }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.error.set(''); this.guardando.set(true);
    const v = this.form.getRawValue();
    const payload = {
      paisId: v.paisId ?? undefined, codigo: v.codigo!, nombre: v.nombre!,
      longitud: v.longitud ?? undefined, patron: v.patron || undefined,
      aplicaPersona: v.aplicaPersona ?? true, aplicaEmpresa: v.aplicaEmpresa ?? true, orden: v.orden ?? 0
    };

    const exito = (msg: string) => () => {
      this.toast.add({ severity: 'success', summary: '¡Listo!', detail: msg, life: 3000 });
      this.guardando.set(false); this.onGuardado.emit();
    };
    const fallo = (e: any) => { this.error.set(e?.error?.message ?? 'Error inesperado'); this.guardando.set(false); };

    if (this.esEdicion()) {
      this.service.actualizar(this.tipo()!.id, payload).subscribe({ next: exito('Tipo actualizado'), error: fallo });
    } else {
      this.service.crear(payload).subscribe({ next: exito('Tipo creado'), error: fallo });
    }
  }

  invalid(campo: string): boolean { const c = this.form.get(campo); return !!(c?.invalid && c?.touched); }
  cerrar(): void { this.onCerrar.emit(); }
}
