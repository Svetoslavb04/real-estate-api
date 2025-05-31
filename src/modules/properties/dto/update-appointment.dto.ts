import {
  IsOptional,
  IsString,
  IsEmail,
  IsPhoneNumber,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  AppointmentStatus,
  AppointmentStatusType,
} from '../../../entities/appointment.entity';

export class UpdateAppointmentDto {
  @ApiProperty({ example: '2024-03-20T14:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  appointmentDate?: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  clientName?: string;

  @ApiProperty({ example: 'john@example.com', required: false })
  @IsOptional()
  @IsEmail()
  clientEmail?: string;

  @ApiProperty({ example: '+359888123456', required: false })
  @IsOptional()
  @IsPhoneNumber()
  clientPhone?: string;

  @ApiProperty({
    example: 'Interested in viewing the property',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    example: 'confirmed',
    enum: Object.values(AppointmentStatus),
    required: false,
  })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatusType;
}
