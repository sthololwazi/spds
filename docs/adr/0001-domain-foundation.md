# ADR 0001 — Domain Foundation

Status: Proposed

Context

We are building SPDS as a domain-first platform. Many packages depend on a stable, framework-free domain package. This ADR records the foundational decisions for `@spds/domain`.

Decision

- Create `@spds/domain` as the canonical source of truth for business objects: `Project`, `Building`, `Room`, `Wall`, `Door`, `Window`.
- Use Value Objects (e.g., `Identifier`, `Length`, `Area`, `Coordinate`) instead of raw primitives to reduce bugs and enforce invariants.
- Provide an `Entity<TId>` base with `id`, `createdAt`, `updatedAt`, and `version` for auditability and optimistic concurrency.
- Implement domain events (e.g., `ProjectCreated`, `WallAdded`) as plain objects to enable event-driven flows and subscribers.
- Each entity shall implement `toJSON()` and `fromJSON()` for portability and interchange.
- Validation must be enforced in domain constructors/factories and via Zod schemas for external inputs.

Consequences

- Other packages will depend on `@spds/domain` for types and basic invariants.
- Domain packages must be stable and backwards-compatible; breaking changes must be announced via ADRs and versioning.

Notes

- This ADR is the foundation for subsequent work: `@spds/core` (event bus, DI), `@spds/standards` (standards packs), `@spds/sdk` (plugin contracts), and the AI gateway.
