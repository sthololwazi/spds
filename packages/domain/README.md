# @spds/domain

The `@spds/domain` package defines the core business model for SPDS.

This package is intentionally framework-free and contains:

- domain aggregates and entities
- value objects and identifiers
- domain event definitions
- validation rules
- serialization helpers (`toJSON`, `fromJSON`)

## Public API

- `Project`
- `Building`
- `Room`
- `Wall`
- `Door`
- `Window`
- `Events`
- `Types`
- `Validators`

## Usage

```ts
import { Project } from '@spds/domain';

const project = new Project({
  id: "project-1",
  name: "New Headquarters",
  client: "Acme Corp",
  site: "Downtown",
  revision: "A",
  metadata: { sector: "commercial" }
});
```
