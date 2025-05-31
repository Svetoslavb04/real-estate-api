import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PropertyImage } from '../../entities/property-image.entity';
import { Property } from '../../entities/property.entity';
import { CreatePropertyImageDto } from './dto/create-property-image.dto';
import { UserRole } from '../../entities/user.entity';

@Injectable()
export class PropertyImagesService {
  constructor(
    @InjectRepository(PropertyImage)
    private propertyImageRepository: Repository<PropertyImage>,
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    private dataSource: DataSource,
  ) {}

  private async checkPropertyOwnership(
    propertyId: string,
    userId: string,
    userRole: (typeof UserRole)[keyof typeof UserRole],
  ): Promise<Property> {
    const property = await this.propertyRepository.findOne({
      where: { id: propertyId },
      relations: ['agent'],
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${propertyId} not found`);
    }

    if (userRole !== UserRole.ADMIN && property.agent.id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to manage images for this property',
      );
    }

    return property;
  }

  async createWithBinary(
    propertyId: string,
    createPropertyImageDto: CreatePropertyImageDto,
    data: Buffer,
    mimeType: string,
    userId: string,
    userRole: (typeof UserRole)[keyof typeof UserRole],
  ): Promise<PropertyImage> {
    const property = await this.checkPropertyOwnership(
      propertyId,
      userId,
      userRole,
    );

    const image = this.propertyImageRepository.create({
      ...createPropertyImageDto,
      property,
      data,
      mimeType,
    });

    return this.propertyImageRepository.save(image);
  }

  async findAll(propertyId: string): Promise<PropertyImage[]> {
    const property = await this.propertyRepository.findOne({
      where: { id: propertyId },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${propertyId} not found`);
    }

    return this.propertyImageRepository.find({
      where: { property: { id: propertyId } },
      order: { displayOrder: 'ASC' },
    });
  }

  async findOne(id: string): Promise<PropertyImage> {
    const image = await this.propertyImageRepository.findOne({
      where: { id },
      relations: ['property', 'property.agent'],
    });

    if (!image) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }

    return image;
  }

  async updateUrlProperties(
    id: string,
    updatePropertyImageDto: Partial<CreatePropertyImageDto>,
    userId: string,
    userRole: (typeof UserRole)[keyof typeof UserRole],
  ): Promise<PropertyImage> {
    const image = await this.findOne(id);

    if (userRole !== UserRole.ADMIN && image.property.agent.id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this image',
      );
    }

    // Only allow updating URL-related properties
    const allowedProperties = ['url', 'altText', 'title'];
    const updates = Object.keys(updatePropertyImageDto).filter((key) =>
      allowedProperties.includes(key),
    );

    if (updates.length === 0) {
      throw new BadRequestException(
        'No valid URL properties provided for update',
      );
    }

    const updateData = {};
    updates.forEach((key) => {
      updateData[key] = updatePropertyImageDto[key];
    });

    Object.assign(image, updateData);
    return this.propertyImageRepository.save(image);
  }

  async setAsMain(
    id: string,
    userId: string,
    userRole: (typeof UserRole)[keyof typeof UserRole],
  ): Promise<PropertyImage> {
    const image = await this.findOne(id);

    if (userRole !== UserRole.ADMIN && image.property.agent.id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to set this image as main',
      );
    }

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

  async remove(
    id: string,
    userId: string,
    userRole: (typeof UserRole)[keyof typeof UserRole],
  ): Promise<void> {
    const image = await this.findOne(id);

    if (userRole !== UserRole.ADMIN && image.property.agent.id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this image',
      );
    }

    await this.propertyImageRepository.remove(image);
  }
}
