import { Component, inject, input, output, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { UsuarioService } from '../../../core/services/usuario.service';
import { RolService, Rol } from '../../../core/services/rol.service';
import { Usuario } from '../../../shared/models/usuario.models';

@Component({
  selector: 'app-usuario-modal',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    DialogModule, InputTextModule, PasswordModule,
    ButtonModule, SelectModule, MultiSelectModule,
    MessageModule, ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './usuario-modal.component.html',
  styleUrls: ['./usuario-modal.component.scss']
})
export class UsuarioModalComponent implements OnInit {
  // ── Inputs / Outputs ──────────────────────────
  visible    = input<boolean>(false);
  usuario    = input<Usuario | null>(null);
  onCerrar   = output<void>();
  onGuardado = output<void>();

  private readonly fb             = inject(FormBuilder);
  private readonly usuarioService = inject(UsuarioService);
  private readonly rolService     = inject(RolService);
  private readonly toast          = inject(MessageService);

  readonly cargando  = signal(false);
  readonly error     = signal('');
  readonly roles     = this.rolService.roles;

  readonly esEdicion = () => !!this.usuario();
  readonly titulo    = () => this.esEdicion() ? 'Editar Usuario' : 'Nuevo Usuario';

  form = this.fb.group({
    nombres:       ['', [Validators.required, Validators.minLength(2)]],
    apellidos:     ['', [Validators.required, Validators.minLength(2)]],
    email:         ['', [Validators.required, Validators.email]],
    password:      ['', []],
    nombreUsuario: [''],
    telefono:      [''],
    celular:       [''],
    rolIds:        [[] as number[]],
  });

  constructor() {
    // Cuando cambia el usuario input, cargar datos en el form
    effect(() => {
      const u = this.usuario();
      if (u) {
        this.form.patchValue({
          nombres:       u.nombres,
          apellidos:     u.apellidos,
          email:         u.email,
          nombreUsuario: u.nombreUsuario ?? '',
          telefono:      u.telefono ?? '',
          celular:       u.celular ?? '',
          rolIds:        [],
        });
        this.form.get('email')?.disable();
        this.form.get('password')?.clearValidators();
        this.form.get('password')?.updateValueAndValidity();
      } else {
        this.form.reset();
        this.form.get('email')?.enable();
        this.form.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
        this.form.get('password')?.updateValueAndValidity();
      }
    });
  }

  ngOnInit(): void {
    this.rolService.listar().subscribe();
  }

  get rolesOptions() {
    return this.roles().map(r => ({ label: r.nombre, value: r.id }));
  }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.error.set('');
    this.cargando.set(true);

    const v = this.form.getRawValue();

    if (this.esEdicion()) {
      this.usuarioService.actualizar(this.usuario()!.id, {
        nombres:       v.nombres!,
        apellidos:     v.apellidos!,
        telefono:      v.telefono ?? undefined,
        celular:       v.celular ?? undefined,
        nombreUsuario: v.nombreUsuario ?? undefined,
      }).subscribe({
        next: () => {
          this.toast.add({ severity:'success', summary:'¡Listo!', detail:'Usuario actualizado correctamente', life:3000 });
          this.cargando.set(false);
          this.onGuardado.emit();
        },
        error: (err) => {
          this.error.set(err?.error?.message ?? 'Error al actualizar usuario');
          this.cargando.set(false);
        }
      });
    } else {
      this.usuarioService.crear({
        empresaId:     1,
        email:         v.email!,
        nombres:       v.nombres!,
        apellidos:     v.apellidos!,
        password:      v.password!,
        nombreUsuario: v.nombreUsuario ?? undefined,
        telefono:      v.telefono ?? undefined,
        celular:       v.celular ?? undefined,
        rolIds:        v.rolIds ?? [],
      }).subscribe({
        next: () => {
          this.toast.add({ severity:'success', summary:'¡Listo!', detail:'Usuario creado correctamente', life:3000 });
          this.cargando.set(false);
          this.onGuardado.emit();
        },
        error: (err) => {
          this.error.set(err?.error?.message ?? 'Error al crear usuario');
          this.cargando.set(false);
        }
      });
    }
  }

  cerrar(): void { this.onCerrar.emit(); }

  invalid(campo: string) {
    const c = this.form.get(campo);
    return c?.invalid && c?.touched;
  }
}
