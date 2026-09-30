import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";

const NAV = [
  { to: "/", label: "Dashboard" },
  { to: "/email", label: "Email Generator" },
  { to: "/notes", label: "Meeting Notes" },
  { to: "/planner", label: "Task Planner" },
] as const;

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="gradient-brand grid size-9 place-items-center rounded-xl font-display text-lg font-bold text-primary-foreground">
          F
        </div>
        <div>
          <p className="font-display font-bold leading-none tracking-tight">
            FeloDesk <span className="text-brand">AI</span>
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Workplace Assistant
          </p>
        </div>
      </div>

      <nav className="mt-2 space-y-1 px-3">
        {NAV.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            activeOptions={{ exact: item.to === "/" }}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-muted-foreground transition hover:bg-accent hover:text-foreground"
            activeProps={{ className: "bg-accent text-foreground font-medium border border-border" }}
          >
            {({ isActive }) => (
              <>
                <span
                  className={`size-1.5 rounded-full ${isActive ? "bg-brand" : "bg-muted-foreground/50"}`}
                />
                {item.label}
              </>
            )}
          </Link>
        ))}
      </nav>

      <div className="mt-auto p-4">
        <div className="rounded-2xl border border-brand/30 bg-brand/10 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand">
            Responsible AI
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Outputs are AI-generated drafts. Always review, verify facts, and take final
            responsibility before sending or acting.
          </p>
        </div>
      </div>
    </>
  );
}

export function AppShell({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  children: ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background font-body text-foreground">
      <div className="ambient pointer-events-none absolute inset-0" />
      <div className="floaty pointer-events-none absolute -top-24 left-1/3 size-[520px] rounded-full bg-brand/20 blur-3xl" />
      <div className="floaty2 pointer-events-none absolute right-10 top-40 size-[420px] rounded-full bg-accent2/20 blur-3xl" />

      <div className="relative z-10 flex min-h-screen">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-ink2/40 backdrop-blur-xl lg:flex">
          <SidebarContent />
        </aside>

        {menuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
              className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
            />
            <aside className="absolute inset-y-0 left-0 flex w-64 flex-col border-r border-border bg-ink2 shadow-2xl">
              <SidebarContent onNavigate={() => setMenuOpen(false)} />
            </aside>
          </div>
        )}

        <main className="min-w-0 flex-1 px-5 py-6 sm:px-8 sm:py-7">
          <header className="mb-7 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <button
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
                className="mt-1 grid size-9 shrink-0 place-items-center rounded-xl border border-border bg-secondary lg:hidden"
              >
                <span className="space-y-1">
                  <span className="block h-0.5 w-4 rounded bg-foreground" />
                  <span className="block h-0.5 w-4 rounded bg-foreground" />
                  <span className="block h-0.5 w-4 rounded bg-foreground" />
                </span>
              </button>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{eyebrow}</p>
                <h1 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">
                  {title}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-sm text-muted-foreground md:flex">
                <span className="size-2 rounded-full bg-ok" /> AI engine online
              </div>
              <div className="gradient-brand grid size-10 place-items-center rounded-full font-display font-bold text-primary-foreground">
                P
              </div>
            </div>
          </header>

          {children}

          <p className="mt-6 text-center text-[11px] text-muted-foreground">
            FeloDesk AI drafts are suggestions — review everything before it informs an important
            workplace decision or message.
          </p>
        </main>
      </div>
    </div>
  );
}
