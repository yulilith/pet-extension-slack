"use client";

import { WrappedDemo } from "@/components/WrappedDemo";

/** Standalone route — same content as the /demo modal version. */
export default function WrappedPage() {
  return (
    <div className="min-h-screen">
      <WrappedDemo />
    </div>
  );
}
