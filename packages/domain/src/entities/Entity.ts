import { Identifier } from '../value-objects/Identifier.js';

export abstract class Entity<TId extends Identifier = Identifier> {
  readonly id: TId;
  readonly createdAt: Date;
  updatedAt: Date;
  version: number;

  protected constructor(props: { id?: TId; createdAt?: string | Date; updatedAt?: string | Date; version?: number }) {
    this.id = props.id ?? (Identifier.create() as TId);
    this.createdAt = props.createdAt ? new Date(props.createdAt) : new Date();
    this.updatedAt = props.updatedAt ? new Date(props.updatedAt) : new Date(this.createdAt);
    this.version = props.version ?? 1;
  }

  touch(): void {
    this.updatedAt = new Date();
    this.version += 1;
  }

  abstract toJSON(): Record<string, unknown>;
}
