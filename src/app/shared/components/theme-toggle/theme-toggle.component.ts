import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      class="theme-toggle"
      (click)="theme.toggle()"
      [title]="theme.isDark() ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
      [attr.aria-label]="theme.isDark() ? 'Modo claro' : 'Modo oscuro'"
    >
      <div class="toggle-track" [class.light]="!theme.isDark()">
        <span class="toggle-icon sun">☀️</span>
        <span class="toggle-icon moon">🌙</span>
        <div class="toggle-thumb" [class.light]="!theme.isDark()"></div>
      </div>
    </button>
  `,
  styles: [`
    .theme-toggle {
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      display: flex;
      align-items: center;
    }

    .toggle-track {
      position: relative;
      width: 52px;
      height: 26px;
      background: #1e2a3a;
      border: 1px solid #334155;
      border-radius: 999px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 5px;
      transition: background .3s, border-color .3s;
      overflow: hidden;

      &.light {
        background: #e0f2fe;
        border-color: #7dd3fc;
      }
    }

    .toggle-icon {
      font-size: .7rem;
      line-height: 1;
      z-index: 1;
      transition: opacity .3s;
      &.sun  { opacity: .6; }
      &.moon { opacity: .6; }
    }

    .toggle-thumb {
      position: absolute;
      right: 3px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      transition: transform .3s cubic-bezier(.4,0,.2,1), background .3s;
      box-shadow: 0 2px 4px rgba(0,0,0,.3);

      &.light {
        transform: translateX(-26px);
        background: linear-gradient(135deg, #f59e0b, #f97316);
      }
    }
  `]
})
export class ThemeToggleComponent {
  readonly theme = inject(ThemeService);
}
