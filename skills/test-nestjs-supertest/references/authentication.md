# Authentication

Authenticate once in `beforeAll` to obtain a token, then reuse that token
across every `it()` block in the same `describe` instead of logging in for
each test.

```typescript
describe('Protected Routes (API integration)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    // Get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@test.com', password: 'password' });

    authToken = loginResponse.body.accessToken;
  });

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
```

Bearer tokens obtained via a login endpoint are the most common pattern for
NestJS + Supertest, but the same approach applies to other auth mechanisms
(session cookies, API keys) — authenticate once in `beforeAll`, capture
whatever credential the app issues, and attach it with `.set(...)` on each
request that needs it.
