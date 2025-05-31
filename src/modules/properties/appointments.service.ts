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

  async findAll(propertyId: string, query: QueryAppointmentDto) {
    const {
      page = 1,
      limit = 10,
      search,
      clientName,
      clientEmail,
      clientPhone,
      status,
      startDate,
      endDate,
      sortBy = 'appointmentDate',
      sortOrder = 'DESC',
    } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.appointmentsRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.property', 'property')
      .leftJoinAndSelect('appointment.agent', 'agent')
      .where('property.id = :propertyId', { propertyId })
      .skip(skip)
      .take(limit);

    if (search) {
      queryBuilder.andWhere(
        '(appointment.clientName LIKE :search OR appointment.clientEmail LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (clientName) {
      queryBuilder.andWhere('appointment.clientName = :clientName', {
        clientName,
      });
    }

    if (clientEmail) {
      queryBuilder.andWhere('appointment.clientEmail = :clientEmail', {
        clientEmail,
      });
    }

    if (clientPhone) {
      queryBuilder.andWhere('appointment.clientPhone = :clientPhone', {
        clientPhone,
      });
    }

    if (status) {
      queryBuilder.andWhere('appointment.status = :status', { status });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere(
        'appointment.appointmentDate BETWEEN :startDate AND :endDate',
        {
          startDate,
          endDate,
        },
      );
    } else if (startDate) {
      queryBuilder.andWhere('appointment.appointmentDate >= :startDate', {
        startDate,
      });
    } else if (endDate) {
      queryBuilder.andWhere('appointment.appointmentDate <= :endDate', {
        endDate,
      });
    }

    // Add sorting
    const validSortFields = [
      'appointmentDate',
      'clientName',
      'clientEmail',
      'status',
      'createdAt',
    ];
    const sortField = validSortFields.includes(sortBy)
      ? sortBy
      : 'appointmentDate';
    queryBuilder.orderBy(`appointment.${sortField}`, sortOrder);

    const [appointments, total] = await queryBuilder.getManyAndCount();

    return {
      data: appointments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
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

  async findByAgent(agentId: string, query: QueryAppointmentDto) {
    const {
      page = 1,
      limit = 10,
      search,
      clientName,
      clientEmail,
      clientPhone,
      status,
      startDate,
      endDate,
      sortBy = 'appointmentDate',
      sortOrder = 'DESC',
    } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.appointmentsRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.property', 'property')
      .leftJoinAndSelect('appointment.agent', 'agent')
      .where('agent.id = :agentId', { agentId })
      .skip(skip)
      .take(limit);

    if (search) {
      queryBuilder.andWhere(
        '(appointment.clientName LIKE :search OR appointment.clientEmail LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (clientName) {
      queryBuilder.andWhere('appointment.clientName = :clientName', {
        clientName,
      });
    }

    if (clientEmail) {
      queryBuilder.andWhere('appointment.clientEmail = :clientEmail', {
        clientEmail,
      });
    }

    if (clientPhone) {
      queryBuilder.andWhere('appointment.clientPhone = :clientPhone', {
        clientPhone,
      });
    }

    if (status) {
      queryBuilder.andWhere('appointment.status = :status', { status });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere(
        'appointment.appointmentDate BETWEEN :startDate AND :endDate',
        {
          startDate,
          endDate,
        },
      );
    } else if (startDate) {
      queryBuilder.andWhere('appointment.appointmentDate >= :startDate', {
        startDate,
      });
    } else if (endDate) {
      queryBuilder.andWhere('appointment.appointmentDate <= :endDate', {
        endDate,
      });
    }

    // Add sorting
    const validSortFields = [
      'appointmentDate',
      'clientName',
      'clientEmail',
      'status',
      'createdAt',
    ];
    const sortField = validSortFields.includes(sortBy)
      ? sortBy
      : 'appointmentDate';
    queryBuilder.orderBy(`appointment.${sortField}`, sortOrder);

    const [appointments, total] = await queryBuilder.getManyAndCount();

    return {
      data: appointments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
