import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { CacheService } from '../src/redis/cache.service';

describe('AI Calling Backend (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    process.env.API_KEY = 'test-secret-key';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]),
        call: {
          findMany: jest.fn().mockResolvedValue([
            {
              id: '1',
              phone: '+1234567890',
              duration: 30,
              createdAt: new Date(),
            },
          ]),
        },
      })
      .overrideProvider(CacheService)
      .useValue({
        ping: jest.fn().mockResolvedValue(true),
        get: jest.fn().mockResolvedValue(null),
        set: jest.fn().mockResolvedValue('OK'),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Public Endpoints', () => {
    it('/hello (GET) should return hello greeting without auth', () => {
      return request(app.getHttpServer())
        .get('/hello')
        .expect(200)
        .expect('Hello World!');
    });

    it('/health (GET) should return healthy status and system metrics', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('uptimeSeconds');
      expect(response.body).toHaveProperty('memoryUsage');
      expect(response.body.services).toEqual({
        database: 'healthy',
        redis: 'healthy',
      });
    });
  });

  describe('Protected Endpoints & API Key Security', () => {
    it('/calls (GET) should reject request with 401 when API key is missing', () => {
      return request(app.getHttpServer()).get('/calls').expect(401);
    });

    it('/calls (GET) should reject request with 401 when invalid API key is provided', () => {
      return request(app.getHttpServer())
        .get('/calls')
        .set('x-api-key', 'wrong-key')
        .expect(401);
    });

    it('/calls (GET) should succeed with 200 when valid x-api-key header is provided', async () => {
      const res = await request(app.getHttpServer())
        .get('/calls')
        .set('x-api-key', 'test-secret-key')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('/calls (GET) should succeed with 200 when valid Bearer token is provided', async () => {
      const res = await request(app.getHttpServer())
        .get('/calls')
        .set('Authorization', 'Bearer test-secret-key')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});
