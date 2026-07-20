import { Entity } from './Entity.js';
import { Identifier } from '../value-objects/Identifier.js';
import { Room } from './Room.js';
import { Wall } from './Wall.js';
import { Door } from './Door.js';
import { Window } from './Window.js';

export interface BuildingProps {
  id?: Identifier;
  levels?: string[];
  rooms?: Room[];
  walls?: Wall[];
  doors?: Door[];
  windows?: Window[];
  roofs?: string[];
  floors?: string[];
  ceilings?: string[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
  version?: number;
}

export class Building extends Entity<Identifier> {
  readonly levels: string[];
  readonly rooms: Room[];
  readonly walls: Wall[];
  readonly doors: Door[];
  readonly windows: Window[];
  readonly roofs: string[];
  readonly floors: string[];
  readonly ceilings: string[];

  constructor(props: BuildingProps) {
    super({ id: props.id });

    this.levels = props.levels ?? [];
    this.rooms = props.rooms ?? [];
    this.walls = props.walls ?? [];
    this.doors = props.doors ?? [];
    this.windows = props.windows ?? [];
    this.roofs = props.roofs ?? [];
    this.floors = props.floors ?? [];
    this.ceilings = props.ceilings ?? [];
  }

  addRoom(room: Room): void {
    this.rooms.push(room);
    this.touch();
  }

  addWall(wall: Wall): void {
    this.walls.push(wall);
    this.touch();
  }

  addDoor(door: Door): void {
    if (!this.walls.some((wall) => wall.id.equals(door.hostWall.id))) {
      throw new Error('Door host wall must exist in the building');
    }
    this.doors.push(door);
    this.touch();
  }

  addWindow(window: Window): void {
    if (!this.walls.some((wall) => wall.id.equals(window.hostWall.id))) {
      throw new Error('Window host wall must exist in the building');
    }
    this.windows.push(window);
    this.touch();
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id.toJSON(),
      levels: this.levels,
      rooms: this.rooms.map((room) => room.toJSON()),
      walls: this.walls.map((wall) => wall.toJSON()),
      doors: this.doors.map((door) => door.toJSON()),
      windows: this.windows.map((window) => window.toJSON()),
      roofs: this.roofs,
      floors: this.floors,
      ceilings: this.ceilings,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      version: this.version
    };
  }

  static fromJSON(json: Record<string, unknown>): Building {
    const { id, levels, rooms, walls, doors, windows, roofs, floors, ceilings, createdAt, updatedAt, version } = json as Record<string, any>;

    return new Building({
      id: Identifier.fromJSON(id as string),
      levels: levels as string[],
      rooms: (rooms as Array<Record<string, unknown>>).map((roomJson) => Room.fromJSON(roomJson)),
      walls: (walls as Array<Record<string, unknown>>).map((wallJson) => Wall.fromJSON(wallJson)),
      doors: (doors as Array<Record<string, unknown>>).map((doorJson) => Door.fromJSON(doorJson)),
      windows: (windows as Array<Record<string, unknown>>).map((windowJson) => Window.fromJSON(windowJson)),
      roofs: roofs as string[],
      floors: floors as string[],
      ceilings: ceilings as string[],
      createdAt,
      updatedAt,
      version
    });
  }
}
