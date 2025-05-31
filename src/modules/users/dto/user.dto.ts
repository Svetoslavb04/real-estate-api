import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, Length } from 'class-validator';
import { UserRole, UserRoleType } from '../../../entities/user.entity';

export class UserDto {
  @ApiProperty({
    description: 'Unique identifier for the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({ description: 'First name of the user', example: 'John' })
  @IsNotEmpty()
  @Length(2, 100)
  firstName: string;

  @ApiProperty({ description: 'Last name of the user', example: 'Doe' })
  @IsNotEmpty()
  @Length(2, 100)
  lastName: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'john.doe@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Phone number of the user',
    example: '+1234567890',
    required: false,
  })
  phone: string;

  @ApiProperty({
    description: 'Role of the user',
    example: 'CLIENT',
    enum: ['CLIENT', 'ADMIN', 'AGENT'],
  })
  @IsIn(Object.values(UserRole))
  role: UserRoleType;

  @ApiProperty({
    description: 'Date when the user was created',
    example: '2023-01-01T00:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the user was last updated',
    example: '2023-01-02T00:00:00Z',
  })
  updatedAt: Date;
}
