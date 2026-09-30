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
  TextInput,
} from "@/components/ui-kit";
import { generateEmail } from "@/lib/felodesk.functions";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "AI Email Generator — FeloDesk AI" },
      {
        name: "description",
        content:
          "Describe what you need to say and get a clear workplace email in a formal, friendly or persuasive tone.",
      },
      { property: "og:title", content: "AI Email Generator — FeloDesk AI" },
      {
        property: "og:description",
        content: "Draft, edit and copy professional emails in seconds with FeloDesk AI.",
      },
    ],
  }),
  component: EmailPage,
});

const TONES = ["Formal", "Friendly", "Persuasive"] as const;

function EmailPage() {
  const run = useServerFn(generateEmail);
  const [recipient, setRecipient] = useState("");
  const [brief, setBrief] = useState("");
  const [tone, setTone] = useState<(typeof TONES)[number]>("Formal");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    if (!brief.trim()) {
      setError("Tell FeloDesk what you want to communicate first.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await run({ data: { brief, recipient: recipient || undefined, tone } });
      setDraft(result.email);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(draft);
    toast.success("Email copied to your clipboard");
  }

  return (
    <AppShell eyebrow="Tool 01" title="AI Email Generator">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel title="What do you want to say?" badge="Input">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <FieldLabel>Recipient (optional)</FieldLabel>
              <TextInput
                value={recipient}
                onChange={setRecipient}
                placeholder="e.g. Dana, our client at Northwind"
              />
            </div>
            <div className="space-y-1.5">
              <FieldLabel>Your message in plain words</FieldLabel>
              <TextArea
                value={brief}
                onChange={setBrief}
                rows={7}
                placeholder="Follow up about the revised timeline and ask them to confirm the 14th delivery date."
              />
            </div>
            <div className="space-y-1.5">
              <FieldLabel>Tone</FieldLabel>
              <Chips options={TONES} value={tone} onChange={setTone} />
            </div>
            {error && <ErrorNote message={error} />}
            <PrimaryButton onClick={generate} disabled={loading}>
              {loading ? "Writing your email…" : draft ? "Regenerate" : "Generate email"}
            </PrimaryButton>
          </div>
        </Panel>

        <Panel title="Your draft" badge="Editable output" badgeTone="accent">
          <OutputFrame label="AI output · editable">
            <TextArea
              value={draft}
              onChange={setDraft}
              rows={14}
              placeholder="Your generated email will appear here, ready to edit."
            />
          </OutputFrame>
          <div className="mt-3">
            <GhostButton onClick={copy} disabled={!draft.trim()}>
              Copy email
            </GhostButton>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Check names, dates and commitments before you send this email.
          </p>
        </Panel>
      </div>
    </AppShell>
  );
}
