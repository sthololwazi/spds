# SPDS AI Constitution v1.0 - Part 3
## Architecture Rules and System Design Principles

**Document Status**: Official Specification  
**Version**: 1.0  
**Effective Date**: 2026-07-21  
**Authority**: Part 1, Section 2.1 (Domain-Driven Architecture)  
**Audience**: Architects, senior developers, AI systems making architectural decisions  

---

## OVERVIEW

Part 3 defines the architectural rules for SPDS. These rules ensure that as the system grows, it remains:
- **Maintainable**: Any developer can understand the overall structure
- **Extensible**: New features integrate cleanly
- **Cohesive**: Related concepts live together
- **Loosely coupled**: Components can evolve independently

---

## SECTION 1: ARCHITECTURAL PRINCIPLES

### 1.1 Domain-Driven Architecture

#### Rule 1.1.1: The Domain Drives the Architecture
The construction drawing domain is the source of truth. Architecture follows the domain, not vice versa.

```
Construction Domain Model
        ↓
System Architecture
        ↓
Code Organization
        ↓
Framework Choices
```

NOT:

```
Framework Capabilities
        ↓
What We Can Build
        ↓
Architecture Constraints
        ↓
Domain Compromises ❌
```

#### Rule 1.1.2: Core vs. Framework
Separate core domain logic from framework-specific code:

```
┌────────────────────────────┐
│     Framework Layer        │  React, Express, etc.
│    (Replaceable)           │
├────────────────────────────┤
│     Application Layer      │  Controllers, services
├────────────────────────────┤
│     Domain Layer           │  Walls, doors, drawings
│    (Never changes)         │  Domain logic, validation
└────────────────────────────┘
```

**Rule**: Domain logic must be framework-agnostic. It should compile and run without any framework.

---

### 1.2 Layered Architecture

#### Rule 1.2.1: The Four Layers of SPDS

Every SPDS system must follow these layers:

**Layer 1: Domain Model**
- Pure domain concepts: Wall, Door, Drawing, Dimension
- Business rules and invariants
- No external dependencies
- No IO operations
- Can be understood by non-programmers (architects, engineers)

**Layer 2: Application Services**
- Orchestrates domain objects
- Implements use cases: "Create a drawing", "Add a wall"
- Handles transactions and domain events
- Thin layer that connects domain to external world

**Layer 3: Infrastructure**
- Persistence (database, file system)
- External APIs and services
- Configuration and logging
- Framework integration

**Layer 4: Presentation/API**
- HTTP endpoints, CLI, UI
- Input validation and transformation
- Response formatting
- Only layer that talks to users

#### Rule 1.2.2: Layer Dependencies
- Layer 1 (Domain) → No dependencies on other layers
- Layer 2 (Application) → Can depend on Layer 1 only
- Layer 3 (Infrastructure) → Can depend on Layers 1-2
- Layer 4 (Presentation) → Can depend on any layer

**Forbidden**: Layer 1 depending on any other layer

```typescript
// ❌ WRONG: Domain depending on infrastructure
export interface Wall {
  async save(): Promise<void>; // NO! This is infrastructure concern
}

// ✅ CORRECT: Domain is pure
export interface Wall {
  readonly id: string;
  readonly height: number;
}

// Infrastructure handles persistence
export class WallRepository {
  async save(wall: Wall): Promise<void> { }
}
```

---

### 1.3 Modularity and Boundaries

#### Rule 1.3.1: Clear Module Boundaries
Each module should have:
1. Clear responsibility (one concept or domain area)
2. Public API (what it exports)
3. Internal implementation (private details)
4. Explicit dependencies (what it needs from other modules)

```typescript
// src/domain/wall/index.ts - Public API
export { Wall, WallProps } from './model';
export { validateWall } from './validator';
export type { WallError } from './errors';

// src/domain/wall/model.ts - Implementation (private)
export interface Wall {
  readonly id: string;
  readonly height: number;
}

// src/domain/wall/validator.ts - Implementation (private)
export function validateWall(wall: Wall): ValidationResult { }

// src/domain/wall/errors.ts - Errors
export class InvalidWallHeightError extends Error { }
```

