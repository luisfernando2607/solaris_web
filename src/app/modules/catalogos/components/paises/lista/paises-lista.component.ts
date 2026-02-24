import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

import { PaisService } from '../../../../../core/services/pais.service';
import { Pais } from '../../../../../shared/models/catalogo.models';
import { PaisPanelComponent } from '../panel/pais-panel.component';

@Component({
  selector: 'app-paises-lista',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    ToastModule, ButtonModule, TooltipModule, ConfirmDialogModule,
    PaisPanelComponent,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './paises-lista.component.html',
  styleUrls: ['./paises-lista.component.scss'],
})
export class PaisesListaComponent implements OnInit {
  private readonly service     = inject(PaisService);
  private readonly toast       = inject(MessageService);
  private readonly confirm     = inject(ConfirmationService);

  readonly paises   = this.service.paises;
  readonly cargando = this.service.cargando;

  readonly busqueda    = signal('');
  readonly panelVisible = signal(false);
  readonly paisEdicion  = signal<Pais | null>(null);

  readonly paisesFiltrados = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    if (!q) return this.paises();
    return this.paises().filter(p =>
      p.nombre.toLowerCase().includes(q) ||
      p.codigo.toLowerCase().includes(q) ||
      p.codigoIso2.toLowerCase().includes(q) ||
      (p.nombreIngles?.toLowerCase().includes(q) ?? false)
    );
  });

  ngOnInit(): void { this.cargar(); }

  cargar(): void { this.service.listar().subscribe(); }

  abrirCrear(): void {
    this.paisEdicion.set(null);
    this.panelVisible.set(true);
  }

  abrirEditar(pais: Pais): void {
    this.paisEdicion.set(pais);
    this.panelVisible.set(true);
  }

  cerrarPanel(): void { this.panelVisible.set(false); }

  onGuardado(): void {
    this.panelVisible.set(false);
    this.cargar();
  }

  toggleActivo(pais: Pais): void {
    const accion = pais.activo ? this.service.desactivar(pais.id) : this.service.activar(pais.id);
    accion.subscribe({
      next: () => {
        this.toast.add({
          severity: pais.activo ? 'warn' : 'success',
          summary: pais.activo ? 'Desactivado' : 'Activado',
          detail: pais.nombre, life: 2500
        });
        this.cargar();
      }
    });
  }

  eliminar(pais: Pais): void {
    this.confirm.confirm({
      message: `¿Eliminar el país <strong>${pais.nombre}</strong>? Esta acción no se puede deshacer.`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-trash',
      acceptButtonStyleClass: 'p-button-danger',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.service.eliminar(pais.id).subscribe({
          next: () => {
            this.toast.add({ severity: 'success', summary: 'Eliminado', detail: pais.nombre, life: 2500 });
            this.cargar();
          },
          error: (e) => {
            this.toast.add({ severity: 'error', summary: 'Error',
              detail: e?.error?.message ?? 'No se pudo eliminar', life: 3500 });
          }
        });
      }
    });
  }
}
