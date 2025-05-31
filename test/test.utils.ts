import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { UserRoleType } from '../src/entities/user.entity';
import TestAgent from 'supertest/lib/agent';

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

export interface TestApp {
  app: INestApplication;
  dataSource: DataSource;
  httpServer: TestAgent;
}

export class TestUtils {
  static async createTestingApp(): Promise<TestApp> {
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

    const httpServer = request(app.getHttpServer());

    return { app, dataSource, httpServer };
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
    testApp: TestApp,
    userData: TestUser,
  ): Promise<AuthResponse> {
    const response = await testApp.httpServer
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
    testApp: TestApp,
    email: string,
    password: string,
  ): Promise<AuthResponse> {
    const response = await testApp.httpServer
      .post('/auth/login')
      .send({
        email,
        password,
      })
      .expect(201);

    return response.body as AuthResponse;
  }
}
