# SPDS AI Constitution v1.0 - Part 5
## Drawing Engine and Rendering Architecture

**Document Status**: Official Specification  
**Version**: 1.0  
**Effective Date**: 2026-07-21  
**Authority**: Part 1, Section 2  
**Audience**: Rendering systems, plugins, visualization tools  

---

## OVERVIEW

Part 5 defines how domain objects (walls, doors, drawings) are converted into visual representations. The Drawing Engine is the bridge between the domain model (Part 4) and SVG output (Part 6).

**Core Responsibility**: Transform immutable domain objects into renderable SVG with zero data loss.

---

## SECTION 1: RENDERING ARCHITECTURE

### 1.1 Rendering Pipeline

Every rendering follows this pipeline:

```
Domain Object (Wall, Door, Drawing)
        ↓
Validation (Is this object valid?)
        ↓
Coordinate Transform (Convert to screen coordinates)
        ↓
Geometry Resolution (Create rendering geometry)
        ↓
Style Application (Colors, strokes, effects)
        ↓
Layer Composition (Order and opacity)
        ↓
Optimization (Deduplicate, compress)
        ↓
SVG Generation (Create SVG elements)
        ↓
Output (SVG string or DOM element)
```

### 1.2 Renderer Interface

```typescript
export interface Renderer {
  /**
   * Render a complete drawing to SVG
   */
  renderDrawing(
    drawing: Drawing,
    options: RenderOptions
  ): Promise<SVGElement>;
  
  /**
   * Render a single sheet
   */
  renderSheet(
    sheet: Sheet,
    scale: Scale,
    options: RenderOptions
  ): Promise<SVGElement>;
  
  /**
   * Render a single element
   */
  renderElement(
    element: Element,
    context: RenderContext
  ): Promise<SVGElement>;
  
  /**
   * Convert rendering to string
   */
  toSVGString(svg: SVGElement): string;
  
  /**
   * Export to other formats (PNG, PDF)
   */
  export(svg: SVGElement, format: ExportFormat): Promise<Buffer>;
}

export interface RenderOptions {
  readonly scale?: number;              // Screen scale factor
  readonly showDimensions: boolean;     // Include dimension annotations
  readonly showAnnotations: boolean;    // Include text annotations
  readonly showGrid: boolean;           // Show reference grid
  readonly showLayers: boolean;         // Show layer indicators
  readonly hiddenLayers: ReadonlySet<string>; // Layers to hide
  readonly theme: 'light' | 'dark';     // Color scheme
  readonly format: 'screen' | 'print';  // Output format
}

export interface RenderContext {
  readonly drawing: Drawing;
  readonly sheet: Sheet;
  readonly scale: Scale;
  readonly screenScale: number;         // Pixels per MM
  readonly svgNamespace: string;        // SVG namespace URI
  readonly options: RenderOptions;
}
```

---

## SECTION 2: COORDINATE SYSTEMS

### 2.1 Domain Coordinates

The domain model uses **millimeters (MM)** as the fundamental unit:

```typescript
export interface Position {
  readonly xMM: number;  // In millimeters
  readonly yMM: number;  // In millimeters
  readonly zOrder?: number; // Stacking order
}
```

**Why millimeters?**
- Standard in architecture and construction
- Precise (sub-millimeter accuracy common)
- International standard (ISO 216, ISO 1219)
- Avoids floating-point errors in conversions

### 2.2 Screen Coordinates

When rendering to screen, convert MM to screen pixels:

```typescript
export function mmToScreenPixels(
  positionMM: Position,
  screenScale: number  // Pixels per MM
): ScreenPosition {
  return {
    x: positionMM.xMM * screenScale,
    y: positionMM.yMM * screenScale,
    zOrder: positionMM.zOrder,
  };
}

export function screenPixelsToMM(
  screenPos: ScreenPosition,
  screenScale: number
): Position {
  return {
    xMM: screenPos.x / screenScale,
    yMM: screenPos.y / screenScale,
    zOrder: screenPos.zOrder,
  };
}
```

### 2.3 SVG Coordinates

SVG uses **SVG user units** (typically pixels), not necessarily screen pixels:

