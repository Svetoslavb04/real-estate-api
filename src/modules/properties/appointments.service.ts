import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Appointment } from '../../entities/appointment.entity';
import { Property } from '../../entities/property.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

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
    agentId: string,
    createAppointmentDto: CreateAppointmentDto,
  ): Promise<Appointment> {
    const property = await this.propertiesRepository.findOne({
      where: { id: propertyId },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${propertyId} not found`);
    }

    // Check if the appointment time is available
    const existingAppointment = await this.appointmentsRepository.findOne({
      where: {
        property: { id: propertyId },
        appointmentDate: createAppointmentDto.appointmentDate,
      },
    });

    if (existingAppointment) {
      throw new BadRequestException('This time slot is already booked');
    }

    const appointment = this.appointmentsRepository.create({
      ...createAppointmentDto,
      property,
      agent: { id: agentId },
    });

    return this.appointmentsRepository.save(appointment);
  }

  async findAll(propertyId: string): Promise<Appointment[]> {
    return this.appointmentsRepository.find({
      where: { property: { id: propertyId } },
      relations: ['property', 'agent'],
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

    // If updating the appointment date, check for conflicts
    if (updateAppointmentDto.appointmentDate) {
      const existingAppointment = await this.appointmentsRepository.findOne({
        where: {
          property: { id: appointment.property.id },
          appointmentDate: updateAppointmentDto.appointmentDate,
          id: Not(id), // Exclude current appointment
        },
      });

      if (existingAppointment) {
        throw new BadRequestException('This time slot is already booked');
      }
    }

    Object.assign(appointment, updateAppointmentDto);
    return this.appointmentsRepository.save(appointment);
  }

  async remove(id: string): Promise<void> {
    const appointment = await this.findOne(id);
    await this.appointmentsRepository.remove(appointment);
  }

  async findByAgent(agentId: string): Promise<Appointment[]> {
    return this.appointmentsRepository.find({
      where: { agent: { id: agentId } },
      relations: ['property', 'agent'],
    });
  }
}
