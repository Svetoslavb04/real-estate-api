import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from '../../entities/property.entity';
import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { Appointment } from '../../entities/appointment.entity';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { PropertyImage } from '../../entities/property-image.entity';
import { PropertyImagesService } from './property-images.service';
import { PropertyImagesController } from './property-images.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Property, Appointment, PropertyImage])],
  providers: [PropertiesService, AppointmentsService, PropertyImagesService],
  controllers: [
    PropertiesController,
    AppointmentsController,
    PropertyImagesController,
  ],
  exports: [PropertiesService],
})
export class PropertiesModule {}
