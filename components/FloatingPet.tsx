"use client";

import { PixelPet } from "@/components/PixelPet";
import type { PetNeed, PetSpecies } from "@/types";

type Props = {
  pet: PetSpecies;
  need: PetNeed;
  status: "needs-action" | "drafting" | "satisfied";
  onAct: () => void;
  onNext: () => void;
  isFinalNeed?: boolean;
  message?: string;
};

export function FloatingPet({
  pet,
  need,
  status,
  onAct,
  onNext,
  isFinalNeed = false,
  message,
}: Props) {
  const isSatisfied = status === "satisfied";
  const isDrafting = status === "drafting";
  const line =
    message ??
    (isSatisfied
      ? need.afterSendLine
      : isDrafting
        ? need.draftingLine
        : need.petLine);

  return (
    <div className="absolute right-6 bottom-6 z-20 flex flex-col items-end gap-2 pointer-events-none">
      <div className="relative max-w-xs rounded-xl bg-fuchsia-300 text-white shadow-lg px-4 py-3 synko-fade-in">
        <div className="text-xs font-semibold uppercase tracking-wide text-white/75 mb-1">
          {need.label}
        </div>
        <p className="text-sm leading-snug">{line}</p>
        {!isDrafting && (
          <button
            onClick={isSatisfied ? onNext : onAct}
            className="mt-3 rounded bg-fuchsia-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-fuchsia-700 transition-colors pointer-events-auto"
          >
            {isSatisfied
              ? isFinalNeed
                ? "Wrap up"
                : "Next need"
              : need.actionLabel}
          </button>
        )}
        <span
          className="absolute -bottom-2 right-8 h-4 w-4 rotate-45 bg-fuchsia-300"
          aria-hidden
        />
      </div>

      <div className="pr-4">
        <PixelPet pet={pet} size={72} />
      </div>
    </div>
  );
}
