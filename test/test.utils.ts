import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { UserRoleType } from '../src/entities/user.entity';

export interface TestUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRoleType;
}

export interface AuthResponse {
  token: string;
  email: string;
  firstName: string;
  lastName: string;
}

export class TestUtils {
  static async createTestingApp(): Promise<{
    app: INestApplication;
    dataSource: DataSource;
  }> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    const dataSource = moduleFixture.get<DataSource>(DataSource, {
      strict: false,
    });
    if (!dataSource) {
      throw new Error('DataSource not found in the module');
    }

    return { app, dataSource };
  }

  static async cleanupDatabase(dataSource: DataSource): Promise<void> {
    if (!dataSource) {
      throw new Error('DataSource is undefined');
    }

    const entities = dataSource.entityMetadatas;
    for (const entity of entities) {
      const repository = dataSource.getRepository(entity.name);
      await repository.clear();
    }
  }

  static async createTestUser(
    app: INestApplication,
    userData: TestUser,
  ): Promise<AuthResponse> {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
      })
      .expect(201);

    return response.body as AuthResponse;
  }

  static async loginTestUser(
    app: INestApplication,
    email: string,
    password: string,
  ): Promise<AuthResponse> {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email,
        password,
      })
      .expect(201);

    return response.body as AuthResponse;
  }
}

export const createTestUser = async (
  app: INestApplication,
  userData: TestUser,
): Promise<AuthResponse> => {
  const response = await request(app.getHttpServer())
    .post('/auth/register')
    .send({
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
    })
    .expect(201);

  return response.body as AuthResponse;
};

export const loginTestUser = async (
  app: INestApplication,
  email: string,
  password: string,
): Promise<AuthResponse> => {
  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send({
      email,
      password,
    })
    .expect(201);

  return response.body as AuthResponse;
};
