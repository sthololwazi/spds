# SPDS AI Constitution v1.0 - Part 10
## Documentation Standards and Writing Guidelines

**Document Status**: Official Specification  
**Version**: 1.0  
**Effective Date**: 2026-07-21  
**Authority**: Part 1, Section 2.2.2 (Clarity)  
**Audience**: All writers, technical communicators, developers  

---

## OVERVIEW

Part 10 defines documentation standards for SPDS. Documentation is code; it must be:
- **Accurate**: Matches the actual system
- **Complete**: Answers all common questions
- **Clear**: Written for the intended audience
- **Maintainable**: Easy to update
- **Discoverable**: Easy to find

**Principle**: "Documentation is a feature. It deserves the same quality as code."

---

## SECTION 1: DOCUMENTATION TYPES

### 1.1 Documentation Hierarchy

```
README.md
  ↓ (Quick start)
GETTING_STARTED.md
  ↓ (Tutorials)
GUIDES/
  ↓ (How-tos)
API_REFERENCE.md
  ↓ (Technical details)
ARCHITECTURE.md
  ↓ (System design)
FAQ.md
  ↓ (Common questions)
```

### 1.2 Documentation Types

**Type 1: README** - First impression
- What is this?
- Quick start in 5 minutes
- Links to detailed docs
- Installation
- Basic usage

**Type 2: Getting Started** - New user onboarding
- Prerequisites
- Step-by-step setup
- First successful example
- Common issues
- Next steps

**Type 3: Guides** - Task-based documentation
- How to create a drawing
- How to add walls
- How to export to SVG
- How to write plugins

**Type 4: API Reference** - Technical details
- Function signatures
- Parameters and types
- Return values
- Examples
- Error conditions

**Type 5: Architecture** - System design
- Design decisions
- Component relationships
- Data flows
- Extension points

**Type 6: FAQ** - Common questions
- Troubleshooting
- Best practices
- Common mistakes
- Tips and tricks

---

## SECTION 2: WRITING GUIDELINES

### 2.1 Tone and Voice

- **Friendly but professional**: Approachable without being casual
- **Clear over clever**: Clarity trumps cleverness
- **Active voice**: "The function returns" not "It is returned"
- **Second person**: "You can" not "One can"
- **Inclusive**: Consider diverse readers

### 2.2 Structure

Every documentation should have:

1. **Overview**: What is this?
2. **Prerequisites**: What do I need?
3. **Steps**: How do I do this?
4. **Example**: Show, don't just tell
5. **Next Steps**: What comes next?
6. **Troubleshooting**: Common issues

### 2.3 Sentence Structure

**Rules**:
- Short sentences (< 20 words)
- One idea per sentence
- Simple vocabulary
- Avoid jargon (define if necessary)
- Use lists instead of paragraphs when possible

**Example**:
```
❌ The DrawingEngine component, which is responsible for converting
   domain model objects into SVG representations, provides several
   configuration options that can be utilized to customize the rendering
   behavior of walls, doors, windows and other architectural elements.

✅ The DrawingEngine converts domain objects to SVG.

   Configuration options:
   - customize wall rendering
   - customize door rendering
   - customize window rendering
```

---

## SECTION 3: CODE DOCUMENTATION

### 3.1 JSDoc Comments

Every public API must have JSDoc:

```typescript
/**
 * Renders a wall to an SVG element.
 * 
 * @param wall - The wall object to render
 * @param context - The rendering context
 * @returns SVG element representing the wall
 * @throws {InvalidWallError} If wall data is invalid
 * 
 * @example
 * ```typescript
 * const wall = { id: '1', height: 3000 };
 * const svg = renderWallToSVG(wall, context);
 * ```
 * 
 * @see {@link renderDoorToSVG} for rendering doors
 * @see {@link RenderContext} for context options
 */
export function renderWallToSVG(
  wall: Wall,
  context: RenderContext
): SVGElement {
  // implementation
}
```

### 3.2 JSDoc Tags

Required tags for public functions:

| Tag | Required | Example |
|-----|----------|----------|
| `@param` | Yes | `@param drawing - The drawing to render` |
| `@returns` | Yes | `@returns SVG element` |
| `@throws` | If applicable | `@throws {InvalidDrawingError}` |
| `@example` | For complex functions | Code example |
| `@deprecated` | If deprecated | `@deprecated Use newFunction instead` |
| `@see` | For related items | `@see {@link relatedFunction}` |
| `@internal` | If internal only | `@internal Not for external use` |