#### Rule 1.3.2: No Circular Dependencies
Modules must not depend on each other circularly:

```
✅ CORRECT:
  Wall → Material → Color
  (Acyclic directed graph)

❌ WRONG:
  Wall → Material ↔ Wall
  (Circular dependency)
```

**Check**: `npm install --save-dev madge` to detect circular dependencies

---

### 1.4 Composition Over Inheritance

#### Rule 1.4.1: Prefer Interfaces Over Classes
When designing abstractions, prefer interfaces:

```typescript
// ✅ PREFERRED: Interface-based composition
export interface Element {
  id: string;
  type: ElementType;
  render(context: RenderContext): SVGElement;
}

export interface Wall extends Element {
  height: number;
  material: Material;
}

// ❌ AVOID: Class inheritance hierarchies
export abstract class Element {
  abstract render(context: RenderContext): SVGElement;
}

export class Wall extends Element {
  height: number;
  material: Material;
  
  render(context: RenderContext): SVGElement { }
}
```

---

## SECTION 2: PLUGIN ARCHITECTURE

### 2.1 Plugin System as First-Class Citizen

#### Rule 2.1.1: Plugins Are Not Afterthoughts
The plugin system is part of core architecture, not an addition bolted on later.

- Core system defines extension points
- Plugins register implementations
- Core depends on plugin interface, not implementation

#### Rule 2.1.2: Plugin Extension Points

Core extension points in SPDS:
1. **Element Types**: Register custom element types (e.g., custom fixtures)
2. **Validators**: Register validation rules for drawings
3. **Renderers**: Register custom rendering logic
4. **Converters**: Register format converters (DWG, PDF, etc.)
5. **Analyzers**: Register analysis tools

```typescript
// src/core/plugin-system.ts
export interface PluginRegistry {
  registerElementType(type: ElementType, handler: ElementHandler): void;
  registerValidator(validator: Validator): void;
  registerRenderer(type: string, renderer: Renderer): void;
}

// src/plugins/custom-fixture/index.ts
export async function activate(registry: PluginRegistry): Promise<void> {
  registry.registerElementType('customFixture', CustomFixtureHandler);
  registry.registerRenderer('customFixture', CustomFixtureRenderer);
}
```

---

## SECTION 3: DEPENDENCY INJECTION

### 3.1 Constructor Injection

#### Rule 3.1.1: Use Constructor Injection for Dependencies

```typescript
// ✅ CORRECT: Constructor injection
export class DrawingService {
  constructor(
    private wallValidator: WallValidator,
    private renderer: Renderer,
    private repository: DrawingRepository
  ) {}
  
  async createDrawing(spec: DrawingSpec): Promise<Drawing> {
    // Uses injected dependencies
  }
}

// ❌ WRONG: Global singletons
export class DrawingService {
  private wallValidator = WallValidator.getInstance();
  private renderer = Renderer.getInstance();
  
  async createDrawing(spec: DrawingSpec): Promise<Drawing> { }
}
```

#### Rule 3.1.2: Inversion of Control Container
Use a lightweight IoC container for wiring:

```typescript
// src/container.ts
export const createContainer = (): Container => {
  const container = new Container();
  
  // Register domain services
  container.bind(WallValidator).toSelf();
  container.bind(DoorValidator).toSelf();
  
  // Register application services
  container.bind(DrawingService).to(class extends DrawingService {
    constructor() {
      super(
        container.get(WallValidator),
        container.get(Renderer),
        container.get(DrawingRepository)
      );
    }
  });
  
  return container;
};
```

---

## SECTION 4: TESTING ARCHITECTURE

Detailed in Part 9, but architectural principles here:

### 4.1 Testability Design

#### Rule 4.1.1: Design for Testability
Architecture must enable:
1. **Unit testing** of domain logic in isolation
2. **Integration testing** of multiple layers
3. **End-to-end testing** of complete workflows

**Anti-pattern**: Architecture that's hard to test

