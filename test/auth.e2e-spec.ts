import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { createTestUser } from './test.utils';

interface AuthResponse {
  token: string;
  email: string;
  firstName: string;
  lastName: string;
}

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userData)
        .expect(201);

      const authResponse = response.body as AuthResponse;
      expect(authResponse).toBeDefined();
      expect(authResponse.token).toBeDefined();
      expect(authResponse.email).toBe(userData.email);
      expect(authResponse.firstName).toBe(userData.firstName);
      expect(authResponse.lastName).toBe(userData.lastName);
    });

    it('should not register a user with existing email', async () => {
      const userData = {
        email: 'test2@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Doe',
      };

      await createTestUser(app, userData);

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(userData)
        .expect(409);
    });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const userData = {
        email: 'test3@example.com',
        password: 'password123',
        firstName: 'Bob',
        lastName: 'Smith',
      };

      await createTestUser(app, userData);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: userData.email,
          password: userData.password,
        })
        .expect(201);

      const authResponse = response.body as AuthResponse;
      expect(authResponse).toBeDefined();
      expect(authResponse.token).toBeDefined();
      expect(authResponse.email).toBe(userData.email);
    });

    it('should not login with invalid credentials', async () => {
      const userData = {
        email: 'test4@example.com',
        password: 'password123',
        firstName: 'Alice',
        lastName: 'Johnson',
      };

      await createTestUser(app, userData);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: userData.email,
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });
});
