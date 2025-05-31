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
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { QueryAppointmentDto } from './dto/query-appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('appointments')
@Controller('properties/:propertyId/appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new appointment' })
  @ApiResponse({
    status: 201,
    description: 'The appointment has been successfully created.',
  })
  create(
    @Param('propertyId') propertyId: string,
    @Body() createAppointmentDto: CreateAppointmentDto,
  ) {
    return this.appointmentsService.create(propertyId, createAppointmentDto);
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
    @Param('propertyId') propertyId: string,
    @Query() query: QueryAppointmentDto,
  ) {
    return this.appointmentsService.findAll(propertyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific appointment' })
  @ApiResponse({ status: 200, description: 'Return the appointment.' })
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an appointment' })
  @ApiResponse({
    status: 200,
    description: 'The appointment has been successfully updated.',
  })
  update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an appointment' })
  @ApiResponse({
    status: 200,
    description: 'The appointment has been successfully deleted.',
  })
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }
}
