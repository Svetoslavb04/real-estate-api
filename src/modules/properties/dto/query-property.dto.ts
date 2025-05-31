import {
  IsOptional,
  IsNumber,
  Min,
  IsString,
  IsBoolean,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QueryPropertyDto {
  @ApiProperty({ required: false, description: 'Page number' })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({ required: false, description: 'Items per page' })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  @ApiProperty({
    required: false,
    description: 'Search by title or description',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ required: false, description: 'Filter by city' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ required: false, description: 'Filter by property type' })
  @IsString()
  @IsOptional()
  propertyType?: string;

  @ApiProperty({ required: false, description: 'Minimum price' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  minPrice?: number;

  @ApiProperty({ required: false, description: 'Maximum price' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxPrice?: number;

  @ApiProperty({ required: false, description: 'Filter by availability' })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @ApiProperty({ required: false, description: 'Minimum bedrooms' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  minBedrooms?: number;

  @ApiProperty({ required: false, description: 'Maximum bedrooms' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxBedrooms?: number;

  @ApiProperty({ required: false, description: 'Minimum bathrooms' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  minBathrooms?: number;

  @ApiProperty({ required: false, description: 'Maximum bathrooms' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxBathrooms?: number;

  @ApiProperty({ required: false, description: 'Minimum area' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  minArea?: number;

  @ApiProperty({ required: false, description: 'Maximum area' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxArea?: number;

  @ApiProperty({ required: false, description: 'Sort by' })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiProperty({ required: false, description: 'Sort order' })
  @IsString()
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}
