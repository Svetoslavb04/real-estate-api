import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User, UserRole } from '../../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    // Check if this is the first user
    const userCount = await this.usersService.count();

    // Only allow admin role for the first user
    if (userCount === 0) {
      createUserDto.role = UserRole.ADMIN;
    } else if (createUserDto.role === UserRole.ADMIN) {
      throw new ForbiddenException('Cannot register as admin');
    }

    // Check if email already exists
    const existingUser = await this.usersService.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const user = await this.usersService.create(createUserDto);
    const payload = { email: user.email, sub: user.id };
    return {
      token: this.jwtService.sign(payload),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  }

  async login(email: string, password: string) {
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id };
    return {
      token: this.jwtService.sign(payload),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }
}
