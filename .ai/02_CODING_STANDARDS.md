# SPDS AI Constitution v1.0 - Part 2
## TypeScript Coding Standards and Practices

**Document Status**: Official Specification  
**Version**: 1.0  
**Effective Date**: 2026-07-21  
**Authority**: Part 1, Section 2 (Engineering Philosophy)  
**Language**: TypeScript 5.0+, ES2020+  
**Audience**: All developers and AI systems writing code  

---

## OVERVIEW

Part 2 defines the definitive coding standards for SPDS. Every line of TypeScript code, whether written by human or AI, must conform to these standards. These rules are not suggestions; they are requirements enforced by automated tooling and human review.

These standards serve a single purpose: **Enable any developer or AI system to understand any part of the codebase in 5 minutes.**

---

## SECTION 1: TYPESCRIPT FUNDAMENTALS

### 1.1 Type Safety Mandate

#### Rule 1.1.1: Strict Mode Required
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```
All SPDS projects must use these exact compiler options. No exceptions.

#### Rule 1.1.2: No `any` Type
**ABSOLUTE PROHIBITION**: The `any` type is forbidden in SPDS code.

- Any use of `any` automatically blocks a PR
- If `any` is unavoidable (external library), use `// @ts-ignore` with justification
- Each `// @ts-ignore` must include a comment explaining why:

```typescript
// ❌ FORBIDDEN
const data: any = fetchFromAPI();

// ✅ ACCEPTABLE (with justification)
// @ts-ignore: External library doesn't export proper types (upstream issue #1234)
const data = fetchFromAPI();
```

#### Rule 1.1.3: Explicit Function Signatures
Every function must have explicit parameter and return types:

```typescript
// ✅ CORRECT
export function createWall(name: string, height: number): Wall {
  return { id: generateId(), name, height };
}

// ❌ WRONG
export function createWall(name, height) {
  return { id: generateId(), name, height };
}

// ❌ WRONG
export function createWall(name: string, height: number): any {
  return { id: generateId(), name, height };
}
```

#### Rule 1.1.4: Explicit Variable Types (Context-Dependent)
Variable types should be explicit UNLESS TypeScript can infer with certainty:

```typescript
// ✅ Type is obvious from context
const walls: Wall[] = [];
const id = 'wall-001'; // Inferred as string
const count = 42; // Inferred as number

// ✅ Type is complex; explicit for clarity
const config: DrawingConfig = parseConfig(rawInput);
const validators: Map<string, Validator> = new Map();

// ❌ Ambiguous; should be explicit
const data = fetchDrawing(); // What is the return type?
const result = process(input); // What is the return type?
```

---

### 1.2 Type Design

#### Rule 1.2.1: Interfaces Over Types (Usually)
Prefer `interface` for public APIs; use `type` for unions and complex patterns:

```typescript
// ✅ PREFERRED: Domain entities as interfaces
export interface Wall {
  id: string;
  name: string;
  height: number;
  material: Material;
}

// ✅ ACCEPTABLE: Type unions
export type ElementType = 'wall' | 'door' | 'window' | 'fixture';

// ✅ ACCEPTABLE: Complex utility types
export type Nullable<T> = T | null;
```

#### Rule 1.2.2: Composition Over Inheritance
Prefer composition and interface extension over class inheritance:

```typescript
// ✅ PREFERRED: Composition via interfaces
export interface Entity {
  id: string;
  createdAt: Date;
}

export interface Wall extends Entity {
  name: string;
  height: number;
}

// ❌ AVOID: Deep class hierarchies
export class BaseEntity {
  id: string;
  createdAt: Date;
}

export class Wall extends BaseEntity {
  name: string;
  height: number;
}
```

#### Rule 1.2.3: Discriminated Unions for Polymorphism
Use discriminated unions instead of inheritance for type variants:

```typescript
// ✅ PREFERRED: Discriminated union
export type Element = 
  | { type: 'wall'; height: number; material: Material }
  | { type: 'door'; width: number; swingDirection: 'left' | 'right' }
  | { type: 'window'; width: number; height: number };

// ❌ AVOID: Base class + inheritance
export class Element {
  constructor(public type: string) {}
}

export class Wall extends Element {
  constructor(public height: number) { super('wall'); }
}
```

