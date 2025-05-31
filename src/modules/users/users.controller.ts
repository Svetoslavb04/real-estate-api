import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { User } from '../../entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Return all users', type: [User] })
  findAll(@Query() query: QueryUserDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiResponse({ status: 200, description: 'Return the user', type: User })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.findOne(id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({
    status: 200,
    description: 'User successfully updated',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.usersService.update(id, updateUserDto);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 200, description: 'User successfully deleted' })
  @ApiResponse({ status: 404, description: 'User not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }
}
