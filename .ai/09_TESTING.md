# SPDS AI Constitution v1.0 - Part 9
## Testing Standards and Quality Assurance

**Document Status**: Official Specification  
**Version**: 1.0  
**Effective Date**: 2026-07-21  
**Authority**: Part 1, Section 2.2.1 (Correctness)  
**Audience**: All developers, QA engineers, CI/CD systems  

---

## OVERVIEW

Part 9 defines testing standards for SPDS. Testing is not optional; it is a Constitutional requirement. This document specifies:
- Test types and coverage targets
- Test organization and naming
- Test automation
- Continuous integration gates

**Principle**: "If it's not tested, it doesn't work."

---

## SECTION 1: TEST PHILOSOPHY

### 1.1 Testing Pyramid

```
        /\
       /E2E\
      /______\
     /Integration
    /___________\
   / Unit Tests
  /____________\

Ratio: 70% Unit : 20% Integration : 10% E2E
Speed: Fast (seconds) → Slower (minutes)
```

### 1.2 Test Principles

1. **Fast**: Unit tests run in milliseconds
2. **Independent**: Tests don't depend on each other
3. **Repeatable**: Same result every run
4. **Self-Validating**: Pass or fail, no manual checking
5. **Timely**: Written near when code is written

---

## SECTION 2: UNIT TESTS

### 2.1 Unit Test Requirements

**Target Coverage**: >80% for domain logic, >60% overall

Every function needs tests:

```typescript
/**
 * Example: Testing a domain function
 */
import { calculateWallArea, InvalidWallError } from '../wall';

describe('calculateWallArea', () => {
  describe('valid inputs', () => {
    it('should calculate area correctly for rectangular wall', () => {
      const wall = createTestWall(1000, 2000); // 1m x 2m
      const area = calculateWallArea(wall);
      expect(area).toBe(2000000); // mm²
    });
    
    it('should handle different dimensions', () => {
      const wall1 = createTestWall(500, 1000);
      const wall2 = createTestWall(1000, 1000);
      expect(calculateWallArea(wall2)).toBe(calculateWallArea(wall1) * 2);
    });
  });
  
  describe('invalid inputs', () => {
    it('should throw InvalidWallError for negative height', () => {
      const wall = createTestWall(-1000, 2000);
      expect(() => calculateWallArea(wall)).toThrow(InvalidWallError);
    });
    
    it('should throw InvalidWallError for zero width', () => {
      const wall = createTestWall(1000, 0);
      expect(() => calculateWallArea(wall)).toThrow(InvalidWallError);
    });
  });
  
  describe('edge cases', () => {
    it('should handle very small dimensions', () => {
      const wall = createTestWall(1, 1);
      expect(calculateWallArea(wall)).toBe(1);
    });
    
    it('should handle very large dimensions', () => {
      const wall = createTestWall(50000, 50000);
      expect(calculateWallArea(wall)).toBe(2500000000);
    });
  });
});
```

### 2.2 Test Naming Convention

```typescript
// Pattern: describe('[Function]', () => { it('should [behavior]', () => {}) })

describe('validateWall', () => {
  it('should return valid for correct wall', () => {});
  it('should return invalid for wall with height < minimum', () => {});
  it('should throw InvalidWallError when properties missing', () => {});
});
```

### 2.3 Test Fixtures and Factories

Use factory functions for test data:

