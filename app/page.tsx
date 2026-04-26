"use client";

import { useEffect, useReducer, useState } from "react";
import { SlackFrame } from "@/components/SlackFrame";
import { Sidebar } from "@/components/Sidebar";
import { IntroScene } from "@/components/IntroScene";
import { AnalysisScene } from "@/components/AnalysisScene";
import { IntentionsScene } from "@/components/IntentionsScene";
import { HatchScene } from "@/components/HatchScene";
import { CoachingScene } from "@/components/CoachingScene";
import { ReflectionScene } from "@/components/ReflectionScene";
import { EndScene } from "@/components/EndScene";
import { PETS_BY_ID } from "@/content/pets";
import { COACHING_MOMENTS } from "@/content/coachingMoments";
import { pickSpeciesFromIntentions } from "@/lib/match";
import { nextStage } from "@/lib/stages";
import { clearFlow, INITIAL_FLOW, loadFlow, saveFlow } from "@/lib/storage";
import type { FlowState, Stage } from "@/types";

type Action =
  | { type: "hydrate"; state: FlowState }
  | { type: "advance" }
  | { type: "submitIntentions"; ids: string[] }
  | { type: "reset" };

function reducer(state: FlowState, action: Action): FlowState {
  switch (action.type) {
    case "hydrate":
      return action.state;

    case "advance": {
      const next = nextStage(state.stage);
      return next ? { ...state, stage: next } : state;
    }

    case "submitIntentions": {
      // UI gates this to be non-empty; defensive guard anyway.
      if (action.ids.length === 0) return state;
      const species = pickSpeciesFromIntentions(action.ids);
      return {
        ...state,
        intentions: action.ids,
        speciesId: species.id,
        stage: "hatching",
      };
    }

    case "reset":
      return INITIAL_FLOW;
  }
}

/** Map a stage to which sidebar item should appear "active." */
function stageToActiveSidebar(stage: Stage): string {
  switch (stage) {
    case "coaching1":
      return "mary";
    case "coaching2":
      return "marketing-launch";
    default:
      return "pando";
  }
}

export default function Home() {
  // Avoid SSR/CSR hydration mismatch: render with INITIAL_FLOW first,
  // then dispatch a hydrate action after mount.
  const [state, dispatch] = useReducer(reducer, INITIAL_FLOW);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const persisted = loadFlow();
    if (persisted) dispatch({ type: "hydrate", state: persisted });
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveFlow(state);
  }, [state, hydrated]);

  const pet = state.speciesId ? PETS_BY_ID[state.speciesId] : null;
  const activeId = stageToActiveSidebar(state.stage);

  const sidebarItems: Parameters<typeof Sidebar>[0]["items"] = [
    { id: "general", label: "general", kind: "channel" },
    { id: "marketing-launch", label: "marketing-launch", kind: "channel" },
    { id: "design", label: "design", kind: "channel" },
    {
      id: "pando",
      label: "Pando",
      kind: "dm",
      avatar: { letter: "P", color: "#FFB347" },
      isPando: true,
    },
    {
      id: "mary",
      label: "Mary Chen",
      kind: "dm",
      avatar: { letter: "M", color: "#7c3aed" },
    },
    {
      id: "devon",
      label: "Devon Park",
      kind: "dm",
      avatar: { letter: "D", color: "#0ea5e9" },
    },
  ];

  function handleReset() {
    clearFlow();
    dispatch({ type: "reset" });
  }

  let main: React.ReactNode;
  switch (state.stage) {
    case "intro":
      main = <IntroScene onBegin={() => dispatch({ type: "advance" })} />;
      break;
    case "analysis":
      main = <AnalysisScene onDone={() => dispatch({ type: "advance" })} />;
      break;
    case "intentions":
      main = (
        <IntentionsScene
          onSubmit={(ids) => dispatch({ type: "submitIntentions", ids })}
        />
      );
      break;
    case "hatching":
      main = pet ? (
        <HatchScene pet={pet} onDone={() => dispatch({ type: "advance" })} />
      ) : null;
      break;
    case "coaching1":
      main = pet ? (
        <CoachingScene
          moment={COACHING_MOMENTS[0]}
          pet={pet}
          onSend={() => dispatch({ type: "advance" })}
        />
      ) : null;
      break;
    case "coaching2":
      main = pet ? (
        <CoachingScene
          moment={COACHING_MOMENTS[1]}
          pet={pet}
          onSend={() => dispatch({ type: "advance" })}
        />
      ) : null;
      break;
    case "reflection":
      main = pet ? (
        <ReflectionScene pet={pet} onDone={() => dispatch({ type: "advance" })} />
      ) : null;
      break;
    case "end":
      main = pet ? <EndScene pet={pet} onReset={handleReset} /> : null;
      break;
  }

  return (
    <SlackFrame
      sidebar={
        <Sidebar
          items={sidebarItems}
          activeId={activeId}
          onReset={handleReset}
        />
      }
    >
      {main}
    </SlackFrame>
  );
}
