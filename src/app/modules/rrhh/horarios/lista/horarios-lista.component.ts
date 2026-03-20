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
import { Horario, TIPO_HORARIO_LABELS } from '../../../../shared/models/rrhh.models';
import { HorarioPanelComponent } from '../panel/horario-panel.component';

@Component({
  selector: 'app-horarios-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastModule, ButtonModule, TooltipModule,
            ConfirmDialogModule, SelectModule, HorarioPanelComponent],
  providers: [MessageService, ConfirmationService],
  templateUrl: './horarios-lista.component.html',
  styleUrls: ['./horarios-lista.component.scss'],
})
export class HorariosListaComponent implements OnInit {
  private readonly service = inject(RrhhService);
  private readonly toast   = inject(MessageService);
  private readonly confirm = inject(ConfirmationService);

  readonly horarios  = this.service.horarios;
  readonly cargando  = this.service.cargandoHor;

  readonly busqueda     = signal('');
  readonly filtroTipo   = signal<number | null>(null);
  readonly panelVisible = signal(false);
  readonly horarioEdicion = signal<Horario | null>(null);

  readonly tipoOptions = Object.entries(TIPO_HORARIO_LABELS).map(([v, l]) => ({ label: l, value: +v }));

  readonly horariosFiltrados = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    const t = this.filtroTipo();
    return this.horarios().filter(h => {
      const matchTipo  = t ? h.tipo === t : true;
      const matchQuery = !q || h.nombre.toLowerCase().includes(q) || h.codigo.toLowerCase().includes(q);
      return matchTipo && matchQuery;
    });
  });

  readonly tipoLabel = (tipo: number) => TIPO_HORARIO_LABELS[tipo] ?? '—';

  ngOnInit(): void { this.cargar(); }
  cargar(): void { this.service.listarHorarios().subscribe(); }

  abrirCrear(): void  { this.horarioEdicion.set(null); this.panelVisible.set(true); }
  abrirEditar(h: Horario): void { this.horarioEdicion.set(h); this.panelVisible.set(true); }
  cerrarPanel(): void { this.panelVisible.set(false); }
  onGuardado(): void  { this.panelVisible.set(false); this.cargar(); }

  eliminar(h: Horario): void {
    this.confirm.confirm({
      message: `¿Eliminar el horario <strong>${h.nombre}</strong>?`,
      header: 'Confirmar eliminación', icon: 'pi pi-trash',
      acceptButtonStyleClass: 'p-button-danger', acceptLabel: 'Eliminar', rejectLabel: 'Cancelar',
      accept: () => {
        this.service.eliminarHorario(h.id).subscribe({
          next: () => this.toast.add({ severity: 'success', summary: 'Eliminado', detail: h.nombre, life: 2500 }),
          error: (e) => this.toast.add({ severity: 'error', summary: 'Error', detail: e?.error?.message ?? 'No se pudo eliminar', life: 3500 })
        });
      }
    });
  }
}
