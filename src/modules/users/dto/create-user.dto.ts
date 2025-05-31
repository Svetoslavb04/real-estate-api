import {
  IsEmail,
  IsNotEmpty,
  Length,
  IsPhoneNumber,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole, UserRoleType } from '../../../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'John', description: 'User first name' })
  @IsNotEmpty()
  @Length(2, 50)
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'User last name' })
  @IsNotEmpty()
  @Length(2, 50)
  lastName: string;

  @ApiProperty({ example: 'john@example.com', description: 'User email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123', description: 'User password' })
  @IsNotEmpty()
  @Length(6, 100)
  password: string;

  @ApiProperty({ example: '+359888123456', description: 'User phone number' })
  @IsPhoneNumber()
  phoneNumber: string;

  @ApiProperty({
    example: 'agent',
    description: 'User role',
    enum: Object.values(UserRole),
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRoleType;

  @ApiProperty({
    example: 'Experienced real estate agent',
    description: 'User description',
  })
  @IsOptional()
  description?: string;
}
