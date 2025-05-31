import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Res,
  UseFilters,
} from '@nestjs/common';
import { PropertyImagesService } from './property-images.service';
import { CreatePropertyImageDto } from './dto/create-property-image.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { FileUploadInterceptor } from './interceptors/file-upload.interceptor';

@ApiTags('property-images')
@Controller('properties/:propertyId/images')
@UseGuards(JwtAuthGuard)
export class PropertyImagesController {
  constructor(private readonly propertyImagesService: PropertyImagesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new property image' })
  @ApiResponse({
    status: 201,
    description: 'The image has been successfully created.',
  })
  create(
    @Param('propertyId') propertyId: string,
    @Body() createPropertyImageDto: CreatePropertyImageDto,
  ) {
    return this.propertyImagesService.create(
      propertyId,
      createPropertyImageDto,
    );
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload a new property image (binary)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @UseFilters(FileUploadInterceptor)
  uploadImage(
    @Param('propertyId') propertyId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() createPropertyImageDto: CreatePropertyImageDto,
  ) {
    if (!file) {
      throw new Error('No file uploaded');
    }
    return this.propertyImagesService.createWithBinary(
      propertyId,
      createPropertyImageDto,
      file.buffer,
      file.mimetype,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all images for a property' })
  @ApiResponse({
    status: 200,
    description: 'Return all images for the property.',
  })
  findAll(@Param('propertyId') propertyId: string) {
    return this.propertyImagesService.findAll(propertyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific property image' })
  @ApiResponse({ status: 200, description: 'Return the image.' })
  findOne(@Param('id') id: string) {
    return this.propertyImagesService.findOne(id);
  }

  @Get(':id/data')
  @ApiOperation({ summary: 'Get the binary data of a property image' })
  async getImageData(@Param('id') id: string, @Res() res: Response) {
    const image = await this.propertyImagesService.findOne(id);
    res.set('Content-Type', image.mimeType || 'image/jpeg');
    res.send(image.data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a property image' })
  @ApiResponse({
    status: 200,
    description: 'The image has been successfully updated.',
  })
  update(
    @Param('id') id: string,
    @Body() updatePropertyImageDto: Partial<CreatePropertyImageDto>,
  ) {
    return this.propertyImagesService.update(id, updatePropertyImageDto);
  }

  @Post(':id/set-as-main')
  @ApiOperation({ summary: 'Set an image as the main image for the property' })
  @ApiResponse({
    status: 200,
    description: 'The image has been set as the main image.',
  })
  setAsMain(@Param('id') id: string) {
    return this.propertyImagesService.setAsMain(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a property image' })
  @ApiResponse({
    status: 200,
    description: 'The image has been successfully deleted.',
  })
  remove(@Param('id') id: string) {
    return this.propertyImagesService.remove(id);
  }
}
