import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from '../../entities/property.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { QueryPropertyDto } from './dto/query-property.dto';
import { UserRole } from '../../entities/user.entity';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private propertiesRepository: Repository<Property>,
  ) {}

  async create(
    createPropertyDto: CreatePropertyDto,
    agentId: string,
  ): Promise<Property> {
    const property = this.propertiesRepository.create({
      ...createPropertyDto,
      agent: { id: agentId },
    });
    return this.propertiesRepository.save(property);
  }

  async findAll(query: QueryPropertyDto) {
    const {
      page = 1,
      limit = 10,
      search,
      city,
      propertyType,
      minPrice,
      maxPrice,
      isAvailable,
      minBedrooms,
      maxBedrooms,
      minBathrooms,
      maxBathrooms,
      minArea,
      maxArea,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.propertiesRepository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.agent', 'agent')
      .skip(skip)
      .take(limit);

    if (search) {
      queryBuilder.where(
        '(property.title LIKE :search OR property.description LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (city) {
      queryBuilder.andWhere('property.city = :city', { city });
    }

    if (propertyType) {
      queryBuilder.andWhere('property.propertyType = :propertyType', {
        propertyType,
      });
    }

    if (minPrice !== undefined && maxPrice !== undefined) {
      queryBuilder.andWhere('property.price BETWEEN :minPrice AND :maxPrice', {
        minPrice,
        maxPrice,
      });
    } else if (minPrice !== undefined) {
      queryBuilder.andWhere('property.price >= :minPrice', { minPrice });
    } else if (maxPrice !== undefined) {
      queryBuilder.andWhere('property.price <= :maxPrice', { maxPrice });
    }

    if (isAvailable !== undefined) {
      queryBuilder.andWhere('property.isAvailable = :isAvailable', {
        isAvailable,
      });
    }

    if (minBedrooms !== undefined && maxBedrooms !== undefined) {
      queryBuilder.andWhere(
        'property.bedrooms BETWEEN :minBedrooms AND :maxBedrooms',
        {
          minBedrooms,
          maxBedrooms,
        },
      );
    } else if (minBedrooms !== undefined) {
      queryBuilder.andWhere('property.bedrooms >= :minBedrooms', {
        minBedrooms,
      });
    } else if (maxBedrooms !== undefined) {
      queryBuilder.andWhere('property.bedrooms <= :maxBedrooms', {
        maxBedrooms,
      });
    }

    if (minBathrooms !== undefined && maxBathrooms !== undefined) {
      queryBuilder.andWhere(
        'property.bathrooms BETWEEN :minBathrooms AND :maxBathrooms',
        {
          minBathrooms,
          maxBathrooms,
        },
      );
    } else if (minBathrooms !== undefined) {
      queryBuilder.andWhere('property.bathrooms >= :minBathrooms', {
        minBathrooms,
      });
    } else if (maxBathrooms !== undefined) {
      queryBuilder.andWhere('property.bathrooms <= :maxBathrooms', {
        maxBathrooms,
      });
    }

    if (minArea !== undefined && maxArea !== undefined) {
      queryBuilder.andWhere('property.area BETWEEN :minArea AND :maxArea', {
        minArea,
        maxArea,
      });
    } else if (minArea !== undefined) {
      queryBuilder.andWhere('property.area >= :minArea', { minArea });
    } else if (maxArea !== undefined) {
      queryBuilder.andWhere('property.area <= :maxArea', { maxArea });
    }

    // Add sorting
    const validSortFields = [
      'price',
      'bedrooms',
      'bathrooms',
      'area',
      'createdAt',
    ];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`property.${sortField}`, sortOrder);

    const [properties, total] = await queryBuilder.getManyAndCount();

    return {
      data: properties,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Property> {
    const property = await this.propertiesRepository.findOne({
      where: { id },
      relations: ['agent'],
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    return property;
  }

  async update(
    id: string,
    updatePropertyDto: UpdatePropertyDto,
    userId: string,
    userRole: (typeof UserRole)[keyof typeof UserRole],
  ): Promise<Property> {
    const property = await this.findOne(id);

    // Check if user has permission to update
    if (userRole !== UserRole.ADMIN && property.agent.id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this property',
      );
    }

    Object.assign(property, updatePropertyDto);
    return this.propertiesRepository.save(property);
  }

  async remove(
    id: string,
    userId: string,
    userRole: (typeof UserRole)[keyof typeof UserRole],
  ): Promise<void> {
    const property = await this.findOne(id);

    // Check if user has permission to delete
    if (userRole !== UserRole.ADMIN && property.agent.id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this property',
      );
    }

    await this.propertiesRepository.remove(property);
  }
}
