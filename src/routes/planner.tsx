import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import {
  Chips,
  ErrorNote,
  FieldLabel,
  GhostButton,
  OutputFrame,
  Panel,
  PrimaryButton,
  TextArea,
} from "@/components/ui-kit";
import { planTasks } from "@/lib/felodesk.functions";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — FeloDesk AI" },
      {
        name: "description",
        content:
          "Enter your tasks, see them ranked by priority, and get an editable daily or weekly schedule.",
      },
      { property: "og:title", content: "AI Task Planner — FeloDesk AI" },
      {
        property: "og:description",
        content: "Turn a messy task list into a prioritised, editable plan for your day or week.",
      },
    ],
  }),
  component: PlannerPage,
});

const HORIZONS = ["Daily", "Weekly"] as const;

type Priority = { task: string; priority: string; why: string };

function PlannerPage() {
  const run = useServerFn(planTasks);
  const [tasks, setTasks] = useState("");
  const [horizon, setHorizon] = useState<(typeof HORIZONS)[number]>("Weekly");
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [schedule, setSchedule] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hasOutput = priorities.length > 0 || Boolean(schedule);

  async function plan() {
    if (!tasks.trim()) {
      setError("Add at least one task first.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await run({ data: { tasks, horizon } });
      setPriorities(result.priorities);
      setSchedule(
        result.schedule.length
          ? result.schedule.map((block) => `${block.slot}\n${block.items.map((i) => `- ${i}`).join("\n")}`).join("\n\n")
          : result.raw,
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function updatePriority(index: number, value: string) {
    setPriorities((current) =>
      current.map((item, i) => (i === index ? { ...item, task: value } : item)),
    );
  }

  async function copyPlan() {
    const text = [
      "Priorities",
      ...priorities.map((item) => `${item.priority} — ${item.task}${item.why ? ` (${item.why})` : ""}`),
      "",
      `${horizon} schedule`,
      schedule,
    ].join("\n");
    await navigator.clipboard.writeText(text);
    toast.success("Plan copied to your clipboard");
  }

  return (
    <AppShell eyebrow="Tool 03" title="AI Task Planner">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel title="Your tasks" badge="Input">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <FieldLabel>One task per line</FieldLabel>
              <TextArea
                value={tasks}
                onChange={setTasks}
                rows={14}
                placeholder={"Ship beta build\nReview onboarding doc\nSync with design\nPrepare board update"}
              />
            </div>
            <div className="space-y-1.5">
              <FieldLabel>Schedule</FieldLabel>
              <Chips options={HORIZONS} value={horizon} onChange={setHorizon} />
            </div>
            {error && <ErrorNote message={error} />}
            <PrimaryButton onClick={plan} disabled={loading}>
              {loading
                ? "Organising your tasks…"
                : hasOutput
                  ? `Plan ${horizon.toLowerCase()} again`
                  : `Plan my ${horizon === "Daily" ? "day" : "week"}`}
            </PrimaryButton>
          </div>
        </Panel>

        <Panel title="Your plan" badge="Editable output" badgeTone="accent">
          <div className="space-y-3">
            <OutputFrame label="Priorities · editable">
              {priorities.length === 0 ? (
                <p className="p-1 text-sm text-muted-foreground">
                  Your ranked priorities will appear here.
                </p>
              ) : (
                <div className="space-y-2">
                  {priorities.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 rounded-xl border border-border bg-secondary p-2.5"
                    >
                      <span
                        className={`size-2 shrink-0 rounded-full ${
                          item.priority === "P1"
                            ? "bg-accent2"
                            : item.priority === "P2"
                              ? "bg-brand"
                              : "bg-muted-foreground/50"
                        }`}
                      />
                      <input
                        value={item.task}
                        onChange={(event) => updatePriority(index, event.target.value)}
                        className="min-w-0 flex-1 bg-transparent text-sm text-foreground/90 focus:outline-none"
                      />
                      <span className="text-[10px] text-muted-foreground">{item.priority}</span>
                    </div>
                  ))}
                </div>
              )}
            </OutputFrame>

            <OutputFrame label={`${horizon} schedule · editable`} tone="accent">
              <TextArea
                value={schedule}
                onChange={setSchedule}
                rows={10}
                placeholder="Your suggested schedule will appear here, ready to adjust."
              />
            </OutputFrame>

            <GhostButton onClick={copyPlan} disabled={!hasOutput}>
              Copy plan
            </GhostButton>
            <p className="text-xs leading-relaxed text-muted-foreground">
              The suggested order is a starting point — adjust it against your own commitments.
            </p>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
