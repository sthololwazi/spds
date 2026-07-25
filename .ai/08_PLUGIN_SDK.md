# SPDS AI Constitution v1.0 - Part 8
## Plugin SDK and Extension Architecture

**Document Status**: Official Specification  
**Version**: 1.0  
**Effective Date**: 2026-07-21  
**Authority**: Part 3, Section 2 (Plugin Architecture)  
**Audience**: Plugin developers, core system architects  

---

## OVERVIEW

Part 8 defines the plugin system for SPDS. Plugins enable extensibility without modifying core code. This document specifies:
- Plugin lifecycle and manifest
- Extension points (APIs plugins can hook into)
- Plugin development guidelines
- Plugin registry and discovery
- Plugin validation and security

---

## SECTION 1: PLUGIN ARCHITECTURE

### 1.1 Plugin System Principles

1. **First-Class**: Plugins are not afterthoughts; core system is designed for extensibility
2. **Type-Safe**: All plugin APIs are strongly typed TypeScript
3. **Isolated**: Plugins cannot break core functionality
4. **Discoverable**: Plugins register with core system and are discoverable
5. **Versioned**: Plugins have semantic versions independent of core
6. **Validated**: All plugins validated before activation

### 1.2 Plugin Manifest

Every plugin declares its capabilities via manifest:

```typescript
export interface PluginManifest {
  // Identity
  readonly id: string;                      // Unique ID (e.g., "com.example.my-plugin")
  readonly name: string;                    // Display name
  readonly version: string;                 // Semantic version (1.0.0)
  readonly author: string;                  // Plugin author
  readonly license: string;                 // License (e.g., "MIT")
  
  // Metadata
  readonly description: string;             // What this plugin does
  readonly keywords: ReadonlyArray<string>; // Search tags
  readonly repository?: string;             // Git repo URL
  readonly bugs?: string;                   // Issue tracker URL
  
  // Dependencies
  readonly requires: string[];              // Required SPDS version (e.g., ">=1.0.0")
  readonly dependencies?: Record<string, string>; // Other plugins
  
  // Capabilities
  readonly extensionPoints: ReadonlyArray<ExtensionPoint>;
  
  // Permissions
  readonly permissions: ReadonlyArray<PluginPermission>;
}

export type ExtensionPoint = 
  | 'element-type'
  | 'validator'
  | 'renderer'
  | 'converter'
  | 'analyzer'
  | 'tool'
  | 'custom';

export type PluginPermission = 
  | 'read-drawing'
  | 'write-drawing'
  | 'access-filesystem'
  | 'access-network'
  | 'access-clipboard';
```

### 1.3 Plugin File Structure

```
my-plugin/
├── package.json              # NPM package metadata
├── plugin.manifest.json      # SPDS plugin manifest
├── README.md                 # Documentation
├── LICENSE                   # License file
├── src/
│   ├── index.ts             # Entry point
│   ├── types.ts             # Type definitions
│   ├── handlers.ts          # Implementation
│   └── errors.ts            # Custom errors
├── tests/
│   ├── plugin.test.ts       # Plugin tests
│   └── integration.test.ts  # Integration tests
└── dist/                    # Compiled JavaScript
```

---

## SECTION 2: PLUGIN LIFECYCLE

### 2.1 Lifecycle Stages

```
Discover
  ↓ (Load manifest)
Validate
  ↓ (Check manifest, dependencies, permissions)
Instantiate
  ↓ (Create plugin instance)
Activate
  ↓ (Call activate() hook)
[Plugin Active]
  ↓ (Perform work)
Deactivate
  ↓ (Call deactivate() hook)
Unload
```

### 2.2 Plugin Interface

