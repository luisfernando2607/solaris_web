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
import { PlantillaPanelComponent } from '../panel/plantilla-panel.component';

@Component({
  selector: 'app-evaluaciones-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastModule, ButtonModule, TooltipModule,
            ConfirmDialogModule, TabsModule, PlantillaPanelComponent],
  providers: [MessageService, ConfirmationService],
  templateUrl: './evaluaciones-lista.component.html',
  styleUrls: ['./evaluaciones-lista.component.scss'],
})
export class EvaluacionesListaComponent implements OnInit {
  readonly service = inject(RrhhService);
  private readonly toast   = inject(MessageService);
  private readonly confirm = inject(ConfirmationService);

  readonly plantillas    = this.service.plantillas;
  readonly procesos      = this.service.procesos;
  readonly cargandoPlant = this.service.cargandoPlant;
  readonly cargandoProc  = this.service.cargandoProc;

  readonly panelPlantilla = signal(false);
  readonly tabActivo      = signal(0);

  ngOnInit(): void {
    this.service.listarPlantillas().subscribe();
    this.service.listarProcesos().subscribe();
  }

  eliminarPlantilla(id: number, nombre: string): void {
    this.confirm.confirm({
      message: `¿Eliminar la plantilla <strong>${nombre}</strong>?`,
      header: 'Confirmar eliminación', icon: 'pi pi-trash',
      acceptButtonStyleClass: 'p-button-danger', acceptLabel: 'Eliminar', rejectLabel: 'Cancelar',
      accept: () => {
        this.service.eliminarPlantilla(id).subscribe({
          next: () => this.toast.add({ severity: 'success', summary: 'Eliminado', detail: nombre, life: 2500 }),
          error: (e: any) => this.toast.add({ severity: 'error', summary: 'Error', detail: e?.error?.message ?? 'Error', life: 3500 })
        });
      }
    });
  }
}
