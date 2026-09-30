import type { ReactNode } from "react";

export function Panel({
  title,
  badge,
  badgeTone = "brand",
  children,
  className = "",
}: {
  title: string;
  badge?: string;
  badgeTone?: "brand" | "accent";
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`glass sheen rounded-3xl p-5 ${className}`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold">{title}</h2>
        {badge && (
          <span
            className={`text-[10px] uppercase tracking-widest ${
              badgeTone === "brand" ? "text-brand" : "text-accent2"
            }`}
          >
            {badge}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="block text-[11px] uppercase tracking-wider text-muted-foreground">
      {children}
    </label>
  );
}

export function Chips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={
            option === value
              ? "rounded-full bg-brand px-3 py-1 text-xs font-semibold text-primary-foreground"
              : "rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground transition hover:text-foreground"
          }
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export function TextArea({
  value,
  onChange,
  rows = 6,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      rows={rows}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className="w-full resize-y rounded-xl border border-border bg-ink/40 p-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
    />
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-xl border border-border bg-ink/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
    />
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="gradient-brand w-full rounded-xl py-2.5 font-display text-sm font-semibold text-primary-foreground transition disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-xl border border-border py-2.5 font-display text-sm font-semibold text-foreground/80 transition hover:bg-accent disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function OutputFrame({
  label,
  tone = "brand",
  children,
}: {
  label: string;
  tone?: "brand" | "accent";
  children: ReactNode;
}) {
  return (
    <div
      className={`rounded-xl border bg-secondary p-3 ${
        tone === "brand" ? "border-brand/25" : "border-accent2/25"
      }`}
    >
      <p
        className={`mb-1.5 text-[10px] uppercase tracking-widest ${
          tone === "brand" ? "text-brand/80" : "text-accent2/80"
        }`}
      >
        {label}
      </p>
      {children}
    </div>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-foreground/90">
      {message}
    </p>
  );
}
