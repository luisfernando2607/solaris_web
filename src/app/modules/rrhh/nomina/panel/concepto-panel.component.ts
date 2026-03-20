import { Component, inject, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { RrhhService } from '../../../../core/services/rrhh.service';
import { ConceptoNomina, TIPO_CONCEPTO_OPTIONS } from '../../../../shared/models/rrhh.models';

@Component({
  selector: 'app-concepto-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, SelectModule, CheckboxModule, ToastModule],
  providers: [MessageService],
  templateUrl: './concepto-panel.component.html',
  styleUrls: ['./concepto-panel.component.scss'],
})
export class ConceptoPanelComponent {
  visible   = input<boolean>(false);
  concepto  = input<ConceptoNomina | null>(null);
  onCerrar  = output<void>();
  onGuardado = output<void>();

  private readonly fb      = inject(FormBuilder);
  private readonly service = inject(RrhhService);
  private readonly toast   = inject(MessageService);

  readonly guardando   = signal(false);
  readonly error       = signal('');
  readonly tipoOptions = TIPO_CONCEPTO_OPTIONS;
  readonly esEdicion   = () => !!this.concepto();
  readonly titulo      = () => this.esEdicion() ? 'Editar Concepto' : 'Nuevo Concepto';

  form = this.fb.group({
    codigo:       ['', Validators.required],
    nombre:       ['', Validators.required],
    descripcion:  [''],
    tipo:         [1, Validators.required],
    formaCalculo: [1],
    valorFijo:    [null as number | null],
    porcentaje:   [null as number | null],
    esObligatorio:[false],
  });

  constructor() {
    effect(() => {
      const c = this.concepto();
      if (c) {
        this.form.patchValue({ codigo: c.codigo, nombre: c.nombre, descripcion: c.descripcion ?? '',
          tipo: c.tipo, formaCalculo: c.formaCalculo, valorFijo: c.valorFijo ?? null,
          porcentaje: c.porcentaje ?? null, esObligatorio: c.esObligatorio });
      } else { this.form.reset({ tipo: 1, formaCalculo: 1, esObligatorio: false }); }
      this.error.set('');
    });
  }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.error.set(''); this.guardando.set(true);
    const v = this.form.getRawValue();
    const req: any = { empresaId: 0, codigo: v.codigo!, nombre: v.nombre!,
      descripcion: v.descripcion || undefined, tipo: v.tipo!, formaCalculo: v.formaCalculo!,
      valorFijo: v.valorFijo ?? undefined, porcentaje: v.porcentaje ?? undefined,
      esObligatorio: v.esObligatorio ?? false };
    const ok  = (msg: string) => () => { this.toast.add({ severity: 'success', summary: '¡Listo!', detail: msg, life: 3000 }); this.guardando.set(false); this.onGuardado.emit(); };
    const err = (e: any) => { this.error.set(e?.error?.message ?? 'Error'); this.guardando.set(false); };
    if (this.esEdicion()) {
      this.service.actualizarConcepto(this.concepto()!.id, req).subscribe({ next: ok('Concepto actualizado'), error: err });
    } else {
      this.service.crearConcepto(req).subscribe({ next: ok('Concepto creado'), error: err });
    }
  }
  invalid(c: string): boolean { const f = this.form.get(c); return !!(f?.invalid && f?.touched); }
  cerrar(): void { this.onCerrar.emit(); }
}
