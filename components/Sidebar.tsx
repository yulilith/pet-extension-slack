"use client";

type SidebarItem = {
  id: string;
  label: string;
  kind: "channel" | "dm";
  /** For DMs only: avatar letter and color. */
  avatar?: { letter: string; color: string };
  /** Whether this item gets the special "Pando" warm dot indicator. */
  isPando?: boolean;
};

type Props = {
  items: SidebarItem[];
  activeId: string;
  onReset?: () => void;
};

export function Sidebar({ items, activeId, onReset }: Props) {
  const channels = items.filter((i) => i.kind === "channel");
  const dms = items.filter((i) => i.kind === "dm");

  return (
    <aside
      className="flex flex-col w-60 shrink-0 text-sm text-white/85"
      style={{ background: "var(--slack-sidebar)" }}
    >
      {/* Workspace header */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="font-semibold text-white">Pando Test Co.</div>
        <div className="text-xs text-white/60 flex items-center gap-1.5 mt-0.5">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ background: "#2bac76" }}
          />
          you
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        <SidebarGroup label="Channels">
          {channels.map((c) => (
            <SidebarRow
              key={c.id}
              active={c.id === activeId}
              icon={<span className="opacity-70">#</span>}
              label={c.label}
            />
          ))}
        </SidebarGroup>

        <SidebarGroup label="Direct messages">
          {dms.map((d) => (
            <SidebarRow
              key={d.id}
              active={d.id === activeId}
              icon={
                d.avatar ? (
                  <span
                    className="inline-flex items-center justify-center w-4 h-4 rounded text-[9px] font-bold"
                    style={{
                      background: d.avatar.color,
                      color: "white",
                    }}
                  >
                    {d.avatar.letter}
                  </span>
                ) : (
                  <span className="w-4 h-4 inline-block" />
                )
              }
              label={d.label}
              suffix={
                d.isPando ? (
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full"
                    style={{ background: "#FFD93D" }}
                    aria-label="Pando"
                  />
                ) : null
              }
            />
          ))}
        </SidebarGroup>
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

function SidebarGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3">
      <div className="px-4 py-1 text-xs uppercase tracking-wide text-white/50">
        {label}
      </div>
      <ul>{children}</ul>
    </div>
  );
}

function SidebarRow({
  active,
  icon,
  label,
  suffix,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  suffix?: React.ReactNode;
}) {
  return (
    <li
      className={`px-4 py-1 flex items-center gap-2 ${
        active ? "text-white" : "hover:bg-white/5"
      }`}
      style={
        active
          ? { background: "var(--slack-sidebar-active)" }
          : undefined
      }
    >
      <span className="w-4 inline-flex justify-center">{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      {suffix}
    </li>
  );
}
