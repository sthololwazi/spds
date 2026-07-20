import { describe, expect, it } from 'vitest';
import { Room } from '../src/entities/Room.js';
import { Coordinate } from '../src/value-objects/Coordinate.js';
import { Area } from '../src/value-objects/Area.js';

describe('Room', () => {
  it('creates a room with boundaries', () => {
    const room = new Room({
      name: 'Suite',
      number: '101',
      area: Area.fromSquareMeters(25),
      level: 'Ground',
      boundaries: [
        Coordinate.create(0, 0),
        Coordinate.create(5, 0),
        Coordinate.create(5, 5)
      ],
      finish: 'paint'
    });

    expect(room.name).toBe('Suite');
    expect(room.area.squareMeters).toBe(25);
    expect(room.boundaries).toHaveLength(3);
  });

  it('fails when boundaries are insufficient', () => {
    expect(
      () =>
        new Room({
          name: 'Tiny',
          number: '102',
          area: Area.fromSquareMeters(9),
          level: 'Ground',
          boundaries: [Coordinate.create(0, 0), Coordinate.create(1, 0)]
        })
    ).toThrow();
  });
});
