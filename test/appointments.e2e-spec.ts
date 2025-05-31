import { TestUtils, TestApp } from './test.utils';
import { UserRole } from '../src/entities/user.entity';
import { PropertyType } from '../src/entities/property.entity';
import { AppointmentStatus } from '../src/entities/appointment.entity';

describe('AppointmentsController (e2e)', () => {
  let testApp: TestApp;
  let adminToken: string;
  let agentToken: string;
  let anotherAgentToken: string;
  let clientToken: string;
  let testPropertyId: string;
  let testAppointmentId: string;

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

  const testAppointment = {
    appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    durationMinutes: 60,
    clientName: 'John Doe',
    clientEmail: 'john@example.com',
    clientPhone: '+359888123456',
    notes: 'Interested in viewing the property',
    status: AppointmentStatus.PENDING,
  };

  beforeEach(async () => {
    testApp = await TestUtils.createTestingApp();

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

    const anotherAgentUser = await TestUtils.createTestUser(testApp, {
      email: 'another-agent@example.com',
      password: 'password123',
      firstName: 'Another',
      lastName: 'Agent',
      role: UserRole.AGENT,
    });
    anotherAgentToken = anotherAgentUser.token;

    const clientUser = await TestUtils.createTestUser(testApp, {
      email: 'client@example.com',
      password: 'password123',
      firstName: 'Client',
      lastName: 'User',
      role: UserRole.CLIENT,
    });
    clientToken = clientUser.token;

    // Create a test property
    const propertyResponse = await testApp.httpServer
      .post('/properties')
      .set('Authorization', `Bearer ${agentToken}`)
      .send(testProperty)
      .expect(201);

    testPropertyId = propertyResponse.body.id;

    // Create a test appointment
    const appointmentResponse = await testApp.httpServer
      .post(`/properties/${testPropertyId}/appointments`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        ...testAppointment,
        appointmentDate: new Date(
          Date.now() + 68 * 60 * 60 * 1000,
        ).toISOString(), // Day after tomorrow
      })
      .expect(201);

    testAppointmentId = appointmentResponse.body.id;
  });

  afterEach(async () => {
    await TestUtils.cleanupDatabase(testApp.dataSource);
    await testApp.app.close();
  });

  describe('Appointment creation', () => {
    it('should allow client to create an appointment', async () => {
      const newAppointment = {
        ...testAppointment,
        appointmentDate: new Date(
          Date.now() + 72 * 60 * 60 * 1000,
        ).toISOString(), // 3 days from now
      };

      const response = await testApp.httpServer
        .post(`/properties/${testPropertyId}/appointments`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send(newAppointment)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.clientName).toBe(newAppointment.clientName);
      expect(response.body.clientEmail).toBe(newAppointment.clientEmail);
    });

    it('should allow agent to create an appointment', async () => {
      const newAppointment = {
        ...testAppointment,
        appointmentDate: new Date(
          Date.now() + 96 * 60 * 60 * 1000,
        ).toISOString(), // 4 days from now
      };

      const response = await testApp.httpServer
        .post(`/properties/${testPropertyId}/appointments`)
        .set('Authorization', `Bearer ${agentToken}`)
        .send(newAppointment)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.clientName).toBe(newAppointment.clientName);
    });

    it('should allow admin to create an appointment', async () => {
      const newAppointment = {
        ...testAppointment,
        appointmentDate: new Date(
          Date.now() + 120 * 60 * 60 * 1000,
        ).toISOString(), // 5 days from now
      };

      const response = await testApp.httpServer
        .post(`/properties/${testPropertyId}/appointments`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newAppointment)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.clientName).toBe(newAppointment.clientName);
    });

    it('should prevent duplicate appointments at the same time', async () => {
      const newAppointment = {
        ...testAppointment,
        appointmentDate: new Date(
          Date.now() + 144 * 60 * 60 * 1000,
        ).toISOString(), // 6 days from now
      };

      // Create first appointment
      await testApp.httpServer
        .post(`/properties/${testPropertyId}/appointments`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send(newAppointment)
        .expect(201);

      // Try to create second appointment at the same time
      await testApp.httpServer
        .post(`/properties/${testPropertyId}/appointments`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send(newAppointment)
        .expect(400);
    });

    it('should validate required fields', async () => {
      const invalidAppointment = {
        clientName: 'John Doe',
        // Missing required fields
      };

      await testApp.httpServer
        .post(`/properties/${testPropertyId}/appointments`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send(invalidAppointment)
        .expect(400);
    });
  });

  describe('Appointment updates', () => {
    it('should allow admin to update any appointment', async () => {
      const updateData = {
        status: AppointmentStatus.CONFIRMED,
        notes: 'Updated by admin',
      };

      const response = await testApp.httpServer
        .patch(
          `/properties/${testPropertyId}/appointments/${testAppointmentId}`,
        )
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe(updateData.status);
      expect(response.body.notes).toBe(updateData.notes);
    });

    it('should allow property owner to update appointment', async () => {
      const updateData = {
        status: AppointmentStatus.CONFIRMED,
        notes: 'Updated by property owner',
      };

      const response = await testApp.httpServer
        .patch(
          `/properties/${testPropertyId}/appointments/${testAppointmentId}`,
        )
        .set('Authorization', `Bearer ${agentToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe(updateData.status);
      expect(response.body.notes).toBe(updateData.notes);
    });

    it('should allow appointment creator to update their appointment', async () => {
      const updateData = {
        notes: 'Updated by client',
      };

      const response = await testApp.httpServer
        .patch(
          `/properties/${testPropertyId}/appointments/${testAppointmentId}`,
        )
        .set('Authorization', `Bearer ${clientToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.notes).toBe(updateData.notes);
    });

    it('should not allow another agent to update appointment', async () => {
      const updateData = {
        status: AppointmentStatus.CONFIRMED,
      };

      await testApp.httpServer
        .patch(
          `/properties/${testPropertyId}/appointments/${testAppointmentId}`,
        )
        .set('Authorization', `Bearer ${anotherAgentToken}`)
        .send(updateData)
        .expect(403);
    });

    it('should prevent scheduling conflicts when updating', async () => {
      // Create another appointment
      const anotherAppointment = {
        ...testAppointment,
        appointmentDate: new Date(
          Date.now() + 48 * 60 * 60 * 1000,
        ).toISOString(), // Day after tomorrow
      };

      await testApp.httpServer
        .post(`/properties/${testPropertyId}/appointments`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send(anotherAppointment)
        .expect(201);

      // Try to update the first appointment to conflict with the second
      await testApp.httpServer
        .patch(
          `/properties/${testPropertyId}/appointments/${testAppointmentId}`,
        )
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ appointmentDate: anotherAppointment.appointmentDate })
        .expect(400);
    });
  });

  describe('Appointment deletion', () => {
    it('should allow admin to delete any appointment', async () => {
      await testApp.httpServer
        .delete(
          `/properties/${testPropertyId}/appointments/${testAppointmentId}`,
        )
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      await testApp.httpServer
        .get(`/properties/${testPropertyId}/appointments/${testAppointmentId}`)
        .set('Authorization', `Bearer ${anotherAgentToken}`)
        .expect(404);
    });

    it('should allow property owner to delete appointment', async () => {
      await testApp.httpServer
        .delete(
          `/properties/${testPropertyId}/appointments/${testAppointmentId}`,
        )
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(200);

      await testApp.httpServer
        .get(`/properties/${testPropertyId}/appointments/${testAppointmentId}`)
        .set('Authorization', `Bearer ${anotherAgentToken}`)
        .expect(404);
    });

    it('should allow appointment creator to delete their appointment', async () => {
      await testApp.httpServer
        .delete(
          `/properties/${testPropertyId}/appointments/${testAppointmentId}`,
        )
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      await testApp.httpServer
        .get(`/properties/${testPropertyId}/appointments/${testAppointmentId}`)
        .set('Authorization', `Bearer ${anotherAgentToken}`)
        .expect(404);
    });

    it('should not allow another agent to delete appointment', async () => {
      await testApp.httpServer
        .delete(
          `/properties/${testPropertyId}/appointments/${testAppointmentId}`,
        )
        .set('Authorization', `Bearer ${anotherAgentToken}`)
        .expect(403);

      // Verify appointment still exists
      await testApp.httpServer
        .get(`/properties/${testPropertyId}/appointments/${testAppointmentId}`)
        .set('Authorization', `Bearer ${anotherAgentToken}`)
        .expect(200);
    });
  });

  describe('Appointment retrieval', () => {
    it('should return all appointments for a property', async () => {
      const response = await testApp.httpServer
        .get(`/properties/${testPropertyId}/appointments`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should return a specific appointment', async () => {
      const response = await testApp.httpServer
        .get(`/properties/${testPropertyId}/appointments/${testAppointmentId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.id).toBe(testAppointmentId);
    });

    it('should filter appointments by date range', async () => {
      const startDate = new Date(
        Date.now() + 48 * 60 * 60 * 1000,
      ).toISOString(); // 2 days from now
      const endDate = new Date(Date.now() + 96 * 60 * 60 * 1000).toISOString(); // 4 days from now

      const response = await testApp.httpServer
        .get(`/properties/${testPropertyId}/appointments`)
        .set('Authorization', `Bearer ${clientToken}`)
        .query({ startDate, endDate })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should filter appointments by status', async () => {
      // Create a new appointment with PENDING status
      const newAppointment = {
        ...testAppointment,
        appointmentDate: new Date(
          Date.now() + 72 * 60 * 60 * 1000,
        ).toISOString(), // 3 days from now
        status: AppointmentStatus.PENDING,
      };

      await testApp.httpServer
        .post(`/properties/${testPropertyId}/appointments`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send(newAppointment)
        .expect(201);

      const response = await testApp.httpServer
        .get(`/properties/${testPropertyId}/appointments`)
        .set('Authorization', `Bearer ${clientToken}`)
        .query({ status: AppointmentStatus.PENDING })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(
        response.body.every((apt) => apt.status === AppointmentStatus.PENDING),
      ).toBe(true);
    });

    it('should return 404 for non-existent appointment', async () => {
      await testApp.httpServer
        .get(`/properties/${testPropertyId}/appointments/non-existent-id`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(404);
    });

    it('should return 401 for unauthenticated requests', async () => {
      await testApp.httpServer
        .get(`/properties/${testPropertyId}/appointments`)
        .expect(401);

      await testApp.httpServer
        .get(`/properties/${testPropertyId}/appointments/${testAppointmentId}`)
        .expect(401);

      await testApp.httpServer
        .post(`/properties/${testPropertyId}/appointments`)
        .send(testAppointment)
        .expect(401);

      await testApp.httpServer
        .patch(
          `/properties/${testPropertyId}/appointments/${testAppointmentId}`,
        )
        .send({ notes: 'Updated' })
        .expect(401);

      await testApp.httpServer
        .delete(
          `/properties/${testPropertyId}/appointments/${testAppointmentId}`,
        )
        .expect(401);
    });
  });

  describe('Appointment overlap prevention', () => {
    it('should prevent creating overlapping appointments', async () => {
      // Create initial appointment
      const initialAppointment = {
        ...testAppointment,
        appointmentDate: new Date(
          Date.now() + 24 * 60 * 60 * 1000,
        ).toISOString(), // Tomorrow at 00:00
        durationMinutes: 60,
      };

      await testApp.httpServer
        .post(`/properties/${testPropertyId}/appointments`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send(initialAppointment)
        .expect(201);

      // Try to create appointment at exactly the same time
      await testApp.httpServer
        .post(`/properties/${testPropertyId}/appointments`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send(initialAppointment)
        .expect(400);

      // Try to create appointment 30 minutes into the initial appointment
      const thirtyMinutesInto = new Date(
        new Date(initialAppointment.appointmentDate).getTime() + 30 * 60 * 1000,
      ).toISOString();
      await testApp.httpServer
        .post(`/properties/${testPropertyId}/appointments`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          ...testAppointment,
          appointmentDate: thirtyMinutesInto,
          durationMinutes: 60,
        })
        .expect(400);

      // Try to create appointment that starts 30 minutes before and ends 30 minutes into the initial appointment
      const thirtyMinutesBefore = new Date(
        new Date(initialAppointment.appointmentDate).getTime() - 30 * 60 * 1000,
      ).toISOString();
      await testApp.httpServer
        .post(`/properties/${testPropertyId}/appointments`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          ...testAppointment,
          appointmentDate: thirtyMinutesBefore,
          durationMinutes: 90,
        })
        .expect(400);

      // Try to create appointment that completely encompasses the initial appointment
      const fifteenMinutesBefore = new Date(
        new Date(initialAppointment.appointmentDate).getTime() - 15 * 60 * 1000,
      ).toISOString();
      await testApp.httpServer
        .post(`/properties/${testPropertyId}/appointments`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          ...testAppointment,
          appointmentDate: fifteenMinutesBefore,
          durationMinutes: 90,
        })
        .expect(400);
    });

    it('should prevent updating appointments to overlap', async () => {
      // Create two appointments with 2 hours gap
      const firstAppointment = {
        ...testAppointment,
        appointmentDate: new Date(
          Date.now() + 24 * 60 * 60 * 1000,
        ).toISOString(), // Tomorrow at 00:00
        durationMinutes: 60,
      };

      const secondAppointment = {
        ...testAppointment,
        appointmentDate: new Date(
          Date.now() + 26 * 60 * 60 * 1000,
        ).toISOString(), // Tomorrow at 02:00
        durationMinutes: 60,
      };

      const firstResponse = await testApp.httpServer
        .post(`/properties/${testPropertyId}/appointments`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send(firstAppointment)
        .expect(201);

      const secondResponse = await testApp.httpServer
        .post(`/properties/${testPropertyId}/appointments`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send(secondAppointment)
        .expect(201);

      // Try to update first appointment to overlap with second
      await testApp.httpServer
        .patch(
          `/properties/${testPropertyId}/appointments/${firstResponse.body.id}`,
        )
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          appointmentDate: secondAppointment.appointmentDate,
          durationMinutes: 60,
        })
        .expect(400);

      // Try to update second appointment to overlap with first
      await testApp.httpServer
        .patch(
          `/properties/${testPropertyId}/appointments/${secondResponse.body.id}`,
        )
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          appointmentDate: firstAppointment.appointmentDate,
          durationMinutes: 60,
        })
        .expect(400);

      // Try to update first appointment to be 30 minutes before second
      const thirtyMinutesBeforeSecond = new Date(
        new Date(secondAppointment.appointmentDate).getTime() - 30 * 60 * 1000,
      ).toISOString();
      await testApp.httpServer
        .patch(
          `/properties/${testPropertyId}/appointments/${firstResponse.body.id}`,
        )
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          appointmentDate: thirtyMinutesBeforeSecond,
          durationMinutes: 90,
        })
        .expect(400);
    });

    it('should allow non-overlapping appointments', async () => {
      // Create initial appointment
      const initialAppointment = {
        ...testAppointment,
        appointmentDate: new Date(
          Date.now() + 24 * 60 * 60 * 1000,
        ).toISOString(), // Tomorrow at 00:00
        durationMinutes: 60,
      };

      await testApp.httpServer
        .post(`/properties/${testPropertyId}/appointments`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send(initialAppointment)
        .expect(201);

      // Create appointment 2 hours before
      const twoHoursBefore = new Date(
        new Date(initialAppointment.appointmentDate).getTime() -
          2 * 60 * 60 * 1000,
      ).toISOString();
      await testApp.httpServer
        .post(`/properties/${testPropertyId}/appointments`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          ...testAppointment,
          appointmentDate: twoHoursBefore,
          durationMinutes: 60,
        })
        .expect(201);

      // Create appointment 2 hours after
      const twoHoursAfter = new Date(
        new Date(initialAppointment.appointmentDate).getTime() +
          2 * 60 * 60 * 1000,
      ).toISOString();
      await testApp.httpServer
        .post(`/properties/${testPropertyId}/appointments`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          ...testAppointment,
          appointmentDate: twoHoursAfter,
          durationMinutes: 60,
        })
        .expect(201);
    });

    it('should validate appointment duration', async () => {
      // Try to create appointment with duration less than minimum
      await testApp.httpServer
        .post(`/properties/${testPropertyId}/appointments`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          ...testAppointment,
          durationMinutes: 10, // Less than minimum 15 minutes
        })
        .expect(400);

      // Try to create appointment with duration more than maximum
      await testApp.httpServer
        .post(`/properties/${testPropertyId}/appointments`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          ...testAppointment,
          durationMinutes: 300, // More than maximum 240 minutes
        })
        .expect(400);

      // Try to create appointment with valid duration
      await testApp.httpServer
        .post(`/properties/${testPropertyId}/appointments`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          ...testAppointment,
          durationMinutes: 120, // Valid duration
        })
        .expect(201);
    });
  });
});