#### Rule 1.2.4: Generic Types Must Be Constrained
When using generics, always provide constraints where appropriate:

```typescript
// ✅ CORRECT: Constrained generic
export function validate<T extends Validatable>(obj: T): ValidationResult {
  return obj.validate();
}

// ❌ WRONG: Unconstrained generic
export function validate<T>(obj: T): ValidationResult {
  // What methods/properties does T have?
}
```

---

### 1.3 Immutability

#### Rule 1.3.1: Prefer Immutability
Treat domain objects as immutable by default:

```typescript
// ✅ PREFERRED: Immutable by default
export interface Wall {
  readonly id: string;
  readonly name: string;
  readonly height: number;
}

export function updateWallHeight(wall: Wall, newHeight: number): Wall {
  return { ...wall, height: newHeight }; // Create new object
}

// ❌ AVOID: Mutable state
export class Wall {
  id: string;
  name: string;
  height: number;
  
  updateHeight(newHeight: number): void {
    this.height = newHeight; // Mutation
  }
}
```

#### Rule 1.3.2: const for References
Always use `const` for variable declarations. Never use `var`. Use `let` only when reassignment is necessary:

```typescript
// ✅ CORRECT
const walls: Wall[] = [];
const config = getConfig();
let counter = 0; // Only when needed

// ❌ WRONG
var walls = [];
let config = getConfig(); // `const` would be better
```

---

## SECTION 2: NAMING CONVENTIONS

### 2.1 Naming Cases

| Category | Case | Example | Notes |
|----------|------|---------|-------|
| Classes | PascalCase | `DrawingEngine`, `WallValidator` | Always singular |
| Interfaces | PascalCase | `Drawing`, `Validator` | Always singular |
| Types | PascalCase | `ElementType`, `Position` | Descriptive |
| Enums | PascalCase | `RenderMode`, `DrawingState` | Singular |
| Functions | camelCase | `createWall`, `validateDrawing` | Start with verb |
| Methods | camelCase | `toSVG`, `validate` | Start with verb |
| Properties | camelCase | `wallHeight`, `isActive` | Noun or adjective |
| Constants | UPPER_SNAKE_CASE | `MAX_WALL_HEIGHT`, `SVG_NAMESPACE` | All caps |
| Private members | _leadingUnderscore | `_internalState`, `_cache` | Prefix with `_` |
| Boolean properties | is/has/can prefix | `isActive`, `hasChildren`, `canRender` | Boolean indicator |

### 2.2 Specificity in Names

#### Rule 2.2.1: Names Must Be Specific
Names should be specific enough that their purpose is unambiguous:

```typescript
// ✅ CLEAR
export function calculateWallDimensions(wall: Wall): Dimensions {
  // ...
}

export function renderDrawingToSVG(drawing: Drawing): SVGElement {
  // ...
}

// ❌ VAGUE
export function calculate(obj: any): any {
  // What is being calculated?
}

export function render(data: any): any {
  // What is being rendered? What format?
}
```

#### Rule 2.2.2: Avoid Abbreviations (Except Standard)
Only use abbreviations if they're universally understood:

```typescript
// ✅ ACCEPTABLE
export interface SVGElement { /* ... */ }
export function getHTMLElement(): Element { /* ... */ }
export const MAX_ID_LENGTH = 255;

// ❌ AVOID
export function calcWallDim(w: any): any { /* ... */ } // What is 'w'?
export function procElem(el: any): any { /* ... */ } // Process? Procedure?
export const MAX_DIMS = 1000; // Dimensions? Dimensions of what?
```

---

## SECTION 3: CODE ORGANIZATION

### 3.1 File Structure

#### Rule 3.1.1: One Primary Export Per File
Each file should export exactly one class, interface, or function group:

```
src/
├── domain/
│   ├── wall.ts              # Exports: Wall, WallValidator
│   ├── door.ts              # Exports: Door, DoorValidator
│   ├── element.ts           # Exports: Element (discriminated union)
│   └── index.ts             # Re-exports public API
├── drawing/
│   ├── engine.ts            # Exports: DrawingEngine
│   ├── renderer.ts          # Exports: Renderer
│   └── index.ts             # Re-exports public API
└── index.ts                 # Main public API
```

