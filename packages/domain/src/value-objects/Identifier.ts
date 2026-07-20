export class Identifier {
  readonly value: string;

  private constructor(value: string) {
    if (!value || typeof value !== 'string' || value.trim().length === 0) {
      throw new Error('Identifier must be a non-empty string');
    }

    this.value = value;
  }

  static create(value?: string): Identifier {
    const id = value?.trim() || (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Identifier.generateFallback());
    return new Identifier(id);
  }

  static fromJSON(value: string): Identifier {
    return new Identifier(value);
  }

  toJSON(): string {
    return this.value;
  }

  equals(other: Identifier): boolean {
    return other instanceof Identifier && this.value === other.value;
  }

  private static generateFallback(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
}