```typescript
export interface Plugin {
  /**
   * Plugin manifest
   */
  readonly manifest: PluginManifest;
  
  /**
   * Called when plugin is activated
   * Use this to register handlers, set up state, etc.
   */
  activate(context: PluginContext): Promise<void>;
  
  /**
   * Called when plugin is deactivated
   * Use this to clean up resources, unregister handlers, etc.
   */
  deactivate?(context: PluginContext): Promise<void>;
  
  /**
   * Plugin provides an API that other plugins can use
   */
  getPublicAPI?(): Record<string, unknown>;
}

export interface PluginContext {
  readonly spds: SPDSCore;                 // Core system access
  readonly drawing: Drawing;              // Current drawing
  readonly logger: Logger;                // Logging interface
  readonly storage: PluginStorage;        // Persistent storage
  
  // Registration methods
  registerElementType(spec: ElementTypeSpec): void;
  registerValidator(spec: ValidatorSpec): void;
  registerRenderer(spec: RendererSpec): void;
  registerConverter(spec: ConverterSpec): void;
  registerAnalyzer(spec: AnalyzerSpec): void;
  registerCommand(spec: CommandSpec): void;
}
```

---

## SECTION 3: EXTENSION POINTS

### 3.1 Element Type Extension

Register custom element types beyond wall, door, window, fixture:

```typescript
export interface ElementTypeSpec {
  readonly type: string;                  // Element type name
  readonly displayName: string;           // User-facing name
  readonly icon?: string;                 // SVG icon or emoji
  readonly properties: PropertyDefinition[]; // Schema
  
  // Handlers
  readonly validate: (props: unknown) => ValidationResult;
  readonly toSVG: (element: Element, context: RenderContext) => SVGElement;
  readonly fromSVG: (svg: SVGElement) => Element;
}

export interface PropertyDefinition {
  readonly key: string;                   // Property key
  readonly type: 'string' | 'number' | 'boolean' | 'object';
  readonly required: boolean;
  readonly default?: unknown;
  readonly description: string;
  readonly validation?: (value: unknown) => boolean;
}

// Usage in plugin
export async function activate(context: PluginContext): Promise<void> {
  context.registerElementType({
    type: 'structural-beam',
    displayName: 'Structural Beam',
    properties: [
      {
        key: 'material',
        type: 'string',
        required: true,
        description: 'Beam material (steel, wood, concrete)',
      },
      {
        key: 'span',
        type: 'number',
        required: true,
        description: 'Span length in mm',
      },
    ],
    validate: (props) => {
      if (!props.material) return { valid: false, error: 'Material required' };
      if (!props.span || props.span < 1000) {
        return { valid: false, error: 'Span must be >= 1000mm' };
      }
      return { valid: true };
    },
    toSVG: (element, context) => {
      // Render beam to SVG
    },
    fromSVG: (svg) => {
      // Parse SVG back to element
    },
  });
}
```

### 3.2 Validator Extension

Register custom validation rules:

```typescript
export interface ValidatorSpec {
  readonly id: string;                    // Unique validator ID
  readonly name: string;                  // Display name
  readonly validate: (drawing: Drawing) => ValidationResult[];
}

// Usage
export async function activate(context: PluginContext): Promise<void> {
  context.registerValidator({
    id: 'structural-integrity',
    name: 'Structural Integrity Validator',
    validate: (drawing) => {
      const errors: ValidationResult[] = [];
      
      for (const sheet of drawing.sheets) {
        for (const element of sheet.elements) {
          if (element.type === 'wall') {
            const wall = element as Wall;
            // Check structural rules
            if (wall.properties.heightMM > 10000) {
              errors.push({
                valid: false,
                error: 'Wall height exceeds typical maximum',
                element: wall.id,
              });
            }
          }
        }
      }
      
      return errors;
    },
  });
}
```

### 3.3 Renderer Extension

Register custom rendering for element types:

```typescript
export interface RendererSpec {
  readonly elementType: string;           // Element type to render
  readonly render: (element: Element, context: RenderContext) => SVGElement;
  readonly priority?: number;             // 0-100, higher = earlier
}

// Usage
export async function activate(context: PluginContext): Promise<void> {
  context.registerRenderer({
    elementType: 'structural-beam',
    render: (element, context) => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      svg.setAttribute('id', element.id);
      svg.setAttribute('class', 'element structural-beam');
      
      // Custom rendering logic
      const beam = element as StructuralBeam;
      // ... render beam-specific geometry
      
      return svg;
    },
    priority: 10,
  });
}
```

### 3.4 Converter Extension

Register format converters (DWG, PDF, etc.):

