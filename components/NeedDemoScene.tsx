"use client";

import { DMPanel } from "@/components/DMPanel";
import { FloatingPet } from "@/components/FloatingPet";
import type { FauxMessage, PetNeed, PetSpecies } from "@/types";

type Props = {
  pet: PetSpecies;
  need: PetNeed;
  draft: string;
  status: "needs-action" | "satisfied";
  onDraftChange: (draft: string) => void;
  onSend: () => void;
  onNext: () => void;
  isFinalNeed?: boolean;
};

export function NeedDemoScene({
  pet,
  need,
  draft,
  status,
  onDraftChange,
  onSend,
  onNext,
  isFinalNeed = false,
}: Props) {
  const isChannel = need.channel.kind === "channel";
  const channelLabel = need.channel.name;
  const subline = isChannel
    ? "Cross-functional project channel"
    : `Direct message with ${need.channel.name}`;
  const messages: FauxMessage[] =
    status === "satisfied"
      ? [
          ...need.history,
          {
            author: "you",
            avatar: { kind: "letter", letter: "Y", color: "#2563eb" },
            time: "now",
            body: draft,
          },
        ]
      : need.history;

  return (
    <section className="relative flex-1 min-w-0 overflow-hidden">
      <DMPanel
        channelLabel={channelLabel}
        isChannel={isChannel}
        subline={subline}
        messages={messages}
        composer={
          <div className="space-y-2 pr-28">
            <div className="text-xs text-stone-500">{need.setup}</div>
            <div className="border border-stone-300 rounded-md focus-within:border-stone-500 transition-colors bg-white">
              <textarea
                value={draft}
                onChange={(e) => onDraftChange(e.target.value)}
                className="w-full px-3 py-2 outline-none resize-none bg-transparent text-stone-900 leading-relaxed disabled:text-stone-500"
                rows={3}
                disabled={status === "satisfied"}
                aria-label="Message draft"
              />
              <div className="flex justify-end px-2 pb-2">
                <button
                  onClick={onSend}
                  disabled={status === "satisfied"}
                  className="px-4 py-1.5 rounded bg-emerald-700 text-white text-sm font-medium hover:bg-emerald-600 transition-colors disabled:bg-stone-300 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        }
      />

      <FloatingPet
        pet={pet}
        need={need}
        status={status}
        onAct={onSend}
        onNext={onNext}
        isFinalNeed={isFinalNeed}
      />
    </section>
  );
}
