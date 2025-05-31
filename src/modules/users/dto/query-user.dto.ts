import {
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  Min,
  Max,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QueryUserDto {
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

  @ApiProperty({ required: false, description: 'Search by name or email' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ required: false, description: 'Filter by first name' })
  @IsString()
  @Length(2, 50)
  @IsOptional()
  firstName?: string;

  @ApiProperty({ required: false, description: 'Filter by last name' })
  @IsString()
  @Length(2, 50)
  @IsOptional()
  lastName?: string;

  @ApiProperty({ required: false, description: 'Filter by email' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({ required: false, description: 'Filter by role' })
  @IsString()
  @IsOptional()
  role?: string;

  @ApiProperty({ required: false, description: 'Filter by active status' })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ required: false, description: 'Sort by' })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiProperty({ required: false, description: 'Sort order' })
  @IsString()
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}
