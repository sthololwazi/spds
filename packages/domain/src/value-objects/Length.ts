export class Length {
  readonly meters: number;

  private constructor(meters: number) {
    if (!Number.isFinite(meters) || meters <= 0) {
      throw new Error('Length must be a positive finite number');
    }
    this.meters = meters;
  }

  static fromMeters(value: number): Length {
    return new Length(value);
  }

  static fromJSON(value: number): Length {
    return new Length(value);
  }

  toJSON(): number {
    return this.meters;
  }

  equals(other: Length): boolean {
    return other instanceof Length && this.meters === other.meters;
  }
}
