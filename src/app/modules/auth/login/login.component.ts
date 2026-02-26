import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { LoaderService } from '../../../core/services/loader.service';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { ThemeToggleComponent } from '../../../shared/components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    MessageModule,
    ToastModule,
    LoaderComponent,
    ThemeToggleComponent,
  ],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private readonly fb          = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router      = inject(Router);
  private readonly toast       = inject(MessageService);
  readonly theme               = inject(ThemeService);
  readonly loader              = inject(LoaderService);

  readonly cargando = this.authService.cargando;
  readonly error    = signal<string>('');

  form = this.fb.group({
    email:    ['admin@solaris.local', [Validators.required, Validators.email]],
    password: ['Admin123!#',          [Validators.required, Validators.minLength(6)]]
  });

  currentYear: number = new Date().getFullYear();

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.error.set('');
    const { email, password } = this.form.value;

    this.authService.login({ email: email!, password: password! }).subscribe({
      next: (res) => {
        if (res.success) {
          // Mostrar toast de éxito
          this.toast.add({
            severity: 'success',
            summary: '¡Acceso exitoso!',
            detail: `Bienvenido, ${res.data.usuario.nombreCompleto}`,
            life: 2500,
            icon: 'pi pi-check-circle'
          });
          // Mostrar loader de transición
          setTimeout(() => {
            this.loader.show();
            setTimeout(() => {
              this.router.navigate(['/dashboard']).then(() => {
                setTimeout(() => this.loader.hide(), 400);
              });
            }, 800);
          }, 600);
        }
      },
      error: (err) => {
        const msg = err?.error?.message
          || err?.error?.data?.mensaje
          || 'Credenciales incorrectas. Verifica tu email y contraseña.';
        this.error.set(msg);
      }
    });
  }

  get emailInvalid()    { const c = this.form.get('email');    return c?.invalid && c?.touched; }
  get passwordInvalid() { const c = this.form.get('password'); return c?.invalid && c?.touched; }
}
