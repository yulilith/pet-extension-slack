"use client";

import { COPY } from "@/content/copy";
import { DMPanel } from "@/components/DMPanel";
import type { FauxMessage } from "@/types";

type Props = {
  onBegin: () => void;
};

export function IntroScene({ onBegin }: Props) {
  const message: FauxMessage = {
    author: "Pando",
    avatar: { kind: "letter", letter: "P", color: "#FFB347" },
    time: "9:00 AM",
    body: COPY.intro.greeting,
    fromPet: true,
  };

  return (
    <DMPanel
      channelLabel="Pando"
      subline="Just you and Pando"
      messages={[message]}
      composer={
        <div className="flex justify-end">
          <button
            onClick={onBegin}
            className="px-5 py-2.5 rounded-md bg-stone-900 text-white text-sm font-medium hover:bg-stone-700 transition-colors pando-fade-in"
          >
            {COPY.intro.beginButton}
          </button>
        </div>
      }
    />
  );
}
