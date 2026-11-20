// Turn photo paths from the sheet / JSON into images Astro can optimize.
//
// Photos live in src/assets/photos/<event-or-section>/, e.g.
//   src/assets/photos/fall-2026/ode-info-1.jpg
// and are referenced in the data by the part after "photos/", e.g. "fall-2026/ode-info-1.jpg".
import type { ImageMetadata } from 'astro';

const files = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/photos/**/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP}',
  { eager: true },
);

/** Normalize "fall-2026/a.jpg", "/fall-2026/a.jpg" or "src/assets/photos/fall-2026/a.jpg". */
function clean(path: string): string {
  return path.trim().replace(/\\/g, '/').replace(/^\/+/, '').replace(/^src\/assets\/photos\//, '');
}

/** The optimized-image source for a photo path, or undefined (with a warning) if it isn't there. */
export function resolvePhoto(path?: string | null): ImageMetadata | undefined {
  if (!path || !path.trim()) return undefined;
  const hit = files[`/src/assets/photos/${clean(path)}`];
  if (!hit) {
    console.warn(`[photos] "${path}" not found. Put it in src/assets/photos/ and use the path after "photos/".`);
    return undefined;
  }
  return hit.default;
}

/** Find a photo by name without caring about the extension, e.g. findPhoto('home/hero'). */
export function findPhoto(base: string): ImageMetadata | undefined {
  const prefix = `/src/assets/photos/${clean(base)}.`;
  const key = Object.keys(files).find((k) => k.startsWith(prefix));
  return key ? files[key].default : undefined;
}
