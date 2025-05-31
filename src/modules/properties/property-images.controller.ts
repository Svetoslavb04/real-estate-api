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
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PropertyImagesService } from './property-images.service';
import { CreatePropertyImageDto } from './dto/create-property-image.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { FileUploadInterceptor } from './interceptors/file-upload.interceptor';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('property-images')
@Controller('properties/:propertyId/images')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PropertyImagesController {
  constructor(private readonly propertyImagesService: PropertyImagesService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a new property image' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'The image has been successfully uploaded.',
  })
  @ApiResponse({
    status: 403,
    description:
      'You do not have permission to manage images for this property.',
  })
  @UseInterceptors(FileInterceptor('file'), FileUploadInterceptor)
  @HttpCode(HttpStatus.CREATED)
  uploadImage(
    @Param('propertyId') propertyId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() createPropertyImageDto: CreatePropertyImageDto,
    @Request() req,
  ) {
    if (!file) {
      throw new Error('No file uploaded');
    }
    return this.propertyImagesService.createWithBinary(
      propertyId,
      createPropertyImageDto,
      file.buffer,
      file.mimetype,
      req.user.id,
      req.user.role,
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
  @ApiOperation({ summary: 'Update image URL properties' })
  @ApiResponse({
    status: 200,
    description: 'The image URL properties have been successfully updated.',
  })
  @ApiResponse({
    status: 403,
    description: 'You do not have permission to update this image.',
  })
  update(
    @Param('id') id: string,
    @Body() updatePropertyImageDto: Partial<CreatePropertyImageDto>,
    @Request() req,
  ) {
    return this.propertyImagesService.updateUrlProperties(
      id,
      updatePropertyImageDto,
      req.user.id,
      req.user.role,
    );
  }

  @Post(':id/set-as-main')
  @ApiOperation({ summary: 'Set an image as the main image for the property' })
  @ApiResponse({
    status: 200,
    description: 'The image has been set as the main image.',
  })
  @ApiResponse({
    status: 403,
    description: 'You do not have permission to set this image as main.',
  })
  @HttpCode(HttpStatus.OK)
  setAsMain(@Param('id') id: string, @Request() req) {
    return this.propertyImagesService.setAsMain(id, req.user.id, req.user.role);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a property image' })
  @ApiResponse({
    status: 200,
    description: 'The image has been successfully deleted.',
  })
  @ApiResponse({
    status: 403,
    description: 'You do not have permission to delete this image.',
  })
  remove(@Param('id') id: string, @Request() req) {
    return this.propertyImagesService.remove(id, req.user.id, req.user.role);
  }
}
