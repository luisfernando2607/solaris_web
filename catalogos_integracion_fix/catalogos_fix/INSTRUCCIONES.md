# Instrucciones de aplicación

## 1. sidebar.component.ts
Reemplaza: src/app/layout/sidebar/sidebar.component.ts

Cambios:
- Agrega el item "Catálogos" con sus 8 sub-ítems al navItems[]

---

## 2. catalogos.component.scss
Reemplaza: src/app/modules/catalogos/catalogos.component.scss

Cambios:
- Cambia variables PrimeNG (--surface-card, --surface-border, etc.)
  por las variables del proyecto (--surface, --border, --bg, etc.)

---

## 3. catalogos-styles.scss → AGREGAR al styles.scss
Al final de: src/styles.scss

Pega el contenido completo de este archivo.
Contiene todos los estilos compartidos de los componentes de catálogos:
- .page, .page-header, .page-title
- .search-wrap, .filters-bar, .btn-refresh
- .table-wrap, .data-table, .table-footer
- .item-cell, .item-avatar, .flag-emoji
- .estado-badge, .tipo-chip, .act-btn
- .side-panel, .panel-header, .panel-form, .field
- Y más...
