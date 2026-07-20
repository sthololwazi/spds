export class Area {
  readonly squareMeters: number;

  private constructor(squareMeters: number) {
    if (!Number.isFinite(squareMeters) || squareMeters <= 0) {
      throw new Error('Area must be a positive finite number');
    }
    this.squareMeters = squareMeters;
  }

  static fromSquareMeters(value: number): Area {
    return new Area(value);
  }

  static fromJSON(value: number): Area {
    return new Area(value);
  }

  toJSON(): number {
    return this.squareMeters;
  }

  equals(other: Area): boolean {
    return other instanceof Area && this.squareMeters === other.squareMeters;
  }
}
