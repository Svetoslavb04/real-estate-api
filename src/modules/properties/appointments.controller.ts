import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { QueryAppointmentDto } from './dto/query-appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@ApiTags('appointments')
@Controller('properties/:propertyId/appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new appointment' })
  @ApiResponse({
    status: 201,
    description: 'The appointment has been successfully created.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not authorized to create appointment',
  })
  @Roles(UserRole.ADMIN, UserRole.AGENT, UserRole.CLIENT)
  async create(
    @Param('propertyId') propertyId: string,
    @Body() createAppointmentDto: CreateAppointmentDto,
    @Request() req,
  ) {
    if (
      !createAppointmentDto.clientEmail ||
      !createAppointmentDto.clientName ||
      !createAppointmentDto.clientPhone
    ) {
      createAppointmentDto.clientEmail = req.user.email;
      createAppointmentDto.clientName = req.user.firstName;
      createAppointmentDto.clientPhone = req.user.phone;
    }

    const appointment = await this.appointmentsService.create(
      propertyId,
      createAppointmentDto,
      req.user.id,
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { agent, ...appointmentWithoutAgent } = appointment;
    return appointmentWithoutAgent;
  }

  @Get()
  @ApiOperation({
    summary:
      'Get all appointments for a property with filtering and pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Return all appointments for the property.',
  })
  findAll(
    @Param('propertyId', ParseUUIDPipe) propertyId: string,
    @Query() query: QueryAppointmentDto,
  ) {
    return this.appointmentsService.findAll(propertyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific appointment' })
  @ApiResponse({ status: 200, description: 'Return the appointment.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an appointment' })
  @ApiResponse({
    status: 200,
    description: 'The appointment has been successfully updated.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not authorized to update this appointment',
  })
  @Roles(UserRole.ADMIN, UserRole.AGENT, UserRole.CLIENT)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @Request() req,
  ) {
    return this.appointmentsService.update(
      id,
      updateAppointmentDto,
      req.user.id,
      req.user.role,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an appointment' })
  @ApiResponse({
    status: 200,
    description: 'The appointment has been successfully deleted.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not authorized to delete this appointment',
  })
  @Roles(UserRole.ADMIN, UserRole.AGENT, UserRole.CLIENT)
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.appointmentsService.remove(id, req.user.id, req.user.role);
  }
}
