import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PropertyFeaturesService } from './property-features.service';
import { CreatePropertyFeatureDto } from './dto/create-property-feature.dto';
import { UpdatePropertyFeatureDto } from './dto/update-property-feature.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('property-features')
@Controller('properties/:propertyId/features')
@UseGuards(JwtAuthGuard)
export class PropertyFeaturesController {
  constructor(
    private readonly propertyFeaturesService: PropertyFeaturesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new property feature' })
  @ApiResponse({
    status: 201,
    description: 'The feature has been successfully created.',
  })
  create(
    @Param('propertyId') propertyId: string,
    @Body() createPropertyFeatureDto: CreatePropertyFeatureDto,
  ) {
    return this.propertyFeaturesService.create(
      propertyId,
      createPropertyFeatureDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all features for a property' })
  @ApiResponse({
    status: 200,
    description: 'Return all features for the property.',
  })
  findAll(@Param('propertyId') propertyId: string) {
    return this.propertyFeaturesService.findAll(propertyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific property feature' })
  @ApiResponse({ status: 200, description: 'Return the feature.' })
  findOne(@Param('id') id: string) {
    return this.propertyFeaturesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a property feature' })
  @ApiResponse({
    status: 200,
    description: 'The feature has been successfully updated.',
  })
  update(
    @Param('id') id: string,
    @Body() updatePropertyFeatureDto: UpdatePropertyFeatureDto,
  ) {
    return this.propertyFeaturesService.update(id, updatePropertyFeatureDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a property feature' })
  @ApiResponse({
    status: 200,
    description: 'The feature has been successfully deleted.',
  })
  remove(@Param('id') id: string) {
    return this.propertyFeaturesService.remove(id);
  }
}