```typescript
// ❌ HARD TO TEST: Mixed concerns
export class DrawingService {
  async createDrawing(spec: DrawingSpec): Promise<void> {
    const drawing = new Drawing(spec); // Creation
    this.validate(drawing);              // Validation
    await db.insert(drawing);            // Persistence
    await email.send(/*...*/);           // Notification
    logger.info(/*...*/);                // Logging
  }
}

// ✅ EASY TO TEST: Separated concerns
export class DrawingService {
  constructor(
    private factory: DrawingFactory,
    private validator: DrawingValidator,
    private repository: DrawingRepository,
    private eventBus: EventBus
  ) {}
  
  async createDrawing(spec: DrawingSpec): Promise<Drawing> {
    const drawing = this.factory.create(spec);   // Create
    this.validator.validate(drawing);             // Validate
    const saved = await this.repository.save(drawing); // Save
    await this.eventBus.publish(new DrawingCreatedEvent(saved)); // Events
    return saved;
  }
}

// Tests can mock each concern independently
```

---

## SECTION 5: EVOLUTIONARY ARCHITECTURE

### 5.1 Future-Proofing

#### Rule 5.1.1: Anticipate Change
Architecture must accommodate:
1. New element types without modifying core
2. New rendering formats (PDF, PNG, WebGL) without rewrites
3. New storage backends (database, cloud, file system)
4. New validation rules
5. New analysis capabilities

**Solution**: Plugin system + extension points

#### Rule 5.1.2: Document Architecture Decisions
Every significant architectural decision is documented in ADRs (Architecture Decision Records):

```markdown
# ADR-001: Domain-Driven Architecture

## Context
SPDS is a drawing standard platform. Decisions must reflect the domain first.

## Decision
We will organize architecture around domain concepts, not technical patterns.

## Consequences
- (+) Domain logic is clear and understandable
- (+) New features integrate cleanly
- (-) Requires more upfront design work
- (-) Developers must understand the domain
```

Stored in: `docs/adr/001-domain-driven-architecture.md`

---

## SECTION 6: PERFORMANCE ARCHITECTURE

### 6.1 Performance Principles

#### Rule 6.1.1: Correctness Before Performance
Always prioritize correctness over performance. Optimize only when necessary and with measurement.

```
1. Design for correctness
2. Implement cleanly
3. Measure performance
4. If fast enough, STOP
5. If not, profile and optimize
```

#### Rule 6.1.2: Caching Strategy
If caching is needed:
1. Cache at domain boundaries
2. Never cache raw user input
3. Always validate cached data
4. Document cache invalidation strategy

```typescript
// ✅ GOOD: Cache at boundaries
export class DrawingRepository {
  private cache = new Map<string, Drawing>();
  
  async get(id: string): Promise<Drawing> {
    if (this.cache.has(id)) {
      return this.cache.get(id)!;
    }
    const drawing = await this.database.fetch(id);
    this.cache.set(id, drawing);
    return drawing;
  }
  
  async save(drawing: Drawing): Promise<void> {
    await this.database.save(drawing);
    this.cache.set(drawing.id, drawing); // Update cache
  }
}
```

---

## SECTION 7: ERROR HANDLING ARCHITECTURE

### 7.1 Error Propagation

#### Rule 7.1.1: Domain Errors vs. System Errors
Distinguish errors:
- **Domain Errors**: Expected business rule violations (invalid wall height)
- **System Errors**: Unexpected failures (database connection lost)

```typescript
// Domain errors
export class InvalidWallHeightError extends Error {}
export class DuplicateElementError extends Error {}

// System errors should be wrapped
export class DatabaseConnectionError extends Error {
  constructor(original: Error) {
    super(`Database connection failed: ${original.message}`);
  }
}
```

---

## SECTION 8: SECURITY ARCHITECTURE

### 8.1 Security Principles

#### Rule 8.1.1: Defense in Depth
1. **Input validation**: All external input validated at boundaries
2. **Authorization**: Every operation checks permissions
3. **Data protection**: Sensitive data encrypted at rest and in transit
4. **Audit logging**: Important actions logged and auditable

---

## SECTION 9: AI SYSTEM ARCHITECTURE

### 9.1 AI Integration Points

See Part 7 (AI Agent Rules) for detailed AI governance.

---

**Constitution Part 3 - Approved and Effective: 2026-07-21**  
**Authority**: Part 1  
**Next Review**: 2026-10-21  

*Architectural principles that guide all SPDS design decisions*