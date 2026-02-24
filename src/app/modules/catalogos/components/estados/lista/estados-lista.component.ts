import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { MessageService, ConfirmationService } from 'primeng/api';

import { EstadoProvinciaService } from '../../../../../core/services/estado-provincia.service';
import { PaisService } from '../../../../../core/services/pais.service';
import { EstadoProvincia } from '../../../../../shared/models/catalogo.models';
import { EstadoPanelComponent } from '../panel/estado-panel.component';

@Component({
  selector: 'app-estados-lista',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    ToastModule, ButtonModule, TooltipModule, ConfirmDialogModule, SelectModule,
    EstadoPanelComponent,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './estados-lista.component.html',
  styleUrls: ['./estados-lista.component.scss'],
})
export class EstadosListaComponent implements OnInit {
  private readonly service      = inject(EstadoProvinciaService);
  private readonly paisService  = inject(PaisService);
  private readonly toast        = inject(MessageService);
  private readonly confirm      = inject(ConfirmationService);

  readonly estados  = this.service.estados;
  readonly cargando = this.service.cargando;
  readonly paises   = this.paisService.paises;

  readonly busqueda     = signal('');
  readonly filtroPaisId = signal<number | null>(null);
  readonly panelVisible  = signal(false);
  readonly estadoEdicion = signal<EstadoProvincia | null>(null);

  readonly paisesOptions = computed(() =>
    this.paises().map(p => ({ label: `${p.bandera ?? ''} ${p.nombre}`, value: p.id }))
  );

  readonly estadosFiltrados = computed(() => {
    const q   = this.busqueda().toLowerCase().trim();
    const pid = this.filtroPaisId();
    return this.estados().filter(e => {
      const matchPais  = pid ? e.paisId === pid : true;
      const matchQuery = !q || e.nombre.toLowerCase().includes(q) || e.codigo.toLowerCase().includes(q);
      return matchPais && matchQuery;
    });
  });

  ngOnInit(): void {
    this.paisService.listar().subscribe();
    this.cargar();
  }

  cargar(): void { this.service.listar(this.filtroPaisId() ?? undefined).subscribe(); }

  abrirCrear(): void { this.estadoEdicion.set(null); this.panelVisible.set(true); }
  abrirEditar(e: EstadoProvincia): void { this.estadoEdicion.set(e); this.panelVisible.set(true); }
  cerrarPanel(): void { this.panelVisible.set(false); }
  onGuardado(): void { this.panelVisible.set(false); this.cargar(); }

  toggleActivo(estado: EstadoProvincia): void {
    const accion = estado.activo ? this.service.desactivar(estado.id) : this.service.activar(estado.id);
    accion.subscribe({
      next: () => {
        this.toast.add({
          severity: estado.activo ? 'warn' : 'success',
          summary: estado.activo ? 'Desactivado' : 'Activado',
          detail: estado.nombre, life: 2500
        });
        this.cargar();
      }
    });
  }

  eliminar(estado: EstadoProvincia): void {
    this.confirm.confirm({
      message: `¿Eliminar <strong>${estado.nombre}</strong>?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-trash',
      acceptButtonStyleClass: 'p-button-danger',
      acceptLabel: 'Eliminar', rejectLabel: 'Cancelar',
      accept: () => {
        this.service.eliminar(estado.id).subscribe({
          next: () => {
            this.toast.add({ severity: 'success', summary: 'Eliminado', detail: estado.nombre, life: 2500 });
            this.cargar();
          },
          error: (e) => this.toast.add({ severity: 'error', summary: 'Error',
            detail: e?.error?.message ?? 'No se pudo eliminar', life: 3500 })
        });
      }
    });
  }
}
