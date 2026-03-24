import { Component, inject, input, output, signal, effect, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { PasswordModule } from 'primeng/password';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

import { RrhhService } from '../../../../core/services/rrhh.service';
import { BancoService } from '../../../../core/services/banco.service';
import {
  Empleado, CuentaSistema,
  TIPO_IDENTIFICACION_OPTIONS,
  GENERO_OPTIONS,
  ESTADO_CIVIL_OPTIONS,
  TIPO_CONTRATO_OPTIONS,
  MODALIDAD_OPTIONS,
  JORNADA_OPTIONS,
  ESTADO_EMPLEADO_OPTIONS,
  TIPO_CUENTA_OPTIONS,
  JornadaLaboral,
} from '../../../../shared/models/rrhh.models';

@Component({
  selector: 'app-empleado-panel',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    InputTextModule, InputNumberModule, ButtonModule,
    SelectModule, TextareaModule, ToastModule, PasswordModule, ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './empleado-panel.component.html',
  styleUrls: ['./empleado-panel.component.scss']
})
export class EmpleadoPanelComponent implements OnInit {
  visible    = input<boolean>(false);
  empleado   = input<Empleado | null>(null);
  onCerrar   = output<void>();
  onGuardado = output<void>();

  private readonly fb             = inject(FormBuilder);
  private readonly rrhhService    = inject(RrhhService);
  private readonly bancoService   = inject(BancoService);
  private readonly toast          = inject(MessageService);
  private readonly confirmService = inject(ConfirmationService);

  readonly cargando     = signal(false);
  readonly error        = signal('');

  // ── Cuenta de sistema ─────────────────────────────────────────────
  readonly cuentaCargando  = signal(false);
  readonly cuentaError     = signal('');
  readonly cuenta          = signal<CuentaSistema | null>(null);
  // 'none' | 'crear' | 'vincular'
  readonly modoAccion      = signal<'none' | 'crear' | 'vincular'>('none');

  readonly cuentaForm = this.fb.group({
    email:         ['', [Validators.required, Validators.email]],
    nombreUsuario: [''],
    password:      ['', [Validators.required, Validators.minLength(6)]],
  });
  readonly vincularForm = this.fb.group({
    emailOId: ['', Validators.required],
  });

  // Opciones de selects estáticas
  readonly tipoIdOpts      = TIPO_IDENTIFICACION_OPTIONS;
  readonly generoOpts      = GENERO_OPTIONS;
  readonly estadoCivilOpts = ESTADO_CIVIL_OPTIONS;
  readonly contratoOpts    = TIPO_CONTRATO_OPTIONS;
  readonly modalidadOpts   = MODALIDAD_OPTIONS;
  readonly jornadaOpts     = JORNADA_OPTIONS;
  readonly estadoOpts      = ESTADO_EMPLEADO_OPTIONS;
  readonly cuentaOpts      = TIPO_CUENTA_OPTIONS;

  readonly esEdicion = () => !!this.empleado();
  readonly titulo    = () => this.esEdicion() ? 'Editar Empleado' : 'Nuevo Empleado';
  readonly subtitulo = () => this.esEdicion()
    ? `Modificando datos de ${this.empleado()?.nombreCompleto}`
    : 'Completa los datos para registrar un nuevo empleado';

  // Opciones dinámicas
  readonly bancosOpts = computed(() =>
    this.bancoService.bancos()
      .filter(b => b.activo)
      .map(b => ({ label: b.nombre, value: b.id }))
  );

  readonly puestosFiltrados = computed(() => {
    const deptId = this.form?.get('departamentoId')?.value;
    return this.rrhhService.puestos()
      .filter(p => !deptId || p.departamentoId === deptId)
      .map(p => ({ label: p.nombre, value: p.id }));
  });

  get departamentosOpts() { return this.rrhhService.departamentos().map(d => ({ label: d.nombre, value: d.id })); }
  get empleadosOpts()     { return this.rrhhService.empleados().map(e => ({ label: e.nombreCompleto, value: e.id })); }

  form = this.fb.group({
    // Personales
    tipoIdentificacion:  ['CEDULA', Validators.required],
    numeroIdentificacion: ['', Validators.required],
    nombres:             ['', [Validators.required, Validators.minLength(2)]],
    apellidos:           ['', [Validators.required, Validators.minLength(2)]],
    fechaNacimiento:     [''],
    genero:              [null as number | null],
    estadoCivil:         [null as number | null],
    emailPersonal:       ['', Validators.email],
    emailCorporativo:    ['', Validators.email],
    telefonoCelular:     [''],
    telefonoFijo:        [''],
    direccion:           [''],
    // Laborales
    departamentoId:      [null as number | null],
    puestoId:            [null as number | null],
    jefeDirectoId:       [null as number | null],
    fechaIngreso:        ['', Validators.required],
    tipoContrato:        [1, Validators.required],
    modalidadTrabajo:    [1, Validators.required],
    jornadaLaboral:      [JornadaLaboral.Completa, Validators.required],
    horasSemanales:      [40, [Validators.required, Validators.min(1)]],
    salarioBase:         [null as number | null, [Validators.required, Validators.min(0)]],
    estado:              [1],
    numeroSeguroSocial:  [''],
    // Bancarios
    bancoId:             [null as number | null],
    tipoCuenta:          [null as number | null],
    numeroCuenta:        [''],
  });

  constructor() {
    effect(() => {
      const e = this.empleado();
      // Reset cuenta state on employee change
      this.cuenta.set(null);
      this.cuentaError.set('');
      this.modoAccion.set('none');
      this.cuentaForm.reset();
      this.vincularForm.reset();

      if (e) {
        // Cargar cuenta vinculada si existe
        if (e.tieneCuenta) {
          this.cuentaCargando.set(true);
          this.rrhhService.obtenerCuentaEmpleado(e.id).subscribe({
            next: r => { if (r?.success) this.cuenta.set(r.data ?? null); this.cuentaCargando.set(false); },
            error: () => this.cuentaCargando.set(false),
          });
        }

        this.form.patchValue({
          tipoIdentificacion:   e.tipoIdentificacion,
          numeroIdentificacion: e.numeroIdentificacion,
          nombres:              e.nombres,
          apellidos:            e.apellidos,
          fechaNacimiento:      e.fechaNacimiento ?? '',
          genero:               e.genero ?? null,
          estadoCivil:          e.estadoCivil ?? null,
          emailPersonal:        e.emailPersonal ?? '',
          emailCorporativo:     e.emailCorporativo ?? '',
          telefonoCelular:      e.telefonoCelular ?? '',
          telefonoFijo:         e.telefonoFijo ?? '',
          direccion:            e.direccion ?? '',
          departamentoId:       e.departamentoId ?? null,
          puestoId:             e.puestoId ?? null,
          jefeDirectoId:        e.jefeDirectoId ?? null,
          fechaIngreso:         e.fechaIngreso,
          tipoContrato:         e.tipoContrato,
          modalidadTrabajo:     e.modalidadTrabajo,
          jornadaLaboral:       e.jornadaLaboral,
          horasSemanales:       e.horasSemanales,
          salarioBase:          e.salarioBase,
          estado:               e.estado,
          numeroSeguroSocial:   e.numeroSeguroSocial ?? '',
          bancoId:              e.bancoId ?? null,
          tipoCuenta:           e.tipoCuenta ?? null,
          numeroCuenta:         e.numeroCuenta ?? '',
        });
        this.form.get('numeroIdentificacion')?.disable();
      } else {
        this.form.reset({
          tipoIdentificacion: 'CEDULA',
          tipoContrato: 1, modalidadTrabajo: 1,
          jornadaLaboral: JornadaLaboral.Completa,
          horasSemanales: 40, estado: 1
        });
        this.form.get('numeroIdentificacion')?.enable();
      }
      this.error.set('');
    });
  }

  ngOnInit(): void {
    if (this.rrhhService.departamentos().length === 0) this.rrhhService.listarDepartamentos().subscribe();
    if (this.rrhhService.puestos().length === 0)       this.rrhhService.listarPuestos().subscribe();
    if (this.bancoService.bancos().length === 0)       this.bancoService.listar().subscribe();
  }

  invalid(campo: string) {
    const c = this.form.get(campo);
    return c?.invalid && c?.touched;
  }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.error.set('');
    this.cargando.set(true);
    const v = this.form.getRawValue();

    const ok  = () => {
      this.toast.add({ severity: 'success', summary: '¡Listo!',
        detail: this.esEdicion() ? 'Empleado actualizado' : 'Empleado creado correctamente', life: 3000 });
      this.cargando.set(false);
      this.onGuardado.emit();
    };
    const err = (e: any) => { this.error.set(e?.error?.message ?? 'Ocurrió un error inesperado'); this.cargando.set(false); };

    if (this.esEdicion()) {
      this.rrhhService.actualizarEmpleado(this.empleado()!.id, {
        nombres:             v.nombres!,
        apellidos:           v.apellidos!,
        fechaNacimiento:     v.fechaNacimiento || undefined,
        genero:              v.genero ?? undefined,
        estadoCivil:         v.estadoCivil ?? undefined,
        emailPersonal:       v.emailPersonal || undefined,
        emailCorporativo:    v.emailCorporativo || undefined,
        telefonoCelular:     v.telefonoCelular || undefined,
        telefonoFijo:        v.telefonoFijo || undefined,
        direccion:           v.direccion || undefined,
        departamentoId:      v.departamentoId ?? undefined,
        puestoId:            v.puestoId ?? undefined,
        jefeDirectoId:       v.jefeDirectoId ?? undefined,
        tipoContrato:        v.tipoContrato!,
        modalidadTrabajo:    v.modalidadTrabajo!,
        jornadaLaboral:      v.jornadaLaboral!,
        horasSemanales:      v.horasSemanales!,
        salarioBase:         v.salarioBase!,
        estado:              v.estado!,
        numeroSeguroSocial:  v.numeroSeguroSocial || undefined,
        bancoId:             v.bancoId ?? undefined,
        tipoCuenta:          v.tipoCuenta ?? undefined,
        numeroCuenta:        v.numeroCuenta || undefined,
      }).subscribe({ next: ok, error: err });
    } else {
      this.rrhhService.crearEmpleado({
        empresaId:            1,
        tipoIdentificacion:   v.tipoIdentificacion!,
        numeroIdentificacion: v.numeroIdentificacion!,
        nombres:              v.nombres!,
        apellidos:            v.apellidos!,
        fechaNacimiento:      v.fechaNacimiento || undefined,
        genero:               v.genero ?? undefined,
        estadoCivil:          v.estadoCivil ?? undefined,
        emailPersonal:        v.emailPersonal || undefined,
        emailCorporativo:     v.emailCorporativo || undefined,
        telefonoCelular:      v.telefonoCelular || undefined,
        telefonoFijo:         v.telefonoFijo || undefined,
        direccion:            v.direccion || undefined,
        departamentoId:       v.departamentoId ?? undefined,
        puestoId:             v.puestoId ?? undefined,
        jefeDirectoId:        v.jefeDirectoId ?? undefined,
        fechaIngreso:         v.fechaIngreso!,
        tipoContrato:         v.tipoContrato!,
        modalidadTrabajo:     v.modalidadTrabajo!,
        jornadaLaboral:       v.jornadaLaboral!,
        horasSemanales:       v.horasSemanales!,
        salarioBase:          v.salarioBase!,
        numeroSeguroSocial:   v.numeroSeguroSocial || undefined,
        bancoId:              v.bancoId ?? undefined,
        tipoCuenta:           v.tipoCuenta ?? undefined,
        numeroCuenta:         v.numeroCuenta || undefined,
      }).subscribe({ next: ok, error: err });
    }
  }

  cerrar(): void { this.onCerrar.emit(); }

  // ── Cuenta de sistema ─────────────────────────────────────────────
  abrirCrearCuenta(): void {
    const e = this.empleado();
    if (!e) return;
    // Pre-rellenar email con el del empleado
    const emailSugerido = e.emailCorporativo || e.emailPersonal || '';
    // Sugerir username: primera letra del nombre + primer apellido
    const primeraNombre  = (e.nombres ?? '').split(' ')[0][0]?.toLowerCase() ?? '';
    const primerApellido = (e.apellidos ?? '').split(' ')[0]?.toLowerCase() ?? '';
    const usernameSugerido = primeraNombre && primerApellido ? primeraNombre + primerApellido : '';
    this.cuentaForm.patchValue({ email: emailSugerido, nombreUsuario: usernameSugerido });
    this.modoAccion.set('crear');
  }

  crearCuenta(): void {
    if (this.cuentaForm.invalid) { this.cuentaForm.markAllAsTouched(); return; }
    this.cuentaCargando.set(true);
    this.cuentaError.set('');
    const v = this.cuentaForm.getRawValue();
    this.rrhhService.crearCuentaEmpleado(this.empleado()!.id, {
      email: v.email!, nombreUsuario: v.nombreUsuario || undefined, password: v.password!, rolesIds: []
    }).subscribe({
      next: r => {
        if (r?.success) { this.cuenta.set(r.data ?? null); this.modoAccion.set('none'); this.cuentaForm.reset(); }
        else this.cuentaError.set(r?.message ?? 'Error al crear cuenta');
        this.cuentaCargando.set(false);
      },
      error: e => { this.cuentaError.set(e?.error?.message ?? 'Error al crear cuenta'); this.cuentaCargando.set(false); },
    });
  }

  vincularUsuario(): void {
    if (this.vincularForm.invalid) { this.vincularForm.markAllAsTouched(); return; }
    this.cuentaCargando.set(true);
    this.cuentaError.set('');
    const emailOId = this.vincularForm.get('emailOId')!.value!;
    this.rrhhService.vincularUsuarioEmpleado(this.empleado()!.id, emailOId).subscribe({
      next: r => {
        if (r?.success) { this.cuenta.set(r.data ?? null); this.modoAccion.set('none'); this.vincularForm.reset(); }
        else this.cuentaError.set(r?.message ?? 'Error al vincular usuario');
        this.cuentaCargando.set(false);
      },
      error: e => { this.cuentaError.set(e?.error?.message ?? 'Error al vincular usuario'); this.cuentaCargando.set(false); },
    });
  }

  desvincularUsuario(): void {
    const nombre = this.cuenta()?.nombreCompleto ?? 'este usuario';
    this.confirmService.confirm({
      message:     `¿Seguro que deseas desvincular la cuenta de <strong>${nombre}</strong> de este empleado?`,
      header:      'Desvincular cuenta',
      icon:        'pi pi-user-minus',
      acceptLabel: 'Sí, desvincular',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.cuentaCargando.set(true);
        this.cuentaError.set('');
        this.rrhhService.desvincularUsuarioEmpleado(this.empleado()!.id).subscribe({
          next: r => {
            if (r?.success) this.cuenta.set(null);
            else this.cuentaError.set(r?.message ?? 'Error al desvincular');
            this.cuentaCargando.set(false);
          },
          error: e => { this.cuentaError.set(e?.error?.message ?? 'Error al desvincular'); this.cuentaCargando.set(false); },
        });
      }
    });
  }

  invalidCuenta(campo: string) {
    const c = this.cuentaForm.get(campo);
    return c?.invalid && c?.touched;
  }

  invalidVincular(campo: string) {
    const c = this.vincularForm.get(campo);
    return c?.invalid && c?.touched;
  }
}