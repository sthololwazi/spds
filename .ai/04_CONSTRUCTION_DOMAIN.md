# SPDS AI Constitution v1.0 - Part 4
## Construction Domain Model and Concepts

**Document Status**: Official Specification  
**Version**: 1.0  
**Effective Date**: 2026-07-21  
**Authority**: Part 1, Section 2.1.1 (Domain-Driven Architecture)  
**Audience**: All developers, domain experts, AI systems  

---

## OVERVIEW

Part 4 defines the core construction domain model for SPDS. This is the language through which all architectural and construction problems are expressed. Every system in SPDS—whether drawing engine, plugin system, or AI agent—must respect and understand this domain model.

**Principle**: The domain model is NOT a database schema. It is a conceptual model of construction drawing reality.

---

## SECTION 1: FUNDAMENTAL DOMAIN CONCEPTS

### 1.1 Drawing

The top-level container representing a complete architectural drawing.

```typescript
export interface Drawing {
  readonly id: string;                    // Unique identifier
  readonly title: string;                 // Drawing title
  readonly description: string;           // Purpose and scope
  readonly version: string;               // Semantic version (1.0.0)
  readonly revisionNumber: number;        // Revision count
  readonly createdAt: Date;               // Creation timestamp
  readonly updatedAt: Date;               // Last modification
  readonly author: Person;                // Creator
  readonly scale: Scale;                  // Drawing scale
  readonly sheets: ReadonlyArray<Sheet>;  // Pages/sheets
  readonly metadata: DrawingMetadata;     // Additional properties
}

export interface DrawingMetadata {
  projectName: string;
  projectNumber: string;
  site: string;
  phase: string;                          // Design phase
  discipline: 'architecture' | 'structural' | 'mechanical' | string;
  preparedFor: string;                    // Client/stakeholder
  notes: string;                          // General notes
}
```

**Rules**:
- Every drawing must have a unique ID
- Scale is mandatory and immutable
- Metadata is immutable (use new Drawing with updated metadata)
- All dates in UTC ISO 8601 format

### 1.2 Sheet

A logical page or canvas within a drawing.

```typescript
export interface Sheet {
  readonly id: string;                        // Unique within drawing
  readonly name: string;                      // Sheet name ("A1", "Floor Plan", etc.)
  readonly index: number;                     // Order in drawing (0-based)
  readonly dimensions: SheetDimensions;       // Physical size
  readonly marginInMM: Margin;                // Page margins
  readonly elements: ReadonlyArray<Element>;  // Content
  readonly annotations: ReadonlyArray<Annotation>; // Labels, notes, dimensions
  readonly titleBlock: TitleBlock;            // Standard title block
}

export interface SheetDimensions {
  readonly widthMM: number;        // Paper width in millimeters
  readonly heightMM: number;       // Paper height in millimeters
  readonly sizeDesignation: string; // "A4", "A3", "A2", "A1", "A0"
}

export interface Margin {
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly left: number;
}

export interface TitleBlock {
  readonly projectName: string;
  readonly sheetTitle: string;
  readonly sheetNumber: string;
  readonly revisionNumber: number;
  readonly date: Date;
  readonly architect: string;
  readonly drawingScale: string;
  readonly position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}
```

**Rules**:
- Sheet dimensions must be standard paper sizes (ISO 216: A4, A3, A2, A1, A0)
- Margins are typically 10-20mm
- Title block is mandatory on every sheet
- Elements are ordered front-to-back (first element is background)

---

## SECTION 2: ELEMENTS

### 2.1 Element Base

An element is any geometric or semantic object in a drawing.

```typescript
export type ElementType = 
  | 'wall'
  | 'door'
  | 'window'
  | 'fixture'
  | 'dimension'
  | 'annotation'
  | 'area'
  | 'grid'
  | 'custom';

export interface Element {
  readonly id: string;                // Unique within sheet
  readonly type: ElementType;         // Element classification
  readonly layer: string;             // Layer name for organization
  readonly locked: boolean;           // Cannot be edited
  readonly visible: boolean;          // Visible in output
  readonly geometry: Geometry;        // Shape/spatial representation
  readonly style: ElementStyle;       // Visual appearance
  readonly properties: Record<string, unknown>; // Domain-specific properties
  readonly metadata: ElementMetadata; // Tracking info
}

export interface ElementMetadata {
  readonly createdAt: Date;
  readonly createdBy: string;
  readonly revisionNumber: number;
  readonly tags: ReadonlyArray<string>; // For filtering/categorization
}

export interface ElementStyle {
  readonly stroke: StrokeStyle;
  readonly fill: FillStyle;
  readonly opacity: number;           // 0-1
  readonly layerStyle?: LayerStyle;   // Per-layer override
}
```

