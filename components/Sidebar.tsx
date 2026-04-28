"use client";

type SidebarItem = {
  id: string;
  label: string;
  kind: "channel" | "dm";
  /** For DMs only: avatar letter and color. */
  avatar?: { letter: string; color: string };
  /** Whether this item gets the special "pet" warm dot indicator. */
  isPet?: boolean;
  /** Online indicator color for DMs (e.g. "#2bac76" for online, undefined for away). */
  presence?: "active" | "away";
  /** Bold formatting for unread messages. */
  unread?: boolean;
};

type Props = {
  workspaceName?: string;
  items: SidebarItem[];
  activeId: string;
  onReset?: () => void;
};

export function Sidebar({
  workspaceName = "Synko Test Co.",
  items,
  activeId,
  onReset,
}: Props) {
  const channels = items.filter((i) => i.kind === "channel");
  const dms = items.filter((i) => i.kind === "dm");

  return (
    <aside
      className="flex flex-col w-64 shrink-0"
      style={{ background: "var(--slack-sidebar)" }}
    >
      {/* Workspace header with chevron + new-message icon */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b border-white/10">
        <button className="flex items-center gap-1 text-white font-bold text-[15px] hover:bg-white/5 -mx-1 px-1 rounded">
          <span className="truncate max-w-[160px]">{workspaceName}</span>
          <Chevron />
        </button>
        <button
          className="w-6 h-6 rounded bg-white text-stone-700 flex items-center justify-center hover:bg-white/90"
          aria-label="New message"
          title="New message"
        >
          <PencilIcon />
        </button>
      </div>

      {/* Search */}
      <div className="slack-search">
        <SearchIcon />
        <span className="flex-1">Search Synko</span>
      </div>

      {/* Utility links — Threads / Drafts / Mentions */}
      <ul className="pt-1 pb-2">
        <li className="slack-row"><HashIcon /> Threads</li>
        <li className="slack-row"><BookmarkIcon /> Drafts &amp; sent</li>
        <li className="slack-row"><AtIcon /> Mentions &amp; reactions</li>
      </ul>

      <nav className="flex-1 overflow-y-auto pb-2">
        <SidebarSection label="Channels">
          {channels.map((c) => (
            <li
              key={c.id}
              className="slack-row"
              data-active={c.id === activeId ? "true" : "false"}
              style={c.unread ? { color: "white", fontWeight: 700 } : undefined}
            >
              <span className="opacity-70 inline-block w-4 text-center">#</span>
              <span className="truncate">{c.label}</span>
            </li>
          ))}
          <li className="slack-row text-white/50 hover:text-white/85">
            <PlusIcon /> Add channels
          </li>
        </SidebarSection>

        <SidebarSection label="Direct messages">
          {dms.map((d) => (
            <li
              key={d.id}
              className="slack-row"
              data-active={d.id === activeId ? "true" : "false"}
              style={d.unread ? { color: "white", fontWeight: 700 } : undefined}
            >
              <span className="relative inline-block w-4 h-4">
                {d.avatar && (
                  <span
                    className="inline-flex items-center justify-center w-4 h-4 rounded text-[9px] font-bold text-white"
                    style={{ background: d.avatar.color }}
                  >
                    {d.avatar.letter}
                  </span>
                )}
                {d.presence === "active" && (
                  <span
                    className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full border border-[#3f0e40]"
                    style={{ background: "var(--slack-green)" }}
                  />
                )}
              </span>
              <span className="truncate flex-1">{d.label}</span>
              {d.isPet && (
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full"
                  style={{ background: "#FFD93D" }}
                  aria-label="pet"
                />
              )}
            </li>
          ))}
          <li className="slack-row text-white/50 hover:text-white/85">
            <PlusIcon /> Add teammates
          </li>
        </SidebarSection>
      </nav>

      {onReset && (
        <button
          onClick={onReset}
          className="text-left px-4 py-2 text-xs text-white/40 hover:text-white/70 border-t border-white/10"
        >
          ↻ Reset prototype
        </button>
      )}
    </aside>
  );
}

function SidebarSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="slack-section-label">
        <Caret />
        <span>{label}</span>
      </div>
      <ul>{children}</ul>
    </div>
  );
}

/* ─────────────────────────── Inline icons ─────────────────────────── */
/* Hand-rolled to keep the bundle light. All sized 14px. */

function Chevron() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M5 8l5 5 5-5z" />
    </svg>
  );
}
function Caret() {
  return (
    <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M6 6l8 4-8 4z" />
    </svg>
  );
}
function PencilIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M3 17l3-1L17 5l-2-2L4 14l-1 3z" />
      <path d="M14 6l2 2" />
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
function HashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M3 8h14M3 12h14M8 3l-2 14M14 3l-2 14" />
    </svg>
  );
}
function BookmarkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M5 3h10v15l-5-3-5 3z" />
    </svg>
  );
}
function AtIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="10" cy="10" r="3" />
      <path d="M13 10v2c0 1 1 2 2 2 2 0 2-2 2-3 0-4-3-7-7-7s-7 3-7 7 3 7 7 7c1 0 2 0 3-1" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M9 4h2v5h5v2h-5v5H9v-5H4V9h5z" />
    </svg>
  );
}