```typescript
export interface SVGTransform {
  readonly translateX: number;
  readonly translateY: number;
  readonly scaleX: number;
  readonly scaleY: number;
  readonly rotationDegrees: number;
}

/**
 * Generate SVG transform string
 */
export function toSVGTransform(transform: SVGTransform): string {
  const parts: string[] = [];
  
  if (transform.translateX !== 0 || transform.translateY !== 0) {
    parts.push(`translate(${transform.translateX}, ${transform.translateY})`);
  }
  
  if (transform.scaleX !== 1 || transform.scaleY !== 1) {
    parts.push(`scale(${transform.scaleX}, ${transform.scaleY})`);
  }
  
  if (transform.rotationDegrees !== 0) {
    parts.push(`rotate(${transform.rotationDegrees})`);
  }
  
  return parts.join(' ');
}
```

---

## SECTION 3: GEOMETRY RENDERING

### 3.1 Point Rendering

```typescript
export function renderPoint(
  point: PointGeometry,
  context: RenderContext
): SVGElement {
  const svg = document.createElementNS(context.svgNamespace, 'circle');
  
  const screenPos = mmToScreenPixels(point.position, context.screenScale);
  svg.setAttribute('cx', String(screenPos.x));
  svg.setAttribute('cy', String(screenPos.y));
  svg.setAttribute('r', '3'); // 3 pixel radius
  
  return svg;
}
```

### 3.2 Line Rendering

```typescript
export function renderLine(
  line: LineGeometry,
  context: RenderContext
): SVGElement {
  const svg = document.createElementNS(context.svgNamespace, 'line');
  
  const start = mmToScreenPixels(line.start, context.screenScale);
  const end = mmToScreenPixels(line.end, context.screenScale);
  
  svg.setAttribute('x1', String(start.x));
  svg.setAttribute('y1', String(start.y));
  svg.setAttribute('x2', String(end.x));
  svg.setAttribute('y2', String(end.y));
  
  return svg;
}
```

### 3.3 Polygon Rendering

```typescript
export function renderPolygon(
  polygon: PolygonGeometry,
  context: RenderContext
): SVGElement {
  const svg = document.createElementNS(context.svgNamespace, 'polygon');
  
  const points = polygon.vertices
    .map(v => mmToScreenPixels(v, context.screenScale))
    .map(p => `${p.x},${p.y}`)
    .join(' ');
  
  svg.setAttribute('points', points);
  
  return svg;
}
```

### 3.4 Circle Rendering

```typescript
export function renderCircle(
  circle: CircleGeometry,
  context: RenderContext
): SVGElement {
  const svg = document.createElementNS(context.svgNamespace, 'circle');
  
  const center = mmToScreenPixels(circle.center, context.screenScale);
  const radius = circle.radiusMM * context.screenScale;
  
  svg.setAttribute('cx', String(center.x));
  svg.setAttribute('cy', String(center.y));
  svg.setAttribute('r', String(radius));
  
  return svg;
}
```

---

## SECTION 4: ELEMENT RENDERING

### 4.1 Wall Rendering

```typescript
export function renderWall(
  wall: Wall,
  context: RenderContext
): SVGElement {
  const group = document.createElementNS(context.svgNamespace, 'g');
  group.setAttribute('id', wall.id);
  group.setAttribute('class', `element wall layer-${wall.layer}`);
  
  // Render main wall line
  const wallLine = renderGeometry(wall.geometry, context);
  applyStyle(wallLine, wall.style);
  group.appendChild(wallLine);
  
  // Render doors in wall
  for (const door of wall.properties.doors) {
    const doorElement = renderDoor(door, context);
    group.appendChild(doorElement);
  }
  
  // Render windows in wall
  for (const window of wall.properties.windows) {
    const windowElement = renderWindow(window, context);
    group.appendChild(windowElement);
  }
  
  // Render thickness indicator if needed
  if (context.options.format === 'print') {
    const thickness = renderWallThickness(wall, context);
    group.appendChild(thickness);
  }
  
  return group;
}

function renderWallThickness(wall: Wall, context: RenderContext): SVGElement {
  // Render thickness as parallel line offset
  const offset = wall.properties.thicknessMM * context.screenScale;
  // ... implementation
}
```

### 4.2 Door Rendering

