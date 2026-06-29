import { describe, it, expect } from 'vitest';
// @ts-expect-error - process-images.js is JS in scripts folder outside TS source roots, so we ignore typing check for the import
import { parseMetadata } from '../../scripts/process-images.js';

describe('process-images parseMetadata', () => {
  it('should return null if GPS latitude or longitude is missing', () => {
    const tags = {
      GPSLatitude: { description: '41.3851' }
      // GPSLongitude missing
    };
    expect(parseMetadata(tags)).toBeNull();
  });

  it('should parse valid EXIF tags successfully', () => {
    const tags = {
      GPSLatitude: { description: '41.3851' },
      GPSLongitude: { description: '2.1734' },
      DateTimeOriginal: { description: '2026:06:29 21:00:00' }
    };
    const result = parseMetadata(tags);
    expect(result).toEqual({
      lat: 41.3851,
      lon: 2.1734,
      date: '2026-06-29',
      year: 2026,
      month: 6
    });
  });

  it('should fallback to DateTime if DateTimeOriginal is missing', () => {
    const tags = {
      GPSLatitude: { description: '-34.6037' },
      GPSLongitude: { description: '-58.3816' },
      DateTime: { description: '2024:12:25 12:00:00' }
    };
    const result = parseMetadata(tags);
    expect(result).toEqual({
      lat: -34.6037,
      lon: -58.3816,
      date: '2024-12-25',
      year: 2024,
      month: 12
    });
  });

  it('should fallback to 2025-01-01 date if no date tags exist', () => {
    const tags = {
      GPSLatitude: { description: '35.6762' },
      GPSLongitude: { description: '139.6503' }
    };
    const result = parseMetadata(tags);
    expect(result).toEqual({
      lat: 35.6762,
      lon: 139.6503,
      date: '2025-01-01',
      year: 2025,
      month: 1
    });
  });
});
