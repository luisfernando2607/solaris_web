import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

import { ImpuestoService } from '../../../../../core/services/impuesto.service';
import { Impuesto, TIPO_IMPUESTO_COLOR } from '../../../../../shared/models/catalogo.models';
import { ImpuestoPanelComponent } from '../panel/impuesto-panel.component';

@Component({
  selector: 'app-impuestos-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastModule, ButtonModule, TooltipModule, ConfirmDialogModule, ImpuestoPanelComponent],
  providers: [MessageService, ConfirmationService],
  templateUrl: './impuestos-lista.component.html',
  styleUrls: ['./impuestos-lista.component.scss'],
})
export class ImpuestosListaComponent implements OnInit {
  private readonly service = inject(ImpuestoService);
  private readonly toast   = inject(MessageService);
  private readonly confirm = inject(ConfirmationService);

  readonly impuestos = this.service.impuestos;
  readonly cargando  = this.service.cargando;
  readonly tipoColor = TIPO_IMPUESTO_COLOR;

  readonly busqueda       = signal('');
  readonly panelVisible   = signal(false);
  readonly impuestoEdicion = signal<Impuesto | null>(null);

  readonly impuestosFiltrados = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    if (!q) return this.impuestos();
    return this.impuestos().filter(i =>
      i.nombre.toLowerCase().includes(q) ||
      i.codigo.toLowerCase().includes(q) ||
      i.tipoImpuesto.toLowerCase().includes(q)
    );
  });

  ngOnInit(): void { this.cargar(); }
  cargar(): void { this.service.listar().subscribe(); }

  abrirCrear(): void { this.impuestoEdicion.set(null); this.panelVisible.set(true); }
  abrirEditar(i: Impuesto): void { this.impuestoEdicion.set(i); this.panelVisible.set(true); }
  cerrarPanel(): void { this.panelVisible.set(false); }
  onGuardado(): void { this.panelVisible.set(false); this.cargar(); }

  toggleActivo(imp: Impuesto): void {
    const accion = imp.activo ? this.service.desactivar(imp.id) : this.service.activar(imp.id);
    accion.subscribe({ next: () => { this.toast.add({ severity: imp.activo ? 'warn' : 'success', summary: imp.activo ? 'Desactivado' : 'Activado', detail: imp.nombre, life: 2500 }); this.cargar(); } });
  }

  eliminar(imp: Impuesto): void {
    this.confirm.confirm({
      message: `¿Eliminar el impuesto <strong>${imp.nombre}</strong>?`, header: 'Confirmar eliminación',
      icon: 'pi pi-trash', acceptButtonStyleClass: 'p-button-danger', acceptLabel: 'Eliminar', rejectLabel: 'Cancelar',
      accept: () => {
        this.service.eliminar(imp.id).subscribe({
          next: () => { this.toast.add({ severity: 'success', summary: 'Eliminado', detail: imp.nombre, life: 2500 }); this.cargar(); },
          error: (e) => this.toast.add({ severity: 'error', summary: 'Error', detail: e?.error?.message ?? 'No se pudo eliminar', life: 3500 })
        });
      }
    });
  }
}
