import fs from 'fs';
import path from 'path';
import piexif from 'piexifjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ORIGINALS_DIR = path.join(__dirname, '../src/originals');

const images = [
  {
    src: '/Users/alex/.gemini/antigravity-cli/brain/883c2ff1-6a6c-4685-850b-63cbe79c6e40/barcelona_1782795151729.jpg',
    dest: 'barcelona.jpeg',
    lat: 41.3851,
    lon: 2.1734,
    date: '2025:05:15 12:00:00'
  },
  {
    src: '/Users/alex/.gemini/antigravity-cli/brain/883c2ff1-6a6c-4685-850b-63cbe79c6e40/tokyo_1782795167718.jpg',
    dest: 'tokyo.jpeg',
    lat: 35.6762,
    lon: 139.6503,
    date: '2025:06:20 12:00:00'
  },
  {
    src: '/Users/alex/.gemini/antigravity-cli/brain/883c2ff1-6a6c-4685-850b-63cbe79c6e40/paris_1782795178832.jpg',
    dest: 'paris.jpeg',
    lat: 48.8566,
    lon: 2.3522,
    date: '2025:07:10 12:00:00'
  },
  {
    src: '/Users/alex/.gemini/antigravity-cli/brain/883c2ff1-6a6c-4685-850b-63cbe79c6e40/newyork_1782795194113.jpg',
    dest: 'newyork.jpeg',
    lat: 40.7128,
    lon: -74.0060,
    date: '2025:08:05 12:00:00'
  },
  {
    src: '/Users/alex/.gemini/antigravity-cli/brain/883c2ff1-6a6c-4685-850b-63cbe79c6e40/sydney_1782795209283.jpg',
    dest: 'sydney.jpeg',
    lat: -33.8688,
    lon: 151.2093,
    date: '2025:09:25 12:00:00'
  }
];

// Helper to convert float coordinate to EXIF degree-minute-second representation
function toDms(coord) {
  const absolute = Math.abs(coord);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = Math.floor((minutesNotTruncated - minutes) * 60);

  // piexif format: [[degrees, 1], [minutes, 1], [seconds * 100, 100]]
  return [
    [degrees, 1],
    [minutes, 1],
    [Math.round(seconds * 100), 100]
  ];
}

async function inject() {
  fs.mkdirSync(ORIGINALS_DIR, { recursive: true });

  for (const img of images) {
    if (!fs.existsSync(img.src)) {
      console.error(`Source image not found: ${img.src}`);
      continue;
    }

    console.log(`Processing ${img.dest}...`);
    const fileBuffer = fs.readFileSync(img.src);
    const base64Data = fileBuffer.toString('binary');

    // Create EXIF structure
    const gps = {
      [piexif.GPSIFD.GPSLatitudeRef]: img.lat >= 0 ? 'N' : 'S',
      [piexif.GPSIFD.GPSLatitude]: toDms(img.lat),
      [piexif.GPSIFD.GPSLongitudeRef]: img.lon >= 0 ? 'E' : 'W',
      [piexif.GPSIFD.GPSLongitude]: toDms(img.lon)
    };

    const exif = {
      [piexif.ExifIFD.DateTimeOriginal]: img.date
    };

    const exifObj = {
      'GPS': gps,
      'Exif': exif
    };

    const exifBytes = piexif.dump(exifObj);
    const newData = piexif.insert(exifBytes, base64Data);
    const newBuffer = Buffer.from(newData, 'binary');

    const destPath = path.join(ORIGINALS_DIR, img.dest);
    fs.writeFileSync(destPath, newBuffer);
    console.log(`Wrote EXIF to ${destPath}`);
  }
}

inject().catch(console.error);
