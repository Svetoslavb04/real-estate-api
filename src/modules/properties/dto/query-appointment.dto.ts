import {
  IsOptional,
  IsString,
  IsDateString,
  IsNumber,
  Min,
  Max,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QueryAppointmentDto {
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
    description: 'Search by client name or email',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ required: false, description: 'Filter by client name' })
  @IsString()
  @Length(2, 100)
  @IsOptional()
  clientName?: string;

  @ApiProperty({ required: false, description: 'Filter by client email' })
  @IsString()
  @IsOptional()
  clientEmail?: string;

  @ApiProperty({ required: false, description: 'Filter by client phone' })
  @IsString()
  @IsOptional()
  clientPhone?: string;

  @ApiProperty({ required: false, description: 'Filter by status' })
  @IsString()
  @Length(2, 20)
  @IsOptional()
  status?: string;

  @ApiProperty({ required: false, description: 'Filter by start date' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ required: false, description: 'Filter by end date' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ required: false, description: 'Sort by' })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiProperty({ required: false, description: 'Sort order' })
  @IsString()
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}
