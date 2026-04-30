import type { PetSpecies } from "@/types";

export type PetState = "healthy" | "normal" | "unhealthy";

type Props = {
  pet: PetSpecies;
  /** Total rendered size in px. */
  size?: number;
  /** Optional className applied to the outer wrapper. */
  className?: string;
  /**
   * Subtle floating idle animation. Default: true.
   * Disable for static contexts (e.g. small avatars in chat).
   */
  animated?: boolean;
  /**
   * Health-state visual treatment. Each state has its own bop amplitude /
   * speed and decoration:
   *   - healthy   → bigger lift, faster bop, accent-color glow halo
   *   - normal    → mid-range bop, no decoration
   *   - unhealthy → small low droop, slow bop, dimmed + slight grayscale
   * Falls back to plain idle float when omitted.
   */
  state?: PetState;
};

/** Maps a 0–100 health value to a discrete pet state. */
export function healthToState(health: number): PetState {
  if (health >= 70) return "healthy";
  if (health >= 35) return "normal";
  return "unhealthy";
}

/**
 * Renders the pet sprite from /public/sprites. Plain <img> rather than
 * next/image so we accept both PNG and SVG files without enabling Next's
 * dangerouslyAllowSVG. Sprites are tiny pixel art — no optimization needed.
 *
 * State-aware bopping animation + decoration matches the Figma "Pet" page
 * (file C31nTMGPfNI8oYoFnfhy5D · "Animation states" section).
 */
export function PixelPet({
  pet,
  size = 192,
  className = "",
  animated = true,
  state,
}: Props) {
  const animClass = !animated
    ? ""
    : state === "healthy"
      ? "synko-pet-bop-healthy"
      : state === "unhealthy"
        ? "synko-pet-bop-unhealthy"
        : state === "normal"
          ? "synko-pet-bop-normal"
          : "synko-pet-float";

  const decorationClass =
    state === "healthy"
      ? "synko-pet-glow"
      : state === "unhealthy"
        ? "synko-pet-dim"
        : "";

  // The glow's color comes from a CSS var set inline so consumers don't need
  // to know about it — we just read pet.accentColor.
  const styleVars =
    state === "healthy"
      ? ({ ["--pet-accent" as string]: pet.accentColor } as React.CSSProperties)
      : undefined;

  return (
    <span
      className={`inline-block ${animClass} ${className}`}
      style={styleVars}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/sprites/${pet.spriteFile}`}
        alt={`${pet.name}, ${pet.tagline}`}
        width={size}
        height={size}
        className={decorationClass}
        style={{
          width: size,
          height: size,
          objectFit: "contain",
          imageRendering: "pixelated",
          display: "block",
        }}
      />
    </span>
  );
}
