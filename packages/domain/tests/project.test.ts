import { describe, expect, it } from 'vitest';
import { Project } from '../src/entities/Project.js';
import { Identifier } from '../src/value-objects/Identifier.js';
import { Building } from '../src/entities/Building.js';

describe('Project', () => {
  it('creates a project with minimal valid props', () => {
    const project = new Project({
      id: Identifier.create('project-1'),
      name: 'Headquarters',
      client: 'Acme Corp',
      site: 'Downtown',
      revision: 'A',
      metadata: { sector: 'commercial' }
    });

    expect(project.name).toBe('Headquarters');
    expect(project.client).toBe('Acme Corp');
    expect(project.site).toBe('Downtown');
    expect(project.revision).toBe('A');
    expect(project.metadata.sector).toBe('commercial');
  });

  it('serializes and deserializes correctly', () => {
    const project = new Project({
      id: Identifier.create('project-2'),
      name: 'Campus',
      client: 'Smith Group',
      site: 'Suburb',
      revision: 'B',
      metadata: { phase: 1 }
    });

    const json = project.toJSON();
    const loaded = Project.fromJSON(json);

    expect(loaded.id.value).toBe('project-2');
    expect(loaded.name).toBe('Campus');
    expect(loaded.metadata.phase).toBe(1);
  });
});