```typescript
export function renderDoor(
  door: Door,
  context: RenderContext
): SVGElement {
  const group = document.createElementNS(context.svgNamespace, 'g');
  group.setAttribute('id', door.id);
  group.setAttribute('class', 'element door');
  
  // Draw door opening (rectangle)
  const opening = document.createElementNS(context.svgNamespace, 'rect');
  const pos = mmToScreenPixels(door.geometry.position, context.screenScale);
  const width = door.properties.widthMM * context.screenScale;
  const height = door.properties.heightMM * context.screenScale;
  
  opening.setAttribute('x', String(pos.x));
  opening.setAttribute('y', String(pos.y));
  opening.setAttribute('width', String(width));
  opening.setAttribute('height', String(height));
  applyStyle(opening, door.style);
  group.appendChild(opening);
  
  // Draw swing arc based on swing direction
  const swingArc = renderDoorSwing(door, context);
  group.appendChild(swingArc);
  
  return group;
}

function renderDoorSwing(door: Door, context: RenderContext): SVGElement {
  const arc = document.createElementNS(context.svgNamespace, 'path');
  
  const radius = door.properties.widthMM * context.screenScale;
  const startAngle = getDoorSwingStartAngle(door);
  const endAngle = getDoorSwingEndAngle(door);
  
  const pathData = generateArcPath(
    mmToScreenPixels(door.geometry.position, context.screenScale),
    radius,
    startAngle,
    endAngle
  );
  
  arc.setAttribute('d', pathData);
  arc.setAttribute('fill', 'none');
  arc.setAttribute('stroke', '#333');
  arc.setAttribute('stroke-width', '2');
  
  return arc;
}
```

### 4.3 Window Rendering

```typescript
export function renderWindow(
  window: Window,
  context: RenderContext
): SVGElement {
  const group = document.createElementNS(context.svgNamespace, 'g');
  group.setAttribute('id', window.id);
  group.setAttribute('class', 'element window');
  
  // Draw window frame (rectangle)
  const frame = document.createElementNS(context.svgNamespace, 'rect');
  const pos = mmToScreenPixels(window.geometry.position, context.screenScale);
  const width = window.properties.widthMM * context.screenScale;
  const height = window.properties.heightMM * context.screenScale;
  
  frame.setAttribute('x', String(pos.x));
  frame.setAttribute('y', String(pos.y));
  frame.setAttribute('width', String(width));
  frame.setAttribute('height', String(height));
  applyStyle(frame, window.style);
  group.appendChild(frame);
  
  // Draw glazing pattern
  if (context.options.showAnnotations) {
    const glazing = renderWindowGlazing(window, context);
    group.appendChild(glazing);
  }
  
  return group;
}
```

---

## SECTION 5: STYLE APPLICATION

### 5.1 Style Rendering

```typescript
export interface StrokeStyle {
  readonly color: string;           // Hex color
  readonly widthMM: number;         // Stroke width in MM
  readonly dashArray?: string;      // CSS dash array
  readonly lineCap?: 'butt' | 'round' | 'square';
  readonly lineJoin?: 'miter' | 'round' | 'bevel';
}

export interface FillStyle {
  readonly color: string;           // Hex color or 'none'
  readonly pattern?: string;        // Pattern ID
  readonly opacity?: number;        // 0-1
}

export function applyStyle(
  element: SVGElement,
  style: ElementStyle
): void {
  // Stroke
  if (style.stroke) {
    element.setAttribute('stroke', style.stroke.color);
    element.setAttribute('stroke-width', String(style.stroke.widthMM));
    if (style.stroke.dashArray) {
      element.setAttribute('stroke-dasharray', style.stroke.dashArray);
    }
    if (style.stroke.lineCap) {
      element.setAttribute('stroke-linecap', style.stroke.lineCap);
    }
    if (style.stroke.lineJoin) {
      element.setAttribute('stroke-linejoin', style.stroke.lineJoin);
    }
  }
  
  // Fill
  if (style.fill) {
    element.setAttribute('fill', style.fill.color);
    if (style.fill.opacity !== undefined) {
      element.setAttribute('fill-opacity', String(style.fill.opacity));
    }
  }
  
  // Overall opacity
  if (style.opacity !== undefined) {
    element.setAttribute('opacity', String(style.opacity));
  }
}
```

