import { Entity } from './Entity.js';
import { Identifier } from '../value-objects/Identifier.js';
import { Coordinate } from '../value-objects/Coordinate.js';
import { Length } from '../value-objects/Length.js';
import { Wall } from './Wall.js';

export interface WindowProps {
  id?: Identifier;
  hostWall: Wall;
  position: Coordinate;
  width: Length;
  height: Length;
  sillHeight: Length;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  version?: number;
}

export class Window extends Entity<Identifier> {
  readonly hostWall: Wall;
  readonly position: Coordinate;
  readonly width: Length;
  readonly height: Length;
  readonly sillHeight: Length;

  constructor(props: WindowProps) {
    super({ id: props.id });

    if (props.width.meters <= 0) {
      throw new Error('Window width must be greater than zero');
    }
    if (props.height.meters <= 0) {
      throw new Error('Window height must be greater than zero');
    }
    if (props.sillHeight.meters < 0) {
      throw new Error('Window sill height must be zero or positive');
    }
    if (!Window.isPositionOnWall(props.position, props.hostWall)) {
      throw new Error('Window position must lie on the host wall');
    }

    this.hostWall = props.hostWall;
    this.position = props.position;
    this.width = props.width;
    this.height = props.height;
    this.sillHeight = props.sillHeight;
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id.toJSON(),
      hostWall: this.hostWall.toJSON(),
      position: this.position.toJSON(),
      width: this.width.toJSON(),
      height: this.height.toJSON(),
      sillHeight: this.sillHeight.toJSON(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      version: this.version
    };
  }

  static fromJSON(json: Record<string, unknown>): Window {
    const { id, hostWall, position, width, height, sillHeight, createdAt, updatedAt, version } = json as Record<string, any>;

    return new Window({
      id: Identifier.fromJSON(id as string),
      hostWall: Wall.fromJSON(hostWall as Record<string, unknown>),
      position: Coordinate.fromJSON(position as { x: number; y: number }),
      width: Length.fromJSON(width as number),
      height: Length.fromJSON(height as number),
      sillHeight: Length.fromJSON(sillHeight as number),
      createdAt,
      updatedAt,
      version
    });
  }

  private static isPositionOnWall(position: Coordinate, wall: Wall): boolean {
    const x1 = wall.start.x;
    const y1 = wall.start.y;
    const x2 = wall.end.x;
    const y2 = wall.end.y;
    const x = position.x;
    const y = position.y;
    const cross = (x - x1) * (y2 - y1) - (y - y1) * (x2 - x1);
    return Math.abs(cross) < 1e-6;
  }
}
