import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TestUtils } from './test.utils';
import { DataSource } from 'typeorm';
import { UserRole } from '../src/entities/user.entity';
import { PropertyType } from '../src/entities/property.entity';

describe('PropertiesController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let adminToken: string;
  let agentToken: string;
  let anotherAgentToken: string;
  let clientToken: string;
  let testPropertyId: string;

  const testProperty = {
    title: 'Modern Apartment in City Center',
    description: 'Beautiful modern apartment with great views',
    price: 250000,
    address: '123 Main St',
    city: 'Sofia',
    bedrooms: 2,
    bathrooms: 2,
    area: 120.5,
    propertyType: PropertyType.APARTMENT,
    isAvailable: true,
  };

  beforeEach(async () => {
    const { app: testApp, dataSource: testDataSource } =
      await TestUtils.createTestingApp();
    app = testApp;
    dataSource = testDataSource;

    // Create test users with different roles
    const adminUser = await TestUtils.createTestUser(app, {
      email: 'admin@example.com',
      password: 'password123',
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
    });
    adminToken = adminUser.token;

    const agentUser = await TestUtils.createTestUser(app, {
      email: 'agent@example.com',
      password: 'password123',
      firstName: 'Agent',
      lastName: 'User',
      role: UserRole.AGENT,
    });
    agentToken = agentUser.token;

    const anotherAgentUser = await TestUtils.createTestUser(app, {
      email: 'another-agent@example.com',
      password: 'password123',
      firstName: 'Another',
      lastName: 'Agent',
      role: UserRole.AGENT,
    });
    anotherAgentToken = anotherAgentUser.token;

    const clientUser = await TestUtils.createTestUser(app, {
      email: 'client@example.com',
      password: 'password123',
      firstName: 'Client',
      lastName: 'User',
      role: UserRole.CLIENT,
    });
    clientToken = clientUser.token;

    // Create a test property
    const propertyResponse = await request(app.getHttpServer())
      .post('/properties')
      .set('Authorization', `Bearer ${agentToken}`)
      .send(testProperty)
      .expect(201);

    testPropertyId = propertyResponse.body.id;
  });

  afterEach(async () => {
    await TestUtils.cleanupDatabase(dataSource);
    await app.close();
  });

  describe('Role-based access control', () => {
    describe('Admin role', () => {
      it('should allow admin to create properties', async () => {
        const response = await request(app.getHttpServer())
          .post('/properties')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(testProperty)
          .expect(201);

        expect(response.body).toBeDefined();
        expect(response.body.title).toBe(testProperty.title);
      });

      it('should allow admin to update any property', async () => {
        const updateData = {
          title: 'Updated by Admin',
          price: 300000,
        };

        const response = await request(app.getHttpServer())
          .patch(`/properties/${testPropertyId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.title).toBe(updateData.title);
        expect(response.body.price).toBe(updateData.price);
      });

      it('should allow admin to delete any property', async () => {
        await request(app.getHttpServer())
          .delete(`/properties/${testPropertyId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        await request(app.getHttpServer())
          .get(`/properties/${testPropertyId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(404);
      });
    });

    describe('Agent role', () => {
      it('should allow agent to create properties', async () => {
        const response = await request(app.getHttpServer())
          .post('/properties')
          .set('Authorization', `Bearer ${agentToken}`)
          .send(testProperty)
          .expect(201);

        expect(response.body).toBeDefined();
        expect(response.body.title).toBe(testProperty.title);
      });

      it('should allow agent to update their own properties', async () => {
        const updateData = {
          title: 'Updated by Agent',
          price: 275000,
        };

        const response = await request(app.getHttpServer())
          .patch(`/properties/${testPropertyId}`)
          .set('Authorization', `Bearer ${agentToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.title).toBe(updateData.title);
        expect(response.body.price).toBe(updateData.price);
      });

      it('should allow agent to delete their own properties', async () => {
        await request(app.getHttpServer())
          .delete(`/properties/${testPropertyId}`)
          .set('Authorization', `Bearer ${agentToken}`)
          .expect(200);

        await request(app.getHttpServer())
          .get(`/properties/${testPropertyId}`)
          .set('Authorization', `Bearer ${agentToken}`)
          .expect(404);
      });
    });

    describe('Client role', () => {
      it('should not allow client to create properties', async () => {
        await request(app.getHttpServer())
          .post('/properties')
          .set('Authorization', `Bearer ${clientToken}`)
          .send(testProperty)
          .expect(403);
      });

      it('should not allow client to update properties', async () => {
        await request(app.getHttpServer())
          .patch(`/properties/${testPropertyId}`)
          .set('Authorization', `Bearer ${clientToken}`)
          .send({ title: 'Updated by Client' })
          .expect(403);
      });

      it('should not allow client to delete properties', async () => {
        await request(app.getHttpServer())
          .delete(`/properties/${testPropertyId}`)
          .set('Authorization', `Bearer ${clientToken}`)
          .expect(403);
      });

      it('should allow client to view properties', async () => {
        const response = await request(app.getHttpServer())
          .get('/properties')
          .set('Authorization', `Bearer ${clientToken}`)
          .expect(200);

        expect(response.body.data).toBeDefined();
        expect(Array.isArray(response.body.data)).toBe(true);
      });

      it('should allow client to view individual properties', async () => {
        const response = await request(app.getHttpServer())
          .get(`/properties/${testPropertyId}`)
          .set('Authorization', `Bearer ${clientToken}`)
          .expect(200);

        expect(response.body).toBeDefined();
        expect(response.body.id).toBe(testPropertyId);
      });
    });
  });

  describe('Property ownership and access control', () => {
    describe('Property updates', () => {
      it('should allow the original agent to update their property', async () => {
        const updateData = {
          title: 'Updated by Original Agent',
          price: 275000,
        };

        const response = await request(app.getHttpServer())
          .patch(`/properties/${testPropertyId}`)
          .set('Authorization', `Bearer ${agentToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.title).toBe(updateData.title);
        expect(response.body.price).toBe(updateData.price);
      });

      it('should allow admin to update any property', async () => {
        const updateData = {
          title: 'Updated by Admin',
          price: 300000,
        };

        const response = await request(app.getHttpServer())
          .patch(`/properties/${testPropertyId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.title).toBe(updateData.title);
        expect(response.body.price).toBe(updateData.price);
      });

      it('should not allow another agent to update the property', async () => {
        const updateData = {
          title: 'Updated by Another Agent',
          price: 275000,
        };

        await request(app.getHttpServer())
          .patch(`/properties/${testPropertyId}`)
          .set('Authorization', `Bearer ${anotherAgentToken}`)
          .send(updateData)
          .expect(403);
      });

      it('should not allow client to update the property', async () => {
        const updateData = {
          title: 'Updated by Client',
          price: 275000,
        };

        await request(app.getHttpServer())
          .patch(`/properties/${testPropertyId}`)
          .set('Authorization', `Bearer ${clientToken}`)
          .send(updateData)
          .expect(403);
      });
    });

    describe('Property deletion', () => {
      it('should allow the original agent to delete their property', async () => {
        await request(app.getHttpServer())
          .delete(`/properties/${testPropertyId}`)
          .set('Authorization', `Bearer ${agentToken}`)
          .expect(200);

        await request(app.getHttpServer())
          .get(`/properties/${testPropertyId}`)
          .set('Authorization', `Bearer ${agentToken}`)
          .expect(404);
      });

      it('should allow admin to delete any property', async () => {
        // First create a new property to delete
        const propertyResponse = await request(app.getHttpServer())
          .post('/properties')
          .set('Authorization', `Bearer ${agentToken}`)
          .send(testProperty)
          .expect(201);

        const newPropertyId = propertyResponse.body.id;

        await request(app.getHttpServer())
          .delete(`/properties/${newPropertyId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        await request(app.getHttpServer())
          .get(`/properties/${newPropertyId}`)
          .set('Authorization', `Bearer ${clientToken}`)
          .expect(404);
      });

      it('should not allow another agent to delete the property', async () => {
        await request(app.getHttpServer())
          .delete(`/properties/${testPropertyId}`)
          .set('Authorization', `Bearer ${anotherAgentToken}`)
          .expect(403);

        // Verify property still exists
        await request(app.getHttpServer())
          .get(`/properties/${testPropertyId}`)
          .set('Authorization', `Bearer ${anotherAgentToken}`)
          .expect(200);
      });

      it('should not allow client to delete the property', async () => {
        await request(app.getHttpServer())
          .delete(`/properties/${testPropertyId}`)
          .set('Authorization', `Bearer ${clientToken}`)
          .expect(403);

        // Verify property still exists
        await request(app.getHttpServer())
          .get(`/properties/${testPropertyId}`)
          .set('Authorization', `Bearer ${clientToken}`)
          .expect(200);
      });
    });
  });

  describe('POST /properties', () => {
    it('should create a property when authenticated as agent', async () => {
      const response = await request(app.getHttpServer())
        .post('/properties')
        .set('Authorization', `Bearer ${agentToken}`)
        .send(testProperty)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.title).toBe(testProperty.title);
      expect(response.body.price).toBe(testProperty.price);
      expect(response.body.agent).toBeDefined();
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .post('/properties')
        .send(testProperty)
        .expect(401);
    });

    it('should return 403 when authenticated as non-agent', async () => {
      await request(app.getHttpServer())
        .post('/properties')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(testProperty)
        .expect(403);
    });

    it('should validate required fields', async () => {
      const invalidProperty = {
        title: 'Test',
        description: 'Test',
      };

      await request(app.getHttpServer())
        .post('/properties')
        .set('Authorization', `Bearer ${agentToken}`)
        .send(invalidProperty)
        .expect(400);
    });
  });

  describe('GET /properties', () => {
    it('should return all properties with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/properties')
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toBeDefined();
      expect(response.body.meta.total).toBeGreaterThan(0);
    });

    it('should filter properties by city', async () => {
      const response = await request(app.getHttpServer())
        .get('/properties')
        .set('Authorization', `Bearer ${agentToken}`)
        .query({ city: 'Sofia' })
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(
        response.body.data.every((property) => property.city === 'Sofia'),
      ).toBe(true);
    });

    it('should filter properties by price range', async () => {
      const response = await request(app.getHttpServer())
        .get('/properties')
        .set('Authorization', `Bearer ${agentToken}`)
        .query({ minPrice: 200000, maxPrice: 300000 })
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(
        response.body.data.every(
          (property) => property.price >= 200000 && property.price <= 300000,
        ),
      ).toBe(true);
    });

    it('should filter properties by property type', async () => {
      const response = await request(app.getHttpServer())
        .get('/properties')
        .set('Authorization', `Bearer ${agentToken}`)
        .query({ propertyType: PropertyType.APARTMENT })
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(
        response.body.data.every(
          (property) => property.propertyType === PropertyType.APARTMENT,
        ),
      ).toBe(true);
    });

    it('should search properties by title or description', async () => {
      const response = await request(app.getHttpServer())
        .get('/properties')
        .set('Authorization', `Bearer ${agentToken}`)
        .query({ search: 'modern' })
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(
        response.body.data.some(
          (property) =>
            property.title.toLowerCase().includes('modern') ||
            property.description.toLowerCase().includes('modern'),
        ),
      ).toBe(true);
    });
  });

  describe('GET /properties/:id', () => {
    it('should return property by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/properties/${testPropertyId}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.id).toBe(testPropertyId);
      expect(response.body.title).toBe(testProperty.title);
    });

    it('should return 404 for non-existent property', async () => {
      await request(app.getHttpServer())
        .get('/properties/non-existent-id')
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(404);
    });
  });

  describe('PATCH /properties/:id', () => {
    it('should update property when authenticated as agent', async () => {
      const updateData = {
        title: 'Updated Title',
        price: 275000,
      };

      const response = await request(app.getHttpServer())
        .patch(`/properties/${testPropertyId}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.title).toBe(updateData.title);
      expect(response.body.price).toBe(updateData.price);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .patch(`/properties/${testPropertyId}`)
        .send({ title: 'Updated Title' })
        .expect(401);
    });

    it('should return 403 when authenticated as non-agent', async () => {
      await request(app.getHttpServer())
        .patch(`/properties/${testPropertyId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ title: 'Updated Title' })
        .expect(403);
    });

    it('should return 404 for non-existent property', async () => {
      await request(app.getHttpServer())
        .patch('/properties/non-existent-id')
        .set('Authorization', `Bearer ${agentToken}`)
        .send({ title: 'Updated Title' })
        .expect(404);
    });

    it('should validate update data', async () => {
      const invalidData = {
        price: -1000,
        bedrooms: -1,
      };

      await request(app.getHttpServer())
        .patch(`/properties/${testPropertyId}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .send(invalidData)
        .expect(400);
    });
  });

  describe('DELETE /properties/:id', () => {
    it('should delete property when authenticated as agent', async () => {
      await request(app.getHttpServer())
        .delete(`/properties/${testPropertyId}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(200);

      // Verify property is deleted
      await request(app.getHttpServer())
        .get(`/properties/${testPropertyId}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(404);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .delete(`/properties/${testPropertyId}`)
        .expect(401);
    });

    it('should return 403 when authenticated as non-agent', async () => {
      await request(app.getHttpServer())
        .delete(`/properties/${testPropertyId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(403);
    });

    it('should return 404 for non-existent property', async () => {
      await request(app.getHttpServer())
        .delete('/properties/non-existent-id')
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(404);
    });
  });
});
