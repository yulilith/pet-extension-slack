import { MessageBubble } from "@/components/MessageBubble";
import type { FauxMessage, PetSpecies } from "@/types";

type Props = {
  /** Top header: name of the conversation (e.g. "Pando", "Mary Chen", "marketing-launch"). */
  channelLabel: string;
  /** Whether to prefix the label with "#". */
  isChannel?: boolean;
  /** Subhead like "Just you and Pando" or member count. */
  subline?: string;
  messages: FauxMessage[];
  /** The user's pet (used for any "pet" avatars in messages). */
  pet?: PetSpecies | null;
  /** Optional content rendered above the composer (e.g. coaching pet bubble). */
  composerOverlay?: React.ReactNode;
  /** Composer area. Pass null to hide composer entirely. */
  composer?: React.ReactNode;
};

export function DMPanel({
  channelLabel,
  isChannel = false,
  subline,
  messages,
  pet = null,
  composerOverlay,
  composer,
}: Props) {
  return (
    <section className="flex-1 flex flex-col bg-white min-w-0">
      <header className="border-b border-stone-200 px-5 py-3">
        <div className="flex items-baseline gap-2">
          {isChannel && <span className="text-stone-500">#</span>}
          <h2 className="font-semibold text-stone-900 text-base">{channelLabel}</h2>
        </div>
        {subline && <p className="text-xs text-stone-500 mt-0.5">{subline}</p>}
      </header>

      <div className="flex-1 overflow-y-auto py-4">
        {messages.map((m, i) => (
          <MessageBubble key={i} message={m} pet={pet} />
        ))}
      </div>

      {composerOverlay && (
        <div className="px-4 pb-2">{composerOverlay}</div>
      )}

      {composer !== null && (
        <div className="border-t border-stone-200 p-4">
          {composer}
        </div>
      )}
    </section>
  );
}
