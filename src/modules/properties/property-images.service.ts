import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PropertyImage } from '../../entities/property-image.entity';
import { Property } from '../../entities/property.entity';
import { CreatePropertyImageDto } from './dto/create-property-image.dto';

@Injectable()
export class PropertyImagesService {
  constructor(
    @InjectRepository(PropertyImage)
    private propertyImageRepository: Repository<PropertyImage>,
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    private dataSource: DataSource,
  ) {}

  async create(
    propertyId: string,
    createPropertyImageDto: CreatePropertyImageDto,
  ): Promise<PropertyImage> {
    const property = await this.propertyRepository.findOne({
      where: { id: propertyId },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${propertyId} not found`);
    }

    const image = this.propertyImageRepository.create({
      ...createPropertyImageDto,
      property,
    });

    return this.propertyImageRepository.save(image);
  }

  async createWithBinary(
    propertyId: string,
    createPropertyImageDto: CreatePropertyImageDto,
    data: Buffer,
    mimeType: string,
  ): Promise<PropertyImage> {
    const property = await this.propertyRepository.findOne({
      where: { id: propertyId },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${propertyId} not found`);
    }

    const image = this.propertyImageRepository.create({
      ...createPropertyImageDto,
      property,
      data,
      mimeType,
    });

    return this.propertyImageRepository.save(image);
  }

  async findAll(propertyId: string): Promise<PropertyImage[]> {
    return this.propertyImageRepository.find({
      where: { property: { id: propertyId } },
      order: { displayOrder: 'ASC' },
    });
  }

  async findOne(id: string): Promise<PropertyImage> {
    const image = await this.propertyImageRepository.findOne({
      where: { id },
    });

    if (!image) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }

    return image;
  }

  async update(
    id: string,
    updatePropertyImageDto: Partial<CreatePropertyImageDto>,
  ): Promise<PropertyImage> {
    const image = await this.findOne(id);
    Object.assign(image, updatePropertyImageDto);
    return this.propertyImageRepository.save(image);
  }

  async setAsMain(id: string): Promise<PropertyImage> {
    const image = await this.findOne(id);

    // Use a transaction to ensure data consistency
    return this.dataSource.transaction(async (manager) => {
      // Reset all other images of this property to not be main
      await manager.update(
        PropertyImage,
        { property: { id: image.property.id }, isMain: true },
        { isMain: false },
      );

      // Set this image as main
      image.isMain = true;
      return manager.save(PropertyImage, image);
    });
  }

  async remove(id: string): Promise<void> {
    const image = await this.findOne(id);
    await this.propertyImageRepository.remove(image);
  }
}
