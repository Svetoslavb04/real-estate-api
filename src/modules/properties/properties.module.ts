import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from '../../entities/property.entity';
import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { PropertyFeature } from '../../entities/property-feature.entity';
import { PropertyFeaturesService } from './property-features.service';
import { PropertyFeaturesController } from './property-features.controller';
import { Appointment } from '../../entities/appointment.entity';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { PropertyImage } from '../../entities/property-image.entity';
import { PropertyImagesService } from './property-images.service';
import { PropertyImagesController } from './property-images.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Property,
      PropertyFeature,
      Appointment,
      PropertyImage,
    ]),
  ],
  providers: [
    PropertiesService,
    PropertyFeaturesService,
    AppointmentsService,
    PropertyImagesService,
  ],
  controllers: [
    PropertiesController,
    PropertyFeaturesController,
    AppointmentsController,
    PropertyImagesController,
  ],
  exports: [PropertiesService],
})
export class PropertiesModule {}
