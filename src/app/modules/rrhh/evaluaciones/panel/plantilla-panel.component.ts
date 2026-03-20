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
  selector: 'app-plantilla-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, SelectModule, ToastModule],
  providers: [MessageService],
  templateUrl: './plantilla-panel.component.html',
  styleUrls: ['./plantilla-panel.component.scss'],
})
export class PlantillaPanelComponent {
  visible    = input<boolean>(false);
  onCerrar   = output<void>();
  onGuardado = output<void>();

  private readonly fb      = inject(FormBuilder);
  private readonly service = inject(RrhhService);
  private readonly toast   = inject(MessageService);

  readonly guardando   = signal(false);
  readonly error       = signal('');
  readonly tipoOptions = [{ label: '360°', value: 1 }, { label: 'Autoevaluación', value: 2 }, { label: 'Por objetivos', value: 3 }];

  form = this.fb.group({
    codigo:        ['', Validators.required],
    nombre:        ['', Validators.required],
    descripcion:   [''],
    tipo:          [1, Validators.required],
    escalaMin:     [1, Validators.required],
    escalaMax:     [5, Validators.required],
    instrucciones: [''],
  });

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.error.set(''); this.guardando.set(true);
    const v = this.form.getRawValue();
    const req: any = { empresaId: 0, codigo: v.codigo!, nombre: v.nombre!,
      descripcion: v.descripcion || undefined, tipo: v.tipo!,
      escalaMin: v.escalaMin!, escalaMax: v.escalaMax!,
      instrucciones: v.instrucciones || undefined, criterios: [] };
    this.service.crearPlantilla(req).subscribe({
      next: () => { this.toast.add({ severity: 'success', summary: '¡Listo!', detail: 'Plantilla creada', life: 3000 }); this.guardando.set(false); this.onGuardado.emit(); },
      error: (e: any) => { this.error.set(e?.error?.message ?? 'Error'); this.guardando.set(false); }
    });
  }
  cerrar(): void { this.onCerrar.emit(); }
}
