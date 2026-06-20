---
title: Structure Modules with DDD and Hexagonal Architecture
impact: HIGH
impactDescription: Isolates business logic from frameworks and infrastructure for independent testing and easier technology swaps
tags: ddd-architecture, ddd, hexagonal-architecture, ports-and-adapters, domain-driven-design
---

## Structure Modules with DDD and Hexagonal Architecture

Within each feature module (see [arch-feature-modules.md](arch-feature-modules.md)), apply Domain-Driven Design (DDD) with a hexagonal (ports & adapters) layout: split the module into `api` (inbound adapters), `domain` (pure business logic, framework-agnostic), and `infra` (outbound adapters). The domain layer must have zero dependency on NestJS decorators, ORMs, or HTTP — it only depends on interfaces ("ports") that infrastructure implements. This makes business rules independently testable and lets you swap databases, queues, or external APIs without touching domain code.

**Incorrect (domain logic coupled to framework and ORM):**

```typescript
// users/users.service.ts - business rules entangled with infrastructure
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserOrmEntity) private repo: Repository<UserOrmEntity>, // domain depends on TypeORM
  ) {}

  async register(dto: CreateUserDto): Promise<UserOrmEntity> {
    const existing = await this.repo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email already registered'); // domain rule throws an HTTP exception
    }

    const hashed = await bcrypt.hash(dto.password, 10); // business rule hardcodes a specific library
    const user = this.repo.create({ ...dto, password: hashed });
    return this.repo.save(user); // domain logic persists directly via the ORM

    // Swapping the database or testing the registration rule in isolation
    // requires spinning up TypeORM and mocking an ORM repository.
  }
}
```

**Correct (DDD + hexagonal layout per module):**

```
src/
│
├── shared/                                 # (Optional) Resources shared by all modules
│   ├── filters/                            # Global exception filters (e.g. HttpExceptionFilter)
│   ├── guards/                              # Global guards (e.g. RolesGuard, JwtAuthGuard)
│   ├── interceptors/                        # Global interceptors (e.g. LoggingInterceptor)
│   ├── middlewares/                         # Global middlewares (e.g. LoggerMiddleware)
│   ├── pipes/                               # Global validation pipes (e.g. ValidationPipe)
│   ├── constants/                           # Global constants (e.g. error codes, statuses)
│   └── utils/                               # Generic helpers and utilities
│
├── <module-name>/                          # Business module (e.g. auth, users, products, orders)
│   │
│   ├── api/                                # Presentation layer / inbound adapter (HTTP, GraphQL, etc.)
│   │   ├── controllers/                    # Controllers that handle requests and delegate to services
│   │   │   └── <name>.controller.ts        # e.g. auth.controller.ts, user.controller.ts
│   │   ├── dto/                             # Module-specific input/output DTOs
│   │   │   ├── <action>-request.dto.ts     # Request DTO (e.g. login-request.dto.ts)
│   │   │   └── <entity>-response.dto.ts    # Response DTO (no sensitive data)
│   │   └── guards/                          # Module-specific guards (e.g. LocalAuthGuard)
│   │       └── <name>.guard.ts
│   │
│   ├── domain/                             # Domain core (independent of frameworks and technologies)
│   │   ├── model/                          # Entities and Value Objects
│   │   │   ├── <entity>.entity.ts          # Domain entity (e.g. user.entity.ts)
│   │   │   └── <value-object>.vo.ts        # Value Objects (e.g. email.vo.ts, password.vo.ts)
│   │   ├── services/                       # Domain services (PURE business logic)
│   │   │   ├── <business-rule>.ts          # Business rules (e.g. password-hasher.ts)
│   │   │   └── ...
│   │   ├── ports/                          # Ports (interfaces) defined by the domain
│   │   │   ├── incoming/                   # Inbound ports (used by the api layer)
│   │   │   │   ├── <use-case>-service.interface.ts   # Use-case interface (e.g. IAuthService)
│   │   │   │   └── ...
│   │   │   └── outgoing/                   # Outbound ports (required by the domain)
│   │   │       ├── <entity>-repository.interface.ts  # Repository interface (e.g. IUserRepository)
│   │   │       └── <external>-service.interface.ts   # External service interface (e.g. ITokenGenerator)
│   │   └── exceptions/                     # Domain exceptions (DomainError, not HttpException)
│   │       └── <module>-domain.exception.ts
│   │
│   └── infra/                              # Infrastructure layer (outbound adapters)
│       ├── repositories/                   # Concrete repository implementations (Mongoose, TypeORM, Prisma)
│       │   ├── <entity>.repository.ts      # Implements the repository interface (e.g. user.repository.ts)
│       │   └── <entity>.schema.ts          # Database schema (Mongoose, TypeORM, etc.)
│       ├── services/                       # External service implementations (API, queues, email, etc.)
│       │   ├── <external>-service.impl.ts  # Implements an outgoing port (e.g. jwt-token-generator.ts)
│       │   └── ...
│       └── config/                         # Infrastructure-specific configuration (env variables, etc.)
│           └── <module>.config.ts
│
├── app.module.ts                           # Root module that imports all business modules
└── main.ts
```

