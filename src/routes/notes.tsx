import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import {
  ErrorNote,
  FieldLabel,
  GhostButton,
  OutputFrame,
  Panel,
  PrimaryButton,
  TextArea,
} from "@/components/ui-kit";
import { summarizeNotes } from "@/lib/felodesk.functions";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — FeloDesk AI" },
      {
        name: "description",
        content:
          "Paste meeting notes and get a plain-language summary plus the action items, decisions and deadlines.",
      },
      { property: "og:title", content: "Meeting Notes Summarizer — FeloDesk AI" },
      {
        property: "og:description",
        content: "Turn messy meeting notes into a shareable summary you can edit.",
      },
    ],
  }),
  component: NotesPage,
});

function NotesPage() {
  const run = useServerFn(summarizeNotes);
  const [notes, setNotes] = useState("");
  const [summary, setSummary] = useState("");
  const [actions, setActions] = useState("");
  const [decisions, setDecisions] = useState("");
  const [deadlines, setDeadlines] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hasOutput = Boolean(summary || actions || decisions || deadlines);

  async function summarize() {
    if (!notes.trim()) {
      setError("Paste your meeting notes first.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await run({ data: { notes } });
      setSummary(result.summary);
      setActions(result.actionItems.join("\n"));
      setDecisions(result.decisions.join("\n"));
      setDeadlines(result.deadlines.join("\n"));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copyAll() {
    const text = [
      "Summary",
      summary,
      "",
      "Action items",
      actions,
      "",
      "Decisions",
      decisions,
      "",
      "Deadlines",
      deadlines,
    ].join("\n");
    await navigator.clipboard.writeText(text);
    toast.success("Summary copied to your clipboard");
  }

  return (
    <AppShell eyebrow="Tool 02" title="Meeting Notes Summarizer">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel title="Your meeting notes" badge="Input" badgeTone="accent">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <FieldLabel>Paste the notes or transcript</FieldLabel>
              <TextArea
                value={notes}
                onChange={setNotes}
                rows={16}
                placeholder="We agreed to launch the beta on the 20th. Priya owns the onboarding doc by Friday. Pricing decision deferred to next week…"
              />
            </div>
            {error && <ErrorNote message={error} />}
            <PrimaryButton onClick={summarize} disabled={loading}>
              {loading ? "Reading your notes…" : hasOutput ? "Summarize again" : "Summarize notes"}
            </PrimaryButton>
          </div>
        </Panel>

        <Panel title="Summary" badge="Editable output">
          <div className="space-y-3">
            <OutputFrame label="Summary" tone="accent">
              <TextArea
                value={summary}
                onChange={setSummary}
                rows={5}
                placeholder="A short plain-language summary will appear here."
              />
            </OutputFrame>
            <OutputFrame label="Action items">
              <TextArea
                value={actions}
                onChange={setActions}
                rows={4}
                placeholder="One action item per line, with the owner where known."
              />
            </OutputFrame>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <OutputFrame label="Decisions">
                <TextArea
                  value={decisions}
                  onChange={setDecisions}
                  rows={3}
                  placeholder="Decisions made"
                />
              </OutputFrame>
              <OutputFrame label="Deadlines">
                <TextArea
                  value={deadlines}
                  onChange={setDeadlines}
                  rows={3}
                  placeholder="Dates and timings"
                />
              </OutputFrame>
            </div>
            <GhostButton onClick={copyAll} disabled={!hasOutput}>
              Copy summary
            </GhostButton>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Confirm owners, decisions and dates with attendees before circulating this summary.
            </p>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
