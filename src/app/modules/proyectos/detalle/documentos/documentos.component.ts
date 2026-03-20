import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProyectoService } from '../../../../core/services/proyecto.service';
import {
  ProyectoDocumentoDto, TipoDocumento, enumNums
} from  '../../../../shared/models/proyecto.models';

const TIPO_DOC_LABELS: Record<TipoDocumento, string> = {
  [TipoDocumento.Contrato]:       'Contrato',
  [TipoDocumento.Plano]:          'Plano',
  [TipoDocumento.Especificacion]: 'Especificación',
  [TipoDocumento.Acta]:           'Acta',
  [TipoDocumento.Otro]:           'Otro',
};

const TIPO_DOC_ICONS: Record<TipoDocumento, string> = {
  [TipoDocumento.Contrato]:       'pi-file-edit',
  [TipoDocumento.Plano]:          'pi-map',
  [TipoDocumento.Especificacion]: 'pi-file-check',
  [TipoDocumento.Acta]:           'pi-book',
  [TipoDocumento.Otro]:           'pi-file',
};

@Component({
  selector: 'app-documentos',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, ToastModule,
    TooltipModule, SelectModule, ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
<p-toast position="top-right" />
<p-confirmDialog />

<div class="tab-section">

  <!-- Header -->
  <div class="tab-section-header">
    <div>
      <h2 class="section-title">Documentos del Proyecto</h2>
      <p class="section-sub">{{ documentos().length }} archivos adjuntos</p>
    </div>
    <div class="header-actions">
      <!-- Filtro por tipo -->
      <p-select
        [options]="tipoOpts"
        [(ngModel)]="filtroTipo"
        placeholder="Todos los tipos"
        [showClear]="true"
        styleClass="filter-select-sm"
        (onChange)="aplicarFiltro()" />
      <p-button label="Subir documento" icon="pi pi-upload" size="small" (onClick)="abrirPanel()" />
    </div>
  </div>

  <!-- Loading -->
  @if (cargando()) {
    <div class="loading-row"><i class="pi pi-spin pi-spinner"></i> Cargando documentos...</div>
  }

  <!-- Empty -->
  @else if (documentosFiltrados().length === 0) {
    <div class="empty-state">
      <i class="pi pi-folder-open"></i>
      <p>{{ filtroTipo ? 'Sin documentos de este tipo.' : 'No hay documentos adjuntos al proyecto.' }}</p>
      @if (!filtroTipo) {
        <p-button label="Subir primer documento" icon="pi pi-upload" severity="secondary" [outlined]="true" size="small" (onClick)="abrirPanel()" />
      }
    </div>
  }

  <!-- Grid de documentos -->
  @else {
    <div class="docs-grid">
      @for (doc of documentosFiltrados(); track doc.id) {
        <div class="doc-card">

          <!-- Icono / tipo -->
          <div class="doc-icon-wrap" [attr.data-tipo]="getTipoClass(doc.tipoDocumento)">
            <i class="pi {{ getTipoIcon(doc.tipoDocumento) }}"></i>
          </div>

          <!-- Info -->
          <div class="doc-info">
            <div class="doc-nombre" [title]="doc.nombre">{{ doc.nombre }}</div>
            <div class="doc-meta-row">
              <span class="badge tipo-badge tipo-{{ getTipoClass(doc.tipoDocumento) }}">
                {{ TIPO_DOC_LABELS[doc.tipoDocumento] }}
              </span>
              <span class="doc-ext">.{{ doc.extension }}</span>
            </div>
            @if (doc.descripcion) {
              <p class="doc-desc">{{ doc.descripcion }}</p>
            }
            <div class="doc-footer">
              <span class="doc-size">{{ formatSize(doc.tamanoBytes) }}</span>
              <span class="doc-fecha">{{ doc.fechaSubida | date:'dd/MM/yy' }}</span>
              @if (doc.subidoPorNombre) {
                <span class="doc-usuario"><i class="pi pi-user"></i> {{ doc.subidoPorNombre }}</span>
              }
            </div>
          </div>

          <!-- Acciones -->
          <div class="doc-actions">
            <a [href]="doc.urlStorage" target="_blank" class="icon-btn primary"
               pTooltip="Abrir / Descargar" tooltipPosition="top">
              <i class="pi pi-external-link"></i>
            </a>
            <button class="icon-btn danger" (click)="confirmarEliminar(doc)"
                    pTooltip="Eliminar" tooltipPosition="top">
              <i class="pi pi-trash"></i>
            </button>
          </div>

        </div>
      }
    </div>
  }

</div>

<!-- Panel lateral — Subir documento -->
@if (panelVisible()) {
  <div class="side-panel-overlay" (click)="cerrar()"></div>
  <div class="side-panel">
    <div class="panel-header">
      <h3>Subir Documento</h3>
      <button class="panel-close" (click)="cerrar()"><i class="pi pi-times"></i></button>
    </div>
    <div class="panel-body">

      <div class="form-group">
        <label>Nombre *</label>
        <input type="text" class="form-input" [(ngModel)]="form.nombre"
               placeholder="Nombre descriptivo del documento" />
      </div>

      <div class="form-group">
        <label>Tipo de Documento *</label>
        <p-select [options]="tipoOpts" [(ngModel)]="form.tipoDocumento"
                  styleClass="form-select" placeholder="Seleccionar tipo" />
      </div>

      <div class="form-group">
        <label>URL / Enlace del archivo *</label>
        <input type="text" class="form-input" [(ngModel)]="form.urlStorage"
               placeholder="https://storage.ejemplo.com/archivo.pdf" />
        <span class="form-hint">Ingresa la URL donde está almacenado el archivo.</span>
      </div>

      <div class="form-group">
        <label>Nombre del archivo original</label>
        <input type="text" class="form-input" [(ngModel)]="form.nombreArchivoOriginal"
               placeholder="documento.pdf" />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Extensión</label>
          <input type="text" class="form-input" [(ngModel)]="form.extension"
                 placeholder="pdf" maxlength="10" />
        </div>
        <div class="form-group">
          <label>Tamaño (bytes)</label>
          <input type="number" class="form-input" [(ngModel)]="form.tamanoBytes" min="0" />
        </div>
      </div>

      <div class="form-group">
        <label>Descripción</label>
        <textarea class="form-input" [(ngModel)]="form.descripcion" rows="3"
                  placeholder="Descripción opcional del contenido"></textarea>
      </div>

      @if (error()) {
        <div class="form-error"><i class="pi pi-exclamation-circle"></i> {{ error() }}</div>
      }

    </div>
    <div class="panel-footer">
      <button class="btn btn-ghost" (click)="cerrar()">Cancelar</button>
      <button class="btn btn-primary" (click)="guardar()" [disabled]="guardando()">
        @if (guardando()) { <i class="pi pi-spin pi-spinner"></i> }
        Guardar
      </button>
    </div>
  </div>
}
  `,
  styles: [`
.tab-section { display:flex; flex-direction:column; gap:1.25rem; }
.tab-section-header { display:flex; align-items:flex-start; justify-content:space-between; gap:1rem; flex-wrap:wrap; }
.header-actions { display:flex; align-items:center; gap:.6rem; }
.section-title { margin:0; font-size:1rem; font-weight:700; color:var(--text); }
.section-sub { margin:.25rem 0 0; font-size:.8rem; color:var(--text-muted); }
.loading-row { padding:2rem; text-align:center; color:var(--text-muted); display:flex; align-items:center; justify-content:center; gap:.5rem; }
.empty-state { text-align:center; padding:3rem; color:var(--text-muted); display:flex; flex-direction:column; align-items:center; gap:1rem; }
.empty-state i { font-size:2.5rem; opacity:.4; }

/* Grid */
.docs-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:1rem; }
.doc-card { background:var(--surface); border:1px solid var(--border); border-radius:10px; padding:1rem; display:flex; gap:.85rem; align-items:flex-start; transition:border-color .2s; }
.doc-card:hover { border-color:var(--border2); }

/* Icono */
.doc-icon-wrap { width:44px; height:44px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1.2rem; flex-shrink:0; }
.doc-icon-wrap[data-tipo="contrato"]  { background:rgba(59,130,246,.12); color:#60a5fa; }
.doc-icon-wrap[data-tipo="plano"]     { background:rgba(20,184,166,.12); color:#2dd4bf; }
.doc-icon-wrap[data-tipo="espec"]     { background:rgba(168,85,247,.12); color:#c084fc; }
.doc-icon-wrap[data-tipo="acta"]      { background:rgba(249,115,22,.12); color:#fb923c; }
.doc-icon-wrap[data-tipo="otro"]      { background:rgba(148,163,184,.12); color:#94a3b8; }

/* Info */
.doc-info { flex:1; display:flex; flex-direction:column; gap:.35rem; min-width:0; }
.doc-nombre { font-weight:600; font-size:.9rem; color:var(--text); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.doc-meta-row { display:flex; align-items:center; gap:.5rem; }
.badge { padding:2px 8px; border-radius:12px; font-size:.7rem; font-weight:600; }
.tipo-badge.tipo-contrato  { background:rgba(59,130,246,.1); color:#60a5fa; }
.tipo-badge.tipo-plano     { background:rgba(20,184,166,.1); color:#2dd4bf; }
.tipo-badge.tipo-espec     { background:rgba(168,85,247,.1); color:#c084fc; }
.tipo-badge.tipo-acta      { background:rgba(249,115,22,.1); color:#fb923c; }
.tipo-badge.tipo-otro      { background:rgba(148,163,184,.1); color:#94a3b8; }
.doc-ext { font-family:'Courier New',monospace; font-size:.72rem; color:var(--text-muted); background:var(--surface2); border:1px solid var(--border); border-radius:4px; padding:1px 6px; }
.doc-desc { margin:0; font-size:.78rem; color:var(--text-muted); overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; }
.doc-footer { display:flex; gap:.75rem; flex-wrap:wrap; }
.doc-footer span { display:flex; align-items:center; gap:.25rem; font-size:.74rem; color:var(--text-muted); }
.doc-footer i { font-size:.7rem; }

/* Acciones */
.doc-actions { display:flex; flex-direction:column; gap:.3rem; flex-shrink:0; }
.icon-btn { width:28px; height:28px; border:1px solid var(--border); border-radius:6px; background:transparent; color:var(--text-muted); cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:.75rem; transition:all .2s; text-decoration:none; }
.icon-btn.primary:hover { background:var(--primary-bg); color:var(--primary); border-color:var(--primary); }
.icon-btn.danger:hover { background:rgba(239,68,68,.1); color:#f87171; border-color:#f87171; }

/* Panel lateral */
.side-panel-overlay { position:fixed; inset:0; background:rgba(0,0,0,.4); z-index:40; }
.side-panel { position:fixed; right:0; top:0; bottom:0; width:440px; background:var(--surface); border-left:1px solid var(--border); z-index:50; display:flex; flex-direction:column; box-shadow:-8px 0 24px rgba(0,0,0,.3); }
.panel-header { display:flex; align-items:center; justify-content:space-between; padding:1.25rem 1.5rem; border-bottom:1px solid var(--border); }
.panel-header h3 { margin:0; font-size:1rem; font-weight:700; color:var(--text); }
.panel-close { background:transparent; border:none; color:var(--text-muted); cursor:pointer; font-size:1rem; padding:.25rem; }
.panel-body { flex:1; overflow-y:auto; padding:1.5rem; display:flex; flex-direction:column; gap:1rem; }
.panel-footer { padding:1rem 1.5rem; border-top:1px solid var(--border); display:flex; justify-content:flex-end; gap:.75rem; }
.form-group { display:flex; flex-direction:column; gap:.4rem; }
.form-group label { font-size:.82rem; font-weight:500; color:var(--text-soft); }
.form-input { background:var(--surface2); border:1px solid var(--border); border-radius:8px; padding:.55rem .8rem; color:var(--text); font-size:.9rem; width:100%; outline:none; }
.form-input:focus { border-color:var(--primary); }
.form-hint { font-size:.75rem; color:var(--text-muted); }
.form-row { display:grid; grid-template-columns:1fr 1fr; gap:.75rem; }
.form-select { width:100%; }
.form-error { display:flex; align-items:center; gap:.5rem; color:#f87171; font-size:.83rem; background:rgba(239,68,68,.08); border:1px solid rgba(239,68,68,.2); border-radius:8px; padding:.6rem .9rem; }
.btn { padding:.5rem 1.25rem; border-radius:8px; font-size:.88rem; font-weight:500; cursor:pointer; display:flex; align-items:center; gap:.4rem; border:none; }
.btn-primary { background:var(--primary); color:#fff; }
.btn-primary:disabled { opacity:.6; cursor:not-allowed; }
.btn-ghost { background:transparent; border:1px solid var(--border); color:var(--text-soft); }
.filter-select-sm { min-width:160px; }
  `]
})
export class DocumentosComponent implements OnInit {
  private readonly route   = inject(ActivatedRoute);
  private readonly service = inject(ProyectoService);
  private readonly toast   = inject(MessageService);
  private readonly confirm = inject(ConfirmationService);

  readonly documentos     = signal<ProyectoDocumentoDto[]>([]);
  readonly cargando       = signal(true);
  readonly panelVisible   = signal(false);
  readonly guardando      = signal(false);
  readonly error          = signal('');
  proyectoId = 0;
  filtroTipo: TipoDocumento | null = null;

  readonly TIPO_DOC_LABELS = TIPO_DOC_LABELS;

  readonly tipoOpts = enumNums(TipoDocumento).map(v => ({
    label: TIPO_DOC_LABELS[v as TipoDocumento],
    value: v as TipoDocumento
  }));

  form: {
    nombre: string; tipoDocumento: TipoDocumento | null;
    urlStorage: string; nombreArchivoOriginal: string;
    extension: string; tamanoBytes: number; descripcion: string;
  } = this.emptyForm();

  ngOnInit(): void {
    this.proyectoId = Number(this.route.parent!.snapshot.paramMap.get('id'));
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.service.getDocumentos(this.proyectoId).subscribe({
      next: d => { this.documentos.set(d); this.cargando.set(false); },
      error: () => this.cargando.set(false)
    });
  }

  documentosFiltrados(): ProyectoDocumentoDto[] {
    if (!this.filtroTipo) return this.documentos();
    return this.documentos().filter(d => d.tipoDocumento === this.filtroTipo);
  }

  aplicarFiltro(): void { /* filtro reactivo en documentosFiltrados */ }

  abrirPanel(): void {
    this.form = this.emptyForm();
    this.error.set('');
    this.panelVisible.set(true);
  }

  guardar(): void {
    if (!this.form.nombre.trim()) {
      this.error.set('El nombre es obligatorio'); return;
    }
    if (!this.form.tipoDocumento) {
      this.error.set('Selecciona un tipo de documento'); return;
    }
    if (!this.form.urlStorage.trim()) {
      this.error.set('La URL del archivo es obligatoria'); return;
    }

    this.error.set('');
    this.guardando.set(true);

    const body = {
      proyectoId:            this.proyectoId,
      nombre:                this.form.nombre,
      tipoDocumento:         this.form.tipoDocumento,
      descripcion:           this.form.descripcion || undefined,
      urlStorage:            this.form.urlStorage,
      nombreArchivoOriginal: this.form.nombreArchivoOriginal || this.form.nombre,
      extension:             this.form.extension || 'pdf',
      tamanoBytes:           this.form.tamanoBytes || 0,
    };

    this.service.crearDocumento(this.proyectoId, body).subscribe({
      next: () => {
        this.toast.add({ severity: 'success', summary: '¡Listo!', detail: 'Documento agregado', life: 2500 });
        this.cerrar();
        this.cargar();
        this.guardando.set(false);
      },
      error: (e) => {
        this.error.set(e?.error?.message ?? 'No se pudo guardar el documento');
        this.guardando.set(false);
      }
    });
  }

  confirmarEliminar(doc: ProyectoDocumentoDto): void {
    this.confirm.confirm({
      message: `¿Eliminar el documento <strong>${doc.nombre}</strong>?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-trash',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.service.eliminarDocumento(this.proyectoId, doc.id).subscribe({
          next: () => {
            this.toast.add({ severity: 'success', summary: 'OK', detail: 'Documento eliminado', life: 2500 });
            this.documentos.update(arr => arr.filter(d => d.id !== doc.id));
          },
          error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar', life: 3000 })
        });
      }
    });
  }

  cerrar(): void { this.panelVisible.set(false); }

  getTipoClass(tipo: TipoDocumento): string {
    const m: Record<TipoDocumento, string> = {
      [TipoDocumento.Contrato]: 'contrato', [TipoDocumento.Plano]: 'plano',
      [TipoDocumento.Especificacion]: 'espec', [TipoDocumento.Acta]: 'acta',
      [TipoDocumento.Otro]: 'otro',
    };
    return m[tipo] ?? 'otro';
  }

  getTipoIcon(tipo: TipoDocumento): string {
    return TIPO_DOC_ICONS[tipo] ?? 'pi-file';
  }

  formatSize(bytes: number): string {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  }

  private emptyForm() {
    return {
      nombre: '', tipoDocumento: null as TipoDocumento | null,
      urlStorage: '', nombreArchivoOriginal: '',
      extension: 'pdf', tamanoBytes: 0, descripcion: ''
    };
  }
}
