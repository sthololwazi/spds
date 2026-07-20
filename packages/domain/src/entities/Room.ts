import { Entity } from './Entity.js';
import { Identifier } from '../value-objects/Identifier.js';
import { Area } from '../value-objects/Area.js';
import { Coordinate } from '../value-objects/Coordinate.js';

export interface RoomProps {
  id?: Identifier;
  name: string;
  number: string;
  area: Area;
  level: string;
  boundaries: Coordinate[];
  finish?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  version?: number;
}

export class Room extends Entity<Identifier> {
  readonly name: string;
  readonly number: string;
  readonly area: Area;
  readonly level: string;
  readonly boundaries: Coordinate[];
  readonly finish: string;

  constructor(props: RoomProps) {
    super({ id: props.id });

    if (!props.name.trim()) {
      throw new Error('Room name is required');
    }
    if (!props.number.trim()) {
      throw new Error('Room number is required');
    }
    if (!props.level.trim()) {
      throw new Error('Room level is required');
    }
    if (!Array.isArray(props.boundaries) || props.boundaries.length < 3) {
      throw new Error('Room boundaries must contain at least three coordinates');
    }

    this.name = props.name;
    this.number = props.number;
    this.area = props.area;
    this.level = props.level;
    this.boundaries = props.boundaries;
    this.finish = props.finish ?? '';
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id.toJSON(),
      name: this.name,
      number: this.number,
      area: this.area.toJSON(),
      level: this.level,
      boundaries: this.boundaries.map((coord) => coord.toJSON()),
      finish: this.finish,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      version: this.version
    };
  }

  static fromJSON(json: Record<string, unknown>): Room {
    const { id, name, number, area, level, boundaries, finish, createdAt, updatedAt, version } = json as Record<string, any>;

    return new Room({
      id: Identifier.fromJSON(id as string),
      name,
      number,
      area: Area.fromJSON(area as number),
      level,
      boundaries: (boundaries as Array<Record<string, number>>).map((coord) => Coordinate.fromJSON(coord)),
      finish: finish as string,
      createdAt,
      updatedAt,
      version
    });
  }
}
