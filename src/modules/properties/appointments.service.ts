import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
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
import { UserRole } from '../../entities/user.entity';

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
    userId: string,
  ): Promise<Appointment> {
    const property = await this.propertiesRepository.findOne({
      where: { id: propertyId },
      relations: ['agent'],
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${propertyId} not found`);
    }

    const appointmentDate = new Date(createAppointmentDto.appointmentDate);
    const durationMinutes = createAppointmentDto.durationMinutes || 60;
    const endTime = new Date(
      appointmentDate.getTime() + durationMinutes * 60000,
    );

    // Check for existing appointments that overlap
    const existingAppointments = await this.appointmentsRepository.find({
      where: {
        property: { id: propertyId },
      },
      relations: ['property'],
    });

    for (const existingAppointment of existingAppointments) {
      const existingStart = existingAppointment.appointmentDate;
      const existingEnd = new Date(
        existingStart.getTime() +
          (existingAppointment.durationMinutes || 60) * 60000,
      );

      // Check if the new appointment overlaps with any existing one
      if (
        (appointmentDate >= existingStart && appointmentDate < existingEnd) || // New appointment starts during existing
        (endTime > existingStart && endTime <= existingEnd) || // New appointment ends during existing
        (appointmentDate <= existingStart && endTime >= existingEnd) // New appointment spans over existing
      ) {
        throw new BadRequestException(
          'An appointment already exists for this property during the specified time period',
        );
      }
    }

    const appointment = this.appointmentsRepository.create({
      ...createAppointmentDto,
      appointmentDate,
      durationMinutes,
      property,
      agent: { id: userId },
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
      relations: ['property', 'agent', 'property.agent'],
      order: { appointmentDate: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id },
      relations: ['property', 'agent', 'property.agent'],
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    return appointment;
  }

  async update(
    id: string,
    updateAppointmentDto: UpdateAppointmentDto,
    userId: string,
    userRole: (typeof UserRole)[keyof typeof UserRole],
  ): Promise<Appointment> {
    const appointment = await this.findOne(id);

    // Check if user has permission to update
    if (
      userRole !== UserRole.ADMIN &&
      appointment.agent.id !== userId &&
      appointment.property.agent.id !== userId
    ) {
      throw new ForbiddenException(
        'You do not have permission to update this appointment',
      );
    }

    if (
      updateAppointmentDto.appointmentDate ||
      updateAppointmentDto.durationMinutes
    ) {
      const appointmentDate = updateAppointmentDto.appointmentDate
        ? new Date(updateAppointmentDto.appointmentDate)
        : appointment.appointmentDate;
      const durationMinutes =
        updateAppointmentDto.durationMinutes ||
        appointment.durationMinutes ||
        60;
      const endTime = new Date(
        appointmentDate.getTime() + durationMinutes * 60000,
      );

      // Check for existing appointments that overlap
      const existingAppointments = await this.appointmentsRepository.find({
        where: {
          property: { id: appointment.property.id },
          id: Not(id), // Exclude current appointment
        },
        relations: ['property'],
      });

      for (const existingAppointment of existingAppointments) {
        const existingStart = existingAppointment.appointmentDate;
        const existingEnd = new Date(
          existingStart.getTime() +
            (existingAppointment.durationMinutes || 60) * 60000,
        );

        // Check if the updated appointment overlaps with any existing one
        if (
          (appointmentDate >= existingStart && appointmentDate < existingEnd) || // Updated appointment starts during existing
          (endTime > existingStart && endTime <= existingEnd) || // Updated appointment ends during existing
          (appointmentDate <= existingStart && endTime >= existingEnd) // Updated appointment spans over existing
        ) {
          throw new BadRequestException(
            'An appointment already exists for this property during the specified time period',
          );
        }
      }

      appointment.appointmentDate = appointmentDate;
      appointment.durationMinutes = durationMinutes;
    }

    Object.assign(appointment, {
      ...updateAppointmentDto,
      appointmentDate: updateAppointmentDto.appointmentDate
        ? new Date(updateAppointmentDto.appointmentDate)
        : appointment.appointmentDate,
    });

    await this.appointmentsRepository.save(appointment);
    return await this.findOne(id);
  }

  async remove(
    id: string,
    userId: string,
    userRole: (typeof UserRole)[keyof typeof UserRole],
  ): Promise<boolean> {
    const appointment = await this.findOne(id);

    // Check if user has permission to delete
    if (
      userRole !== UserRole.ADMIN &&
      appointment.agent.id !== userId &&
      appointment.property.agent.id !== userId
    ) {
      throw new ForbiddenException(
        'You do not have permission to delete this appointment',
      );
    }

    await this.appointmentsRepository.remove(appointment);
    return true;
  }
}
