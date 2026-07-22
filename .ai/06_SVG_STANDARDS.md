# SPDS AI Constitution v1.0 - Part 6
## SVG Standards and Output Specifications

**Document Status**: Official Specification  
**Version**: 1.0  
**Effective Date**: 2026-07-21  
**Authority**: Part 5 (Drawing Engine)  
**Audience**: Rendering systems, output validation, accessibility  

---

## OVERVIEW

Part 6 defines the SVG output specification for SPDS. Every drawing rendered to SVG must conform to these standards, ensuring:
- **Consistency**: All SPDS drawings look and behave the same way
- **Accessibility**: SVG is accessible to screen readers and assistive tech
- **Compatibility**: SVG works in browsers, printing, and external tools
- **Semantic Meaning**: SVG structure reflects the domain model

---

## SECTION 1: SVG STRUCTURE AND METADATA

### 1.1 SVG Document Structure

Every SPDS SVG document follows this structure:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  version="1.1"
  viewBox="0 0 {width} {height}"
  width="{screenWidth}px"
  height="{screenHeight}px"
  preserveAspectRatio="xMidYMid meet"
>
  <!-- Metadata section -->
  <metadata>
    <title>{drawing.title}</title>
    <desc>{drawing.description}</desc>
    <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
      <rdf:Description about="{drawing.id}">
        <dc:creator xmlns:dc="http://purl.org/dc/elements/1.1/">
          {drawing.author}
        </dc:creator>
        <dc:date xmlns:dc="http://purl.org/dc/elements/1.1/">
          {drawing.createdAt}
        </dc:date>
      </rdf:Description>
    </rdf:RDF>
  </metadata>
  
  <!-- Definitions for reusable elements -->
  <defs>
    <!-- Symbols, patterns, gradients, styles -->
  </defs>
  
  <!-- Style definitions -->
  <style type="text/css">
    /* Embedded stylesheets for consistency */
  </style>
  
  <!-- Main drawing content -->
  <g id="sheet-container" class="sheet-container">
    <!-- Sheets and elements -->
  </g>
</svg>
```

### 1.2 Metadata Requirements

```typescript
export interface SVGMetadata {
  readonly title: string;              // Drawing title
  readonly description: string;        // Purpose
  readonly author: string;             // Creator
  readonly created: Date;              // Creation date
  readonly modified: Date;             // Last modification
  readonly scale: string;              // e.g., "1:100"
  readonly project: string;            // Project name
  readonly discipline: string;         // Architectural discipline
  readonly revision: number;           // Revision number
  readonly unit: string;               // "mm", "m", "in", "ft"
}

export function injectMetadata(
  svgElement: SVGElement,
  metadata: SVGMetadata
): void {
  const metadataElement = createMetadataElement(metadata);
  const existingMetadata = svgElement.querySelector('metadata');
  
  if (existingMetadata) {
    existingMetadata.replaceWith(metadataElement);
  } else {
    svgElement.insertBefore(metadataElement, svgElement.firstChild);
  }
}
```

---

## SECTION 2: ELEMENT STYLING

### 2.1 Standard Styles

All SPDS SVG uses these standard styles:

```css
/* Wall styling */
.element.wall {
  stroke: #333333;
  stroke-width: 2px;
  fill: #f5f5f5;
  stroke-linecap: square;
  stroke-linejoin: miter;
}

/* Door styling */
.element.door {
  stroke: #333333;
  stroke-width: 1px;
  fill: none;
  stroke-dasharray: 2,2;
}

/* Door swing arc */
.element.door-swing {
  stroke: #999999;
  stroke-width: 1px;
  fill: none;
}

/* Window styling */
.element.window {
  stroke: #333333;
  stroke-width: 1px;
  fill: #e6f2ff;
  opacity: 0.7;
}

/* Dimension styling */
.element.dimension {
  stroke: #666666;
  stroke-width: 0.5px;
  fill: none;
}

.dimension-text {
  font-family: "Arial", sans-serif;
  font-size: 10px;
  fill: #333333;
}

/* Annotation styling */
.element.annotation {
  font-family: "Arial", sans-serif;
  font-size: 12px;
  fill: #000000;
}

/* Layer visibility */
.layer.hidden {
  display: none;
}

