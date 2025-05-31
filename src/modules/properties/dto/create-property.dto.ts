import { IsNotEmpty, IsNumber, Min, Length, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePropertyDto {
  @ApiProperty({
    example: 'Modern Apartment in City Center',
    description: 'Property title',
  })
  @IsNotEmpty()
  @Length(5, 100)
  title: string;

  @ApiProperty({
    example: 'Beautiful modern apartment with great views',
    description: 'Property description',
  })
  @IsNotEmpty()
  @Length(10, 500)
  description: string;

  @ApiProperty({ example: 250000, description: 'Property price' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: '123 Main St', description: 'Property address' })
  @IsNotEmpty()
  @Length(5, 100)
  address: string;

  @ApiProperty({ example: 'Sofia', description: 'Property city' })
  @IsNotEmpty()
  @Length(2, 50)
  city: string;

  @ApiProperty({ example: 2, description: 'Number of bedrooms' })
  @IsNumber()
  @Min(0)
  bedrooms: number;

  @ApiProperty({ example: 2, description: 'Number of bathrooms' })
  @IsNumber()
  @Min(0)
  bathrooms: number;

  @ApiProperty({
    example: 120.5,
    description: 'Property area in square meters',
  })
  @IsNumber()
  @Min(0)
  area: number;

  @ApiProperty({ example: 'apartment', description: 'Type of property' })
  @IsNotEmpty()
  @Length(2, 20)
  propertyType: string;

  @ApiProperty({ example: true, description: 'Property availability status' })
  @IsOptional()
  isAvailable?: boolean;
}
