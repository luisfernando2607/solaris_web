import { Component, inject, input, output, signal, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';
import { MessageService } from 'primeng/api';

import { UsuarioService } from '../../../core/services/usuario.service';
import { RolService } from '../../../core/services/rol.service';
import { Usuario } from '../../../shared/models/usuario.models';

@Component({
  selector: 'app-usuario-panel',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    InputTextModule, PasswordModule, ButtonModule,
    MultiSelectModule, MessageModule, ToastModule, DividerModule,
  ],
  providers: [MessageService],
  templateUrl: './usuario-panel.component.html',
  styleUrls: ['./usuario-panel.component.scss']
})
export class UsuarioPanelComponent implements OnInit {
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
  readonly subtitulo = () => this.esEdicion()
    ? `Modificando datos de ${this.usuario()?.nombreCompleto}`
    : 'Completa los datos para crear un nuevo usuario';

  form = this.fb.group({
    nombres:       ['', [Validators.required, Validators.minLength(2)]],
    apellidos:     ['', [Validators.required, Validators.minLength(2)]],
    email:         ['', [Validators.required, Validators.email]],
    password:      [''],
    nombreUsuario: [''],
    telefono:      [''],
    celular:       [''],
    rolIds:        [[] as number[]],
  });

  constructor() {
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
      } else {
        this.form.reset({ rolIds: [] });
        this.form.get('email')?.enable();
        this.form.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
      }
      this.form.get('password')?.updateValueAndValidity();
      this.error.set('');
    });
  }

  ngOnInit(): void { this.rolService.listar().subscribe(); }

  get rolesOptions() {
    return this.roles().map(r => ({ label: r.nombre, value: r.id }));
  }

  invalid(campo: string) {
    const c = this.form.get(campo);
    return c?.invalid && c?.touched;
  }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.error.set('');
    this.cargando.set(true);
    const v = this.form.getRawValue();

    const ok = () => {
      this.toast.add({
        severity: 'success',
        summary:  '¡Listo!',
        detail:   this.esEdicion() ? 'Usuario actualizado' : 'Usuario creado correctamente',
        life: 3000
      });
      this.cargando.set(false);
      this.onGuardado.emit();
    };

    const err = (e: any) => {
      this.error.set(e?.error?.message ?? 'Ocurrió un error inesperado');
      this.cargando.set(false);
    };

    if (this.esEdicion()) {
      this.usuarioService.actualizar(this.usuario()!.id, {
        nombres:       v.nombres!,
        apellidos:     v.apellidos!,
        telefono:      v.telefono ?? undefined,
        celular:       v.celular ?? undefined,
        nombreUsuario: v.nombreUsuario ?? undefined,
      }).subscribe({ next: ok, error: err });
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
      }).subscribe({ next: ok, error: err });
    }
  }

  cerrar(): void { this.onCerrar.emit(); }
}