The layers connect through ports — the domain defines the interface, infrastructure implements it, and the api layer only ever talks to interfaces:

```typescript
// domain/ports/outgoing/user-repository.interface.ts
export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<User>;
}

// domain/services/register-user.service.ts - implements the incoming port IAuthService
@Injectable()
export class RegisterUserService implements IAuthService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository, // depends on the port, not the ORM
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: IPasswordHasher,
  ) {}

  async register(email: Email, password: Password): Promise<User> {
    if (await this.userRepository.findByEmail(email.value)) {
      throw new EmailAlreadyRegisteredException(email.value); // domain exception, not HttpException
    }

    const hashed = await this.passwordHasher.hash(password.value);
    return this.userRepository.save(User.create(email, hashed));
  }
}

// infra/repositories/user.repository.ts - implements the outgoing port
@Injectable()
export class UserRepository implements IUserRepository {
  constructor(@InjectModel(UserSchema.name) private model: Model<UserDocument>) {}

  async findByEmail(email: string): Promise<User | null> {
    const doc = await this.model.findOne({ email }).exec();
    return doc ? UserMapper.toDomain(doc) : null;
  }

  async save(user: User): Promise<User> {
    const doc = await this.model.create(UserMapper.toPersistence(user));
    return UserMapper.toDomain(doc);
  }
}

// api/controllers/auth.controller.ts - only knows the incoming port
@Controller('auth')
export class AuthController {
  constructor(@Inject(AUTH_SERVICE) private readonly authService: IAuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterRequestDto): Promise<UserResponseDto> {
    const user = await this.authService.register(new Email(dto.email), new Password(dto.password));
    return UserResponseDto.fromDomain(user);
  }
}
```

**Layer responsibilities:**

- `shared/`: cross-cutting infrastructure reused by every module (filters, guards, interceptors, pipes, constants, utils) — not business logic.
- `<module>/api/`: inbound adapter. Controllers, request/response DTOs, and module-specific guards. Depends only on incoming ports.
- `<module>/domain/`: the core. Entities, Value Objects, pure business-rule services, the ports (incoming and outgoing interfaces), and domain exceptions. No imports from `@nestjs/*`, ORMs, or HTTP libraries.
- `<module>/infra/`: outbound adapter. Repository and external-service implementations that satisfy the domain's outgoing ports, plus infra-specific config. Depends on the domain (implements its interfaces); the domain never depends on infra.
- Wire ports to implementations in the module's `*.module.ts` using injection tokens (see [di-use-interfaces-tokens.md](di-use-interfaces-tokens.md)).

Reference: [Hexagonal Architecture (Ports & Adapters)](https://alistair.cockburn.us/hexagonal-architecture/)