---

## SECTION 6: LAYER COMPOSITION

### 6.1 Layer Management

```typescript
export interface Layer {
  readonly name: string;
  readonly visible: boolean;
  readonly locked: boolean;
  readonly opacity: number;
  readonly elements: ReadonlyArray<Element>;
}

export function renderLayers(
  sheet: Sheet,
  context: RenderContext
): SVGElement {
  const defs = document.createElementNS(context.svgNamespace, 'defs');
  
  // Group elements by layer
  const elementsByLayer = groupBy(sheet.elements, e => e.layer);
  
  const svg = document.createElementNS(context.svgNamespace, 'svg');
  
  // Render each layer in order (back to front)
  for (const [layerName, elements] of Object.entries(elementsByLayer)) {
    const layerGroup = document.createElementNS(context.svgNamespace, 'g');
    layerGroup.setAttribute('id', `layer-${layerName}`);
    layerGroup.setAttribute('class', `layer ${layerName}`);
    
    for (const element of elements) {
      if (!context.options.hiddenLayers.has(element.layer)) {
        const rendered = renderElement(element, context);
        layerGroup.appendChild(rendered);
      }
    }
    
    svg.appendChild(layerGroup);
  }
  
  return svg;
}
```

---

## SECTION 7: PERFORMANCE OPTIMIZATION

### 7.1 Symbol Reuse

Common elements are defined once and reused:

```typescript
export function createSymbolDefs(sheet: Sheet): SVGElement {
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  
  // Define reusable door symbol
  const doorSymbol = document.createElementNS('http://www.w3.org/2000/svg', 'symbol');
  doorSymbol.setAttribute('id', 'door-standard');
  // ... draw door geometry
  defs.appendChild(doorSymbol);
  
  // Define reusable window symbol
  const windowSymbol = document.createElementNS('http://www.w3.org/2000/svg', 'symbol');
  windowSymbol.setAttribute('id', 'window-standard');
  // ... draw window geometry
  defs.appendChild(windowSymbol);
  
  return defs;
}

// Use symbols with <use> references
export function renderDoorWithSymbol(door: Door): SVGElement {
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('xlink:href', '#door-standard');
  use.setAttribute('x', String(door.geometry.position.xMM));
  use.setAttribute('y', String(door.geometry.position.yMM));
  return use;
}
```

### 7.2 Viewport Culling

Only render elements visible in the current viewport:

```typescript
export function isInViewport(
  element: Element,
  viewport: Viewport,
  context: RenderContext
): boolean {
  const bounds = getElementBounds(element, context);
  
  return !(
    bounds.right < viewport.left ||
    bounds.left > viewport.right ||
    bounds.bottom < viewport.top ||
    bounds.top > viewport.bottom
  );
}

export function renderVisibleElements(
  sheet: Sheet,
  viewport: Viewport,
  context: RenderContext
): SVGElement {
  const group = document.createElementNS(context.svgNamespace, 'g');
  
  for (const element of sheet.elements) {
    if (isInViewport(element, viewport, context)) {
      const rendered = renderElement(element, context);
      group.appendChild(rendered);
    }
  }
  
  return group;
}
```

---

## SECTION 8: ERROR HANDLING

### 8.1 Rendering Errors

```typescript
export class RenderError extends Error {
  constructor(
    public element: Element,
    public reason: string
  ) {
    super(`Failed to render element ${element.id}: ${reason}`);
    this.name = 'RenderError';
  }
}

export async function renderElementSafely(
  element: Element,
  context: RenderContext
): Promise<Result<SVGElement, RenderError>> {
  try {
    if (!isValidElement(element)) {
      return {
        error: new RenderError(element, 'Invalid element data'),
      };
    }
    
    const rendered = await renderElement(element, context);
    return { ok: rendered };
  } catch (error) {
    return {
      error: new RenderError(element, (error as Error).message),
    };
  }
}
```

---

**Constitution Part 5 - Approved and Effective: 2026-07-21**  
**Authority**: Part 1, Section 2  
**Next Review**: 2026-10-21  

*How domain objects become visual reality*