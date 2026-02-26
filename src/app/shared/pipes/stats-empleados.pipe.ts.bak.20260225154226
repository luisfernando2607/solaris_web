import { Pipe, PipeTransform } from '@angular/core';
import { EmpleadoDto } from '../models/rrhh.models';

@Pipe({ name: 'statsEmpleados', standalone: true })
export class StatsEmpleadosPipe implements PipeTransform {
  transform(empleados: EmpleadoDto[], estado: number): number {
    return empleados.filter(e => e.estado === estado).length;
  }
}
