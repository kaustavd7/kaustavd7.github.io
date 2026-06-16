// Build-time photo pipeline.
//
// Scans content/photos/ for images, extracts EXIF (camera model, lens, focal
// length, aperture, shutter, ISO, date, GPS) via exifr, reads true dimensions
// and generates a blur placeholder via sharp, writes a web-sized copy to
// public/photos/, merges per-photo overrides from content/photos/metadata.json
// (overrides win over EXIF), and emits src/data/photos.generated.json consumed
// by the gallery. Drop a real photo in the folder and its metadata self-populates.

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import exifr from "exifr";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC_DIR = path.join(ROOT, "content", "photos");
const OUT_IMG_DIR = path.join(ROOT, "public", "photos");
const OUT_DATA = path.join(ROOT, "src", "data", "photos.generated.json");
const META_FILE = path.join(SRC_DIR, "metadata.json");

const MAX_EDGE = 2000;
const IMAGE_RE = /\.(jpe?g|png|webp)$/i;

const slugify = (name) =>
  name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const round2 = (n) => Math.round(n * 100) / 100;

function exposureToShutter(t) {
  if (t == null) return null;
  if (t >= 1) return `${round2(t)}s`;
  const denom = Math.round(1 / t);
  return `1/${denom}`;
}

// "Apple iPhone 15 Pro" / make="Apple" model="iPhone 15 Pro" -> "iPhone 15 Pro"
function cleanModel(make, model) {
  if (!model) return null;
  let m = String(model).trim().replace(/^Apple\s+/i, "");
  if (make) {
    const mk = String(make).trim();
    if (mk && m.toLowerCase().startsWith(mk.toLowerCase() + " ")) {
      m = m.slice(mk.length).trim();
    }
  }
  return m || null;
}

function toIsoDate(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

async function loadOverrides() {
  try {
    const raw = await fs.readFile(META_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function main() {
  await fs.mkdir(OUT_IMG_DIR, { recursive: true });
  await fs.mkdir(path.dirname(OUT_DATA), { recursive: true });

  const overrides = await loadOverrides();

  let dirEntries = [];
  try {
    dirEntries = await fs.readdir(SRC_DIR);
  } catch {
    dirEntries = [];
  }
  const files = dirEntries.filter((f) => IMAGE_RE.test(f)).sort();

  if (files.length === 0) {
    console.warn(
      `[photos] WARNING: no images found in ${path.relative(ROOT, SRC_DIR)} — the gallery will be EMPTY. ` +
        `If this is a deploy, ensure content/photos/ (the source images) is committed to the repo.`
    );
  }

  const photos = [];
  const usedNames = new Set();

  for (const file of files) {
    const abs = path.join(SRC_DIR, file);
    const buf = await fs.readFile(abs);

    let slug = slugify(file);
    while (usedNames.has(slug)) slug = `${slug}-x`;
    usedNames.add(slug);
    const outName = `${slug}.jpg`;

    // Web-sized copy (orientation baked in via rotate()).
    const resized = await sharp(buf)
      .rotate()
      .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 82 })
      .toBuffer({ resolveWithObject: true });
    await fs.writeFile(path.join(OUT_IMG_DIR, outName), resized.data);
    const { width, height } = resized.info;

    // Tiny blurred placeholder as a data URL.
    const blurBuf = await sharp(buf).rotate().resize(20, 20, { fit: "inside" }).blur().jpeg({ quality: 40 }).toBuffer();
    const blurDataURL = `data:image/jpeg;base64,${blurBuf.toString("base64")}`;

    let exif = {};
    try {
      exif = (await exifr.parse(buf, { tiff: true, ifd0: true, exif: true, gps: true, iptc: true })) || {};
    } catch {
      exif = {};
    }
    let gps = null;
    try {
      gps = await exifr.gps(buf);
    } catch {
      gps = null;
    }

    const o = overrides[file] || overrides[outName] || {};

    const dateTaken =
      toIsoDate(o.dateTaken) || toIsoDate(exif.DateTimeOriginal) || toIsoDate(exif.CreateDate) || null;
    const year = dateTaken ? new Date(dateTaken).getUTCFullYear() : o.year ?? null;

    const record = {
      id: slug,
      src: `/photos/${outName}`,
      width,
      height,
      blurDataURL,
      title: o.title ?? null,
      model: o.model ?? cleanModel(exif.Make, exif.Model),
      lens: o.lens ?? exif.LensModel ?? null,
      focalLength: o.focalLength ?? (exif.FocalLength != null ? Math.round(exif.FocalLength) : null),
      aperture: o.aperture ?? (exif.FNumber != null ? round2(exif.FNumber) : null),
      shutter: o.shutter ?? exposureToShutter(exif.ExposureTime),
      iso: o.iso ?? exif.ISO ?? null,
      dateTaken,
      year,
      country: o.country ?? exif.Country ?? null,
      city: o.city ?? exif.City ?? null,
      lat: o.lat ?? (gps ? gps.latitude : null),
      lng: o.lng ?? (gps ? gps.longitude : null),
    };

    photos.push(record);
  }

  // Newest first; undated photos sink to the bottom.
  photos.sort((a, b) => (b.dateTaken || "").localeCompare(a.dateTaken || ""));

  const payload = { count: photos.length, photos };
  await fs.writeFile(OUT_DATA, JSON.stringify(payload, null, 2) + "\n", "utf8");
  console.log(`[photos] processed ${photos.length} photo(s) -> ${path.relative(ROOT, OUT_DATA)}`);
}

main().catch((err) => {
  console.error("[photos] build failed:", err);
  process.exit(1);
});