### 2.2 Geometry

The spatial representation of an element.

```typescript
export type Geometry = 
  | PointGeometry
  | LineGeometry
  | PolygonGeometry
  | CircleGeometry
  | ArcGeometry
  | CustomGeometry;

export interface PointGeometry {
  readonly type: 'point';
  readonly position: Position;
}

export interface LineGeometry {
  readonly type: 'line';
  readonly start: Position;
  readonly end: Position;
}

export interface PolygonGeometry {
  readonly type: 'polygon';
  readonly vertices: ReadonlyArray<Position>; // Closed path
}

export interface CircleGeometry {
  readonly type: 'circle';
  readonly center: Position;
  readonly radiusMM: number;
}

export interface ArcGeometry {
  readonly type: 'arc';
  readonly center: Position;
  readonly radiusMM: number;
  readonly startAngleDegrees: number;
  readonly endAngleDegrees: number;
}

export interface CustomGeometry {
  readonly type: 'custom';
  readonly data: unknown; // Plugin-defined geometry
}

export interface Position {
  readonly xMM: number;   // X in millimeters
  readonly yMM: number;   // Y in millimeters
  readonly zOrder?: number; // Stacking order (0 = background)
}
```

**Rules**:
- All coordinates in millimeters (domain unit)
- Positions are relative to sheet origin (top-left = 0,0)
- Z-order: lower numbers render first (background to foreground)
- Polygons must have at least 3 vertices
- Angles in degrees (0-360)

### 2.3 Wall Element

```typescript
export interface Wall extends Element {
  readonly type: 'wall';
  readonly properties: WallProperties;
}

export interface WallProperties {
  readonly heightMM: number;              // Wall height
  readonly thicknessMM: number;           // Wall thickness
  readonly material: Material;
  readonly fireRating?: string;           // e.g., "2-hour"
  readonly soundTransmission?: number;    // STC rating
  readonly doors: ReadonlyArray<Door>;    // Doors in this wall
  readonly windows: ReadonlyArray<Window>; // Windows in this wall
  readonly notes: string;                 // Specifications
}

export interface Material {
  readonly id: string;
  readonly name: string;                  // e.g., "Brick", "Concrete Block"
  readonly code: string;                  // e.g., "CMU 8\" Concrete Block"
  readonly density: number;               // kg/m³
  readonly thermalResistance?: number;    // R-value
}
```

### 2.4 Door Element

```typescript
export interface Door extends Element {
  readonly type: 'door';
  readonly properties: DoorProperties;
}

export interface DoorProperties {
  readonly widthMM: number;                // Door opening width
  readonly heightMM: number;               // Door opening height
  readonly swingDirection: 'left' | 'right' | 'both' | 'slide';
  readonly material: Material;
  readonly fireRating?: string;            // e.g., "1.5-hour"
  readonly doorType: DoorType;
  readonly hardware: string;               // Hardware specification
  readonly remarks: string;
}

export type DoorType = 
  | 'swing'
  | 'pocket'
  | 'bifold'
  | 'sliding'
  | 'sliding-pocket'
  | 'accordion'
  | 'revolving';
```

### 2.5 Window Element

```typescript
export interface Window extends Element {
  readonly type: 'window';
  readonly properties: WindowProperties;
}

export interface WindowProperties {
  readonly widthMM: number;               // Window opening width
  readonly heightMM: number;              // Window opening height
  readonly sillHeightMM: number;          // Height above floor
  readonly windowType: WindowType;
  readonly glazing: GlazingSpecification;
  readonly frame: FrameSpecification;
  readonly remarks: string;
}

export type WindowType = 
  | 'fixed'
  | 'single-hung'
  | 'double-hung'
  | 'casement'
  | 'awning'
  | 'sliding'
  | 'picture';

export interface GlazingSpecification {
  readonly glassType: 'clear' | 'tinted' | 'frosted' | 'tempered';
  readonly thickness: number;            // mm
  readonly uValue?: number;              // Thermal conductance
  readonly solarHeatGain?: number;       // SHGC
}

export interface FrameSpecification {
  readonly material: 'wood' | 'aluminum' | 'vinyl' | 'fiberglass';
  readonly finish?: string;              // Paint or stain specification
}
```

### 2.6 Dimension

