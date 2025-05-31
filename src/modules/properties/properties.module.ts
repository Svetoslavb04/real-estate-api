import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from '../../entities/property.entity';
import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { Appointment } from '../../entities/appointment.entity';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Property, Appointment])],
  providers: [PropertiesService, AppointmentsService],
  controllers: [PropertiesController, AppointmentsController],
  exports: [PropertiesService],
})
export class PropertiesModule {}
