import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { QueryAppointmentDto } from './dto/query-appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

interface RequestWithUser extends Request {
  user: {
    id: string;
    email: string;
  };
}

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
    @Request() req: RequestWithUser,
    @Body() createAppointmentDto: CreateAppointmentDto,
  ) {
    return this.appointmentsService.create(
      propertyId,
      req.user.id,
      createAppointmentDto,
    );
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

  @Get('agent/appointments')
  @ApiOperation({
    summary:
      'Get all appointments for the current agent with filtering and pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Return all appointments for the agent.',
  })
  findByAgent(
    @Request() req: RequestWithUser,
    @Query() query: QueryAppointmentDto,
  ) {
    return this.appointmentsService.findByAgent(req.user.id, query);
  }
}
