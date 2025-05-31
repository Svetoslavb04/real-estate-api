import {
  IsEmail,
  IsOptional,
  Length,
  IsPhoneNumber,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole, UserRoleType } from '../../../entities/user.entity';

export class UpdateUserDto {
  @ApiProperty({
    example: 'John',
    description: 'User first name',
    required: false,
  })
  @IsOptional()
  @Length(2, 50)
  firstName?: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User last name',
    required: false,
  })
  @IsOptional()
  @Length(2, 50)
  lastName?: string;

  @ApiProperty({
    example: 'john@example.com',
    description: 'User email',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: '+359888123456',
    description: 'User phone number',
    required: false,
  })
  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;

  @ApiProperty({
    example: 'agent',
    description: 'User role',
    enum: Object.values(UserRole),
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRoleType;

  @ApiProperty({
    example: 'Experienced real estate agent',
    description: 'User description',
    required: false,
  })
  @IsOptional()
  description?: string;
}
