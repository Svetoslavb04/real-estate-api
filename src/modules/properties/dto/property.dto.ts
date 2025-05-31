import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Min, Length } from 'class-validator';

export const PropertyType = {
  HOUSE: 'house',
  APARTMENT: 'apartment',
  CONDO: 'condo',
  TOWNHOUSE: 'townhouse',
  LAND: 'land',
  COMMERCIAL: 'commercial',
} as const;

export type PropertyTypeType = (typeof PropertyType)[keyof typeof PropertyType];

export class PropertyDto {
  @ApiProperty({
    description: 'Unique identifier for the property',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Title of the property',
    example: 'Beautiful Family Home',
  })
  @IsNotEmpty()
  @Length(5, 100)
  title: string;

  @ApiProperty({
    description: 'Description of the property',
    example: 'A spacious 4-bedroom home with a large backyard.',
  })
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Price of the property', example: 250000.0 })
  @IsNotEmpty()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Address of the property',
    example: '123 Main St',
  })
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    description: 'City where the property is located',
    example: 'Los Angeles',
  })
  @IsNotEmpty()
  city: string;

  @ApiProperty({
    description: 'Number of bedrooms in the property',
    example: 4,
  })
  @IsNotEmpty()
  @Min(0)
  bedrooms: number;

  @ApiProperty({
    description: 'Number of bathrooms in the property',
    example: 3,
  })
  @IsNotEmpty()
  @Min(0)
  bathrooms: number;

  @ApiProperty({
    description: 'Area of the property in square feet',
    example: 2000.5,
  })
  @IsNotEmpty()
  @Min(0)
  area: number;

  @ApiProperty({
    description: 'Type of the property',
    enum: PropertyType,
    example: 'house',
  })
  @IsNotEmpty()
  propertyType: PropertyTypeType;

  @ApiProperty({
    description: 'Availability status of the property',
    example: true,
  })
  isAvailable: boolean;

  @ApiProperty({
    description: 'Date when the property was created',
    example: '2023-01-01T00:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the property was last updated',
    example: '2023-01-02T00:00:00Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Agent responsible for the property',
    example: { id: '123e4567-e89b-12d3-a456-426614174001', name: 'John Doe' },
  })
  agent: any;

  @ApiProperty({
    description: 'List of appointments for the property',
    example: [],
  })
  appointments: any[];
}
