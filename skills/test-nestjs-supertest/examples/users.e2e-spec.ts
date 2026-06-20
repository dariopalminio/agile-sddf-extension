// Illustrative example for the test-nestjs-supertest skill.
// Demonstrates a complete Users resource integration spec: full CRUD
// (POST/GET/PUT/DELETE) plus authenticated/protected route testing,
// sharing a single app bootstrap across all describe blocks.
// Fictional domain — not tied to a real project's source code.

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Users (API integration)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@test.com', password: 'password' });

    authToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/users (POST)', () => {
    it('should create a user', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({ name: 'John', email: 'john@test.com' })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe('John');
          expect(res.body.email).toBe('john@test.com');
        });
    });

    it('should return 400 for invalid email', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({ name: 'John', email: 'invalid-email' })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('email');
        });
    });
  });

  describe('/users/:id (GET)', () => {
    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .get('/users/non-existent-id')
        .expect(404);
    });
  });

  describe('/users/:id (PUT)', () => {
    let userId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/users')
        .send({ name: 'Jane', email: 'jane@test.com' });
      userId = res.body.id;
    });

    it('should update an existing user', () => {
      return request(app.getHttpServer())
        .put(`/users/${userId}`)
        .send({ name: 'Jane Updated' })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Jane Updated');
        });
    });

    it('should return 404 when updating a non-existent user', () => {
      return request(app.getHttpServer())
        .put('/users/non-existent-id')
        .send({ name: 'Nobody' })
        .expect(404);
    });
  });

  describe('/users/:id (DELETE)', () => {
    let userId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/users')
        .send({ name: 'Temp', email: 'temp@test.com' });
      userId = res.body.id;
    });

    it('should delete an existing user', () => {
      return request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .expect(204);
    });

    it('should confirm the user no longer exists', () => {
      return request(app.getHttpServer())
        .get(`/users/${userId}`)
        .expect(404);
    });
  });

  describe('Protected Routes', () => {
    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/users/me')
        .expect(401);
    });

    it('should return user profile with valid token', () => {
      return request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe('test@test.com');
        });
    });
  });
});
