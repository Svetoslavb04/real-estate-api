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
  ParseUUIDPipe,
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
import { UserRole } from '../../entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PropertyDto } from './dto/property.dto';

@ApiTags('properties')
@Controller('properties')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new property' })
  @ApiResponse({
    status: 201,
    description: 'Property successfully created',
    type: PropertyDto,
  })
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  create(@Body() createPropertyDto: CreatePropertyDto, @Request() req) {
    return this.propertiesService.create(createPropertyDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all properties with filtering and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Return all properties',
    type: [PropertyDto],
  })
  findAll(@Query() query: QueryPropertyDto) {
    return this.propertiesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a property by id' })
  @ApiResponse({
    status: 200,
    description: 'Return the property',
    type: PropertyDto,
  })
  @ApiResponse({ status: 404, description: 'Property not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.propertiesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a property' })
  @ApiResponse({
    status: 200,
    description: 'Property successfully updated',
    type: PropertyDto,
  })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not authorized to update this property',
  })
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
    @Request() req,
  ) {
    return this.propertiesService.update(
      id,
      updatePropertyDto,
      req.user.id,
      req.user.role,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a property' })
  @ApiResponse({ status: 200, description: 'Property successfully deleted' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not authorized to delete this property',
  })
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.propertiesService.remove(id, req.user.id, req.user.role);
  }
}
