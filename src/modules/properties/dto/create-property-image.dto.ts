import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUrl,
  IsInt,
  IsBoolean,
  Min,
  Length,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePropertyImageDto {
  @ApiProperty({ description: 'URL of the image' })
  @IsNotEmpty()
  @IsString()
  @IsUrl()
  url: string;

  @ApiProperty({ description: 'Title of the image' })
  @IsNotEmpty()
  @IsString()
  @Length(2, 100)
  title: string;

  @ApiProperty({ description: 'Description of the image', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Display order of the image', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @ApiProperty({
    description: 'Whether this is the main image',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isMain?: boolean;
}