A dimension annotation that measures and labels distances.

```typescript
export interface Dimension extends Element {
  readonly type: 'dimension';
  readonly properties: DimensionProperties;
}

export interface DimensionProperties {
  readonly dimensionType: DimensionType;
  readonly value: number;                 // Value in millimeters
  readonly unit: 'mm' | 'cm' | 'm' | 'in' | 'ft';
  readonly referenceElements: ReadonlyArray<string>; // IDs of measured elements
  readonly text: string;                  // Label text
  readonly tolerance?: Tolerance;
}

export type DimensionType = 
  | 'linear'      // Single line dimension
  | 'aligned'     // Aligned to object
  | 'angular'     // Angle dimension
  | 'arc-length'  // Arc dimension
  | 'diameter'    // Circle diameter
  | 'radius';     // Circle radius

export interface Tolerance {
  readonly upperLimit: number;
  readonly lowerLimit: number;
  readonly type: 'bilateral' | 'unilateral' | 'limit';
}
```

### 2.7 Annotation

Text, notes, and labels.

```typescript
export interface Annotation extends Element {
  readonly type: 'annotation';
  readonly properties: AnnotationProperties;
}

export interface AnnotationProperties {
  readonly text: string;                  // Annotation text
  readonly fontSize: number;              // Points
  readonly fontFamily: string;            // Font name
  readonly alignment: TextAlignment;      // Horizontal alignment
  readonly verticalAlignment: 'top' | 'middle' | 'bottom';
  readonly backgroundColor?: string;      // Hex color
  readonly referencedElement?: string;    // Element ID this refers to
}

export type TextAlignment = 'left' | 'center' | 'right';
```

---

## SECTION 3: SCALE AND MEASUREMENT

### 3.1 Scale Definition

```typescript
export interface Scale {
  readonly ratio: string;                 // "1:100", "1/4\" = 1'-0\""
  readonly numerator: number;             // 1
  readonly denominator: number;           // 100
  readonly unit: ScaleUnit;               // mm, cm, m, in, ft
}

export type ScaleUnit = 
  | 'mm'  // Millimeters (metric)
  | 'cm'  // Centimeters (metric)
  | 'm'   // Meters (metric)
  | 'in'  // Inches (imperial)
  | 'ft'  // Feet (imperial)
  | 'us'; // US survey feet

/**
 * Standard architectural scales
 */
export const STANDARD_SCALES = {
  FULL_SIZE: { ratio: '1:1', numerator: 1, denominator: 1 },
  HALF_INCH: { ratio: '1/2\" = 1\'-0\"', numerator: 1, denominator: 24 },
  QUARTER_INCH: { ratio: '1/4\" = 1\'-0\"', numerator: 1, denominator: 48 },
  EIGHTH_INCH: { ratio: '1/8\" = 1\'-0\"', numerator: 1, denominator: 96 },
  ONE_TO_FIFTY: { ratio: '1:50', numerator: 1, denominator: 50 },
  ONE_TO_HUNDRED: { ratio: '1:100', numerator: 1, denominator: 100 },
  ONE_TO_TWO_HUNDRED: { ratio: '1:200', numerator: 1, denominator: 200 },
} as const;
```

### 3.2 Unit Conversion

```typescript
export interface UnitConverter {
  /**
   * Convert a measurement from one unit to another
   */
  convert(value: number, from: ScaleUnit, to: ScaleUnit): number;
  
  /**
   * Get display string for a measurement
   * e.g., 1200 mm -> "1.2 m" or "3'-11.25\""
   */
  format(value: number, unit: ScaleUnit, precision?: number): string;
}
```

**Rules**:
- All internal measurements stored in millimeters
- Conversion happens only at display boundaries
- Never perform calculations in different units

---

## SECTION 4: VALIDATION RULES

### 4.1 Domain Invariants

These rules are ALWAYS enforced, never violated:

#### Rule 4.1.1: Wall Heights
```typescript
export const WALL_HEIGHT_CONSTRAINTS = {
  minimumMM: 1000,          // 1 meter
  maximumMM: 20000,         // 20 meters
  standardMM: 3000,         // Standard 3m floor-to-floor
};

// Validation function
export function validateWallHeight(heightMM: number): ValidationResult {
  if (heightMM < WALL_HEIGHT_CONSTRAINTS.minimumMM) {
    return { valid: false, error: 'Wall height below minimum' };
  }
  if (heightMM > WALL_HEIGHT_CONSTRAINTS.maximumMM) {
    return { valid: false, error: 'Wall height exceeds maximum' };
  }
  return { valid: true };
}
```

