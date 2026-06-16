// Import an Instagram "Download your information" (JSON) export into the gallery.
//
// Copies your *post* photos into content/photos/ and writes per-photo metadata
// (caption -> title, post timestamp -> dateTaken) into content/photos/metadata.json.
// Then run `npm run photos` to resize, blur, and build the gallery data.
//
// Handles the two post schemas Instagram emits (flat `media[]` in posts_1.json and
// nested `label_values[].media` in posts.json), repairs the Latin-1/UTF-8 mojibake
// in captions, and transcodes HEIC -> JPEG (the build only scans jpg/png/webp).
// Instagram strips EXIF and caps images at ~1080px, so there is no GPS/camera data.
//
// Usage:
//   node scripts/import-instagram.mjs <path-to-unzipped-export> [--clean]
//     <path>   the unzipped export folder (default: ./instagram-export)
//     --clean  wipe existing content/photos images + reset metadata.json first
//              (use this to replace the placeholder photos with your real set)

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PHOTOS_DIR = path.join(ROOT, "content", "photos");
const META_FILE = path.join(PHOTOS_DIR, "metadata.json");

const args = process.argv.slice(2);
const CLEAN = args.includes("--clean");
const EXPORT_ROOT = path.resolve(ROOT, args.find((a) => !a.startsWith("--")) || "instagram-export");

const STD_EXT = /\.(jpe?g|png|webp)$/i; // formats the build pipeline scans directly
const ANY_IMG = /\.(jpe?g|png|webp|heic|heif|avif|tiff?)$/i;

// Instagram writes non-ASCII text as UTF-8 bytes reinterpreted as Latin-1;
// re-decode to recover emoji/accents in captions.
function fixMojibake(s) {
  if (!s || typeof s !== "string") return s;
  try {
    const fixed = Buffer.from(s, "latin1").toString("utf8");
    // only accept if it didn't introduce replacement chars
    return fixed.includes("�") ? s : fixed;
  } catch {
    return s;
  }
}

function caption(s) {
  const t = fixMojibake(s);
  if (!t || !String(t).trim()) return null;
  const line = String(t).split(/\r?\n/)[0].trim();
  if (!line) return null;
  return line.length > 90 ? line.slice(0, 87) + "…" : line;
}

async function walk(dir) {
  let out = [];
  let entries = [];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out = out.concat(await walk(p));
    else out.push(p);
  }
  return out;
}

// Pull {uri, ts, title} from a post regardless of which schema it uses.
function* mediaFromPost(post) {
  const baseTs = post.creation_timestamp || post.timestamp;
  const baseTitle = post.title;
  if (Array.isArray(post.media)) {
    for (const m of post.media) {
      if (m && m.uri) yield { uri: m.uri, ts: m.creation_timestamp || baseTs, title: m.title || baseTitle };
    }
  }
  if (Array.isArray(post.label_values)) {
    for (const lv of post.label_values) {
      if (Array.isArray(lv.media)) {
        for (const m of lv.media) {
          if (m && m.uri) yield { uri: m.uri, ts: m.creation_timestamp || baseTs, title: m.title || baseTitle };
        }
      }
    }
  }
  if (post.uri) yield { uri: post.uri, ts: baseTs, title: baseTitle };
}

async function main() {
  try {
    await fs.access(EXPORT_ROOT);
  } catch {
    console.error(
      `[ig-import] export folder not found: ${EXPORT_ROOT}\n` +
        `  pass the path: node scripts/import-instagram.mjs <folder> [--clean]`
    );
    process.exit(1);
  }

  const allFiles = await walk(EXPORT_ROOT);
  // posts.json / posts_1.json only — not reposts/reels/stories/profile_photos
  const postsJson = allFiles.filter((f) => /(^|[\\/])posts(_\d+)?\.json$/i.test(f));
  if (postsJson.length === 0) {
    console.error("[ig-import] no posts JSON found (posts*.json). Export in JSON format and unzip fully.");
    process.exit(1);
  }

  // Build uri -> {ts, title}, keeping the entry with a real caption / earliest date.
  const meta = new Map();
  for (const jf of postsJson) {
    let data;
    try {
      data = JSON.parse(await fs.readFile(jf, "utf8"));
    } catch {
      continue;
    }
    const posts = Array.isArray(data) ? data : data.media || data.label_values ? [data] : [];
    for (const post of posts) {
      for (const m of mediaFromPost(post)) {
        const prev = meta.get(m.uri);
        if (!prev) {
          meta.set(m.uri, m);
        } else {
          if (!prev.title && m.title) prev.title = m.title;
          if (m.ts && (!prev.ts || m.ts < prev.ts)) prev.ts = m.ts;
        }
      }
    }
  }

  // Source images = everything under media/posts (the actual post photos).
  const postsImgDir = allFiles.filter((f) => /[\\/]media[\\/]posts[\\/]/i.test(f) && ANY_IMG.test(f));
  if (postsImgDir.length === 0) {
    console.error("[ig-import] no images found under media/posts in the export.");
    process.exit(1);
  }

  await fs.mkdir(PHOTOS_DIR, { recursive: true });

  if (CLEAN) {
    for (const f of await fs.readdir(PHOTOS_DIR).catch(() => [])) {
      if (STD_EXT.test(f)) await fs.rm(path.join(PHOTOS_DIR, f), { force: true });
    }
  }

  let overrides = {};
  if (CLEAN) {
    overrides = { _comment: "Imported from an Instagram export. Edit titles/dates freely." };
  } else {
    try {
      overrides = JSON.parse(await fs.readFile(META_FILE, "utf8"));
    } catch {
      overrides = {};
    }
  }

  let copied = 0;
  let transcoded = 0;
  let unmatched = 0;
  const sorted = postsImgDir.sort();

  for (const src of sorted) {
    const baseName = path.basename(src); // e.g. 17959177635044646.heic
    const id = baseName.replace(/\.[^.]+$/, "");
    const ext = path.extname(baseName).toLowerCase();
    const uri = `media/posts/${baseName}`;
    const m = meta.get(uri);
    if (!m) unmatched++;

    let destFile;
    if (STD_EXT.test(baseName)) {
      destFile = `${id}${ext}`;
      await fs.copyFile(src, path.join(PHOTOS_DIR, destFile));
      copied++;
    } else {
      // HEIC/HEIF/etc. -> JPEG so the build pipeline picks it up.
      destFile = `${id}.jpg`;
      const buf = await sharp(src).rotate().jpeg({ quality: 95 }).toBuffer();
      await fs.writeFile(path.join(PHOTOS_DIR, destFile), buf);
      transcoded++;
    }

    overrides[destFile] = {
      ...(overrides[destFile] || {}),
      title: caption(m?.title) ?? overrides[destFile]?.title ?? null,
      dateTaken: m?.ts ? new Date(m.ts * 1000).toISOString() : overrides[destFile]?.dateTaken ?? null,
    };
  }

  await fs.writeFile(META_FILE, JSON.stringify(overrides, null, 2) + "\n", "utf8");
  console.log(
    `[ig-import] imported ${copied + transcoded} photo(s): ${copied} copied, ${transcoded} HEIC transcoded` +
      (unmatched ? `, ${unmatched} had no caption/date in JSON` : "") +
      "."
  );
  console.log(`[ig-import] wrote ${path.relative(ROOT, META_FILE)}.`);
  console.log(`[ig-import] next: npm run photos`);
}

main().catch((e) => {
  console.error("[ig-import] failed:", e);
  process.exit(1);
});