```typescript
export interface ConverterSpec {
  readonly format: string;                // "dwg", "pdf", "png"
  readonly mimeType: string;              // MIME type
  readonly convert: (drawing: Drawing, options?: unknown) => Promise<Buffer>;
  readonly canExport: boolean;            // Can export to this format
  readonly canImport: boolean;            // Can import from this format
}

// Usage: Export drawing to PDF
export async function activate(context: PluginContext): Promise<void> {
  context.registerConverter({
    format: 'pdf',
    mimeType: 'application/pdf',
    convert: async (drawing) => {
      // Convert drawing to PDF
      const svgString = await convertToSVG(drawing);
      const pdf = await svgToPdf(svgString);
      return pdf;
    },
    canExport: true,
    canImport: false,
  });
}
```

### 3.5 Analyzer Extension

Register analysis tools:

```typescript
export interface AnalyzerSpec {
  readonly id: string;
  readonly name: string;
  readonly analyze: (drawing: Drawing) => Promise<AnalysisResult>;
}

export interface AnalysisResult {
  readonly toolId: string;
  readonly timestamp: Date;
  readonly data: Record<string, unknown>;
  readonly recommendations: ReadonlyArray<string>;
}

// Usage: Area calculator
export async function activate(context: PluginContext): Promise<void> {
  context.registerAnalyzer({
    id: 'area-calculator',
    name: 'Area Calculator',
    analyze: async (drawing) => {
      let totalArea = 0;
      
      for (const sheet of drawing.sheets) {
        for (const element of sheet.elements) {
          if (element.type === 'area') {
            // Calculate area
          }
        }
      }
      
      return {
        toolId: 'area-calculator',
        timestamp: new Date(),
        data: { totalArea },
        recommendations: [],
      };
    },
  });
}
```

---

## SECTION 4: PLUGIN DEVELOPMENT

### 4.1 TypeScript Requirements

All plugins must:
- [ ] Use TypeScript 5.0+
- [ ] Use strict mode
- [ ] No `any` types
- [ ] Explicit return types
- [ ] Export plugin as default

```typescript
// src/index.ts - REQUIRED structure
import { Plugin, PluginContext, PluginManifest } from '@spds/core';

const manifest: PluginManifest = {
  id: 'com.example.my-plugin',
  name: 'My Plugin',
  version: '1.0.0',
  author: 'Your Name',
  license: 'MIT',
  description: 'What this plugin does',
  keywords: ['element', 'rendering'],
  requires: '>=1.0.0',
  extensionPoints: ['element-type'],
  permissions: ['read-drawing'],
};

const plugin: Plugin = {
  manifest,
  
  async activate(context: PluginContext): Promise<void> {
    context.logger.info('Plugin activated');
    // Register handlers
  },
  
  async deactivate(context: PluginContext): Promise<void> {
    context.logger.info('Plugin deactivated');
    // Clean up
  },
};

export default plugin;
```

### 4.2 Testing Requirements

All plugins must include tests:

```typescript
// tests/plugin.test.ts
import plugin from '../src/index';

describe('My Plugin', () => {
  describe('manifest', () => {
    it('should have valid manifest', () => {
      expect(plugin.manifest.id).toBeDefined();
      expect(plugin.manifest.version).toMatch(/^\d+\.\d+\.\d+$/);
    });
    
    it('should declare required fields', () => {
      expect(plugin.manifest.name).toBeDefined();
      expect(plugin.manifest.author).toBeDefined();
    });
  });
  
  describe('activation', () => {
    it('should activate without errors', async () => {
      const context = createMockContext();
      await expect(plugin.activate(context)).resolves.not.toThrow();
    });
  });
});
```

### 4.3 Package.json

Plugins must specify metadata:

```json
{
  "name": "@spds/plugin-my-plugin",
  "version": "1.0.0",
  "description": "Plugin description",
  "author": "Your Name",
  "license": "MIT",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "keywords": ["spds", "plugin"],
  "peerDependencies": {
    "@spds/core": ">=1.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0"
  },
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "lint": "eslint src"
  }
}
```

---

## SECTION 5: PLUGIN REGISTRY

### 5.1 Plugin Registry

