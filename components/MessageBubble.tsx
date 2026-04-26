import { PixelPet } from "@/components/PixelPet";
import type { FauxMessage, PetSpecies } from "@/types";

type Props = {
  message: FauxMessage;
  /** Required when message.avatar.kind === "pet". */
  pet?: PetSpecies | null;
};

/**
 * Single Slack-style message: avatar + name/time header + body.
 *
 * If `message.fromPet` is set, applies the warm "magical" treatment to make
 * Pando's voice feel distinct from the surrounding chat.
 */
export function MessageBubble({ message, pet }: Props) {
  const { avatar, author, time, body, fromPet } = message;

  return (
    <div
      className={`group px-4 py-2 flex gap-3 ${
        fromPet ? "" : "hover:bg-stone-50"
      }`}
    >
      <div className="shrink-0 w-9 h-9 mt-0.5 flex items-start justify-center">
        {avatar.kind === "pet" && pet ? (
          <div
            className="rounded-md overflow-hidden p-0.5 pando-warm"
            style={{ width: 36, height: 36 }}
          >
            <PixelPet pet={pet} size={32} animated={false} />
          </div>
        ) : avatar.kind === "letter" ? (
          <div
            className="w-9 h-9 rounded-md flex items-center justify-center text-white text-sm font-bold"
            style={{ background: avatar.color }}
          >
            {avatar.letter}
          </div>
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-stone-900">{author}</span>
          <span className="text-xs text-stone-500">{time}</span>
        </div>
        <div
          className={`text-stone-800 whitespace-pre-wrap leading-relaxed ${
            fromPet ? "mt-1" : ""
          }`}
        >
          {fromPet ? (
            <div className="pando-warm rounded-xl px-3 py-2 inline-block max-w-prose">
              {body}
            </div>
          ) : (
            <span>{body}</span>
          )}
        </div>
      </div>
    </div>
  );
}