### 3.3 Inline Comments

Inline comments explain "why," not "what":

```typescript
// ✅ GOOD: Explains reasoning
if (wall.height > 4000) {
  // Buildings must comply with typical ceiling height standards (ADA 2010).
  // Heights above 4m typically require engineering review.
  validateAgainstBuildingCode(wall);
}

// ❌ BAD: Explains what code does (obvious from code)
if (wall.height > 4000) {
  // If wall height is greater than 4000
  validateAgainstBuildingCode(wall);
}
```

---

## SECTION 4: README TEMPLATE

```markdown
# Project Name

One-sentence description of what this does.

## Features

- Feature 1
- Feature 2
- Feature 3

## Installation

```bash
npm install @spds/package-name
```

## Quick Start

```typescript
import { SomeClass } from '@spds/package-name';

const instance = new SomeClass();
await instance.initialize();

const result = await instance.doSomething();
console.log(result);
```

## Documentation

- [Getting Started](docs/getting-started.md)
- [API Reference](docs/api.md)
- [Architecture](docs/architecture.md)
- [FAQ](docs/faq.md)

## Examples

See [examples/](examples/) for complete examples.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## License

MIT
```

---

## SECTION 5: API DOCUMENTATION

### 5.1 Function Documentation

```markdown
## `renderWallToSVG(wall, context)`

Renders a wall object to an SVG element.

### Parameters

- `wall` (Wall): The wall object to render
  - Required
  - Must be valid according to WallValidator

- `context` (RenderContext): The rendering context
  - Required
  - Provides scale, canvas dimensions, options

### Returns

`SVGElement` - SVG group element (`<g>`) containing the wall representation.

### Throws

- `InvalidWallError` - If wall is invalid
- `RenderError` - If rendering fails

### Example

```typescript
const wall = {
  id: 'wall-001',
  height: 3000,
  thickness: 300,
  material: { id: 'brick', name: 'Brick' }
};

const svg = renderWallToSVG(wall, {
  scale: { ratio: '1:100' },
  screenScale: 1,
  options: { showDimensions: true }
});

// Add to SVG document
svgDocument.appendChild(svg);
```

### Related

- `renderDoorToSVG()` - Render a door
- `renderWindowToSVG()` - Render a window
- `RenderContext` - Configuration interface
```

---

## SECTION 6: EXAMPLE DOCUMENTATION

### 6.1 Example Template

```markdown
# Example: Create a Simple Drawing

This example shows how to create a drawing with walls and export to SVG.

## Prerequisites

- Node.js 18+
- SPDS installed

## Steps

### 1. Import SPDS

```typescript
import { Drawing, DrawingEngine, DomainFactory } from '@spds/core';
```

### 2. Create a drawing

```typescript
const drawing = DomainFactory.createDrawing({
  title: 'My First Drawing',
  scale: { ratio: '1:100', numerator: 1, denominator: 100, unit: 'mm' }
});
```

### 3. Add a wall

```typescript
const wall = DomainFactory.createWall({
  start: { xMM: 0, yMM: 0 },
  end: { xMM: 5000, yMM: 0 },
  height: 3000,
  thickness: 300,
  material: { id: 'brick', name: 'Brick' }
});

if (wall.ok) {
  drawing.sheets[0].elements.push(wall.ok);
}
```

### 4. Render to SVG

```typescript
const engine = new DrawingEngine();
const svg = await engine.renderDrawing(drawing, {
  scale: 1,
  showDimensions: true
});

const svgString = engine.toSVGString(svg);
console.log(svgString);
```

## Complete Code

See [examples/simple-drawing.ts](../examples/simple-drawing.ts) for the full example.

## Next Steps

- [Add doors and windows](./add-openings.md)
- [Export to PDF](./export-pdf.md)
- [Create plugins](./plugin-development.md)
```

---

## SECTION 7: ARCHITECTURE DOCUMENTATION

### 7.1 Architecture Decision Record (ADR)

Every significant architectural decision is documented:

