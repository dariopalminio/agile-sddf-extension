// Illustrative example for the test-nestjs-supertest skill.
// Demonstrates database isolation between tests using full schema
// synchronize (Strategy 1 in references/database-isolation.md).
// Fictional domain — not tied to a real project's source code.

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Orders (API integration)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env.test', // Test database config
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    dataSource = moduleFixture.get(DataSource);
    await app.init();
  });

  beforeEach(async () => {
    // Clean database between tests
    await dataSource.synchronize(true);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  it('should create an order and list it', async () => {
    await request(app.getHttpServer())
      .post('/orders')
      .send({ item: 'Book', quantity: 1 })
      .expect(201);

    const res = await request(app.getHttpServer()).get('/orders').expect(200);

    expect(res.body).toHaveLength(1);
  });

  it('should start with an empty order list', async () => {
    // If beforeEach didn't wipe the database, the order created in the
    // previous test would still be here.
    const res = await request(app.getHttpServer()).get('/orders').expect(200);

    expect(res.body).toHaveLength(0);
  });

  it('should isolate orders created within this test from other tests', async () => {
    await request(app.getHttpServer())
      .post('/orders')
      .send({ item: 'Pen', quantity: 3 })
      .expect(201);

    await request(app.getHttpServer())
      .post('/orders')
      .send({ item: 'Notebook', quantity: 2 })
      .expect(201);

    const res = await request(app.getHttpServer()).get('/orders').expect(200);

    expect(res.body).toHaveLength(2);
  });
});