The core system maintains a registry of active plugins:

```typescript
export interface PluginRegistry {
  /**
   * Register a plugin
   */
  register(plugin: Plugin): Promise<void>;
  
  /**
   * Unregister a plugin
   */
  unregister(pluginId: string): Promise<void>;
  
  /**
   * Get registered plugin
   */
  get(pluginId: string): Plugin | undefined;
  
  /**
   * List all registered plugins
   */
  list(): ReadonlyArray<Plugin>;
  
  /**
   * Find plugins by extension point
   */
  findByExtensionPoint(point: ExtensionPoint): ReadonlyArray<Plugin>;
}
```

### 5.2 Plugin Discovery

Plugins can be discovered from:

1. **NPM Registry**: Published as `@spds/plugin-*`
2. **Local Directory**: `./plugins/*/plugin.manifest.json`
3. **Configuration**: Listed in `.spds/plugins.json`

```json
{
  "plugins": [
    {
      "id": "com.example.my-plugin",
      "enabled": true,
      "version": "1.0.0",
      "source": "npm" // or "local"
    }
  ]
}
```

---

## SECTION 6: PLUGIN VALIDATION

### 6.1 Manifest Validation

All plugin manifests are validated:

```typescript
export function validateManifest(manifest: unknown): Result<PluginManifest, string> {
  if (!manifest || typeof manifest !== 'object') {
    return { error: 'Manifest must be an object' };
  }
  
  const m = manifest as Record<string, unknown>;
  
  // Required fields
  if (!m.id || typeof m.id !== 'string') {
    return { error: 'Manifest must have id (string)' };
  }
  
  if (!m.name || typeof m.name !== 'string') {
    return { error: 'Manifest must have name (string)' };
  }
  
  if (!m.version || typeof m.version !== 'string') {
    return { error: 'Manifest must have version (string, semantic)' };
  }
  
  // Validate semantic version
  if (!/^\d+\.\d+\.\d+$/.test(m.version as string)) {
    return { error: 'Version must be semantic (X.Y.Z)' };
  }
  
  // Validate permissions
  const validPermissions = [
    'read-drawing',
    'write-drawing',
    'access-filesystem',
    'access-network',
    'access-clipboard',
  ];
  
  const permissions = (m.permissions || []) as string[];
  for (const perm of permissions) {
    if (!validPermissions.includes(perm)) {
      return { error: `Invalid permission: ${perm}` };
    }
  }
  
  return { ok: m as PluginManifest };
}
```

### 6.2 Security Checks

Plugins are checked for security:

- [ ] Manifest is valid
- [ ] Dependencies are resolvable
- [ ] Required SPDS version is met
- [ ] Permissions are declared
- [ ] No unsigned/untrusted code

---

## SECTION 7: PLUGIN COMMUNICATION

### 7.1 Plugin-to-Plugin Communication

Plugins can communicate through public APIs:

```typescript
// Plugin A registers API
export async function activate(context: PluginContext): Promise<void> {
  // ...
}

function getPublicAPI(): Record<string, unknown> {
  return {
    calculateArea: (element: Element): number => {
      // ...
    },
  };
}

// Plugin B uses Plugin A's API
export async function activate(context: PluginContext): Promise<void> {
  const pluginA = context.spds.plugins.get('com.example.plugin-a');
  if (pluginA) {
    const api = pluginA.getPublicAPI?.();
    if (api && api.calculateArea) {
      // Use plugin A's function
    }
  }
}
```

---

## SECTION 8: PLUGIN ERRORS

### 8.1 Plugin Error Handling

```typescript
export class PluginError extends Error {
  constructor(
    public pluginId: string,
    public code: string,
    message: string
  ) {
    super(`[${pluginId}] ${code}: ${message}`);
    this.name = 'PluginError';
  }
}

export class PluginActivationError extends PluginError {
  constructor(pluginId: string, reason: string) {
    super(pluginId, 'ACTIVATION_FAILED', reason);
  }
}
```

---

**Constitution Part 8 - Approved and Effective: 2026-07-21**  
**Authority**: Part 3, Section 2  
**Next Review**: 2026-10-21  

*Plugins: The extensible future of SPDS*