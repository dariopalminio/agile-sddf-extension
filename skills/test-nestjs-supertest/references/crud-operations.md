# CRUD Operations

Request assertions for the four basic HTTP verbs against a REST resource.
Every block below assumes `app: INestApplication` is already initialized as
shown in [bootstrap-and-teardown.md](bootstrap-and-teardown.md).

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

Deleting and confirming the deletion are one behaviour, so they belong in one
test. Splitting them across two `it()` blocks makes the second depend on the
first having run — it then breaks under `.only`, reordering, or parallel
execution (see [common-pitfalls.md](common-pitfalls.md), Pitfall 5).

```typescript
describe('/users/:id (DELETE)', () => {
  it('should delete an existing user and stop returning it', async () => {
    // Arrange — this test creates the state it needs
    const created = await request(app.getHttpServer())
      .post('/users')
      .send({ name: 'Temp', email: 'temp@test.com' })
      .expect(201);

    // Act
    await request(app.getHttpServer())
      .delete(`/users/${created.body.id}`)
      .expect(204);

    // Assert
    await request(app.getHttpServer())
      .get(`/users/${created.body.id}`)
      .expect(404);
  });

  it('should return 404 when deleting a non-existent user', () => {
    return request(app.getHttpServer())
      .delete('/users/non-existent-id')
      .expect(404);
  });
});
```