.layer.locked {
  pointer-events: none;
  opacity: 0.5;
}
```

### 2.2 Color Palette

```typescript
export const SPDS_COLOR_PALETTE = {
  // Primary colors
  primary: '#1e3a8a',      // Deep blue
  secondary: '#7c3aed',    // Purple
  
  // Element colors
  wall: '#333333',         // Dark gray
  door: '#333333',         // Dark gray
  window: '#4db8ff',       // Light blue
  fixture: '#666666',      // Medium gray
  
  // Annotation colors
  dimension: '#666666',    // Medium gray
  annotation: '#000000',   // Black
  text: '#333333',         // Dark gray
  
  // UI colors
  selected: '#ff6b6b',     // Red
  hover: '#ffd43b',        // Yellow
  warning: '#ff922b',      // Orange
  error: '#ff6b6b',        // Red
  success: '#51cf66',      // Green
  
  // Background colors
  background: '#ffffff',   // White
  lightGray: '#f5f5f5',    // Light gray
  darkGray: '#333333',     // Dark gray
};
```

---

## SECTION 3: LAYER ORGANIZATION

### 3.1 Recommended Layer Structure

SVG content should be organized in layers from background to foreground:

```xml
<g id="layer-background">
  <!-- Grid, guides, background elements -->
</g>

<g id="layer-structure">
  <!-- Walls, columns, structural elements -->
</g>

<g id="layer-openings">
  <!-- Doors, windows -->
</g>

<g id="layer-fixtures">
  <!-- Fixtures, equipment, furnishings -->
</g>

<g id="layer-dimensions">
  <!-- Dimension annotations -->
</g>

<g id="layer-annotations">
  <!-- Text notes, labels, callouts -->
</g>

<g id="layer-title-block">
  <!-- Title block and sheet information -->
</g>
```

### 3.2 Layer Attributes

```typescript
export interface SVGLayer {
  readonly id: string;              // Unique layer ID
  readonly name: string;            // Display name
  readonly visible: boolean;        // Visibility
  readonly locked: boolean;         // Editable state
  readonly opacity: number;         // 0-1
  readonly className: string;       // CSS class
}

export function createSVGLayer(layer: SVGLayer): SVGElement {
  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  
  group.setAttribute('id', layer.id);
  group.setAttribute('class', `layer ${layer.className}`);
  
  if (!layer.visible) {
    group.classList.add('hidden');
  }
  
  if (layer.locked) {
    group.classList.add('locked');
  }
  
  if (layer.opacity !== 1) {
    group.setAttribute('opacity', String(layer.opacity));
  }
  
  return group;
}
```

---

## SECTION 4: DIMENSION ANNOTATIONS

### 4.1 Dimension Line Structure

```xml
<g id="dimension-{id}" class="element dimension">
  <!-- Dimension line -->
  <line
    x1="{x1}" y1="{y1}"
    x2="{x2}" y2="{y2}"
    stroke="#666666"
    stroke-width="0.5"
  />
  
  <!-- Extension lines -->
  <line x1="{x1}" y1="{y1-10}" x2="{x1}" y2="{y1+10}" />
  <line x1="{x2}" y1="{y2-10}" x2="{x2}" y2="{y2+10}" />
  
  <!-- Dimension text -->
  <text
    x="{midX}"
    y="{midY}"
    class="dimension-text"
    text-anchor="middle"
    dy="0.3em"
  >
    {value}
  </text>
  
  <!-- Arrow markers -->
  <polygon points="0,0 5,5 0,10" />
  <polygon points="5,0 0,5 5,10" />
</g>
```

### 4.2 Dimension Markers

```xml
<!-- Arrow marker definitions -->
<defs>
  <marker
    id="arrow-end"
    markerWidth="10"
    markerHeight="10"
    refX="5"
    refY="5"
    orient="auto"
  >
    <polygon points="0,0 5,5 0,10" fill="#666666" />
  </marker>
  
  <marker
    id="arrow-start"
    markerWidth="10"
    markerHeight="10"
    refX="5"
    refY="5"
    orient="auto"
  >
    <polygon points="5,0 0,5 5,10" fill="#666666" />
  </marker>
</defs>
```

---

## SECTION 5: TEXT AND TYPOGRAPHY

### 5.1 Typography Standards

```typescript
export interface SVGTypography {
  readonly fontFamily: string;        // Font name
  readonly fontSize: number;          // Points
  readonly fontWeight: 'normal' | 'bold' | number;
  readonly fontStyle: 'normal' | 'italic';
  readonly textAnchor: 'start' | 'middle' | 'end';
  readonly dominantBaseline: 'hanging' | 'middle' | 'baseline';
  readonly lineHeight: number;        // Multiplier
}

