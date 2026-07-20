import { describe, expect, it } from 'vitest';
import { Wall } from '../src/entities/Wall.js';
import { Coordinate } from '../src/value-objects/Coordinate.js';
import { Length } from '../src/value-objects/Length.js';

describe('Wall', () => {
  it('creates a wall with valid geometry', () => {
    const wall = new Wall({
      start: Coordinate.create(0, 0),
      end: Coordinate.create(5, 0),
      height: Length.fromMeters(3),
      thickness: Length.fromMeters(0.2),
      material: 'concrete',
      wallType: 'exterior'
    });

    expect(wall.height.meters).toBe(3);
    expect(wall.wallType).toBe('exterior');
  });

  it('rejects a wall with identical start and end', () => {
    expect(
      () =>
        new Wall({
          start: Coordinate.create(0, 0),
          end: Coordinate.create(0, 0),
          height: Length.fromMeters(3),
          thickness: Length.fromMeters(0.2),
          material: 'concrete',
          wallType: 'interior'
        })
    ).toThrow();
  });
});
