export interface DomainEvent<TPayload = Record<string, unknown>> {
  type: string;
  occurredAt: string;
  payload: TPayload;
}

export abstract class BaseDomainEvent<TPayload = Record<string, unknown>> implements DomainEvent<TPayload> {
  readonly type: string;
  readonly occurredAt: string;
  readonly payload: TPayload;

  protected constructor(type: string, payload: TPayload) {
    this.type = type;
    this.occurredAt = new Date().toISOString();
    this.payload = payload;
  }
}