export const SVG_TYPOGRAPHY = {
  title: {
    fontFamily: 'Arial, sans-serif',
    fontSize: 24,
    fontWeight: 'bold' as const,
  },
  heading: {
    fontFamily: 'Arial, sans-serif',
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
  body: {
    fontFamily: 'Arial, sans-serif',
    fontSize: 12,
    fontWeight: 'normal' as const,
  },
  small: {
    fontFamily: 'Arial, sans-serif',
    fontSize: 10,
    fontWeight: 'normal' as const,
  },
  dimension: {
    fontFamily: 'Arial, sans-serif',
    fontSize: 10,
    fontWeight: 'normal' as const,
  },
};
```

### 5.2 Text Rendering

```typescript
export function renderText(
  text: string,
  position: SVGPosition,
  typography: SVGTypography,
  options?: { maxWidth?: number; ellipsis?: boolean }
): SVGElement {
  const textElement = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'text'
  );
  
  textElement.setAttribute('x', String(position.x));
  textElement.setAttribute('y', String(position.y));
  textElement.setAttribute('font-family', typography.fontFamily);
  textElement.setAttribute('font-size', String(typography.fontSize));
  textElement.setAttribute('font-weight', String(typography.fontWeight));
  textElement.setAttribute('text-anchor', typography.textAnchor);
  textElement.setAttribute('dominant-baseline', typography.dominantBaseline);
  
  // Handle text wrapping for long text
  if (options?.maxWidth) {
    const words = text.split(' ');
    let line = '';
    let lineNumber = 0;
    
    for (const word of words) {
      const testLine = line + (line ? ' ' : '') + word;
      // Estimate line width (simplified)
      if (testLine.length * (typography.fontSize * 0.6) > options.maxWidth && line) {
        const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
        tspan.setAttribute('x', String(position.x));
        tspan.setAttribute('dy', String(typography.fontSize * 1.2));
        tspan.textContent = line;
        textElement.appendChild(tspan);
        line = word;
        lineNumber++;
      } else {
        line = testLine;
      }
    }
    
    if (line) {
      const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
      if (lineNumber > 0) {
        tspan.setAttribute('x', String(position.x));
        tspan.setAttribute('dy', String(typography.fontSize * 1.2));
      }
      tspan.textContent = line;
      textElement.appendChild(tspan);
    }
  } else {
    textElement.textContent = text;
  }
  
  return textElement;
}
```

---

## SECTION 6: ACCESSIBILITY

### 6.1 Semantic SVG

Every SVG element should include accessible attributes:

```typescript
export interface AccessibleSVGElement {
  readonly id: string;                    // Unique ID
  readonly role?: string;                 // ARIA role
  readonly ariaLabel?: string;            // Text label for screen readers
  readonly ariaDescription?: string;      // Detailed description
  readonly title?: string;                // Hover tooltip
}

export function makeAccessible(
  element: SVGElement,
  accessible: AccessibleSVGElement
): void {
  element.setAttribute('id', accessible.id);
  
  if (accessible.role) {
    element.setAttribute('role', accessible.role);
  }
  
  if (accessible.ariaLabel) {
    element.setAttribute('aria-label', accessible.ariaLabel);
  }
  
  if (accessible.ariaDescription) {
    element.setAttribute('aria-description', accessible.ariaDescription);
  }
  
  // Add title element for tooltips
  if (accessible.title) {
    const titleElement = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'title'
    );
    titleElement.textContent = accessible.title;
    element.insertBefore(titleElement, element.firstChild);
  }
}
```

### 6.2 Description Elements

```xml
<!-- Every wall should be describable -->
<g id="wall-001" class="element wall" role="img" aria-label="Exterior wall">
  <title>Exterior Wall - A1</title>
  <desc>External wall, 300mm thickness, brick material, located at coordinates (100, 200) to (500, 200)</desc>
  <!-- wall geometry -->
</g>

<!-- Every dimension should be readable -->
<g id="dimension-001" class="element dimension" role="img" aria-label="Dimension: 5000mm">
  <title>Horizontal Dimension</title>
  <desc>Horizontal dimension of 5000 millimeters (5 meters)</desc>
  <!-- dimension line, text, arrows -->
