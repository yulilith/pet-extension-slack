type Props = {
  sidebar: React.ReactNode;
  children: React.ReactNode;
};

/**
 * The fixed Slack-like layout: sidebar on the left, content panel on the right.
 * Sized to fill the viewport. Designed for desktop demo (≥1024px).
 */
export function SlackFrame({ sidebar, children }: Props) {
  return (
    <div className="flex w-full h-screen overflow-hidden bg-white">
      {sidebar}
      <main className="flex-1 flex flex-col min-w-0">{children}</main>
    </div>
  );
}