#### Rule 3.1.2: Collocate Tests
Test files live beside source files:

```
src/
├── domain/
│   ├── wall.ts
│   ├── wall.test.ts         # Co-located
│   ├── door.ts
│   ├── door.test.ts         # Co-located
```

#### Rule 3.1.3: Index Files Only Re-export
Index files should ONLY re-export public API. No implementation:

```typescript
// ✅ CORRECT: src/domain/index.ts
export { Wall, WallValidator } from './wall';
export { Door, DoorValidator } from './door';
export type { Element, ElementType } from './element';

// ❌ WRONG: Implementation in index.ts
export class Wall {
  // Implementation in index.ts is harder to find
}
```

### 3.2 Directory Structure

#### Rule 3.2.1: Organized by Domain, Not Framework
Organize around domain concepts, not technical patterns:

```
// ✅ PREFERRED: Domain-organized
src/
├── domain/           # Core drawing domain
│   ├── wall/
│   ├── door/
│   ├── window/
│   └── fixture/
├── drawing/          # Drawing engine & rendering
│   ├── renderer/
│   ├── converter/
│   └── validator/
├── api/              # Public API surface
└── plugins/          # Plugin system

// ❌ AVOID: Framework-organized
src/
├── components/
├── services/
├── utils/
├── models/
└── controllers/
```

---

## SECTION 4: FUNCTIONS AND METHODS

### 4.1 Function Design

#### Rule 4.1.1: Single Responsibility
Each function should do ONE thing well:

```typescript
// ✅ GOOD: Single responsibility
export function validateWall(wall: Wall): ValidationResult {
  // Only validates wall structure
}

export function renderWallToSVG(wall: Wall): SVGElement {
  // Only renders to SVG
}

// ❌ BAD: Multiple responsibilities
export function processWall(wall: Wall): SVGElement {
  // Validates AND renders? Too many concerns
}
```

#### Rule 4.1.2: Function Length
- Keep functions to ~50 lines maximum
- If a function exceeds 50 lines, break it into smaller functions
- Exception: Long lists (e.g., switch statements) can exceed 50 lines if necessary

#### Rule 4.1.3: Parameter Limits
- Maximum 3 parameters for regular functions
- Use objects for 4+ parameters:

```typescript
// ✅ GOOD: Few parameters
export function renderWall(wall: Wall, scale: number): SVGElement {
  // ...
}

// ✅ GOOD: Object for many parameters
export interface RenderOptions {
  scale: number;
  showDimensions: boolean;
  highlightSelected: boolean;
  theme: 'light' | 'dark';
}

export function render(wall: Wall, options: RenderOptions): SVGElement {
  // ...
}

// ❌ BAD: Too many parameters
export function render(
  wall: Wall,
  scale: number,
  showDimensions: boolean,
  highlightSelected: boolean,
  theme: 'light' | 'dark'
): SVGElement {
  // ...
}
```

#### Rule 4.1.4: Pure Functions Preferred
Favor pure functions (no side effects) for domain logic:

```typescript
// ✅ PURE: No side effects
export function calculateWallArea(width: number, height: number): number {
  return width * height;
}

// ❌ IMPURE: Side effect (logging)
export function calculateWallArea(width: number, height: number): number {
  console.log(`Calculating area for ${width}x${height}`);
  return width * height;
}
```

---

### 4.2 Documentation

#### Rule 4.2.1: JSDoc for Public APIs
All exported functions, classes, and interfaces must have JSDoc:

```typescript
/**
 * Renders a wall to an SVG element.
 * 
 * @param wall - The wall object to render
 * @param scale - The scale factor (e.g., 100 for 1:100 scale)
 * @returns SVG element representing the wall
 * @throws {InvalidWallError} If wall data is invalid
 * 
 * @example
 * const wall = { id: '1', height: 3, material: 'brick' };
 * const svg = renderWallToSVG(wall, 100);
 */
export function renderWallToSVG(wall: Wall, scale: number): SVGElement {
  // ...
}
```

#### Rule 4.2.2: JSDoc Sections
Required sections for complex functions:
- `@param` for each parameter
- `@returns` for return value
- `@throws` if function throws errors
- `@example` for usage
- `@see` for related functions

