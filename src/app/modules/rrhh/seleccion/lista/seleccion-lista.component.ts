import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TabsModule } from 'primeng/tabs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { RrhhService } from '../../../../core/services/rrhh.service';
import { RequisicionPanelComponent } from '../panel/requisicion-panel.component';
import { CandidatoPanelComponent } from '../panel/candidato-panel.component';

@Component({
  selector: 'app-seleccion-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastModule, ButtonModule, TooltipModule,
            ConfirmDialogModule, TabsModule, RequisicionPanelComponent, CandidatoPanelComponent],
  providers: [MessageService, ConfirmationService],
  templateUrl: './seleccion-lista.component.html',
  styleUrls: ['./seleccion-lista.component.scss'],
})
export class SeleccionListaComponent implements OnInit {
  readonly service = inject(RrhhService);
  private readonly toast   = inject(MessageService);
  private readonly confirm = inject(ConfirmationService);

  readonly requisiciones = this.service.requisiciones;
  readonly candidatos    = this.service.candidatos;
  readonly procesos      = this.service.procesosSeleccion;
  readonly cargandoReq   = this.service.cargandoReq;
  readonly cargandoCand  = this.service.cargandoCand;

  readonly panelRequisicion = signal(false);
  readonly panelCandidato   = signal(false);
  readonly tabActivo        = signal(0);

  ngOnInit(): void {
    this.service.listarRequisiciones().subscribe();
    this.service.listarCandidatos().subscribe();
    this.service.listarProcesosSeleccion().subscribe();
  }

  eliminarRequisicion(id: number): void {
    this.service.eliminarRequisicion(id).subscribe({
      next: () => this.toast.add({ severity: 'success', summary: 'Eliminado', life: 2500 }),
      error: (e: any) => this.toast.add({ severity: 'error', summary: 'Error', detail: e?.error?.message, life: 3500 })
    });
  }

  eliminarCandidato(id: number, nombre: string): void {
    this.confirm.confirm({
      message: `¿Eliminar al candidato <strong>${nombre}</strong>?`,
      header: 'Confirmar eliminación', icon: 'pi pi-trash',
      acceptButtonStyleClass: 'p-button-danger', acceptLabel: 'Eliminar', rejectLabel: 'Cancelar',
      accept: () => {
        this.service.eliminarCandidato(id).subscribe({
          next: () => this.toast.add({ severity: 'success', summary: 'Eliminado', life: 2500 }),
          error: (e: any) => this.toast.add({ severity: 'error', summary: 'Error', detail: e?.error?.message, life: 3500 })
        });
      }
    });
  }
}