```markdown
# ADR-001: Domain-Driven Architecture

**Date**: 2026-07-21  
**Status**: Accepted  
**Supersedes**: None  
**Superseded by**: None  

## Context

SPDS is a drawing standard platform for architectural and construction industry.
The system must accommodate complex domain concepts (walls, doors, openings,
dimensions) while remaining flexible and extensible.

## Decision

We will organize the system architecture around the construction domain model
rather than technical patterns (controllers, services, etc.).

Core layers:
1. Domain model (pure, no dependencies)
2. Application services (orchestration)
3. Infrastructure (persistence, I/O)
4. Presentation/API (user interface)

## Rationale

1. Domain clarity: Developers understand construction concepts
2. Extensibility: New element types require minimal core changes
3. Testability: Pure domain logic is easy to test
4. Longevity: Design survives framework changes

## Consequences

### Positive
- Domain logic is highly testable and reusable
- Adding new features is intuitive
- System is framework-agnostic
- Clear separation of concerns

### Negative
- Upfront design investment required
- Cannot rely on framework conventions
- Developers must understand the domain
- More explicit code required

## Alternatives Considered

### Alternative 1: Framework-Driven
Organize around framework patterns (MVC, layered architecture).
**Rejected**: Would constrain domain model to framework capabilities.

### Alternative 2: Microservices
Separate concerns into independent services.
**Rejected**: Premature complexity; start with monolith.

## Links

- [Domain-Driven Design](https://en.wikipedia.org/wiki/Domain-driven_design)
- [Architecture Rules (Part 3)](../ai/03_ARCHITECTURE_RULES.md)
```

---

## SECTION 8: TROUBLESHOOTING DOCUMENTATION

```markdown
# Troubleshooting

## Common Issues

### Issue: "InvalidWallError: Height below minimum"

**Cause**: Wall height is less than 1 meter (minimum requirement).

**Solution**:
```typescript
// ❌ WRONG: Height too small
const wall = createWall({ heightMM: 500 });

// ✅ CORRECT: Height >= 1000mm
const wall = createWall({ heightMM: 3000 });
```

**Related**: [Wall Height Constraints](api.md#wall-constraints)

### Issue: "SVG output is blank"

**Cause**: Drawing has no visible elements.

**Solution**:
1. Verify drawing has at least one sheet
2. Verify sheet has elements
3. Verify elements are not hidden
4. Check rendering options

**Debug**:
```typescript
const drawing = ...;
console.log('Sheets:', drawing.sheets.length);
console.log('Elements in sheet 0:', drawing.sheets[0].elements.length);
```

### Issue: "Plugin failed to activate"

**Cause**: Plugin manifest is invalid or dependencies not met.

**Solution**:
```bash
# Check manifest
json validate plugin.manifest.json

# Verify SPDS version
npm list @spds/core

# Check plugin logs
DEBUG=spds:* npm start
```
```

---

## SECTION 9: DOCUMENTATION MAINTENANCE

### 9.1 Keep Docs in Sync

**Rule**: If you change code, update docs.

- [ ] JSDoc comments updated
- [ ] README updated if features changed
- [ ] API reference updated
- [ ] Examples updated
- [ ] Architecture docs updated if design changed

### 9.2 Documentation Review

All documentation PRs must pass:
- [ ] Grammar and spelling correct
- [ ] Code examples runnable
- [ ] Links work
- [ ] Formatting consistent
- [ ] No outdated information

### 9.3 Documentation Versions

Documentation versions match software versions:
- Main branch: Latest documentation
- v1.0.0 tag: v1.0.0 documentation
- v1.1.0 tag: v1.1.0 documentation

---

## SECTION 10: GENERATED DOCUMENTATION

### 10.1 Auto-Generated API Docs

API reference is auto-generated from JSDoc:

```bash
# Generate API docs
npm run docs:generate

# Output: docs/api-reference.md
```

### 10.2 Changelog Generation

Changelog is auto-generated from git commits:

```bash
# Generate changelog
npm run changelog:generate

# Output: CHANGELOG.md
```

---

## SECTION 11: DOCUMENTATION CHECKLIST

### For Every Feature
- [ ] JSDoc on public APIs
- [ ] README updated
- [ ] API reference updated
- [ ] Example code created
- [ ] Troubleshooting updated
- [ ] Links checked

### For Major Changes
- [ ] Architecture ADR created
- [ ] Migration guide written
- [ ] FAQ updated
- [ ] Getting Started updated

---

**Constitution Part 10 - Approved and Effective: 2026-07-21**  
**Authority**: Part 1, Section 2.2.2  
**Next Review**: 2026-10-21  

*Clear documentation: The mark of a mature project*