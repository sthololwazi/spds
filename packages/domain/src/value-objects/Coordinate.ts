export class Coordinate {
  readonly x: number;
  readonly y: number;

  private constructor(x: number, y: number) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      throw new Error('Coordinate values must be finite numbers');
    }
    this.x = x;
    this.y = y;
  }

  static create(x: number, y: number): Coordinate {
    return new Coordinate(x, y);
  }

  static fromJSON(value: { x: number; y: number }): Coordinate {
    return new Coordinate(value.x, value.y);
  }

  toJSON(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  equals(other: Coordinate): boolean {
    return other instanceof Coordinate && this.x === other.x && this.y === other.y;
  }
}
