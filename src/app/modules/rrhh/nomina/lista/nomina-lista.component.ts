import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { RrhhService } from '../../../../core/services/rrhh.service';
import { ConceptoNomina, PeriodoNomina, TIPO_CONCEPTO_LABELS, TIPO_CONCEPTO_OPTIONS } from '../../../../shared/models/rrhh.models';
import { ConceptoPanelComponent } from '../panel/concepto-panel.component';
import { PeriodoPanelComponent } from '../panel/periodo-panel.component';

@Component({
  selector: 'app-nomina-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastModule, ButtonModule, TooltipModule,
            ConfirmDialogModule, SelectModule, TabsModule, ConceptoPanelComponent, PeriodoPanelComponent],
  providers: [MessageService, ConfirmationService],
  templateUrl: './nomina-lista.component.html',
  styleUrls: ['./nomina-lista.component.scss'],
})
export class NominaListaComponent implements OnInit {
  readonly service = inject(RrhhService);
  private readonly toast   = inject(MessageService);
  private readonly confirm = inject(ConfirmationService);

  readonly conceptos  = this.service.conceptos;
  readonly periodos   = this.service.periodos;
  readonly cargandoC  = this.service.cargandoConc;
  readonly cargandoP  = this.service.cargandoPer;

  readonly busqueda         = signal('');
  readonly filtroTipo       = signal<number | null>(null);
  readonly panelConcepto    = signal(false);
  readonly panelPeriodo     = signal(false);
  readonly conceptoEdicion  = signal<ConceptoNomina | null>(null);
  readonly tabActivo        = signal(0);

  readonly tipoOptions = TIPO_CONCEPTO_OPTIONS;
  readonly tipoLabel   = (t: number) => TIPO_CONCEPTO_LABELS[t] ?? '—';

  readonly conceptosFiltrados = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    const t = this.filtroTipo();
    return this.conceptos().filter(c => {
      const matchTipo  = t ? c.tipo === t : true;
      const matchQuery = !q || c.nombre.toLowerCase().includes(q) || c.codigo.toLowerCase().includes(q);
      return matchTipo && matchQuery;
    });
  });

  ngOnInit(): void { this.service.listarConceptos().subscribe(); this.service.listarPeriodos().subscribe(); }

  abrirConcepto(c?: ConceptoNomina): void { this.conceptoEdicion.set(c ?? null); this.panelConcepto.set(true); }
  abrirPeriodo(): void { this.panelPeriodo.set(true); }

  eliminarConcepto(c: ConceptoNomina): void {
    this.confirm.confirm({
      message: `¿Eliminar el concepto <strong>${c.nombre}</strong>?`,
      header: 'Confirmar eliminación', icon: 'pi pi-trash',
      acceptButtonStyleClass: 'p-button-danger', acceptLabel: 'Eliminar', rejectLabel: 'Cancelar',
      accept: () => {
        this.service.eliminarConcepto(c.id).subscribe({
          next: () => this.toast.add({ severity: 'success', summary: 'Eliminado', detail: c.nombre, life: 2500 }),
          error: (e) => this.toast.add({ severity: 'error', summary: 'Error', detail: e?.error?.message ?? 'Error', life: 3500 })
        });
      }
    });
  }
}
