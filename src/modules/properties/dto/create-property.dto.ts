import {
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  Length,
  IsEnum,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  PropertyType,
  PropertyTypeType,
} from '../../../entities/property.entity';

export class CreatePropertyDto {
  @ApiProperty({
    example: 'Modern Apartment in City Center',
    description: 'Property title',
  })
  @IsNotEmpty()
  @IsString()
  @Length(5, 100)
  title: string;

  @ApiProperty({
    example: 'Beautiful modern apartment with great views',
    description: 'Property description',
  })
  @IsNotEmpty()
  @IsString()
  @Length(10, 500)
  description: string;

  @ApiProperty({ example: 250000, description: 'Property price' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: '123 Main St', description: 'Property address' })
  @IsNotEmpty()
  @IsString()
  @Length(5, 100)
  address: string;

  @ApiProperty({ example: 'Sofia', description: 'Property city' })
  @IsNotEmpty()
  @IsString()
  @Length(2, 50)
  city: string;

  @ApiProperty({ example: 2, description: 'Number of bedrooms' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  bedrooms: number;

  @ApiProperty({ example: 2, description: 'Number of bathrooms' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  bathrooms: number;

  @ApiProperty({
    example: 120.5,
    description: 'Property area in square meters',
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  area: number;

  @ApiProperty({ example: 'apartment', enum: Object.values(PropertyType) })
  @IsNotEmpty()
  @IsEnum(PropertyType)
  propertyType: PropertyTypeType;

  @ApiProperty({ example: true, description: 'Property availability status' })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
