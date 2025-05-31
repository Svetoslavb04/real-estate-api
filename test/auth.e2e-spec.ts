import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestUser, TestUtils } from './test.utils';
import { DataSource } from 'typeorm';

interface AuthResponse {
  token: string;
  email: string;
  firstName: string;
  lastName: string;
}

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeEach(async () => {
    const { app: testApp, dataSource: testDataSource } =
      await TestUtils.createTestingApp();
    app = testApp;
    dataSource = testDataSource;
  });

  afterEach(async () => {
    await TestUtils.cleanupDatabase(dataSource);
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
        .expect(400);
    });

    it('should not register with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(userData)
        .expect(400);
    });

    it('should not register with missing required fields', async () => {
      const userData = {
        email: 'test3@example.com',
        password: 'password123',
        // Missing firstName and lastName
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(userData)
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const userData = {
        email: 'test5@example.com',
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
        .expect(200);

      const authResponse = response.body as AuthResponse;
      expect(authResponse).toBeDefined();
      expect(authResponse.token).toBeDefined();
      expect(authResponse.email).toBe(userData.email);
    });

    it('should not login with invalid credentials', async () => {
      const userData = {
        email: 'test6@example.com',
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

    it('should not login with non-existent email', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);
    });

    it('should not login with missing fields', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test7@example.com',
          // Missing password
        })
        .expect(400);
    });
  });
});
