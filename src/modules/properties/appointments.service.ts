import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  Not,
  FindOptionsWhere,
  Between,
  LessThanOrEqual,
  MoreThanOrEqual,
} from 'typeorm';
import {
  Appointment,
  AppointmentStatusType,
} from '../../entities/appointment.entity';
import { Property } from '../../entities/property.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { QueryAppointmentDto } from './dto/query-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
    @InjectRepository(Property)
    private propertiesRepository: Repository<Property>,
  ) {}

  async create(
    propertyId: string,
    createAppointmentDto: CreateAppointmentDto,
  ): Promise<Appointment> {
    const property = await this.propertiesRepository.findOne({
      where: { id: propertyId },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${propertyId} not found`);
    }

    // Check for existing appointment at the same time
    const existingAppointment = await this.appointmentsRepository.findOne({
      where: {
        property: { id: propertyId },
        appointmentDate: new Date(createAppointmentDto.appointmentDate),
      },
    });

    if (existingAppointment) {
      throw new BadRequestException(
        'An appointment already exists for this property at the specified time',
      );
    }

    const appointment = this.appointmentsRepository.create({
      ...createAppointmentDto,
      appointmentDate: new Date(createAppointmentDto.appointmentDate),
      property,
    });

    return this.appointmentsRepository.save(appointment);
  }

  async findAll(
    propertyId: string,
    query: QueryAppointmentDto,
  ): Promise<Appointment[]> {
    const { startDate, endDate, status, clientName, clientEmail, clientPhone } =
      query;

    const where: FindOptionsWhere<Appointment> = {
      property: { id: propertyId },
    };

    if (startDate && endDate) {
      where.appointmentDate = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      where.appointmentDate = MoreThanOrEqual(new Date(startDate));
    } else if (endDate) {
      where.appointmentDate = LessThanOrEqual(new Date(endDate));
    }

    if (status) {
      where.status = status as AppointmentStatusType;
    }

    if (clientName) {
      where.clientName = clientName;
    }

    if (clientEmail) {
      where.clientEmail = clientEmail;
    }

    if (clientPhone) {
      where.clientPhone = clientPhone;
    }

    return this.appointmentsRepository.find({
      where,
      relations: ['property', 'agent'],
      order: { appointmentDate: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id },
      relations: ['property', 'agent'],
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    return appointment;
  }

  async update(
    id: string,
    updateAppointmentDto: UpdateAppointmentDto,
  ): Promise<Appointment> {
    const appointment = await this.findOne(id);

    if (updateAppointmentDto.appointmentDate) {
      // Check for existing appointment at the new time
      const existingAppointment = await this.appointmentsRepository.findOne({
        where: {
          property: { id: appointment.property.id },
          appointmentDate: new Date(updateAppointmentDto.appointmentDate),
          id: Not(id),
        },
      });

      if (existingAppointment) {
        throw new BadRequestException(
          'An appointment already exists for this property at the specified time',
        );
      }

      appointment.appointmentDate = new Date(
        updateAppointmentDto.appointmentDate,
      );
    }

    Object.assign(appointment, {
      ...updateAppointmentDto,
      appointmentDate: updateAppointmentDto.appointmentDate
        ? new Date(updateAppointmentDto.appointmentDate)
        : appointment.appointmentDate,
    });

    return this.appointmentsRepository.save(appointment);
  }

  async remove(id: string): Promise<void> {
    const appointment = await this.findOne(id);
    await this.appointmentsRepository.remove(appointment);
  }
}
