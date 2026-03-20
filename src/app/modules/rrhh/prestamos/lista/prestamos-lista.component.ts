import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { MessageService, ConfirmationService } from 'primeng/api';
import { RrhhService } from '../../../../core/services/rrhh.service';
import { Prestamo, ESTADO_PRESTAMO_LABELS, ESTADO_PRESTAMO_OPTIONS } from '../../../../shared/models/rrhh.models';
import { PrestamoPanelComponent } from '../panel/prestamo-panel.component';

@Component({
  selector: 'app-prestamos-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastModule, ButtonModule, TooltipModule,
            ConfirmDialogModule, SelectModule, PrestamoPanelComponent],
  providers: [MessageService, ConfirmationService],
  templateUrl: './prestamos-lista.component.html',
  styleUrls: ['./prestamos-lista.component.scss'],
})
export class PrestamosListaComponent implements OnInit {
  private readonly service = inject(RrhhService);
  private readonly toast   = inject(MessageService);
  private readonly confirm = inject(ConfirmationService);

  readonly prestamos = this.service.prestamos;
  readonly cargando  = this.service.cargandoPrest;

  readonly busqueda      = signal('');
  readonly filtroEstado  = signal<number | null>(null);
  readonly panelVisible  = signal(false);
  readonly prestamoEdicion = signal<Prestamo | null>(null);

  readonly estadoOptions = ESTADO_PRESTAMO_OPTIONS;
  readonly estadoLabel   = (e: number) => ESTADO_PRESTAMO_LABELS[e] ?? '—';

  readonly prestamosFiltrados = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    const e = this.filtroEstado();
    return this.prestamos().filter(p => {
      const matchEstado = e ? p.estado === e : true;
      const matchQuery  = !q || (p.empleadoNombre?.toLowerCase().includes(q) ?? false) || p.numero.toLowerCase().includes(q);
      return matchEstado && matchQuery;
    });
  });

  ngOnInit(): void { this.cargar(); }
  cargar(): void { this.service.listarPrestamos().subscribe(); }

  abrirCrear(): void { this.prestamoEdicion.set(null); this.panelVisible.set(true); }
  cerrarPanel(): void { this.panelVisible.set(false); }
  onGuardado(): void  { this.panelVisible.set(false); this.cargar(); }

  aprobar(p: Prestamo): void {
    this.service.aprobarPrestamo(p.id).subscribe({
      next: () => { this.toast.add({ severity: 'success', summary: 'Aprobado', detail: p.numero, life: 2500 }); this.cargar(); },
      error: (e) => this.toast.add({ severity: 'error', summary: 'Error', detail: e?.error?.message ?? 'No se pudo aprobar', life: 3500 })
    });
  }

  rechazar(p: Prestamo): void {
    this.confirm.confirm({
      message: `¿Rechazar el préstamo <strong>${p.numero}</strong>?`,
      header: 'Confirmar rechazo', icon: 'pi pi-times-circle',
      acceptButtonStyleClass: 'p-button-danger', acceptLabel: 'Rechazar', rejectLabel: 'Cancelar',
      accept: () => {
        this.service.rechazarPrestamo(p.id).subscribe({
          next: () => { this.toast.add({ severity: 'warn', summary: 'Rechazado', detail: p.numero, life: 2500 }); this.cargar(); },
          error: (e) => this.toast.add({ severity: 'error', summary: 'Error', detail: e?.error?.message ?? 'Error', life: 3500 })
        });
      }
    });
  }
}
