SPDS Architecture Vision

Imagine a construction company opening SPDS in 2035.

They don't start by drawing.

They start with a conversation.

"Create a 280m² double-storey house on Erf 1425 in Mbombela with four bedrooms, a flat roof, solar PV, and comply with SANS 10400."

SPDS should be able to:

create the project,
generate the object model,
propose layouts,
generate coordinated drawings,
produce schedules,
draft specifications,
estimate quantities,
compile safety documentation,
prepare procurement packages,

all while keeping the human designer in control. Everything the software does must be fed into a knowledge graph, then we will incorporate and agent in the future that analyses the knowledge graph and and create recomendations on how to improve the software, application in the format of machine learning and algorithms. This vision starts with the architecture we choose today.

SPDS as a Construction Operating System

Instead of separate applications:

CAD

BIM

BOQ

Specifications

Safety File

Scheduling

Procurement

SPDS becomes one platform.

Knowledge

↓

Rules

↓

Objects

↓

Geometry

↓

Documents

↓

Construction

↓

Operations
Six Core Domains

Instead of organizing code by technology, organize by business capability.

Domain 1 — Project Management

Responsible for:

Clients
Projects
Sites
Revisions
Teams
Permissions
Issue tracking
Domain 2 — Building Model

Responsible for every physical object.

Rooms
Walls
Doors
Windows
Roofs
Floors
Ceilings
Columns
Foundations
Furniture
Equipment

This is the heart of SPDS.

Domain 3 — Documentation

Responsible for:

Drawings
Sheets
Schedules
Specifications
BOQs
Reports
Registers
Domain 4 — Standards

Responsible for:

SANS
Company standards
Municipal rules
Material libraries
Symbols
Title blocks
Layers
Lineweights

Domain 5 — Intelligence

Responsible for:

AI
Agents
Planning
Automation
RAG
Prompt library
Context builder

Domain 6 — Platform

Responsible for:

Plugins
Authentication
Storage
APIs
Events
Security
Configuration

Domain 7 - Knowledge Graph

Responsible for:
SPDS should eventually evolve beyond a relational data model. In future we will use this to develop and implement features that improve and optimize this software.

Alongside PostgreSQL, maintain a Knowledge Graph representing the relationships between every object.

Example:

Project
 ├── contains → Building
 │       ├── contains → Room
 │       │       ├── bounded_by → Wall
 │       │       ├── contains → Door
 │       │       └── contains → Window
 │       └── has → Roof
 ├── references → Standards Pack
 └── generates → Drawing Set

This unlocks AI reasoning, dependency analysis, and impact assessment.

Capability Registry

Every subsystem advertises its capabilities.

For example:

Drawing Engine:
  capabilities:
    - GenerateFloorPlan
    - GenerateElevation
    - GenerateSection

AI Agent:
  capabilities:
    - RoomPlanning
    - SpecificationWriting
    - QAReview

Instead of hard-coded dependencies, modules discover and use capabilities dynamically.

Digital Twin Readiness

Every object should be future-ready.

Today:

Window:
  width: 1800

Future:

Window:
  width: 1800
  manufacturer: XYZ
  warranty: 10 years
  installDate: 2028-04-14
  maintenanceInterval: 24 months
  sensorId: WIN-443

Nothing in the architecture prevents future facility management or IoT integration.

Governance

Professional engineering software requires traceability.

Every generated artefact should record:

Source project version
Standards pack version
AI provider (if used)
Prompt version (if applicable)
Plugin versions
User
Timestamp
Approval status

This provides a complete audit trail.

Standards Packs as First-Class Packages

Rather than embedding South African standards in code, create installable standards packs.

Example:

@spds/standards-sans-residential
@spds/standards-sans-commercial
@spds/standards-namibia
@spds/standards-botswana

This makes regional expansion straightforward.

Feature Flags

Every major capability should be controlled through feature flags.

Examples:

AI Project Wizard
Automatic BOQ
Interactive SVG
IFC Export
Collaboration
Structural Module

This allows gradual rollout and safer releases.

Security Model

Construction documentation often contains sensitive client information.

From the beginning, define:

Role-based access control
Project-level permissions
Read/write separation
Audit logging
Revision approval workflows
Secure API authentication
Production Roadmap (Expanded)
Phase	Objective	Deliverable
Foundation	Architecture, documentation, domain	Stable platform foundation
Core	Project model, standards, events	Working project engine
Draw	Geometry, SVG, sheet generation	Architectural drawing package
Docs	Schedules, specifications, reports	Coordinated documentation
Build	BOQ, procurement, safety	Construction documentation suite
Intelligence	AI gateway, agents, workflows	AI-assisted platform
Enterprise	Collaboration, permissions, cloud	Multi-user environment
Ecosystem	Plugin marketplace, standards packs	Extensible platform

Analyse and verify The first implementation epic:

Epic 001 — SPDS Platform Foundation

This epic consists of six production-ready workstreams:

Repository & Build System — establish the monorepo, package management, linting, formatting, testing, and continuous integration.
Domain Package (@spds/domain) — implement the core entities, identifiers, validation, domain events, and serialization.
Core Package (@spds/core) — add the event bus, dependency injection, configuration, logging, and lifecycle management.
Plugin SDK (@spds/sdk) — define extension contracts for disciplines, exporters, AI agents, standards packs, and validation rules.
AI Gateway (@spds/ai) — implement provider abstractions, context builders, prompt registry, and response validation.
Documentation & Governance — create the architecture documents, ADRs, developer handbook, coding standards, contribution guide, and roadmap.