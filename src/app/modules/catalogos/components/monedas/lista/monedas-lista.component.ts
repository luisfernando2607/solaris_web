import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

import { MonedaService } from '../../../../../core/services/moneda.service';
import { Moneda } from '../../../../../shared/models/catalogo.models';
import { MonedaPanelComponent } from '../panel/moneda-panel.component';

@Component({
  selector: 'app-monedas-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastModule, ButtonModule, TooltipModule, ConfirmDialogModule, MonedaPanelComponent],
  providers: [MessageService, ConfirmationService],
  templateUrl: './monedas-lista.component.html',
  styleUrls: ['./monedas-lista.component.scss'],
})
export class MonedasListaComponent implements OnInit {
  private readonly service = inject(MonedaService);
  private readonly toast   = inject(MessageService);
  private readonly confirm = inject(ConfirmationService);

  readonly monedas  = this.service.monedas;
  readonly cargando = this.service.cargando;

  readonly busqueda      = signal('');
  readonly panelVisible  = signal(false);
  readonly monedaEdicion = signal<Moneda | null>(null);

  readonly monedasFiltradas = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    if (!q) return this.monedas();
    return this.monedas().filter(m =>
      m.nombre.toLowerCase().includes(q) ||
      m.codigo.toLowerCase().includes(q) ||
      m.simbolo.toLowerCase().includes(q)
    );
  });

  ngOnInit(): void { this.cargar(); }
  cargar(): void { this.service.listar().subscribe(); }

  abrirCrear(): void { this.monedaEdicion.set(null); this.panelVisible.set(true); }
  abrirEditar(m: Moneda): void { this.monedaEdicion.set(m); this.panelVisible.set(true); }
  cerrarPanel(): void { this.panelVisible.set(false); }
  onGuardado(): void { this.panelVisible.set(false); this.cargar(); }

  toggleActivo(moneda: Moneda): void {
    const accion = moneda.activo ? this.service.desactivar(moneda.id) : this.service.activar(moneda.id);
    accion.subscribe({
      next: () => {
        this.toast.add({ severity: moneda.activo ? 'warn' : 'success',
          summary: moneda.activo ? 'Desactivada' : 'Activada', detail: moneda.nombre, life: 2500 });
        this.cargar();
      }
    });
  }

  eliminar(moneda: Moneda): void {
    this.confirm.confirm({
      message: `¿Eliminar la moneda <strong>${moneda.nombre}</strong>?`,
      header: 'Confirmar eliminación', icon: 'pi pi-trash',
      acceptButtonStyleClass: 'p-button-danger', acceptLabel: 'Eliminar', rejectLabel: 'Cancelar',
      accept: () => {
        this.service.eliminar(moneda.id).subscribe({
          next: () => { this.toast.add({ severity: 'success', summary: 'Eliminada', detail: moneda.nombre, life: 2500 }); this.cargar(); },
          error: (e) => this.toast.add({ severity: 'error', summary: 'Error', detail: e?.error?.message ?? 'No se pudo eliminar', life: 3500 })
        });
      }
    });
  }
}