```typescript
/**
 * Test fixture factory for walls
 */
export function createTestWall(
  overrides?: Partial<Wall>
): Wall {
  return {
    id: 'wall-test-001',
    type: 'wall' as const,
    layer: 'walls',
    locked: false,
    visible: true,
    geometry: {
      type: 'line' as const,
      start: { xMM: 0, yMM: 0 },
      end: { xMM: 5000, yMM: 0 },
    },
    style: {
      stroke: { color: '#333333', widthMM: 2 },
      fill: { color: '#f5f5f5' },
      opacity: 1,
    },
    properties: {
      heightMM: 3000,
      thicknessMM: 300,
      material: { id: 'brick', name: 'Brick', code: 'BRICK-001', density: 1900 },
      doors: [],
      windows: [],
      notes: 'Test wall',
    },
    metadata: {
      createdAt: new Date('2026-07-21'),
      createdBy: 'test',
      revisionNumber: 0,
      tags: [],
    },
    ...overrides,
  };
}

// Usage
it('should render wall correctly', () => {
  const wall = createTestWall({ properties: { heightMM: 4000 } });
  const svg = renderWall(wall, createTestContext());
  expect(svg).toBeDefined();
});
```

### 2.4 Unit Test Example: Domain Model

```typescript
/**
 * Complete unit test for Wall factory
 */
import { DomainFactory, Wall, InvalidWallError } from '../domain';

describe('DomainFactory.createWall', () => {
  describe('valid creation', () => {
    it('should create wall with valid properties', () => {
      const result = DomainFactory.createWall({
        name: 'Exterior Wall',
        heightMM: 3000,
        thicknessMM: 300,
        material: { id: 'brick', name: 'Brick', code: 'BRICK-001', density: 1900 },
      });
      
      expect(result.ok).toBeDefined();
      expect(result.ok?.properties.name).toBe('Exterior Wall');
      expect(result.ok?.properties.heightMM).toBe(3000);
    });
  });
  
  describe('validation', () => {
    it('should reject wall height below minimum', () => {
      const result = DomainFactory.createWall({
        name: 'Short Wall',
        heightMM: 500, // Too short
        thicknessMM: 300,
        material: testMaterial(),
      });
      
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('INVALID_WALL_HEIGHT');
    });
    
    it('should reject wall height above maximum', () => {
      const result = DomainFactory.createWall({
        name: 'Tall Wall',
        heightMM: 25000, // Too tall
        thicknessMM: 300,
        material: testMaterial(),
      });
      
      expect(result.error).toBeDefined();
    });
  });
});
```

---

## SECTION 3: INTEGRATION TESTS

### 3.1 Integration Test Requirements

Integration tests verify multiple components working together:

```typescript
/**
 * Integration test: Drawing creation workflow
 */
import { DrawingService, WallValidator, DrawingRepository } from '../services';

describe('Drawing Creation Workflow', () => {
  let service: DrawingService;
  let validator: WallValidator;
  let repository: DrawingRepository;
  
  beforeEach(() => {
    validator = new WallValidator();
    repository = new MockDrawingRepository();
    service = new DrawingService(validator, repository);
  });
  
  it('should create complete drawing with walls and doors', async () => {
    // 1. Create drawing
    const drawing = await service.createDrawing({
      title: 'Test Drawing',
      scale: { ratio: '1:100', numerator: 1, denominator: 100, unit: 'mm' },
    });
    
    // 2. Add walls
    const wall = await service.addWall(drawing.id, {
      heightMM: 3000,
      thicknessMM: 300,
      material: testMaterial(),
    });
    
    // 3. Add doors to wall
    const door = await service.addDoor(drawing.id, wall.id, {
      widthMM: 900,
      heightMM: 2100,
      swingDirection: 'left',
    });
    
    // 4. Validate entire drawing
    const validation = await service.validate(drawing.id);
    
    expect(validation.valid).toBe(true);
    expect(drawing.sheets[0].elements).toContainEqual(
      expect.objectContaining({ type: 'wall' })
    );
  });
  
  it('should fail validation when adding invalid door', async () => {
    const drawing = await service.createDrawing({ title: 'Test' });
    const wall = await service.addWall(drawing.id, testWallProps());
    
    const result = await service.addDoor(drawing.id, wall.id, {
      widthMM: 50, // Too small
      heightMM: 2100,
      swingDirection: 'left',
    });
    
    expect(result.error).toBeDefined();
  });
});
```

---

## SECTION 4: END-TO-END TESTS

### 4.1 E2E Test Requirements

