import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import {
  AppointmentStatus,
  AppointmentStatusType,
} from '../../../entities/appointment.entity';

export class AppointmentDto {
  @ApiProperty({
    description: 'Unique identifier for the appointment',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Date and time of the appointment',
    example: '2023-10-01T10:00:00Z',
  })
  appointmentDate: Date;

  @ApiProperty({
    description: 'Duration of the appointment in minutes',
    example: 60,
  })
  @Min(1)
  durationMinutes: number;

  @ApiProperty({
    description: 'Name of the client',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  clientName: string;

  @ApiProperty({
    description: 'Email of the client',
    example: 'johndoe@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  clientEmail: string;

  @ApiProperty({
    description: 'Phone number of the client',
    example: '+1234567890',
    required: false,
  })
  @IsOptional()
  @IsPhoneNumber()
  @MaxLength(20)
  clientPhone: string;

  @ApiProperty({
    description: 'Additional notes for the appointment',
    example: 'Please arrive 10 minutes early.',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes: string;

  @ApiProperty({
    description: 'Status of the appointment',
    enum: AppointmentStatus,
    example: AppointmentStatus.PENDING,
  })
  @IsEnum(AppointmentStatus)
  status: AppointmentStatusType;

  @ApiProperty({
    description: 'Timestamp when the appointment was created',
    example: '2023-10-01T09:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the appointment was last updated',
    example: '2023-10-01T09:30:00Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Agent associated with the appointment',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID()
  agentId: string;

  @ApiProperty({
    description: 'Property associated with the appointment',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsUUID()
  propertyId: string;
}
