import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsPhoneNumber,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  AppointmentStatus,
  AppointmentStatusType,
} from '../../../entities/appointment.entity';

export class CreateAppointmentDto {
  @ApiProperty({ example: '2024-03-20T14:00:00Z' })
  @IsNotEmpty()
  @IsDateString()
  appointmentDate: string;

  @ApiProperty({ example: 60, description: 'Duration in minutes', default: 60 })
  @IsNumber()
  @Min(15)
  @Max(240)
  @IsOptional()
  durationMinutes?: number;

  @ApiProperty({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  clientName: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsOptional()
  @IsEmail()
  clientEmail: string;

  @ApiProperty({ example: '+359888123456' })
  @IsOptional()
  @IsPhoneNumber()
  clientPhone: string;

  @ApiProperty({
    example: 'Interested in viewing the property',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    example: 'pending',
    enum: Object.values(AppointmentStatus),
    required: false,
  })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatusType;
}
