import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';

import { UsuarioService } from '../../../core/services/usuario.service';
import { UsuarioPanelComponent } from '../panel/usuario-panel.component';
import { Usuario, UsuarioListItem } from '../../../shared/models/usuario.models';
import { ESTADO_USUARIO_LABELS } from '../../../shared/models/common.models';

@Component({
  selector: 'app-usuarios-lista',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    ToastModule, ButtonModule, InputTextModule,
    SelectModule, TagModule, ConfirmDialogModule, TooltipModule,
    UsuarioPanelComponent,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './usuarios-lista.component.html',
  styleUrls: ['./usuarios-lista.component.scss']
})
export class UsuariosListaComponent implements OnInit {
  private readonly usuarioService = inject(UsuarioService);
  private readonly toast          = inject(MessageService);
  private readonly confirmService = inject(ConfirmationService);

  readonly usuarios  = this.usuarioService.usuarios;
  readonly total     = this.usuarioService.total;
  readonly cargando  = this.usuarioService.cargando;

  busqueda       = signal('');
  estadoFiltro   = signal<number | null>(null);
  panelVisible   = signal(false);
  usuarioEdicion = signal<Usuario | null>(null);

  readonly usuariosFiltrados = computed(() => {
    const q   = this.busqueda().toLowerCase().trim();
    const est = this.estadoFiltro();
    return this.usuarios().filter(u => {
      const matchQ = !q
        || u.email.toLowerCase().includes(q)
        || u.nombreCompleto?.toLowerCase().includes(q)
        || u.empresaNombre?.toLowerCase().includes(q);
      const matchE = est == null || u.estado === est;
      return matchQ && matchE;
    });
  });

  readonly estadoOpciones = [
    { label: 'Todos',     value: null },
    { label: 'Activo',    value: 1 },
    { label: 'Inactivo',  value: 0 },
    { label: 'Bloqueado', value: 2 },
    { label: 'Pendiente', value: 3 },
  ];

  etiquetaEstado(e: number)  { return ESTADO_USUARIO_LABELS[e] ?? 'Desconocido'; }
  severidadEstado(e: number): any {
    return ({ 0:'secondary', 1:'success', 2:'danger', 3:'warn' } as any)[e] ?? 'secondary';
  }
  iniciales(nombre: string) {
    return nombre?.split(' ').slice(0,2).map(n => n[0]).join('').toUpperCase() ?? '?';
  }

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.usuarioService.listar().subscribe({
      error: () => this.toast.add({ severity:'error', summary:'Error', detail:'No se pudo cargar la lista', life:3000 })
    });
  }

  abrirCrear(): void {
    this.usuarioEdicion.set(null);
    this.panelVisible.set(true);
  }

  abrirEditar(id: number): void {
    this.usuarioService.obtener(id).subscribe({
      next: (res) => {
        const u = res?.data ?? res as any;
        this.usuarioEdicion.set(u);
        this.panelVisible.set(true);
      },
      error: () => this.toast.add({ severity:'error', summary:'Error', detail:'No se pudo cargar el usuario', life:3000 })
    });
  }

  cerrarPanel(): void { this.panelVisible.set(false); this.usuarioEdicion.set(null); }
  onGuardado():  void { this.cerrarPanel(); this.cargar(); }

  toggleEstado(u: UsuarioListItem): void {
    const accion = u.estado === 1 ? 'desactivar' : 'activar';
    const label  = u.estado === 1 ? 'desactivará' : 'activará';
    this.confirmService.confirm({
      message:    `¿Seguro que deseas ${label} a <strong>${u.nombreCompleto}</strong>?`,
      header:     'Confirmar acción',
      icon:       'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, confirmar',
      rejectLabel: 'Cancelar',
      accept: () => {
        const obs = u.estado === 1
          ? this.usuarioService.desactivar(u.id)
          : this.usuarioService.activar(u.id);
        obs.subscribe({
          next:  () => { this.toast.add({ severity:'success', summary:'Listo', detail:`Usuario ${accion}do`, life:2500 }); this.cargar(); },
          error: () =>  this.toast.add({ severity:'error',   summary:'Error', detail:`No se pudo ${accion} el usuario`, life:3000 })
        });
      }
    });
  }

  bloquear(u: UsuarioListItem): void {
    this.confirmService.confirm({
      message:     `¿Seguro que deseas bloquear a <strong>${u.nombreCompleto}</strong>?`,
      header:      'Bloquear usuario',
      icon:        'pi pi-lock',
      acceptLabel: 'Sí, bloquear',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.usuarioService.bloquear(u.id).subscribe({
          next:  () => { this.toast.add({ severity:'warn',  summary:'Bloqueado', detail:u.nombreCompleto, life:2500 }); this.cargar(); },
          error: () =>  this.toast.add({ severity:'error',  summary:'Error',     detail:'No se pudo bloquear', life:3000 })
        });
      }
    });
  }
}
