import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ThemeToggleComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  readonly authService  = inject(AuthService);
  readonly usuario      = this.authService.usuario;
  readonly dropdownOpen = signal(false);

  toggleDropdown() { this.dropdownOpen.update(v => !v); }
  logout()         { this.authService.logout(); }
}
