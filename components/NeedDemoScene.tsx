"use client";

import { DMPanel } from "@/components/DMPanel";
import { FloatingPet } from "@/components/FloatingPet";
import type { FauxMessage, NeedId, PetNeed, PetSpecies } from "@/types";

type Props = {
  pet: PetSpecies;
  need: PetNeed;
  draft: string;
  status: "drafting" | "satisfied";
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
    status === "satisfied" && draft.trim().length > 0
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
  const petMessage =
    status === "drafting" ? draftFeedback(need.id, draft, need.draftingLine) : undefined;

  return (
    <section className="relative flex flex-col flex-1 min-h-0 min-w-0 overflow-hidden">
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
                placeholder={need.placeholder}
                aria-label="Message draft"
              />
              <div className="flex justify-end px-2 pb-2">
                <button
                  onClick={onSend}
                  disabled={status === "satisfied" || draft.trim().length === 0}
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
        onAct={() => undefined}
        onNext={onNext}
        isFinalNeed={isFinalNeed}
        message={petMessage}
      />
    </section>
  );
}

function draftFeedback(id: NeedId, draft: string, emptyLine: string): string {
  const text = draft.trim();
  const lower = text.toLowerCase();
  if (text.length === 0) return emptyLine;

  switch (id) {
    case "hungry":
      if (!/\b(mon|tue|wed|thu|fri|today|tomorrow|\d)/i.test(text)) {
        return "Add the date or time. Chan needs the part they can plan around.";
      }
      if (!/\b(can you|please|confirm|review|own|owns)\b/i.test(text)) {
        return "The status is there. If someone needs to act, make the ask explicit.";
      }
      return "This has a status and a next ask. Good shape.";

    case "lonely":
      if (!text.includes("?")) {
        return "Make it a question Priya can answer. Right now it reads like context.";
      }
      if (!/\b(option|choose|help|stuck|leaning)\b/i.test(text)) {
        return "Tell Priya what kind of help you need. A broad ask is harder to answer.";
      }
      return "This gives Priya a real question and enough context to help.";

    case "wobbly":
      if (/\b(maybe|probably|could|if you want|no worries)\b/i.test(lower)) {
        return "One softener is fine. This many makes the timeline harder to trust.";
      }
      if (!/\b(need|move|tuesday|two more days|delay)\b/i.test(lower)) {
        return "Say the timeline directly. Mary should not have to infer the change.";
      }
      return "The firm part is visible. Keep the reason after the timeline.";

    case "restless":
      if (!/\b(owns|owner|next step|due|by|review)\b/i.test(lower)) {
        return "Name the owner and the check point. That is what unsticks the thread.";
      }
      if (!/\b(mon|tue|wed|thu|fri|today|tomorrow|\d)/i.test(text)) {
        return "You named the move. Add a time so people know when to look again.";
      }
      return "Owner, next step, check point. The thread has somewhere to go.";
  }
}
