import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Length,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  PropertyType,
  PropertyTypeType,
} from '../../../entities/property.entity';

export class UpdatePropertyDto {
  @ApiProperty({ example: 'Modern Apartment in City Center', required: false })
  @IsOptional()
  @IsString()
  @Length(5, 100)
  title?: string;

  @ApiProperty({
    example: 'Beautiful modern apartment with great views',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 250000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({ example: '123 Main St', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'New York', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  bedrooms?: number;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  bathrooms?: number;

  @ApiProperty({ example: 120.5, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  area?: number;

  @ApiProperty({
    example: 'apartment',
    enum: Object.values(PropertyType),
    required: false,
  })
  @IsOptional()
  @IsEnum(PropertyType)
  propertyType?: PropertyTypeType;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
