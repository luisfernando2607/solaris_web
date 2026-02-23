import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'solaris_theme';

  private _theme = signal<Theme>(
    (localStorage.getItem(this.STORAGE_KEY) as Theme) ?? 'dark'
  );

  readonly theme = this._theme.asReadonly();
  readonly isDark = () => this._theme() === 'dark';

  constructor() {
    // Aplicar tema al arrancar
    this.applyTheme(this._theme());

    // Sincronizar con el DOM cada vez que cambie
    effect(() => {
      this.applyTheme(this._theme());
    });
  }

  toggle(): void {
    const next: Theme = this._theme() === 'dark' ? 'light' : 'dark';
    this._theme.set(next);
    localStorage.setItem(this.STORAGE_KEY, next);
  }

  private applyTheme(theme: Theme): void {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
  }
}
