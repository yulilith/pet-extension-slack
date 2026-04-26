import type { PetSpecies } from "@/types";
import Image from "next/image";

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
};

/**
 * Renders the pet PNG from /public/sprites.
 * Kept as PixelPet so existing web-demo components switch over cleanly.
 */
export function PixelPet({ pet, size = 192, className = "", animated = true }: Props) {
  return (
    <Image
      src={`/sprites/${pet.spriteFile}`}
      alt={`${pet.name}, ${pet.tagline}`}
      width={size}
      height={size}
      className={`inline-block ${animated ? "pando-pet-float" : ""} ${className}`}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        imageRendering: "pixelated",
      }}
    />
  );
}
