"use client";

import { useEffect, useState } from "react";
import { DMPanel } from "@/components/DMPanel";
import { PixelPet } from "@/components/PixelPet";
import { COPY } from "@/content/copy";
import type { CoachingMoment, PetSpecies } from "@/types";

type Props = {
  moment: CoachingMoment;
  pet: PetSpecies;
  onSend: () => void;
};

export function CoachingScene({ moment, pet, onSend }: Props) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [draft, setDraft] = useState(moment.draft);

  // Reset draft + feedback when the moment changes (e.g. coaching1 → coaching2).
  // Pet feedback fades in shortly after — feels like the pet noticed you typing.
  useEffect(() => {
    setDraft(moment.draft);
    setShowFeedback(false);
    const t = setTimeout(() => setShowFeedback(true), 900);
    return () => clearTimeout(t);
  }, [moment]);

  const channelLabel =
    moment.channel.kind === "channel" ? moment.channel.name : moment.channel.name;
  const isChannel = moment.channel.kind === "channel";
  const subline =
    moment.channel.kind === "channel"
      ? "Cross-functional working channel"
      : `Direct message with ${moment.channel.name}`;

  return (
    <DMPanel
      channelLabel={channelLabel}
      isChannel={isChannel}
      subline={subline}
      messages={moment.history}
      composerOverlay={
        showFeedback ? (
          <div className="pando-fade-in flex gap-3 items-start mb-2">
            <div
              className="rounded-md overflow-hidden p-0.5 pando-warm shrink-0"
              style={{ width: 36, height: 36 }}
            >
              <PixelPet pet={pet} size={32} animated={false} />
            </div>
            <div className="flex-1">
              <div className="text-xs text-stone-500 mb-1">
                {COPY.coaching.petBubbleHint}
              </div>
              <div className="pando-warm rounded-xl px-4 py-3 text-stone-800 leading-relaxed">
                {moment.petFeedback[pet.id]}
              </div>
            </div>
          </div>
        ) : null
      }
      composer={
        <div className="space-y-2">
          <div className="text-xs text-stone-500 italic">{moment.setup}</div>
          <div className="border border-stone-300 rounded-md focus-within:border-stone-500 transition-colors">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-full px-3 py-2 outline-none resize-none bg-transparent text-stone-900 leading-relaxed"
              rows={4}
              placeholder={COPY.coaching.composerPlaceholder}
            />
            <div className="flex justify-end px-2 pb-2">
              <button
                onClick={onSend}
                className="px-4 py-1.5 rounded bg-emerald-700 text-white text-sm font-medium hover:bg-emerald-600 transition-colors"
              >
                {COPY.coaching.sendLabel}
              </button>
            </div>
          </div>
        </div>
      }
    />
  );
}
