import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { MessageService, ConfirmationService } from 'primeng/api';

import { BancoService } from '../../../../../core/services/banco.service';
import { PaisService } from '../../../../../core/services/pais.service';
import { Banco } from '../../../../../shared/models/catalogo.models';
import { BancoPanelComponent } from '../panel/banco-panel.component';

@Component({
  selector: 'app-bancos-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastModule, ButtonModule, TooltipModule, ConfirmDialogModule, SelectModule, BancoPanelComponent],
  providers: [MessageService, ConfirmationService],
  templateUrl: './bancos-lista.component.html',
  styleUrls: ['./bancos-lista.component.scss'],
})
export class BancosListaComponent implements OnInit {
  private readonly service     = inject(BancoService);
  private readonly paisService = inject(PaisService);
  private readonly toast       = inject(MessageService);
  private readonly confirm     = inject(ConfirmationService);

  readonly bancos   = this.service.bancos;
  readonly cargando = this.service.cargando;
  readonly paises   = this.paisService.paises;

  readonly busqueda    = signal('');
  readonly filtroPaisId = signal<number | null>(null);
  readonly panelVisible = signal(false);
  readonly bancoEdicion = signal<Banco | null>(null);

  readonly paisesOptions = computed(() =>
    this.paises().map(p => ({ label: `${p.bandera ?? ''} ${p.nombre}`, value: p.id }))
  );

  readonly bancosFiltrados = computed(() => {
    const q   = this.busqueda().toLowerCase().trim();
    const pid = this.filtroPaisId();
    return this.bancos().filter(b => {
      const matchPais  = pid ? b.paisId === pid : true;
      const matchQuery = !q || b.nombre.toLowerCase().includes(q) || b.codigo.toLowerCase().includes(q) || (b.nombreCorto?.toLowerCase().includes(q) ?? false);
      return matchPais && matchQuery;
    });
  });

  ngOnInit(): void {
    this.paisService.listar().subscribe();
    this.cargar();
  }

  cargar(): void { this.service.listar().subscribe(); }

  abrirCrear(): void { this.bancoEdicion.set(null); this.panelVisible.set(true); }
  abrirEditar(b: Banco): void { this.bancoEdicion.set(b); this.panelVisible.set(true); }
  cerrarPanel(): void { this.panelVisible.set(false); }
  onGuardado(): void { this.panelVisible.set(false); this.cargar(); }

  toggleActivo(banco: Banco): void {
    const accion = banco.activo ? this.service.desactivar(banco.id) : this.service.activar(banco.id);
    accion.subscribe({ next: () => { this.toast.add({ severity: banco.activo ? 'warn' : 'success', summary: banco.activo ? 'Desactivado' : 'Activado', detail: banco.nombre, life: 2500 }); this.cargar(); } });
  }

  eliminar(banco: Banco): void {
    this.confirm.confirm({
      message: `¿Eliminar el banco <strong>${banco.nombre}</strong>?`, header: 'Confirmar eliminación',
      icon: 'pi pi-trash', acceptButtonStyleClass: 'p-button-danger', acceptLabel: 'Eliminar', rejectLabel: 'Cancelar',
      accept: () => {
        this.service.eliminar(banco.id).subscribe({
          next: () => { this.toast.add({ severity: 'success', summary: 'Eliminado', detail: banco.nombre, life: 2500 }); this.cargar(); },
          error: (e) => this.toast.add({ severity: 'error', summary: 'Error', detail: e?.error?.message ?? 'No se pudo eliminar', life: 3500 })
        });
      }
    });
  }
}
