"use client";

import { useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Width preset. fullscreen = takes the whole viewport. */
  width?: "sm" | "md" | "lg" | "fullscreen";
  /** Optional title rendered in a top bar. */
  title?: string;
  children: React.ReactNode;
};

const widthMap = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-4xl",
  fullscreen: "w-full h-full",
};

/** Backdrop + centered card. Closes on Esc and on backdrop click.
 *  Always shows an explicit close button (top-right), including fullscreen. */
export function Modal({ open, onClose, width = "md", title, children }: Props) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const isFs = width === "fullscreen";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-xl shadow-2xl w-full ${widthMap[width]} ${
          isFs ? "h-full" : "max-h-[90vh]"
        } overflow-hidden flex flex-col relative`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between px-5 py-3 border-b border-stone-200">
            <h3 className="font-bold text-stone-900 text-[15px]">{title}</h3>
            <CloseButton onClick={onClose} />
          </div>
        )}

        {/* Floating close button for fullscreen / no-title modals */}
        {!title && (
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white text-stone-700 hover:bg-stone-100 shadow-md border border-stone-200 flex items-center justify-center text-lg"
          >
            ✕
          </button>
        )}

        <div className={`flex-1 min-h-0 ${isFs ? "" : "overflow-y-auto"}`}>
          {children}
        </div>

        {/* Esc hint for fullscreen modals */}
        {isFs && (
          <div className="absolute bottom-3 left-3 z-10 text-[11px] text-white/60 bg-black/40 px-2 py-1 rounded-md pointer-events-none">
            Press Esc to close
          </div>
        )}
      </div>
    </div>
  );
}

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-7 h-7 rounded-md flex items-center justify-center text-stone-500 hover:bg-stone-100"
      aria-label="Close"
    >
      ✕
    </button>
  );
}
