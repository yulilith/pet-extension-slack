"use client";

import { useId, type KeyboardEvent } from "react";

type Props = {
  value: string;
  onChange: (next: string) => void;
  onSend?: () => void;
  placeholder?: string;
  /** Optional content rendered above the textarea (e.g. an attachment/quote chip). */
  topAdornment?: React.ReactNode;
  /** Optional content rendered below the textarea, above the action row (e.g. pet pulse hint). */
  bottomAdornment?: React.ReactNode;
  rows?: number;
};

/**
 * Slack-faithful message composer: formatting toolbar, textarea, action row.
 * Cmd/Ctrl-Enter sends. Send button is dimmed when the textarea is empty.
 */
export function SlackComposer({
  value,
  onChange,
  onSend,
  placeholder = "Message",
  topAdornment,
  bottomAdornment,
  rows = 2,
}: Props) {
  const id = useId();
  const empty = value.trim().length === 0;

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && !empty) {
      e.preventDefault();
      onSend?.();
    }
  }

  return (
    <div className="slack-composer">
      <div className="slack-composer-toolbar">
        <button title="Bold"><b className="text-[13px]">B</b></button>
        <button title="Italic"><i className="text-[13px]">I</i></button>
        <button title="Strikethrough"><span className="text-[13px] line-through">S</span></button>
        <span className="sep" />
        <button title="Link"><LinkIcon /></button>
        <span className="sep" />
        <button title="Numbered list"><span className="text-[13px]">1.</span></button>
        <button title="Bullet list"><BulletIcon /></button>
        <span className="sep" />
        <button title="Quote"><QuoteIcon /></button>
        <button title="Code"><CodeIcon /></button>
        <button title="Code block"><CodeBlockIcon /></button>
      </div>
      {topAdornment}
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="resize-none outline-none px-3 py-2 text-[15px] leading-snug text-stone-900 bg-transparent"
      />
      {bottomAdornment}
      <div className="slack-composer-actions">
        <div className="left">
          <button title="Attach"><PlusBoxIcon /></button>
          <button title="Mention"><AtIcon /></button>
          <button title="Emoji"><SmileIcon /></button>
          <button title="Mention someone"><span className="text-stone-500 text-[15px] px-1">@</span></button>
          <button title="Record audio"><MicIcon /></button>
          <button title="Record video"><CamIcon /></button>
        </div>
        <div className="right">
          <button title="Schedule"><ClockIcon /></button>
          <button
            className="slack-send-btn"
            data-empty={empty ? "true" : "false"}
            onClick={() => !empty && onSend?.()}
            aria-label="Send"
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

/* Icon set — sized to match the toolbar's 13–15px aesthetic */
function LinkIcon() {
  return <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M8 12L12 8M7 14a3 3 0 010-4l3-3M13 6a3 3 0 010 4l-3 3" /></svg>;
}
function BulletIcon() {
  return <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden><circle cx="3" cy="5" r="1.5" /><circle cx="3" cy="10" r="1.5" /><circle cx="3" cy="15" r="1.5" /><rect x="7" y="4" width="10" height="2" /><rect x="7" y="9" width="10" height="2" /><rect x="7" y="14" width="10" height="2" /></svg>;
}
function QuoteIcon() {
  return <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden><path d="M3 3h2v14H3zM7 6h10v2H7zM7 10h7v2H7zM7 14h10v2H7z" /></svg>;
}
function CodeIcon() {
  return <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M8 7L4 10l4 3M12 7l4 3-4 3" /></svg>;
}
function CodeBlockIcon() {
  return <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden><rect x="2" y="3" width="16" height="14" rx="1" /><path d="M6 8l-2 2 2 2M14 8l2 2-2 2M11 7l-2 6" /></svg>;
}
function PlusBoxIcon() {
  return <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden><path d="M9 4h2v5h5v2h-5v5H9v-5H4V9h5z" /></svg>;
}
function AtIcon() {
  return <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><circle cx="10" cy="10" r="3" /><path d="M13 10v2c0 1 1 2 2 2 2 0 2-2 2-3 0-4-3-7-7-7s-7 3-7 7 3 7 7 7c1 0 2 0 3-1" /></svg>;
}
function SmileIcon() {
  return <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><circle cx="10" cy="10" r="8" /><path d="M7 12c1 1 2 1.5 3 1.5s2-.5 3-1.5" /><circle cx="7.5" cy="8" r=".8" fill="currentColor" /><circle cx="12.5" cy="8" r=".8" fill="currentColor" /></svg>;
}
function MicIcon() {
  return <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><rect x="8" y="3" width="4" height="9" rx="2" /><path d="M5 11a5 5 0 0010 0M10 16v3" /></svg>;
}
function CamIcon() {
  return <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><rect x="2" y="6" width="11" height="9" rx="1.5" /><path d="M13 9l5-3v8l-5-3z" /></svg>;
}
function ClockIcon() {
  return <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><circle cx="10" cy="10" r="7" /><path d="M10 6v4l3 2" /></svg>;
}
function SendIcon() {
  return <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden><path d="M3 3l14 7-14 7v-5l9-2-9-2z" /></svg>;
}