#### Rule 4.2.3: Inline Comments (Why, Not What)
Inline comments should explain "why," not "what":

```typescript
// ✅ GOOD: Explains reasoning
if (wall.height > 4) {
  // Buildings must comply with typical ceiling height standards (ADA 2010)
  validateAgainstBuildingCode(wall);
}

// ❌ BAD: Explains what the code does
if (wall.height > 4) {
  // If wall height is greater than 4
  validateAgainstBuildingCode(wall);
}
```

---

## SECTION 5: ERROR HANDLING

### 5.1 Custom Errors

#### Rule 5.1.1: Domain-Specific Error Classes
Create custom errors for domain-specific problems:

```typescript
// ✅ GOOD: Domain-specific error
export class InvalidWallError extends Error {
  constructor(
    public wall: Wall,
    public reason: string
  ) {
    super(`Invalid wall: ${reason}`);
    this.name = 'InvalidWallError';
  }
}

// Usage
try {
  validateWall(wall);
} catch (error) {
  if (error instanceof InvalidWallError) {
    console.error(`Wall ${error.wall.id} is invalid: ${error.reason}`);
  }
}
```

#### Rule 5.1.2: Never Use `throw new Error()`
Always use custom error classes:

```typescript
// ✅ CORRECT
throw new InvalidWallError(wall, 'Height exceeds maximum');

// ❌ WRONG: Generic error
throw new Error('Invalid wall');
```

### 5.2 Try-Catch

#### Rule 5.2.1: Catch Specific Errors
Catch only errors you can handle:

```typescript
// ✅ GOOD: Specific error handling
try {
  const wall = parseWallData(input);
  return wall;
} catch (error) {
  if (error instanceof InvalidWallError) {
    console.error('Wall parse failed:', error.reason);
    return null;
  }
  // Re-throw unknown errors
  throw error;
}

// ❌ BAD: Catches everything
try {
  const wall = parseWallData(input);
  return wall;
} catch (error) {
  console.error('Something went wrong');
  return null;
}
```

---

## SECTION 6: CLASSES AND CONSTRUCTORS

### 6.1 Class Design

#### Rule 6.1.1: Minimal Classes
Use classes only when you need state + behavior together. Prefer interfaces + functions:

```typescript
// ✅ PREFERRED: Functions + interfaces
export interface Wall {
  readonly id: string;
  readonly height: number;
}

export function createWall(id: string, height: number): Wall {
  return { id, height };
}

// ✅ ACCEPTABLE: Class with clear responsibility
export class DrawingEngine {
  private _layers: Layer[] = [];
  
  addLayer(layer: Layer): void {
    this._layers.push(layer);
  }
  
  render(): SVGElement {
    // ...
  }
}

// ❌ AVOID: Unnecessary class
export class WallUtils {
  static validate(wall: Wall): ValidationResult { }
  static render(wall: Wall): SVGElement { }
  static serialize(wall: Wall): string { }
}
// Use functions instead
```

#### Rule 6.1.2: Constructors
Keep constructors simple; do initialization in factories:

```typescript
// ✅ GOOD: Simple constructor
export class DrawingEngine {
  private _layers: Layer[] = [];
  
  constructor(private config: DrawingConfig) {}
  
  // Factory method for complex initialization
  static async create(configPath: string): Promise<DrawingEngine> {
    const config = await loadConfig(configPath);
    return new DrawingEngine(config);
  }
}

// ❌ BAD: Complex initialization in constructor
export class DrawingEngine {
  private _layers: Layer[];
  
  constructor(configPath: string) {
    // Heavy initialization in constructor
    this._layers = loadLayersFromFile(configPath);
    this.validate();
    this.optimize();
  }
}
```

---

## SECTION 7: ASYNC/AWAIT

### 7.1 Async Functions

#### Rule 7.1.1: Return Type Must Be Promise<T>

```typescript
// ✅ CORRECT
export async function loadDrawing(path: string): Promise<Drawing> {
  const data = await fs.readFile(path);
  return parseDrawing(data);
}

// ❌ WRONG: Missing type
export async function loadDrawing(path: string) {
  const data = await fs.readFile(path);
  return parseDrawing(data);
}

// ❌ WRONG: Wrong type annotation
export async function loadDrawing(path: string): Drawing {
  // Should be Promise<Drawing>
  const data = await fs.readFile(path);
  return parseDrawing(data);
}
```

