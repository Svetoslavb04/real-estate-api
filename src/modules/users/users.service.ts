import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async count(): Promise<number> {
    return this.usersRepository.count();
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.usersRepository.save(user);
  }

  async findAll(query: QueryUserDto) {
    const {
      page = 1,
      limit = 10,
      search,
      firstName,
      lastName,
      email,
      role,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.usersRepository
      .createQueryBuilder('user')
      .skip(skip)
      .take(limit);

    if (search) {
      queryBuilder.where(
        '(user.firstName LIKE :search OR user.lastName LIKE :search OR user.email LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (firstName) {
      queryBuilder.andWhere('user.firstName = :firstName', { firstName });
    }

    if (lastName) {
      queryBuilder.andWhere('user.lastName = :lastName', { lastName });
    }

    if (email) {
      queryBuilder.andWhere('user.email = :email', { email });
    }

    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('user.isActive = :isActive', { isActive });
    }

    // Add sorting
    const validSortFields = [
      'firstName',
      'lastName',
      'email',
      'role',
      'createdAt',
    ];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`user.${sortField}`, sortOrder);

    const [users, total] = await queryBuilder.getManyAndCount();

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({ where: { email } });
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<boolean> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
    return true;
  }
}