E2E tests verify complete user workflows:

```typescript
/**
 * E2E test: Complete drawing workflow
 */
import { Application } from '../app';

describe('Complete Drawing Workflow (E2E)', () => {
  let app: Application;
  
  beforeEach(async () => {
    app = await Application.create();
  });
  
  afterEach(async () => {
    await app.cleanup();
  });
  
  it('should load file, render, and export to SVG', async () => {
    // 1. Load drawing file
    const drawing = await app.openFile('fixtures/sample-drawing.json');
    expect(drawing).toBeDefined();
    
    // 2. Render to SVG
    const svg = await app.renderToSVG(drawing);
    expect(svg).toContain('<svg');
    expect(svg).toContain('<g');
    
    // 3. Validate SVG
    const validation = await app.validateSVG(svg);
    expect(validation.valid).toBe(true);
    
    // 4. Export to file
    const file = await app.exportToFile(svg, 'output.svg');
    expect(file).toBeDefined();
  });
});
```

---

## SECTION 5: COVERAGE REQUIREMENTS

### 5.1 Coverage Targets

| Category | Minimum | Target |
|----------|---------|--------|
| Domain logic | 80% | 95% |
| Drawing engine | 80% | 90% |
| Plugin system | 75% | 85% |
| API layer | 70% | 80% |
| Infrastructure | 60% | 75% |
| **Overall** | **70%** | **85%** |

### 5.2 Coverage Tools

```bash
# Run with coverage report
npm run test:coverage

# View coverage report
open coverage/lcov-report/index.html

# Enforce minimum coverage
npm run test:coverage -- --coverageThreshold='{"branches":70,"functions":70,"lines":70,"statements":70}'
```

---

## SECTION 6: TESTING CONFIGURATION

### 6.1 Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // Coverage
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/**/index.ts', // Exclude re-exports
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    './src/domain/**/*.ts': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  
  // Test matching
  testMatch: [
    '<rootDir>/src/**/*.test.ts',
    '<rootDir>/tests/**/*.test.ts',
  ],
  
  // Module setup
  moduleFileExtensions: ['ts', 'js', 'json'],
  
  // Transform
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
  },
};
```

---

## SECTION 7: CI/CD TESTING

### 7.1 GitHub Actions Workflow

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run type checking
        run: npm run type-check
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run integration tests
        run: npm run test:integration
      
      - name: Check coverage
        run: npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

### 7.2 Quality Gates

A PR cannot merge unless:
- [ ] All tests pass
- [ ] Coverage > 70%
- [ ] Linting passes
- [ ] Type checking passes
- [ ] No console.log in code

---

## SECTION 8: TEST DOUBLES

### 8.1 Mocks and Stubs

```typescript
/**
 * Mock drawing repository
 */
export class MockDrawingRepository implements DrawingRepository {
  private drawings = new Map<string, Drawing>();
  
  async save(drawing: Drawing): Promise<void> {
    this.drawings.set(drawing.id, drawing);
  }
  
  async get(id: string): Promise<Drawing | undefined> {
    return this.drawings.get(id);
  }
  
  async delete(id: string): Promise<void> {
    this.drawings.delete(id);
  }
}

/**
 * Mock validator
 */
export class MockValidator implements WallValidator {
  async validate(wall: Wall): Promise<ValidationResult> {
    return { valid: true };
  }
}
```

---

## SECTION 9: AI-GENERATED TEST REQUIREMENTS

When AI systems generate tests:

- [ ] Tests follow naming conventions
- [ ] Test coverage > 80% for generated code
- [ ] Tests use proper fixtures and factories
- [ ] Tests include happy path and error cases
- [ ] Tests are independent (can run in any order)
- [ ] Tests include JSDoc explaining what they test

---

**Constitution Part 9 - Approved and Effective: 2026-07-21**  
**Authority**: Part 1, Section 2.2.1  
**Next Review**: 2026-10-21  

*Quality assurance: Non-negotiable foundation of SPDS*