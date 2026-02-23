import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderService } from '../../../core/services/loader.service';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (loader.visible()) {
      <div class="loader-overlay">
        <div class="loader-box">
          <!-- Logo animado -->
          <div class="loader-logo">
            <svg width="48" height="48" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="16" fill="url(#lg)"/>
              <path d="M8 16 L16 8 L24 16 L16 24 Z" fill="white" opacity="0.9"/>
              <circle cx="16" cy="16" r="4" fill="white"/>
              <defs>
                <linearGradient id="lg" x1="0" y1="0" x2="32" y2="32">
                  <stop offset="0%" stop-color="#3b82f6"/>
                  <stop offset="100%" stop-color="#8b5cf6"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <!-- Spinner de puntos -->
          <div class="loader-dots">
            <span></span><span></span><span></span>
          </div>
          <p class="loader-text">Iniciando sesión...</p>
        </div>
      </div>
    }
  `,
  styles: [`
    .loader-overlay {
      position: fixed;
      inset: 0;
      background: rgba(7, 9, 15, 0.92);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: fadeIn .2s ease;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    .loader-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.25rem;
      animation: scaleIn .3s ease both;
    }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(.9); }
      to   { opacity: 1; transform: none; }
    }

    .loader-logo {
      animation: pulse 1.5s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1);    opacity: 1;   }
      50%       { transform: scale(1.08); opacity: .85; }
    }

    .loader-dots {
      display: flex;
      gap: .5rem;
    }
    .loader-dots span {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: #3b82f6;
      animation: bounce 1.2s ease-in-out infinite;
    }
    .loader-dots span:nth-child(2) { animation-delay: .2s; background: #8b5cf6; }
    .loader-dots span:nth-child(3) { animation-delay: .4s; background: #06b6d4; }
    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0.6); opacity: .5; }
      40%            { transform: scale(1.0); opacity: 1;  }
    }

    .loader-text {
      font-family: 'JetBrains Mono', monospace;
      font-size: .72rem;
      color: #64748b;
      margin: 0;
      letter-spacing: .05em;
    }
  `]
})
export class LoaderComponent {
  readonly loader = inject(LoaderService);
}
