"use client";

import { useState } from "react";
import { SlackFrame } from "@/components/SlackFrame";
import { Sidebar } from "@/components/Sidebar";
import { HatchScene } from "@/components/HatchScene";
import { PixelPet } from "@/components/PixelPet";
import { PETS } from "@/content/pets";
import type { PetSpecies } from "@/types";

type Step = "leader" | "hatching" | "channel";

type ProjectConfig = {
  name: string;
  goal: string;
  context: string;
  deadline: string;
  members: { name: string; role: string }[];
};

const DEFAULT_PROJECT: ProjectConfig = {
  name: "Q3 Launch — Pomegranate",
  goal: "Ship a confident, well-coordinated launch with no last-minute scrambles.",
  context:
    "Cross-functional team across product, design, engineering, marketing. First launch under the new GTM playbook.",
  deadline: "September 12, 2026",
  members: [
    { name: "Mary Chen", role: "PM" },
    { name: "Devon Park", role: "Engineer" },
    { name: "Lex Ito", role: "Marketing" },
    { name: "You", role: "Designer" },
  ],
};

const SIDEBAR_ITEMS: Parameters<typeof Sidebar>[0]["items"] = [
  { id: "general", label: "general", kind: "channel" },
  { id: "proj-pomegranate", label: "proj-pomegranate", kind: "channel", unread: true },
  { id: "design", label: "design", kind: "channel" },
  { id: "synko", label: "Synko", kind: "dm", avatar: { letter: "S", color: "#FFB347" }, isPet: true, presence: "active" },
  { id: "mary", label: "Mary Chen", kind: "dm", avatar: { letter: "M", color: "#7c3aed" }, presence: "active" },
];

