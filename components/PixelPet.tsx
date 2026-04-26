import type { PetSpecies } from "@/types";

type Props = {
  pet: PetSpecies;
  /** Total rendered size in px (the sprite is 16x16 cells, so cellSize = size/16). */
  size?: number;
  /** Optional className applied to the outer wrapper. */
  className?: string;
  /**
   * Subtle floating idle animation. Default: true.
   * Disable for static contexts (e.g. small avatars in chat).
   */
  animated?: boolean;
};

/**
 * Renders a 16x16 pixel-art pet from a sprite (2D index grid) and palette.
 * Pure CSS grid — no canvas, no SVG. Each cell is a colored <div>.
 */
export function PixelPet({ pet, size = 192, className = "", animated = true }: Props) {
  const cellSize = size / 16;

  return (
    <div
      role="img"
      aria-label={`${pet.name}, ${pet.tagline}`}
      className={`inline-block ${animated ? "pando-pet-float" : ""} ${className}`}
      style={{
        width: size,
        height: size,
        display: "grid",
        gridTemplateColumns: `repeat(16, ${cellSize}px)`,
        gridTemplateRows: `repeat(16, ${cellSize}px)`,
      }}
    >
      {pet.sprite.map((row, r) =>
        row.map((idx, c) => (
          <div
            key={`${r}-${c}`}
            style={{
              backgroundColor: idx === 0 ? "transparent" : pet.palette[idx],
            }}
          />
        )),
      )}
    </div>
  );
}
