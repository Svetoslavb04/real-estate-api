import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { QueryPropertyDto } from './dto/query-property.dto';
import { Property } from '../../entities/property.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('properties')
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new property' })
  @ApiResponse({
    status: 201,
    description: 'Property successfully created',
    type: Property,
  })
  create(@Body() createPropertyDto: CreatePropertyDto, @Request() req) {
    return this.propertiesService.create(createPropertyDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all properties with filtering and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Return all properties',
    type: [Property],
  })
  findAll(@Query() query: QueryPropertyDto) {
    return this.propertiesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a property by id' })
  @ApiResponse({
    status: 200,
    description: 'Return the property',
    type: Property,
  })
  @ApiResponse({ status: 404, description: 'Property not found' })
  findOne(@Param('id') id: string) {
    return this.propertiesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a property' })
  @ApiResponse({
    status: 200,
    description: 'Property successfully updated',
    type: Property,
  })
  @ApiResponse({ status: 404, description: 'Property not found' })
  update(
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
  ) {
    return this.propertiesService.update(id, updatePropertyDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a property' })
  @ApiResponse({ status: 200, description: 'Property successfully deleted' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  remove(@Param('id') id: string) {
    return this.propertiesService.remove(id);
  }
}
