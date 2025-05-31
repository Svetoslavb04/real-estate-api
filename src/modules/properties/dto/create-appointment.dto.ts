import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsPhoneNumber,
  IsOptional,
  IsEnum,
  IsDateString,
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

  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  clientName: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsNotEmpty()
  @IsEmail()
  clientEmail: string;

  @ApiProperty({ example: '+359888123456' })
  @IsNotEmpty()
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