</g>
```

---

## SECTION 7: TITLE BLOCK

### 7.1 Standard Title Block

```xml
<g id="title-block" class="title-block">
  <!-- Border -->
  <rect
    x="{x}"
    y="{y}"
    width="{width}"
    height="{height}"
    stroke="#333333"
    stroke-width="1"
    fill="none"
  />
  
  <!-- Grid lines for sections -->
  <line x1="{x}" y1="{y + h1}" x2="{x + w}" y2="{y + h1}" stroke="#333333" stroke-width="1" />
  <line x1="{x + c1}" y1="{y}" x2="{x + c1}" y2="{y + h}" stroke="#333333" stroke-width="1" />
  
  <!-- Project information -->
  <text x="{x + 10}" y="{y + 20}" class="title-block-heading">Project Name</text>
  <text x="{x + 10}" y="{y + 40}" class="title-block-text">{project.name}</text>
  
  <!-- Sheet information -->
  <text x="{x + 10}" y="{y + 60}" class="title-block-heading">Sheet Number</text>
  <text x="{x + 10}" y="{y + 80}" class="title-block-text">{sheet.number}</text>
  
  <!-- Date and signature -->
  <text x="{x + 10}" y="{y + 100}" class="title-block-text">Date: {date}</text>
  <text x="{x + 10}" y="{y + 120}" class="title-block-text">By: {author}</text>
  
  <!-- Revision -->
  <text x="{x + 10}" y="{y + 140}" class="title-block-text">Revision: {revision}</text>
</g>
```

---

## SECTION 8: EXPORT AND VALIDATION

### 8.1 SVG Validation

```typescript
export interface SVGValidationResult {
  readonly valid: boolean;
  readonly errors: ReadonlyArray<SVGValidationError>;
  readonly warnings: ReadonlyArray<string>;
}

export interface SVGValidationError {
  readonly code: string;
  readonly message: string;
  readonly element?: string;
  readonly severity: 'error' | 'warning';
}

export async function validateSVG(
  svgElement: SVGElement
): Promise<SVGValidationResult> {
  const errors: SVGValidationError[] = [];
  const warnings: string[] = [];
  
  // Check metadata
  if (!svgElement.querySelector('metadata')) {
    errors.push({
      code: 'MISSING_METADATA',
      message: 'SVG must include metadata element',
      severity: 'error',
    });
  }
  
  // Check for required attributes
  if (!svgElement.getAttribute('viewBox')) {
    errors.push({
      code: 'MISSING_VIEWBOX',
      message: 'SVG must have viewBox attribute',
      severity: 'error',
    });
  }
  
  // Check for accessibility
  const elements = svgElement.querySelectorAll('[class*="element"]');
  for (const element of elements) {
    if (!element.getAttribute('id')) {
      warnings.push(`Element ${element.className} missing ID attribute`);
    }
    if (!element.getAttribute('aria-label')) {
      warnings.push(`Element ${element.id} missing aria-label`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
```

### 8.2 SVG to String Conversion

```typescript
export function svgToString(svgElement: SVGElement): string {
  const serializer = new XMLSerializer();
  let svgString = serializer.serializeToString(svgElement);
  
  // Add XML declaration
  if (!svgString.startsWith('<?xml')) {
    svgString = '<?xml version="1.0" encoding="UTF-8"?>\n' + svgString;
  }
  
  // Pretty print (optional)
  svgString = prettifyXML(svgString);
  
  return svgString;
}

export function svgToFile(
  svgElement: SVGElement,
  filename: string
): Blob {
  const svgString = svgToString(svgElement);
  return new Blob([svgString], { type: 'image/svg+xml' });
}
```

---

## SECTION 9: PRINT SPECIFICATIONS

### 9.1 Print-Ready SVG

```typescript
export interface PrintOptions {
  readonly paperSize: 'A0' | 'A1' | 'A2' | 'A3' | 'A4';
  readonly orientation: 'portrait' | 'landscape';
  readonly scale: string;                           // "1:100"
  readonly includeMargins: boolean;
  readonly includeBleedBox: boolean;
  readonly colorMode: 'color' | 'grayscale' | 'bw';
}

export function preparePrintSVG(
  svgElement: SVGElement,
  options: PrintOptions
): SVGElement {
  const printSVG = svgElement.cloneNode(true) as SVGElement;
  
  // Add print-specific styles
  const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
  style.textContent = `
    @media print {
      .element { vector-effect: non-scaling-stroke; }
      .element.wall { stroke-width: 0.5mm; }
      .element.dimension { stroke-width: 0.2mm; }
    }
  `;
  
  const defs = printSVG.querySelector('defs') || 
    document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.appendChild(style);
  
  // Apply color mode
  if (options.colorMode === 'grayscale') {
    applyGrayscaleFilter(printSVG);
  } else if (options.colorMode === 'bw') {
    applyBlackAndWhiteFilter(printSVG);
  }
  
  return printSVG;
}
```

---

**Constitution Part 6 - Approved and Effective: 2026-07-21**  
**Authority**: Part 5 (Drawing Engine)  
**Next Review**: 2026-10-21  

*SVG is the universal drawing language of SPDS*