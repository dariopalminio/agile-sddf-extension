---
title: Use Testing Module for Unit Tests
impact: HIGH
impactDescription: Enables proper isolated testing with mocked dependencies
tags: testing, unit-tests, mocking, jest
---

## Use Testing Module for Unit Tests

Use `@nestjs/testing` module to create isolated test environments with mocked dependencies. This ensures your tests run fast, don't depend on external services, and properly test your business logic in isolation.

**Incorrect (manual instantiation bypassing DI):**

```typescript
// Instantiate services manually without DI
describe('UsersService', () => {
  it('should create user', async () => {
    // Manual instantiation bypasses DI
    const repo = new UserRepository(); // Real repo!
    const service = new UsersService(repo);

    const user = await service.create({ name: 'Test' });
    // This hits the real database!
  });
});

// Manual instantiation again, plus a hollow assertion
describe('UsersController', () => {
  it('should call service', async () => {
    const service = { create: jest.fn() };
    const controller = new UsersController(service as any); // `as any` disables
                                                            // the DI contract check

    await controller.create({ name: 'Test' });

    expect(service.create).toHaveBeenCalled(); // never asserts WHAT was passed,
                                               // nor what the controller returned
  });
});
```

> **On the second example:** asserting that a controller delegates to its service is
> *not* an implementation detail — delegating is precisely a controller's behaviour.
> The problems here are different: `as any` disables the check that would catch a
> changed constructor signature, and `toHaveBeenCalled()` asserts neither the
> arguments nor the returned value, so the test passes even if the controller drops
> the DTO or returns `undefined`. The fix is `Test.createTestingModule` plus
> `toHaveBeenCalledWith(dto)` and an assertion on the result.

**Correct (use Test.createTestingModule with mocked dependencies):**

```typescript
// Use Test.createTestingModule for proper DI
import { Test, TestingModule } from '@nestjs/testing';

describe('UsersService', () => {
  let service: UsersService;
  let repo: jest.Mocked<UserRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserRepository,
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should save and return user', async () => {
      const dto = { name: 'John', email: 'john@test.com' };
      const expectedUser = { id: '1', ...dto };

      // Stub EVERY call the method makes, not just the one being asserted.
      // `create` checks for duplicates first; leaving findOne unstubbed makes the
      // test pass by accident (undefined is falsy) and break later for the wrong reason.
      repo.findOne.mockResolvedValue(null);
      repo.save.mockResolvedValue(expectedUser);

      const result = await service.create(dto);

      expect(result).toEqual(expectedUser);
      expect(repo.save).toHaveBeenCalledWith(dto);
    });

    it('should throw on duplicate email', async () => {
      repo.findOne.mockResolvedValue({ id: '1', email: 'test@test.com' });

      await expect(
        service.create({ name: 'Test', email: 'test@test.com' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      const user = { id: '1', name: 'John' };
      repo.findOne.mockResolvedValue(user);

      const result = await service.findById('1');

      expect(result).toEqual(user);
    });

    it('should throw NotFoundException when not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findById('999')).rejects.toThrow(NotFoundException);
    });
  });
});

// Testing guards and interceptors
describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RolesGuard,
        { provide: Reflector, useValue: { getAllAndOverride: jest.fn() } },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should allow when no roles required', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const context = createMockExecutionContext({ user: { roles: [] } });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow admin for admin-only route', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin']);
    const context = createMockExecutionContext({ user: { roles: ['admin'] } });

    expect(guard.canActivate(context)).toBe(true);
  });

  // The cases that give the suite its value: without them a guard that always
  // returned `true` would pass every test above.
  it('should deny a user missing the required role', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin']);
    const context = createMockExecutionContext({ user: { roles: ['user'] } });

    expect(guard.canActivate(context)).toBe(false);
  });

  it('should deny when the request carries no user', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin']);
    const context = createMockExecutionContext({});

    expect(guard.canActivate(context)).toBe(false);
  });
});

/**
 * Minimal ExecutionContext double for HTTP guards.
 * Only the members a guard actually consumes are implemented; the cast is
 * deliberate. If several guards need this, extract it to a shared
 * `src/test/mocks/execution-context.ts` instead of copying it per spec file.
 */
function createMockExecutionContext(
  request: Record<string, unknown> = {},
): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => ({}),
      getNext: () => ({}),
    }),
    getHandler: () => function handler() {},
    getClass: () => class TestController {},
    getType: () => 'http',
    getArgs: () => [request],
    getArgByIndex: () => request,
    switchToRpc: () => ({}),
    switchToWs: () => ({}),
  } as unknown as ExecutionContext;
}
```

Reference: [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)