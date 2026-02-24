import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

import { FormaPagoService } from '../../../../../core/services/forma-pago.service';
import { FormaPago, TIPO_FORMA_PAGO_COLOR } from '../../../../../shared/models/catalogo.models';
import { FormaPagoPanelComponent } from '../panel/forma-pago-panel.component';

@Component({
  selector: 'app-formas-pago-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastModule, ButtonModule, TooltipModule, ConfirmDialogModule, FormaPagoPanelComponent],
  providers: [MessageService, ConfirmationService],
  templateUrl: './formas-pago-lista.component.html',
  styleUrls: ['./formas-pago-lista.component.scss'],
})
export class FormasPagoListaComponent implements OnInit {
  private readonly service = inject(FormaPagoService);
  private readonly toast   = inject(MessageService);
  private readonly confirm = inject(ConfirmationService);

  readonly formasPago = this.service.formasPago;
  readonly cargando   = this.service.cargando;
  readonly tipoColor  = TIPO_FORMA_PAGO_COLOR;

  readonly busqueda         = signal('');
  readonly panelVisible     = signal(false);
  readonly formaPagoEdicion = signal<FormaPago | null>(null);

  readonly formasPagoFiltradas = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    if (!q) return this.formasPago();
    return this.formasPago().filter(f =>
      f.nombre.toLowerCase().includes(q) || f.codigo.toLowerCase().includes(q) || f.tipo.toLowerCase().includes(q)
    );
  });

  ngOnInit(): void { this.cargar(); }
  cargar(): void { this.service.listar().subscribe(); }

  abrirCrear(): void { this.formaPagoEdicion.set(null); this.panelVisible.set(true); }
  abrirEditar(f: FormaPago): void { this.formaPagoEdicion.set(f); this.panelVisible.set(true); }
  cerrarPanel(): void { this.panelVisible.set(false); }
  onGuardado(): void { this.panelVisible.set(false); this.cargar(); }

  toggleActivo(fp: FormaPago): void {
    const accion = fp.activo ? this.service.desactivar(fp.id) : this.service.activar(fp.id);
    accion.subscribe({ next: () => { this.toast.add({ severity: fp.activo ? 'warn' : 'success', summary: fp.activo ? 'Desactivada' : 'Activada', detail: fp.nombre, life: 2500 }); this.cargar(); } });
  }

  eliminar(fp: FormaPago): void {
    this.confirm.confirm({
      message: `¿Eliminar <strong>${fp.nombre}</strong>?`, header: 'Confirmar eliminación',
      icon: 'pi pi-trash', acceptButtonStyleClass: 'p-button-danger', acceptLabel: 'Eliminar', rejectLabel: 'Cancelar',
      accept: () => {
        this.service.eliminar(fp.id).subscribe({
          next: () => { this.toast.add({ severity: 'success', summary: 'Eliminada', detail: fp.nombre, life: 2500 }); this.cargar(); },
          error: (e) => this.toast.add({ severity: 'error', summary: 'Error', detail: e?.error?.message ?? 'No se pudo eliminar', life: 3500 })
        });
      }
    });
  }
}
