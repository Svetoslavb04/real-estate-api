import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
  Length,
} from 'class-validator';
import {
  PropertyFeatureCategory,
  PropertyFeatureCategoryType,
} from '../../../entities/property-feature.entity';

export class CreatePropertyFeatureDto {
  @IsNotEmpty()
  @IsString()
  @Length(2, 50)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsEnum(PropertyFeatureCategory)
  category: PropertyFeatureCategoryType;

  @IsOptional()
  @IsBoolean()
  isHighlight?: boolean;

  @IsOptional()
  @IsNumber()
  value?: number;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  unit?: string;
}
