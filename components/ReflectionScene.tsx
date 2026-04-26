"use client";

import { DMPanel } from "@/components/DMPanel";
import { COPY } from "@/content/copy";
import { REFLECTIONS } from "@/content/reflections";
import type { FauxMessage, PetSpecies } from "@/types";

type Props = {
  pet: PetSpecies;
  onDone: () => void;
};

export function ReflectionScene({ pet, onDone }: Props) {
  const reflection = REFLECTIONS[pet.id];

  // Two messages from Pando: lead-in + affirmation, then invitation.
  // Splitting into two bubbles makes it feel like the pet is *thinking aloud*
  // rather than delivering a paragraph.
  const messages: FauxMessage[] = [
    {
      author: pet.name,
      avatar: { kind: "pet" },
      time: "5:48 PM",
      body: `${COPY.reflection.leadIn}\n\n${reflection.affirmation}`,
      fromPet: true,
    },
    {
      author: pet.name,
      avatar: { kind: "pet" },
      time: "5:48 PM",
      body: reflection.invitation,
      fromPet: true,
    },
  ];

  return (
    <DMPanel
      channelLabel="Pando"
      subline="Just you and Pando"
      messages={messages}
      pet={pet}
      composer={
        <div className="flex justify-end">
          <button
            onClick={onDone}
            className="px-5 py-2.5 rounded-md bg-stone-900 text-white text-sm font-medium hover:bg-stone-700 transition-colors"
          >
            Goodnight
          </button>
        </div>
      }
    />
  );
}
