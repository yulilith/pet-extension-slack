"use client";

import { ScaffoldDemo } from "@/components/ScaffoldDemo";

/** Standalone route — same content as the /demo modal version. */
export default function ScaffoldPage() {
  return (
    <div className="h-screen flex flex-col">
      <ScaffoldDemo />
    </div>
  );
}
