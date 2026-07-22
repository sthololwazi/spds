import { BaseDomainEvent } from './DomainEvent.js';

export { DomainEvent, BaseDomainEvent } from './DomainEvent.js';

export class ProjectCreatedEvent extends BaseDomainEvent<{ projectId: string }> {
  constructor(projectId: string) {
    super('ProjectCreated', { projectId });
  }
}

export class RoomCreatedEvent extends BaseDomainEvent<{ roomId: string; projectId: string }> {
  constructor(roomId: string, projectId: string) {
    super('RoomCreated', { roomId, projectId });
  }
}

export class WallAddedEvent extends BaseDomainEvent<{ wallId: string; buildingId: string }> {
  constructor(wallId: string, buildingId: string) {
    super('WallAdded', { wallId, buildingId });
  }
}

export class DoorInsertedEvent extends BaseDomainEvent<{ doorId: string; wallId: string }> {
  constructor(doorId: string, wallId: string) {
    super('DoorInserted', { doorId, wallId });
  }
}

export class WindowMovedEvent extends BaseDomainEvent<{ windowId: string; wallId: string }> {
  constructor(windowId: string, wallId: string) {
    super('WindowMoved', { windowId, wallId });
  }
}
