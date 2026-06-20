# CRUD Operations

Request assertions for the four basic HTTP verbs against a REST resource.
Every block below assumes `app: INestApplication` is already initialized as
shown in [setup-and-teardown.md](setup-and-teardown.md).

## POST — create a resource

```typescript
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
```

## GET — read a resource

```typescript
describe('/users/:id (GET)', () => {
  it('should return 404 for non-existent user', () => {
    return request(app.getHttpServer())
      .get('/users/non-existent-id')
      .expect(404);
  });
});
```

## PUT — update a resource

```typescript
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
```

## DELETE — remove a resource

```typescript
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
```