/** Deterministic species pick from project text — keeps the demo stable. */
function pickSpeciesFromProject(p: ProjectConfig): PetSpecies {
  const seed = `${p.name}|${p.goal}|${p.context}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return PETS[Math.abs(hash) % PETS.length];
}

export default function InitPage() {
  const [step, setStep] = useState<Step>("leader");
  const [project, setProject] = useState<ProjectConfig>(DEFAULT_PROJECT);
  const [pet, setPet] = useState<PetSpecies | null>(null);

  function finishLeader() {
    setPet(pickSpeciesFromProject(project));
    setStep("hatching");
  }

  return (
    <SlackFrame
      sidebar={
        <Sidebar
          workspaceName="Synko Test Co."
          items={SIDEBAR_ITEMS}
          activeId="proj-pomegranate"
        />
      }
    >
      {step === "leader" && (
        <LeaderStep project={project} onChange={setProject} onSubmit={finishLeader} />
      )}
      {step === "hatching" && pet && (
        <HatchScene pet={pet} onDone={() => setStep("channel")} />
      )}
      {step === "channel" && pet && (
        <ChannelArrivalStep pet={pet} project={project} />
      )}
    </SlackFrame>
  );
}

/* ─────────────────────────── Step 1: Leader sets up project ─────────────────────────── */

function LeaderStep({
  project,
  onChange,
  onSubmit,
}: {
  project: ProjectConfig;
  onChange: (p: ProjectConfig) => void;
  onSubmit: () => void;
}) {
  const [memberDraft, setMemberDraft] = useState({ name: "", role: "" });

  function addMember() {
    if (!memberDraft.name.trim()) return;
    onChange({
      ...project,
      members: [...project.members, { ...memberDraft }],
    });
    setMemberDraft({ name: "", role: "" });
  }

  function removeMember(i: number) {
    onChange({
      ...project,
      members: project.members.filter((_, idx) => idx !== i),
    });
  }

  return (
    <section className="flex-1 flex flex-col bg-white min-w-0 min-h-0">
      <header className="border-b border-stone-200 px-5 py-2.5 flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-stone-500 text-base">#</span>
            <h2 className="font-bold text-stone-900 text-[15px]">proj-pomegranate</h2>
          </div>
          <p className="text-xs text-stone-500">
            Hatch a Synko pet for this project · leader setup
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto py-8 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <div className="text-[11px] uppercase tracking-wider text-stone-500 font-bold">
              Step 1 of 2
            </div>
            <h1 className="text-2xl font-bold text-stone-900 mt-1">
              Set up your project
            </h1>
            <p className="text-stone-600 mt-1">
              You're the project leader. Tell Synko what your team is here to do —
              this is what shapes the pet that hatches.
            </p>
          </div>

          <div className="space-y-5">
            <Field label="Project name">
              <input
                value={project.name}
                onChange={(e) => onChange({ ...project, name: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-md text-stone-900 outline-none focus:border-stone-500"
              />
            </Field>
            <Field label="Project goal" hint="One sentence. What does done look like?">
              <textarea
                value={project.goal}
                onChange={(e) => onChange({ ...project, goal: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-stone-300 rounded-md text-stone-900 outline-none focus:border-stone-500 resize-none"
              />
            </Field>
            <Field label="Context the pet should know" hint="Anything that would help a thoughtful new teammate. Constraints, history, personalities.">
              <textarea
                value={project.context}
                onChange={(e) => onChange({ ...project, context: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-stone-300 rounded-md text-stone-900 outline-none focus:border-stone-500 resize-none"
              />
            </Field>
            <Field label="Deadline">
              <input
                value={project.deadline}
                onChange={(e) => onChange({ ...project, deadline: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-md text-stone-900 outline-none focus:border-stone-500"
              />
            </Field>

            <div>
              <div className="text-sm font-semibold text-stone-700 mb-2">
                Team members
              </div>
              <ul className="space-y-1.5 mb-3">
                {project.members.map((m, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-2 px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-sm"
                  >
                    <div>
                      <span className="font-medium text-stone-800">{m.name}</span>
                      <span className="text-stone-500 ml-2">· {m.role}</span>
                    </div>
                    <button
                      onClick={() => removeMember(i)}
                      className="text-stone-400 hover:text-stone-700 text-xs"
                    >
                      remove
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <input
                  value={memberDraft.name}
                  onChange={(e) => setMemberDraft({ ...memberDraft, name: e.target.value })}
                  placeholder="Name"
                  className="flex-1 px-3 py-2 border border-stone-300 rounded-md text-sm outline-none focus:border-stone-500"
                />
                <input
                  value={memberDraft.role}
                  onChange={(e) => setMemberDraft({ ...memberDraft, role: e.target.value })}
                  placeholder="Role"
                  className="w-32 px-3 py-2 border border-stone-300 rounded-md text-sm outline-none focus:border-stone-500"
                />
                <button
                  onClick={addMember}
                  className="px-4 py-2 rounded-md border border-stone-300 text-sm hover:bg-stone-50"
                >
                  Add
                </button>
              </div>
            </div>

            <button
              onClick={onSubmit}
              disabled={!project.name.trim() || project.members.length === 0}
              className="px-5 py-2.5 rounded-md bg-stone-900 text-white text-sm font-medium hover:bg-stone-700 disabled:bg-stone-300 disabled:cursor-not-allowed transition-colors"
            >
              Hatch the pet →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Step 2: Pet arrives in channel ─────────────────────────── */

function ChannelArrivalStep({
  pet,
  project,
}: {
  pet: PetSpecies;
  project: ProjectConfig;
}) {
  return (
    <section className="flex-1 flex flex-col bg-white min-w-0 min-h-0">
      <header className="border-b border-stone-200 px-5 py-2.5 flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-stone-500 text-base">#</span>
            <h2 className="font-bold text-stone-900 text-[15px]">proj-pomegranate</h2>
          </div>
          <p className="text-xs text-stone-500">{project.goal}</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto py-4">
        <div className="slack-msg">
          <div className="slack-msg-time-rail">10:01</div>
          <div className="slack-msg-avatar bg-purple-600 text-white text-sm font-bold flex items-center justify-center">
            M
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-stone-900">Mary Chen</span>
            <span className="text-xs text-stone-500">10:01 AM</span>
          </div>
          <div className="text-stone-800">
            kicking off proj-pomegranate today. let's gooo 🍅
          </div>
        </div>

        <div className="slack-msg">
          <div className="slack-msg-time-rail">10:02</div>
          <div
            className="slack-msg-avatar synko-warm flex items-center justify-center"
          >
            <PixelPet pet={pet} size={32} animated={false} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-stone-900">Synko</span>
            <span className="inline-block px-1.5 py-0 text-[10px] rounded bg-stone-200 text-stone-600 font-medium">
              APP
            </span>
            <span className="text-xs text-stone-500">10:02 AM</span>
          </div>
          <div className="text-stone-800 leading-relaxed mt-1">
            <div className="synko-warm rounded-xl px-4 py-3 inline-block max-w-prose">
              <div className="font-bold mb-1">Hi team — I'm {pet.name}.</div>
              <p className="mb-2">{pet.intro}</p>
              <p className="text-sm text-stone-700 mb-2">
                <b>What I'll be paying attention to:</b> {pet.coachingFocus}
              </p>
              <p className="text-xs text-stone-500 mt-3 italic">
                I'll be quiet most of the time. When you see a glow on me, click —
                I noticed something you might want to look at.
              </p>
            </div>
          </div>
        </div>

        <div className="slack-msg">
          <div className="slack-msg-time-rail">10:03</div>
          <div className="slack-msg-avatar bg-sky-500 text-white text-sm font-bold flex items-center justify-center">
            D
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-stone-900">Devon Park</span>
            <span className="text-xs text-stone-500">10:03 AM</span>
          </div>
          <div className="text-stone-800">welcome 🐾</div>
        </div>
      </div>

      <div className="border-t border-stone-200 px-5 py-3 text-xs text-stone-500 italic flex items-center justify-between">
        <span>End of project initiation flow.</span>
        <a href="/scaffold" className="text-stone-600 underline hover:text-stone-900">
          See how Synko's coaching fades over time →
        </a>
      </div>
    </section>
  );
}

/* ─────────────────────────── Shared: form field ─────────────────────────── */

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-stone-700 mb-1">{label}</label>
      {hint && <div className="text-xs text-stone-500 mb-1.5">{hint}</div>}
      {children}
    </div>
  );
}