#### Rule 4.1.2: Door and Window Sizes
```typescript
export const OPENING_CONSTRAINTS = {
  door: {
    minWidthMM: 600,         // 600mm minimum
    maxWidthMM: 3000,        // 3m maximum
    minHeightMM: 1800,       // 1.8m minimum
    maxHeightMM: 3000,       // 3m maximum
  },
  window: {
    minWidthMM: 400,
    maxWidthMM: 3000,
    minHeightMM: 400,
    maxHeightMM: 2500,
  },
};
```

#### Rule 4.1.3: Element Overlap
- Doors and windows cannot overlap within a wall
- Elements in different layers can overlap visually
- Overlaps are detected and reported during validation

#### Rule 4.1.4: Drawing Completeness
A valid drawing must have:
- [ ] Unique ID
- [ ] Title and author
- [ ] Scale defined
- [ ] At least one sheet
- [ ] Each sheet has title block
- [ ] All dimensions include units
- [ ] All annotations are legible

---

## SECTION 5: DOMAIN PATTERNS

### 5.1 Creating Domain Objects

Domain objects are created through factories, never directly:

```typescript
/**
 * Factory for creating domain objects with validation
 */
export class DomainFactory {
  static createWall(props: WallProps): Result<Wall, ValidationError> {
    // Validate properties
    const validation = validateWallHeight(props.heightMM);
    if (!validation.valid) {
      return { error: validation.error };
    }
    
    // Create and return
    return {
      ok: {
        id: generateId(),
        type: 'wall' as const,
        layer: 'walls',
        locked: false,
        visible: true,
        geometry: createLineGeometry(props.start, props.end),
        style: defaultWallStyle(),
        properties: props,
        metadata: {
          createdAt: new Date(),
          createdBy: 'system',
          revisionNumber: 0,
          tags: [],
        },
      },
    };
  }
}
```

### 5.2 Immutability Pattern

Domain objects never change; modifications create new objects:

```typescript
// To modify a wall height:
export function updateWallHeight(
  wall: Wall,
  newHeightMM: number
): Result<Wall, ValidationError> {
  // Validate new height
  const validation = validateWallHeight(newHeightMM);
  if (!validation.valid) {
    return { error: validation.error };
  }
  
  // Create new wall with updated height
  const updated: Wall = {
    ...wall,
    properties: {
      ...wall.properties,
      heightMM: newHeightMM,
    },
    metadata: {
      ...wall.metadata,
      revisionNumber: wall.metadata.revisionNumber + 1,
    },
  };
  
  return { ok: updated };
}
```

---

## SECTION 6: RESULT TYPE

All domain operations return explicit Result types:

```typescript
export type Result<T, E> = 
  | { ok: T; error?: never }
  | { ok?: never; error: E };

export interface ValidationError {
  readonly code: string;
  readonly message: string;
  readonly context?: unknown;
}

// Usage:
export function createDrawing(props: DrawingProps): Result<Drawing, ValidationError> {
  if (!props.title) {
    return { error: { code: 'MISSING_TITLE', message: 'Drawing must have a title' } };
  }
  
  return { ok: { /* new drawing */ } };
}

// Consuming:
const result = createDrawing(props);
if (result.ok) {
  console.log('Drawing created:', result.ok);
} else {
  console.error('Failed to create drawing:', result.error);
}
```

---

## SECTION 7: DOMAIN EVENTS

Significant domain changes are published as events:

```typescript
export type DomainEvent = 
  | DrawingCreatedEvent
  | DrawingRevisedEvent
  | ElementAddedEvent
  | ElementModifiedEvent
  | ElementDeletedEvent
  | DimensionAddedEvent;

export interface DrawingCreatedEvent {
  readonly type: 'DrawingCreated';
  readonly drawingId: string;
  readonly timestamp: Date;
  readonly author: string;
}

export interface ElementAddedEvent {
  readonly type: 'ElementAdded';
  readonly drawingId: string;
  readonly sheetId: string;
  readonly element: Element;
  readonly timestamp: Date;
}

/**
 * Event bus for domain events
 */
export interface DomainEventBus {
  publish(event: DomainEvent): void;
  subscribe(handler: (event: DomainEvent) => void): void;
}
```

---

**Constitution Part 4 - Approved and Effective: 2026-07-21**  
**Authority**: Part 1, Section 2.1.1  
**Next Review**: 2026-10-21  

*The language of SPDS - how we think about buildings and drawings*