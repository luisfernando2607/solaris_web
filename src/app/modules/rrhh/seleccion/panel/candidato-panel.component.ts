import { Component, inject, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { RrhhService } from '../../../../core/services/rrhh.service';
import { Candidato } from '../../../../shared/models/rrhh.models';

@Component({
  selector: 'app-candidato-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, ToastModule],
  providers: [MessageService],
  templateUrl: './candidato-panel.component.html',
  styleUrls: ['./candidato-panel.component.scss'],
})
export class CandidatoPanelComponent {
  visible    = input<boolean>(false);
  candidato  = input<Candidato | null>(null);
  onCerrar   = output<void>();
  onGuardado = output<void>();

  private readonly fb      = inject(FormBuilder);
  private readonly service = inject(RrhhService);
  private readonly toast   = inject(MessageService);

  readonly guardando = signal(false);
  readonly error     = signal('');
  readonly esEdicion = () => !!this.candidato();
  readonly titulo    = () => this.esEdicion() ? 'Editar Candidato' : 'Nuevo Candidato';

  form = this.fb.group({
    primerNombre:  ['', Validators.required],
    primerApellido:['', Validators.required],
    email:         ['', [Validators.required, Validators.email]],
    telefono:      [''],
    cvUrl:         [''],
    linkedinUrl:   [''],
  });

  constructor() {
    effect(() => {
      const c = this.candidato();
      if (c) {
        this.form.patchValue({ primerNombre: c.primerNombre, primerApellido: c.primerApellido,
          email: c.email, telefono: c.telefono ?? '', cvUrl: c.cvUrl ?? '', linkedinUrl: c.linkedinUrl ?? '' });
      } else { this.form.reset(); }
      this.error.set('');
    });
  }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.error.set(''); this.guardando.set(true);
    const v = this.form.getRawValue();
    const req: any = { empresaId: 0, primerNombre: v.primerNombre!, primerApellido: v.primerApellido!,
      email: v.email!, telefono: v.telefono || undefined, cvUrl: v.cvUrl || undefined, linkedinUrl: v.linkedinUrl || undefined };
    const ok  = (msg: string) => () => { this.toast.add({ severity: 'success', summary: '¡Listo!', detail: msg, life: 3000 }); this.guardando.set(false); this.onGuardado.emit(); };
    const err = (e: any) => { this.error.set(e?.error?.message ?? 'Error'); this.guardando.set(false); };
    if (this.esEdicion()) {
      this.service.actualizarCandidato(this.candidato()!.id, req).subscribe({ next: ok('Candidato actualizado'), error: err });
    } else {
      this.service.crearCandidato(req).subscribe({ next: ok('Candidato creado'), error: err });
    }
  }
  invalid(campo: string): boolean { const c = this.form.get(campo); return !!(c?.invalid && c?.touched); }
  cerrar(): void { this.onCerrar.emit(); }
}
