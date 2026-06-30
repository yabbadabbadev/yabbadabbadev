import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ExifReader from 'exifreader';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ORIGINALS_DIR = path.join(__dirname, '../src/originals');
const OUTPUT_DIR = path.join(__dirname, '../public/images');
const METADATA_FILE = path.join(__dirname, '../src/photos-metadata.json');

export function parseMetadata(tags) {
  const lat = tags.GPSLatitude ? tags.GPSLatitude.description : null;
  const lon = tags.GPSLongitude ? tags.GPSLongitude.description : null;
  const latRef = tags.GPSLatitudeRef ? String(tags.GPSLatitudeRef.value[0] || tags.GPSLatitudeRef.description || 'N').trim().toUpperCase() : 'N';
  const lonRef = tags.GPSLongitudeRef ? String(tags.GPSLongitudeRef.value[0] || tags.GPSLongitudeRef.description || 'E').trim().toUpperCase() : 'E';
  const dateTag = tags.DateTimeOriginal ? tags.DateTimeOriginal.description : (tags.DateTime ? tags.DateTime.description : null);
  
  if (lat === null || lon === null) {
    return null;
  }
  
  // Parse Date (EXIF date format: "YYYY:MM:DD HH:MM:SS" -> "YYYY-MM-DD")
  let dateStr = '2025-01-01';
  if (dateTag) {
    const parts = dateTag.split(' ');
    if (parts[0]) {
      dateStr = parts[0].replace(/:/g, '-');
    }
  }
  
  const dateParts = dateStr.split('-');
  const year = parseInt(dateParts[0], 10) || 2025;
  const month = parseInt(dateParts[1], 10) || 1;

  let latVal = parseFloat(lat);
  let lonVal = parseFloat(lon);

  if (latRef.startsWith('S')) {
    latVal = -Math.abs(latVal);
  }
  if (lonRef.startsWith('W')) {
    lonVal = -Math.abs(lonVal);
  }
  
  return {
    lat: latVal,
    lon: lonVal,
    date: dateStr,
    year,
    month
  };
}

async function main() {
  console.log('Starting image processing...');
  if (!fs.existsSync(ORIGINALS_DIR)) {
    console.error(`Originals directory not found: ${ORIGINALS_DIR}`);
    process.exit(1);
  }
  
  // Ensure output directories exist
  fs.mkdirSync(path.join(OUTPUT_DIR, 'thumbnails'), { recursive: true });
  fs.mkdirSync(path.join(OUTPUT_DIR, 'display'), { recursive: true });

  const files = fs.readdirSync(ORIGINALS_DIR).filter(f => /\.(jpe?g|png)$/i.test(f));
  const metadata = [];

  for (const file of files) {
    try {
      const inputPath = path.join(ORIGINALS_DIR, file);
      const name = path.parse(file).name;
      
      const fileBuffer = fs.readFileSync(inputPath);
      const tags = ExifReader.load(fileBuffer);
      
      const parsed = parseMetadata(tags);
      if (!parsed) {
        console.warn(`Skipping ${file}: Missing GPS metadata`);
        continue;
      }

      const thumbFilename = `${name}.jpeg`;
      const displayFilename = `${name}.jpeg`;

      // Generate thumbnail: 120x120px square cropped (auto-rotated first)
      await sharp(fileBuffer)
        .rotate()
        .resize(120, 120, { fit: 'cover' })
        .toFormat('jpeg', { quality: 80 })
        .toFile(path.join(OUTPUT_DIR, 'thumbnails', thumbFilename));

      // Generate display version: max 1200px inside (auto-rotated first)
      await sharp(fileBuffer)
        .rotate()
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .toFormat('jpeg', { quality: 85 })
        .toFile(path.join(OUTPUT_DIR, 'display', displayFilename));

      metadata.push({
        id: name,
        filename: file,
        lat: parsed.lat,
        lon: parsed.lon,
        date: parsed.date,
        year: parsed.year,
        month: parsed.month,
        thumbnail: `/images/thumbnails/${thumbFilename}`,
        display: `/images/display/${displayFilename}`
      });
      console.log(`Processed ${file}: Lat=${parsed.lat}, Lon=${parsed.lon}, Date=${parsed.date}`);
    } catch (error) {
      console.error(`Error processing file ${file}:`, error);
    }
  }

  fs.writeFileSync(METADATA_FILE, JSON.stringify(metadata, null, 2));
  console.log(`Wrote metadata database of ${metadata.length} photos.`);
}

// Only run automatically if executed directly
if (process.argv[1] === __filename) {
  main().catch(err => {
    console.error('Error processing images:', err);
    process.exit(1);
  });
}
