import { describe, expect, it } from 'vitest';
import { Door } from '../src/entities/Door.js';
import { Window } from '../src/entities/Window.js';
import { Wall } from '../src/entities/Wall.js';
import { Coordinate } from '../src/value-objects/Coordinate.js';
import { Length } from '../src/value-objects/Length.js';

describe('Door and Window', () => {
  const wall = new Wall({
    start: Coordinate.create(0, 0),
    end: Coordinate.create(5, 0),
    height: Length.fromMeters(3),
    thickness: Length.fromMeters(0.2),
    material: 'brick',
    wallType: 'exterior'
  });

  it('creates a door on a wall', () => {
    const door = new Door({
      hostWall: wall,
      position: Coordinate.create(2.5, 0),
      width: Length.fromMeters(1),
      height: Length.fromMeters(2.1),
      swing: 'right',
      type: 'single'
    });

    expect(door.width.meters).toBe(1);
    expect(door.hostWall.id.equals(wall.id)).toBe(true);
  });

  it('creates a window on a wall', () => {
    const window = new Window({
      hostWall: wall,
      position: Coordinate.create(3, 0),
      width: Length.fromMeters(1.2),
      height: Length.fromMeters(1.2),
      sillHeight: Length.fromMeters(0.9)
    });

    expect(window.sillHeight.meters).toBe(0.9);
    expect(window.hostWall.id.equals(wall.id)).toBe(true);
  });
});
