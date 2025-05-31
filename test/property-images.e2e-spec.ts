import { DataSource } from 'typeorm';
import { INestApplication } from '@nestjs/common';
import { TestUtils, TestApp, TestUser } from './test.utils';
import { PropertyType } from '../src/entities/property.entity';
import { PropertyImage } from '../src/entities/property-image.entity';
import { UserRole } from '../src/entities/user.entity';

describe('Property Images (e2e)', () => {
  let testApp: TestApp;
  let app: INestApplication;
  let dataSource: DataSource;

  let testProperty: any;
  let testImage: PropertyImage;
  let testImageBuffer: Buffer;

  beforeAll(async () => {
    testImageBuffer = Buffer.from('fake-image-data');
  });

  afterEach(async () => {
    await TestUtils.cleanupDatabase(dataSource);
    await app.close();
  });

  beforeEach(async () => {
    testApp = await TestUtils.createTestingApp();
    app = testApp.app;
    dataSource = testApp.dataSource;

    // Create test users
    const agentData: TestUser = {
      email: 'agent@test.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'Agent',
      role: UserRole.AGENT,
    };
    const clientData: TestUser = {
      email: 'client@test.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'Client',
      role: UserRole.CLIENT,
    };
    const adminData: TestUser = {
      email: 'admin@test.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'Admin',
      role: UserRole.ADMIN,
    };

    await TestUtils.createTestUser(testApp, adminData);
    await TestUtils.createTestUser(testApp, agentData);
    await TestUtils.createTestUser(testApp, clientData);

    // Create a test property
    const agent = await TestUtils.loginTestUser(
      testApp,
      'agent@test.com',
      'password123',
    );

    const propertyResponse = await testApp.httpServer
      .post('/properties')
      .set('Authorization', `Bearer ${agent.token}`)
      .send({
        title: 'Test Property',
        description: 'Test Description',
        price: 100000,
        address: '123 Test St',
        city: 'Test City',
        propertyType: PropertyType.HOUSE,
        isAvailable: true,
        bedrooms: 3,
        bathrooms: 2,
        area: 1500,
      });

    testProperty = propertyResponse.body;
  });

  describe('Image Upload', () => {
    it('should allow property owner to upload an image', async () => {
      const agent = await TestUtils.loginTestUser(
        testApp,
        'agent@test.com',
        'password123',
      );

      const response = await testApp.httpServer
        .post(`/properties/${testProperty.id}/images/upload`)
        .set('Authorization', `Bearer ${agent.token}`)
        .attach('file', testImageBuffer, {
          filename: 'test.jpg',
          contentType: 'image/jpeg',
        })
        .field('title', 'Test Image');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Test Image');
      expect(response.body.mimeType).toBe('image/jpeg');
      expect(response.body.data).toBeDefined();

      testImage = response.body;
    });

    it('should not allow non-owner to upload an image', async () => {
      const client = await TestUtils.loginTestUser(
        testApp,
        'client@test.com',
        'password123',
      );

      const response = await testApp.httpServer
        .post(`/properties/${testProperty.id}/images/upload`)
        .set('Authorization', `Bearer ${client.token}`)
        .attach('file', testImageBuffer, {
          filename: 'test.jpg',
          contentType: 'image/jpeg',
        })
        .field('title', 'Test Image');

      expect(response.status).toBe(403);
    });

    it('should allow admin to upload an image', async () => {
      const admin = await TestUtils.loginTestUser(
        testApp,
        'admin@test.com',
        'password123',
      );

      const response = await testApp.httpServer
        .post(`/properties/${testProperty.id}/images/upload`)
        .set('Authorization', `Bearer ${admin.token}`)
        .attach('file', testImageBuffer, {
          filename: 'test.jpg',
          contentType: 'image/jpeg',
        })
        .field('title', 'Test Image');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });

    it('should validate required fields', async () => {
      const agent = await TestUtils.loginTestUser(
        testApp,
        'agent@test.com',
        'password123',
      );

      const response = await testApp.httpServer
        .post(`/properties/${testProperty.id}/images/upload`)
        .set('Authorization', `Bearer ${agent.token}`)
        .field('title', '');

      expect(response.status).toBe(400);
    });
  });

  describe('Image Retrieval', () => {
    beforeEach(async () => {
      const agent = await TestUtils.loginTestUser(
        testApp,
        'agent@test.com',
        'password123',
      );

      const response = await testApp.httpServer
        .post(`/properties/${testProperty.id}/images/upload`)
        .set('Authorization', `Bearer ${agent.token}`)
        .attach('file', testImageBuffer, {
          filename: 'test.jpg',
          contentType: 'image/jpeg',
        })
        .field('title', 'Test Image');

      testImage = response.body;
    });

    it('should get all images for a property', async () => {
      const agent = await TestUtils.loginTestUser(
        testApp,
        'agent@test.com',
        'password123',
      );

      const response = await testApp.httpServer
        .get(`/properties/${testProperty.id}/images`)
        .set('Authorization', `Bearer ${agent.token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('title');
    });

    it('should get a specific image', async () => {
      const agent = await TestUtils.loginTestUser(
        testApp,
        'agent@test.com',
        'password123',
      );

      const response = await testApp.httpServer
        .get(`/properties/${testProperty.id}/images/${testImage.id}`)
        .set('Authorization', `Bearer ${agent.token}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(testImage.id);
      expect(response.body.title).toBe('Test Image');
    });

    it('should get image binary data', async () => {
      const agent = await TestUtils.loginTestUser(
        testApp,
        'agent@test.com',
        'password123',
      );

      const response = await testApp.httpServer
        .get(`/properties/${testProperty.id}/images/${testImage.id}/data`)
        .set('Authorization', `Bearer ${agent.token}`);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('image/jpeg');
      expect(Buffer.isBuffer(response.body)).toBe(true);
    });
  });

  describe('Image Updates', () => {
    beforeEach(async () => {
      const agent = await TestUtils.loginTestUser(
        testApp,
        'agent@test.com',
        'password123',
      );

      const response = await testApp.httpServer
        .post(`/properties/${testProperty.id}/images/upload`)
        .set('Authorization', `Bearer ${agent.token}`)
        .attach('file', testImageBuffer, {
          filename: 'test.jpg',
          contentType: 'image/jpeg',
        })
        .field('title', 'Test Image');

      testImage = response.body;
    });

    it('should allow owner to update URL properties', async () => {
      const agent = await TestUtils.loginTestUser(
        testApp,
        'agent@test.com',
        'password123',
      );

      const response = await testApp.httpServer
        .patch(`/properties/${testProperty.id}/images/${testImage.id}`)
        .set('Authorization', `Bearer ${agent.token}`)
        .send({
          title: 'Updated Title',
          altText: 'Updated Alt Text',
          url: 'https://example.com/updated.jpg',
        });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Updated Title');
      expect(response.body.altText).toBe('Updated Alt Text');
      expect(response.body.url).toBe('https://example.com/updated.jpg');
    });

    it('should not allow updating non-URL properties', async () => {
      const agent = await TestUtils.loginTestUser(
        testApp,
        'agent@test.com',
        'password123',
      );

      const response = await testApp.httpServer
        .patch(`/properties/${testProperty.id}/images/${testImage.id}`)
        .set('Authorization', `Bearer ${agent.token}`)
        .send({
          mimeType: 'image/png',
          data: 'new-data',
        });

      expect(response.status).toBe(400);
    });

    it('should not allow non-owner to update image', async () => {
      const client = await TestUtils.loginTestUser(
        testApp,
        'client@test.com',
        'password123',
      );

      const response = await testApp.httpServer
        .patch(`/properties/${testProperty.id}/images/${testImage.id}`)
        .set('Authorization', `Bearer ${client.token}`)
        .send({
          title: 'Updated Title',
        });

      expect(response.status).toBe(403);
    });
  });

  describe('Main Image Management', () => {
    let secondImage: PropertyImage;

    beforeEach(async () => {
      const agent = await TestUtils.loginTestUser(
        testApp,
        'agent@test.com',
        'password123',
      );

      // Upload first image
      const response1 = await testApp.httpServer
        .post(`/properties/${testProperty.id}/images/upload`)
        .set('Authorization', `Bearer ${agent.token}`)
        .attach('file', testImageBuffer, {
          filename: 'test1.jpg',
          contentType: 'image/jpeg',
        })
        .field('title', 'First Image');

      testImage = response1.body;

      // Upload second image
      const response2 = await testApp.httpServer
        .post(`/properties/${testProperty.id}/images/upload`)
        .set('Authorization', `Bearer ${agent.token}`)
        .attach('file', testImageBuffer, {
          filename: 'test2.jpg',
          contentType: 'image/jpeg',
        })
        .field('title', 'Second Image');

      secondImage = response2.body;
    });

    it('should allow owner to set main image', async () => {
      const agent = await TestUtils.loginTestUser(
        testApp,
        'agent@test.com',
        'password123',
      );

      const response = await testApp.httpServer
        .post(
          `/properties/${testProperty.id}/images/${secondImage.id}/set-as-main`,
        )
        .set('Authorization', `Bearer ${agent.token}`);

      expect(response.status).toBe(200);
      expect(response.body.isMain).toBe(true);

      // Verify other image is no longer main
      const imagesResponse = await testApp.httpServer
        .get(`/properties/${testProperty.id}/images`)
        .set('Authorization', `Bearer ${agent.token}`);

      const images = imagesResponse.body;
      const firstImage = images.find((img) => img.id === testImage.id);
      expect(firstImage.isMain).toBe(false);
    });

    it('should not allow non-owner to set main image', async () => {
      const client = await TestUtils.loginTestUser(
        testApp,
        'client@test.com',
        'password123',
      );

      const response = await testApp.httpServer
        .post(
          `/properties/${testProperty.id}/images/${secondImage.id}/set-as-main`,
        )
        .set('Authorization', `Bearer ${client.token}`);

      expect(response.status).toBe(403);
    });
  });

  describe('Image Deletion', () => {
    beforeEach(async () => {
      const agent = await TestUtils.loginTestUser(
        testApp,
        'agent@test.com',
        'password123',
      );

      const response = await testApp.httpServer
        .post(`/properties/${testProperty.id}/images/upload`)
        .set('Authorization', `Bearer ${agent.token}`)
        .attach('file', testImageBuffer, {
          filename: 'test.jpg',
          contentType: 'image/jpeg',
        })
        .field('title', 'Test Image');

      testImage = response.body;
    });

    it('should allow owner to delete image', async () => {
      const agent = await TestUtils.loginTestUser(
        testApp,
        'agent@test.com',
        'password123',
      );

      const response = await testApp.httpServer
        .delete(`/properties/${testProperty.id}/images/${testImage.id}`)
        .set('Authorization', `Bearer ${agent.token}`);

      expect(response.status).toBe(200);

      // Verify image is deleted
      const getResponse = await testApp.httpServer
        .get(`/properties/${testProperty.id}/images/${testImage.id}`)
        .set('Authorization', `Bearer ${agent.token}`);

      expect(getResponse.status).toBe(404);
    });

    it('should not allow non-owner to delete image', async () => {
      const client = await TestUtils.loginTestUser(
        testApp,
        'client@test.com',
        'password123',
      );

      const response = await testApp.httpServer
        .delete(`/properties/${testProperty.id}/images/${testImage.id}`)
        .set('Authorization', `Bearer ${client.token}`);

      expect(response.status).toBe(403);
    });

    it('should allow admin to delete image', async () => {
      const admin = await TestUtils.loginTestUser(
        testApp,
        'admin@test.com',
        'password123',
      );

      const response = await testApp.httpServer
        .delete(`/properties/${testProperty.id}/images/${testImage.id}`)
        .set('Authorization', `Bearer ${admin.token}`);

      expect(response.status).toBe(200);
    });
  });
});
