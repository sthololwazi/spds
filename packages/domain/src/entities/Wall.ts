import { Entity } from './Entity.js';
import { Identifier } from '../value-objects/Identifier.js';
import { Coordinate } from '../value-objects/Coordinate.js';
import { Length } from '../value-objects/Length.js';

export type WallType = 'exterior' | 'interior' | 'party';

export interface WallProps {
  id?: Identifier;
  start: Coordinate;
  end: Coordinate;
  height: Length;
  thickness: Length;
  material: string;
  wallType: WallType;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  version?: number;
}

export class Wall extends Entity<Identifier> {
  readonly start: Coordinate;
  readonly end: Coordinate;
  readonly height: Length;
  readonly thickness: Length;
  readonly material: string;
  readonly wallType: WallType;

  constructor(props: WallProps) {
    super({ id: props.id });

    if (props.start.equals(props.end)) {
      throw new Error('Wall start and end coordinates must be different');
    }
    if (!props.material.trim()) {
      throw new Error('Wall material is required');
    }

    this.start = props.start;
    this.end = props.end;
    this.height = props.height;
    this.thickness = props.thickness;
    this.material = props.material;
    this.wallType = props.wallType;
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id.toJSON(),
      start: this.start.toJSON(),
      end: this.end.toJSON(),
      height: this.height.toJSON(),
      thickness: this.thickness.toJSON(),
      material: this.material,
      wallType: this.wallType,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      version: this.version
    };
  }

  static fromJSON(json: Record<string, unknown>): Wall {
    const { id, start, end, height, thickness, material, wallType, createdAt, updatedAt, version } = json as Record<string, any>;

    return new Wall({
      id: Identifier.fromJSON(id as string),
      start: Coordinate.fromJSON(start as { x: number; y: number }),
      end: Coordinate.fromJSON(end as { x: number; y: number }),
      height: Length.fromJSON(height as number),
      thickness: Length.fromJSON(thickness as number),
      material,
      wallType,
      createdAt,
      updatedAt,
      version
    });
  }
}
