import { PETS } from "@/content/pets";
import { PixelPet } from "@/components/PixelPet";

/**
 * Dev-only preview page. Renders all 5 pet PNGs at multiple sizes
 * so the designer can eyeball sprite art.
 *
 * Lives at /dev, not part of the user-facing flow.
 */
export default function DevPreview() {
  return (
    <main className="min-h-screen p-10 bg-stone-50">
      <h1 className="text-3xl font-semibold mb-2">Pando pet sprite preview</h1>
      <p className="text-sm text-stone-600 mb-10">
        All 5 species at three sizes. Edit{" "}
        <code className="px-1 bg-stone-200 rounded">public/sprites/</code> to iterate.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {PETS.map((pet) => (
          <div
            key={pet.id}
            className="pando-warm rounded-2xl p-6 flex flex-col items-center text-center shadow-sm"
          >
            <div className="mb-4">
              <PixelPet pet={pet} size={192} />
            </div>
            <div className="flex items-end gap-3 mb-3">
              <PixelPet pet={pet} size={96} animated={false} />
              <PixelPet pet={pet} size={48} animated={false} />
              <PixelPet pet={pet} size={32} animated={false} />
            </div>
            <h2 className="text-xl font-semibold mt-2">{pet.name}</h2>
            <p className="text-sm text-stone-700 italic">{pet.tagline}</p>
            <p className="text-xs text-stone-500 mt-3 max-w-xs">
              <span className="font-medium uppercase tracking-wide">coaches:</span>{" "}
              {pet.coachingFocus}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
