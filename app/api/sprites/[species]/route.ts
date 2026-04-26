/**
 * Sprite image route: GET /api/sprites/{species}
 *
 * Now only handles "egg" — pet sprites are static PNGs served straight from
 * /public/sprites (see PetSpecies.spriteFile). Keeping the dynamic route
 * because the egg is still rendered programmatically; once we replace it
 * with a static egg.png too, this route can go away.
 *
 * Slack's image blocks accept GIF/JPEG/PNG/BMP/WebP only (no SVG), so the
 * SVG egg is rasterized to PNG via sharp before responding.
 */

import sharp from "sharp";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ species: string }> },
): Promise<Response> {
  const { species } = await params;

  if (species !== "egg") {
    return new Response("Not found. Pet sprites live at /sprites/<file>.png.", {
      status: 404,
    });
  }

  const png = await sharp(Buffer.from(renderEggSvg())).png().toBuffer();

  return new Response(new Uint8Array(png), {
    status: 200,
    headers: {
      "content-type": "image/png",
      "cache-control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

/**
 * Egg SVG matching the web demo's Egg component, rasterized at 560×700.
 */
function renderEggSvg(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 200" width="560" height="700">
  <defs>
    <radialGradient id="egg-grad" cx="35%" cy="30%" r="80%">
      <stop offset="0%" stop-color="#fff7df"/>
      <stop offset="60%" stop-color="#f5dfa7"/>
      <stop offset="100%" stop-color="#d8b878"/>
    </radialGradient>
  </defs>
  <ellipse cx="80" cy="115" rx="62" ry="80" fill="url(#egg-grad)" stroke="#a08355" stroke-width="2"/>
  <circle cx="55" cy="100" r="3" fill="#a08355" opacity="0.5"/>
  <circle cx="100" cy="80" r="2" fill="#a08355" opacity="0.5"/>
  <circle cx="95" cy="140" r="2.5" fill="#a08355" opacity="0.5"/>
  <circle cx="65" cy="155" r="2" fill="#a08355" opacity="0.5"/>
  <path d="M 80 50 L 75 65 L 88 80 L 78 95" stroke="#7a5f30" stroke-width="2" fill="none" stroke-linecap="round"/>
</svg>`;
}
