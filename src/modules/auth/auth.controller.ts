import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../../entities/user.entity';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'User registration',
    description:
      'Registers a new user in the system. The user must provide a valid email, password, and other required details.',
  })
  @ApiResponse({
    status: 201,
    description:
      'User successfully registered. Returns the created user object.',
    type: User,
  })
  @ApiResponse({
    status: 409,
    description:
      'Email already exists. This error occurs when the provided email is already registered in the system.',
  })
  @ApiBody({
    description: 'The data required to create a new user.',
    type: CreateUserDto,
  })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'User login',
    description:
      'Authenticates a user with their email and password. Returns a JWT token if the credentials are valid.',
  })
  @ApiResponse({
    status: 200,
    description:
      'User successfully logged in. Returns a JWT token and user details.',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 1,
          email: 'user@example.com',
          name: 'John Doe',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description:
      'Invalid credentials. This error occurs when the provided email or password is incorrect.',
  })
  @ApiBody({
    description: 'The login credentials of the user.',
    type: LoginDto,
  })
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }
}
