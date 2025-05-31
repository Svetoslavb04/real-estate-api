import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TestApp, TestUtils } from './test.utils';
import { DataSource } from 'typeorm';
import { UserRole } from '../src/entities/user.entity';

describe('UsersController (e2e)', () => {
  let testApp: TestApp;
  let app: INestApplication;
  let dataSource: DataSource;
  let adminToken: string;
  let agentToken: string;

  beforeEach(async () => {
    testApp = await TestUtils.createTestingApp();
    app = testApp.app;
    dataSource = testApp.dataSource;

    // Create test users with different roles
    const adminUser = await TestUtils.createTestUser(testApp, {
      email: 'admin@example.com',
      password: 'password123',
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
    });
    adminToken = adminUser.token;

    const agentUser = await TestUtils.createTestUser(testApp, {
      email: 'agent@example.com',
      password: 'password123',
      firstName: 'Agent',
      lastName: 'User',
      role: UserRole.AGENT,
    });
    agentToken = agentUser.token;
  });

  afterEach(async () => {
    await TestUtils.cleanupDatabase(dataSource);
    await app.close();
  });

  describe('GET /users', () => {
    it('should return all users when authenticated as admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toBeDefined();
      expect(response.body.meta.total).toBeGreaterThan(0);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer()).get('/users').expect(401);
    });

    it('should filter users by role', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .query({ role: UserRole.AGENT })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(
        response.body.data.every((user) => user.role === UserRole.AGENT),
      ).toBe(true);
    });

    it('should search users by name or email', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .query({ search: 'agent' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(
        response.body.data.some(
          (user) =>
            user.email.includes('agent') ||
            user.firstName.includes('agent') ||
            user.lastName.includes('agent'),
        ),
      ).toBe(true);
    });
  });

  describe('GET /users/:id', () => {
    it('should return user by id when authenticated as admin', async () => {
      // First get all users to get an ID
      const usersResponse = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const userId = usersResponse.body.data[0].id;

      const response = await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.id).toBe(userId);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer()).get('/users/123').expect(401);
    });

    it('should return 404 for non-existent user', async () => {
      await request(app.getHttpServer())
        .get('/users/470b3195-403e-4f4e-a762-23a6ef1b49c2')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('PATCH /users/:id', () => {
    it('should update user when authenticated as admin', async () => {
      // First get all users to get an ID
      const usersResponse = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const userId = usersResponse.body.data[0].id;

      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        phone: '+359888123456',
      };

      const response = await request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.firstName).toBe(updateData.firstName);
      expect(response.body.lastName).toBe(updateData.lastName);
      expect(response.body.phone).toBe(updateData.phone);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .patch('/users/123')
        .send({ firstName: 'Updated' })
        .expect(401);
    });

    it('should return 403 when authenticated as non-admin', async () => {
      await request(app.getHttpServer())
        .patch('/users/123')
        .set('Authorization', `Bearer ${agentToken}`)
        .send({ firstName: 'Updated' })
        .expect(403);
    });

    it('should return 404 for non-existent user', async () => {
      await request(app.getHttpServer())
        .patch('/users/470b3195-403e-4f4e-a762-23a6ef1b49c2')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ firstName: 'Updated' })
        .expect(404);
    });

    it('should validate update data', async () => {
      // First get all users to get an ID
      const usersResponse = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const userId = usersResponse.body.data[0].id;

      const invalidData = {
        email: 'invalid-email',
        phone: 'invalid-phone',
      };

      await request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete user when authenticated as admin', async () => {
      // First get all users to get an ID
      const usersResponse = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const userId = usersResponse.body.data[0].id;

      await request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verify user is deleted
      await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer()).delete('/users/123').expect(401);
    });

    it('should return 403 when authenticated as non-admin', async () => {
      await request(app.getHttpServer())
        .delete('/users/123')
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(403);
    });

    it('should return 404 for non-existent user', async () => {
      await request(app.getHttpServer())
        .delete('/users/470b3195-403e-4f4e-a762-23a6ef1b49c2')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});
