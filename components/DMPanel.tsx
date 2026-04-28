import { MessageBubble } from "@/components/MessageBubble";
import type { FauxMessage, PetSpecies } from "@/types";

type Props = {
  /** Top header: name of the conversation (e.g. "Synko", "Mary Chen", "marketing-launch"). */
  channelLabel: string;
  /** Whether to prefix the label with "#". */
  isChannel?: boolean;
  /** Subhead like "Just you and Synko" or member count. */
  subline?: string;
  /** Optional topic pinned in header (real Slack shows this next to channel name). */
  topic?: string;
  /** Member count rendered as a clickable pill (right side). */
  memberCount?: number;
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
  topic,
  memberCount,
  messages,
  pet = null,
  composerOverlay,
  composer,
}: Props) {
  return (
    <section className="flex-1 flex flex-col bg-white min-w-0">
      <header className="border-b border-stone-200 px-5 py-2.5 flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <button className="flex items-center gap-1.5 -mx-1 px-1 py-0.5 rounded hover:bg-stone-100">
            {isChannel && <span className="text-stone-500 text-base">#</span>}
            <h2 className="font-bold text-stone-900 text-[15px] leading-tight">
              {channelLabel}
            </h2>
            <svg
              width="12"
              height="12"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="text-stone-500"
              aria-hidden
            >
              <path d="M5 8l5 5 5-5z" />
            </svg>
          </button>
          {(subline || topic) && (
            <p className="text-xs text-stone-500 mt-0.5 truncate">
              {topic || subline}
            </p>
          )}
        </div>

        <div className="slack-channel-actions">
          {typeof memberCount === "number" && (
            <button title="View members">
              <UsersIcon />
              <span className="font-semibold tabular-nums">{memberCount}</span>
            </button>
          )}
          <button title="Pinned items">
            <PinIcon />
          </button>
          <button title="Search this conversation">
            <SearchIcon />
          </button>
          <button title="Channel info">
            <InfoIcon />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto py-4">
        {messages.map((m, i) => (
          <MessageBubble key={i} message={m} pet={pet} />
        ))}
      </div>

      {composerOverlay && (
        <div className="px-5 pb-2">{composerOverlay}</div>
      )}

      {composer !== null && composer !== undefined && (
        <div className="border-t border-stone-200 px-5 py-3">{composer}</div>
      )}
    </section>
  );
}

function UsersIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <circle cx="7" cy="7" r="3" />
      <circle cx="14" cy="8" r="2.5" />
      <path d="M2 17c0-3 2.5-5 5-5s5 2 5 5zM12 17c0-2.4 1.5-4 4-4s2 1.6 2 4z" />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M14 3l3 3-4 1-2 5h-1L7 8H5l1-2 5-2 1-1z" />
      <path d="M9 11l-4 5" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="9" cy="9" r="6" />
      <path d="M14 14l4 4" />
    </svg>
  );
}
function InfoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="10" cy="10" r="8" />
      <path d="M10 9v5M10 6.5v.5" />
    </svg>
  );
}
