import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PropertyFeature } from '../../entities/property-feature.entity';
import { Property } from '../../entities/property.entity';

@Injectable()
export class PropertyFeaturesService {
  constructor(
    @InjectRepository(PropertyFeature)
    private propertyFeaturesRepository: Repository<PropertyFeature>,
    @InjectRepository(Property)
    private propertiesRepository: Repository<Property>,
  ) {}

  async create(
    propertyId: string,
    featureData: Partial<PropertyFeature>,
  ): Promise<PropertyFeature> {
    const property = await this.propertiesRepository.findOne({
      where: { id: propertyId },
    });
    if (!property) {
      throw new NotFoundException(`Property with ID ${propertyId} not found`);
    }

    const feature = this.propertyFeaturesRepository.create({
      ...featureData,
      property,
    });

    return this.propertyFeaturesRepository.save(feature);
  }

  async findAll(propertyId: string): Promise<PropertyFeature[]> {
    return this.propertyFeaturesRepository.find({
      where: { property: { id: propertyId } },
    });
  }

  async findOne(id: string): Promise<PropertyFeature> {
    const feature = await this.propertyFeaturesRepository.findOne({
      where: { id },
      relations: ['property'],
    });

    if (!feature) {
      throw new NotFoundException(`Property feature with ID ${id} not found`);
    }

    return feature;
  }

  async update(
    id: string,
    featureData: Partial<PropertyFeature>,
  ): Promise<PropertyFeature> {
    const feature = await this.findOne(id);
    Object.assign(feature, featureData);
    return this.propertyFeaturesRepository.save(feature);
  }

  async remove(id: string): Promise<void> {
    const feature = await this.findOne(id);
    await this.propertyFeaturesRepository.remove(feature);
  }
}
