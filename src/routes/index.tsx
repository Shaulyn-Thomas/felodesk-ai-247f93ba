import { createFileRoute, Link } from "@tanstack/react-router";

import { AppShell } from "@/components/AppShell";
import { Panel } from "@/components/ui-kit";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FeloDesk AI — Workplace productivity assistant" },
      {
        name: "description",
        content:
          "One dashboard for AI-drafted emails, meeting note summaries and prioritised task plans.",
      },
      { property: "og:title", content: "FeloDesk AI — Workplace productivity assistant" },
      {
        property: "og:description",
        content:
          "One dashboard for AI-drafted emails, meeting note summaries and prioritised task plans.",
      },
    ],
  }),
  component: Dashboard,
});

const STATS = [
  { label: "Emails drafted", value: "18" },
  { label: "Meetings summarized", value: "6" },
  { label: "Tasks organised", value: "24" },
];

const TOOLS = [
  {
    to: "/email",
    title: "Email Generator",
    badge: "Tool 01",
    tone: "brand" as const,
    blurb: "Say what you need to communicate and get a clear, professional email.",
    detail: "Choose Formal, Friendly or Persuasive — then edit and copy the draft.",
  },
  {
    to: "/notes",
    title: "Meeting Notes",
    badge: "Tool 02",
    tone: "accent" as const,
    blurb: "Paste raw meeting notes and get a simple summary you can share.",
    detail: "Action items, decisions and deadlines are pulled out separately.",
  },
  {
    to: "/planner",
    title: "Task Planner",
    badge: "Tool 03",
    tone: "brand" as const,
    blurb: "Drop in your task list and see what deserves attention first.",
    detail: "Builds an editable daily or weekly schedule around your priorities.",
  },
];

function Dashboard() {
  return (
    <AppShell
      eyebrow="Good morning, Priya"
      title={
        <>
          Your day, <span className="text-brand">orchestrated</span>.
        </>
      }
    >
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {STATS.map((stat) => (
          <div key={stat.label} className="glass rounded-2xl p-4">
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="mt-1 font-display text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {TOOLS.map((tool) => (
          <Panel key={tool.to} title={tool.title} badge={tool.badge} badgeTone={tool.tone}>
            <p className="text-sm leading-relaxed text-foreground/80">{tool.blurb}</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{tool.detail}</p>
            <Link
              to={tool.to}
              className="gradient-brand mt-4 block rounded-xl py-2.5 text-center font-display text-sm font-semibold text-primary-foreground"
            >
              Open tool
            </Link>
          </Panel>
        ))}
      </div>
    </AppShell>
  );
}
