import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
  ) {}

  async create(
    createAppointmentDto: CreateAppointmentDto,
  ): Promise<Appointment> {
    const existing = await this.appointmentsRepository.findOne({
      where: {
        fechaCita: createAppointmentDto.fechaCita,
        horaCita: createAppointmentDto.horaCita,
        estado: Not(AppointmentStatus.Cancelada),
      },
    });

    if (existing) {
      throw new ConflictException('La hora seleccionada ya esta ocupada');
    }

    const appointment =
      this.appointmentsRepository.create(createAppointmentDto);
    return await this.appointmentsRepository.save(appointment);
  }

  async findAll(filters?: {
    fecha?: string;
    estado?: string;
  }): Promise<Appointment[]> {
    const where: Record<string, string> = {};

    if (filters?.fecha) {
      where.fechaCita = filters.fecha;
    }

    if (filters?.estado) {
      where.estado = filters.estado;
    }

    return await this.appointmentsRepository.find({
      where: Object.keys(where).length ? where : undefined,
      order: {
        creadoEn: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<Appointment> {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException(`Cita con id ${id} no encontrada`);
    }

    return appointment;
  }

  async findByDate(fecha: string): Promise<Appointment[]> {
    return await this.appointmentsRepository.find({
      where: { fechaCita: fecha },
      order: { horaCita: 'ASC' },
    });
  }

  async updateStatus(id: number, estado: string): Promise<Appointment> {
    const appointment = await this.findOne(id);
    appointment.estado = estado;
    return await this.appointmentsRepository.save(appointment);
  }

  async update(
    id: number,
    updateAppointmentDto: UpdateAppointmentDto,
  ): Promise<Appointment> {
    const appointment = await this.findOne(id);

    if (updateAppointmentDto.fechaCita || updateAppointmentDto.horaCita) {
      const fecha = updateAppointmentDto.fechaCita ?? appointment.fechaCita;
      const hora = updateAppointmentDto.horaCita ?? appointment.horaCita;

      const existing = await this.appointmentsRepository.findOne({
        where: {
          fechaCita: fecha,
          horaCita: hora,
          estado: Not(AppointmentStatus.Cancelada),
        },
      });

      if (existing && existing.id !== appointment.id) {
        throw new ConflictException('La hora seleccionada ya esta ocupada');
      }
    }

    Object.assign(appointment, updateAppointmentDto);
    return await this.appointmentsRepository.save(appointment);
  }

  async remove(id: number): Promise<void> {
    const appointment = await this.findOne(id);
    await this.appointmentsRepository.remove(appointment);
  }
}
