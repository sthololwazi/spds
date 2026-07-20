import { Entity } from './Entity.js';
import { Identifier } from '../value-objects/Identifier.js';
import { Building } from './Building.js';

export type ProjectMetadata = Record<string, string | number | boolean>;

export interface ProjectProps {
  id?: Identifier;
  name: string;
  client: string;
  site: string;
  building?: Building;
  revision: string;
  metadata?: ProjectMetadata;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  version?: number;
}

export class Project extends Entity<Identifier> {
  readonly name: string;
  readonly client: string;
  readonly site: string;
  readonly building?: Building;
  readonly revision: string;
  readonly metadata: ProjectMetadata;

  constructor(props: ProjectProps) {
    super({ id: props.id, createdAt: props.building?.createdAt, updatedAt: props.building?.updatedAt, version: 1 });

    if (!props.name.trim()) {
      throw new Error('Project name is required');
    }
    if (!props.client.trim()) {
      throw new Error('Project client is required');
    }
    if (!props.site.trim()) {
      throw new Error('Project site is required');
    }
    if (!props.revision.trim()) {
      throw new Error('Project revision is required');
    }

    this.name = props.name;
    this.client = props.client;
    this.site = props.site;
    this.building = props.building;
    this.revision = props.revision;
    this.metadata = props.metadata ?? {};
  }

  static create(props: Omit<ProjectProps, 'id'> & { id?: Identifier }): Project {
    return new Project({ ...props, id: props.id });
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id.toJSON(),
      name: this.name,
      client: this.client,
      site: this.site,
      building: this.building?.toJSON(),
      revision: this.revision,
      metadata: this.metadata,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      version: this.version
    };
  }

  static fromJSON(json: Record<string, unknown>): Project {
    const { id, name, client, site, building, revision, metadata, createdAt, updatedAt, version } = json as Record<string, any>;

    return new Project({
      id: Identifier.fromJSON(id as string),
      name,
      client,
      site,
      building: building ? Building.fromJSON(building as Record<string, unknown>) : undefined,
      revision,
      metadata: (metadata as ProjectMetadata) ?? {},
      createdAt,
      updatedAt,
      version
    });
  }
}
