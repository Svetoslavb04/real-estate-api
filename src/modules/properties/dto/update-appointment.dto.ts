import {
  IsOptional,
  IsString,
  IsDateString,
  Length,
  Matches,
} from 'class-validator';

export class UpdateAppointmentDto {
  @IsOptional()
  @IsDateString()
  appointmentDate?: Date;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  clientName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, {
    message: 'Invalid email format',
  })
  clientEmail?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Invalid phone number format',
  })
  clientPhone?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  notes?: string;

  @IsOptional()
  @IsString()
  @Length(2, 20)
  status?: string;
}