#### Rule 7.1.2: Error Handling in Async Functions

```typescript
// ✅ GOOD: Explicit error handling
export async function loadDrawing(path: string): Promise<Drawing> {
  try {
    const data = await fs.readFile(path);
    return parseDrawing(data);
  } catch (error) {
    if (error instanceof FileNotFoundError) {
      throw new DrawingLoadError(`Drawing not found: ${path}`);
    }
    throw error;
  }
}
```

---

## SECTION 8: IMPORTS AND EXPORTS

### 8.1 Import Organization

#### Rule 8.1.1: Group Imports
Organize imports in this order:
1. External libraries
2. Relative imports from parent directories
3. Relative imports from sibling directories
4. Relative imports from subdirectories

```typescript
// ✅ CORRECT: Organized imports
import { validate } from 'fastest-validator';

import type { DrawingConfig } from '../config';
import { loadConfig } from '../config';

import { ElementValidator } from './validators';
import { render } from './renderer';

import { WallRenderer } from './renderers/wall';
```

#### Rule 8.1.2: Use Named Imports
Prefer named imports over default exports (except in rare cases):

```typescript
// ✅ PREFERRED
import { Wall, WallValidator } from './domain';

// ❌ AVOID
import * as domain from './domain';
const wall = domain.Wall;

// ✅ ACCEPTABLE: Default exports for main entry points
import DrawingEngine from './engine';
```

#### Rule 8.1.3: Type-Only Imports
Use `import type` for type-only imports:

```typescript
// ✅ GOOD: Explicit type import
import type { Wall, Drawing } from './domain';
import { validateWall } from './validators';

// ❌ BAD: Imports type via value import
import { Wall, validateWall } from './domain';
```

### 8.2 Exports

#### Rule 8.2.1: Named Exports Only
Use named exports. Default exports are permitted only for main module exports:

```typescript
// ✅ CORRECT: Named exports
export interface Wall { }
export function createWall(): Wall { }
export class WallValidator { }

// ❌ AVOID: Default export
export default class Wall { }
```

---

## SECTION 9: LINTING AND FORMATTING

### 9.1 ESLint Configuration

#### Rule 9.1.1: ESLint Rules
All code must pass these ESLint rules (non-negotiable):

```javascript
// .eslintrc.js
module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  rules: {
    'no-console': 'warn',
    'no-debugger': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-types': 'error',
    'prefer-const': 'error',
    'no-var': 'error'
  }
};
```

### 9.2 Prettier

#### Rule 9.2.1: Prettier Configuration

```javascript
// .prettierrc.js
module.exports = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  arrowParens: 'always'
};
```

---

## SECTION 10: TESTING

Detailed in Part 9, but brief guidelines here:

### 10.1 Unit Tests

#### Rule 10.1.1: Test Naming
```typescript
// ✅ GOOD: Describes behavior
describe('calculateWallArea', () => {
  it('should return correct area for valid dimensions', () => {
    expect(calculateWallArea(10, 5)).toBe(50);
  });
  
  it('should throw error for invalid dimensions', () => {
    expect(() => calculateWallArea(-10, 5)).toThrow();
  });
});
```

---

## SECTION 11: AI-SPECIFIC GUIDANCE

When AI systems generate code for SPDS:

### 11.1 Code Generation Checklist
- [ ] All functions have explicit return types
- [ ] All parameters have explicit types
- [ ] No `any` types used
- [ ] All public APIs have JSDoc
- [ ] Comments explain "why," not "what"
- [ ] Functions follow single responsibility principle
- [ ] Error handling uses custom error classes
- [ ] Tests included with >80% coverage
- [ ] Naming follows conventions (PascalCase/camelCase/UPPER_SNAKE_CASE)
- [ ] Imports organized correctly
- [ ] No console.log in production code

---

**Constitution Part 2 - Approved and Effective: 2026-07-21**  
**Authority**: Part 1, Section 2  
**Next Review**: 2026-10-21  

*Standards by which all SPDS code is judged*