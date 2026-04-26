"use client";

import { useReducer } from "react";
import { DMPanel } from "@/components/DMPanel";
import { HatchScene } from "@/components/HatchScene";
import { NeedDemoScene } from "@/components/NeedDemoScene";
import { Sidebar } from "@/components/Sidebar";
import { SlackFrame } from "@/components/SlackFrame";
import { PixelPet } from "@/components/PixelPet";
import { PET_NEEDS } from "@/content/needs";
import { PETS_BY_ID } from "@/content/pets";
import type { FauxMessage } from "@/types";

type NeedStage = "intro" | "hatching" | "need" | "reflection";
type NeedStatus = "needs-action" | "satisfied";

type State = {
  stage: NeedStage;
  needIndex: number;
  status: NeedStatus;
  drafts: string[];
};

type Action =
  | { type: "begin" }
  | { type: "hatchDone" }
  | { type: "updateDraft"; draft: string }
  | { type: "send" }
  | { type: "next" }
  | { type: "reset" };

const INITIAL_STATE: State = {
  stage: "intro",
  needIndex: 0,
  status: "needs-action",
  drafts: PET_NEEDS.map((need) => need.draft),
};

const pet = PETS_BY_ID.wisp;

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "begin":
      return { ...state, stage: "hatching" };

    case "hatchDone":
      return { ...state, stage: "need" };

    case "updateDraft": {
      const drafts = [...state.drafts];
      drafts[state.needIndex] = action.draft;
      return { ...state, drafts };
    }

    case "send":
      return { ...state, status: "satisfied" };

    case "next": {
      if (state.needIndex >= PET_NEEDS.length - 1) {
        return { ...state, stage: "reflection" };
      }
      return {
        ...state,
        needIndex: state.needIndex + 1,
        status: "needs-action",
      };
    }

    case "reset":
      return INITIAL_STATE;
  }
}

function activeSidebarId(stage: NeedStage, needIndex: number): string {
  if (stage === "need") return PET_NEEDS[needIndex].channel.name;
  if (stage === "intro") return "project-x";
  return "pando";
}

export default function NeedsPrototype() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const need = PET_NEEDS[state.needIndex];
  const activeId = activeSidebarId(state.stage, state.needIndex);

  const sidebarItems: Parameters<typeof Sidebar>[0]["items"] = [
    { id: "announcements", label: "01-announcements", kind: "channel" },
    { id: "project-x", label: "project-x", kind: "channel" },
    { id: "talk-random", label: "03-talk random", kind: "channel" },
    {
      id: "pando",
      label: "Pando",
      kind: "dm",
      avatar: { letter: "P", color: "#FFB347" },
      isPando: true,
    },
    {
      id: "Mary Chen",
      label: "Mary Chen",
      kind: "dm",
      avatar: { letter: "M", color: "#7c3aed" },
    },
    {
      id: "Priya Shah",
      label: "Priya Shah",
      kind: "dm",
      avatar: { letter: "P", color: "#0f766e" },
    },
  ];

  let main: React.ReactNode;
  switch (state.stage) {
    case "intro":
      main = <IntroScene onBegin={() => dispatch({ type: "begin" })} />;
      break;
    case "hatching":
      main = (
        <HatchScene pet={pet} onDone={() => dispatch({ type: "hatchDone" })} />
      );
      break;
    case "need":
      main = (
        <NeedDemoScene
          pet={pet}
          need={need}
          draft={state.drafts[state.needIndex]}
          status={state.status}
          onDraftChange={(draft) => dispatch({ type: "updateDraft", draft })}
          onSend={() => dispatch({ type: "send" })}
          onNext={() => dispatch({ type: "next" })}
          isFinalNeed={state.needIndex === PET_NEEDS.length - 1}
        />
      );
      break;
    case "reflection":
      main = <NeedsReflection onReset={() => dispatch({ type: "reset" })} />;
      break;
  }

  return (
    <SlackFrame
      sidebar={
        <Sidebar
          items={sidebarItems}
          activeId={activeId}
          onReset={() => dispatch({ type: "reset" })}
        />
      }
    >
      {main}
    </SlackFrame>
  );
}

function IntroScene({ onBegin }: { onBegin: () => void }) {
  const messages: FauxMessage[] = [
    {
      author: "Mary Heer",
      avatar: { kind: "letter", letter: "M", color: "#64748b" },
      time: "10:27 AM",
      body: "Would you like to hatch your communication pet?",
    },
  ];

  return (
    <DMPanel
      channelLabel="project-x"
      isChannel
      subline="A central place to organize meetups, coffee chats, and launch work"
      messages={messages}
      composer={
        <div className="flex items-center gap-2">
          <button
            onClick={onBegin}
            className="rounded border border-stone-300 px-3 py-1.5 text-sm hover:bg-stone-50"
          >
            Yes
          </button>
          <button
            className="rounded border border-stone-300 px-3 py-1.5 text-sm text-stone-500"
            disabled
          >
            Remind me later
          </button>
        </div>
      }
    />
  );
}

function NeedsReflection({ onReset }: { onReset: () => void }) {
  const messages: FauxMessage[] = [
    {
      author: pet.name,
      avatar: { kind: "pet" },
      time: "5:48 PM",
      body: "You fed me four times today. Status update, real question, firm reply, named next step.",
      fromPet: true,
    },
    {
      author: pet.name,
      avatar: { kind: "pet" },
      time: "5:48 PM",
      body: "Tomorrow I will get hungry again when a thread needs a clearer owner.",
      fromPet: true,
    },
  ];

  return (
    <section className="relative flex-1 min-w-0">
      <DMPanel
        channelLabel="Pando"
        subline="Just you and Pando"
        messages={messages}
        pet={pet}
        composer={
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-end gap-2">
              <PixelPet pet={pet} size={56} animated={false} />
              <span className="text-sm text-stone-500">...</span>
            </div>
            <button
              onClick={onReset}
              className="px-5 py-2.5 rounded-md bg-stone-900 text-white text-sm font-medium hover:bg-stone-700 transition-colors"
            >
              Start over
            </button>
          </div>
        }
      />
    </section>
  );
}
