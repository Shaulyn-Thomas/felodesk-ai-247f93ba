import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

export const PROFILE = { name: "Shaulyn Thomas", initials: "S" };

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, ready };
}

export type ActivityKind = "email" | "meeting" | "tasks";

/** Records one completed AI action for the signed-in user (drives dashboard counts). */
export async function recordActivity(kind: ActivityKind) {
  const { data } = await supabase.auth.getSession();
  const userId = data.session?.user.id;
  if (!userId) return;
  const { error } = await supabase.from("activity_events").insert({ kind, user_id: userId });
  if (error) console.error("[felodesk] could not record activity", error);
}

export async function fetchActivityCounts() {
  const count = async (kind: ActivityKind) => {
    const { count: n } = await supabase
      .from("activity_events")
      .select("id", { count: "exact", head: true })
      .eq("kind", kind);
    return n ?? 0;
  };
  const [email, meeting, tasks] = await Promise.all([count("email"), count("meeting"), count("tasks")]);
  return { email, meeting, tasks };
}

export function useTheme() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  useEffect(() => {
    setTheme(document.documentElement.classList.contains("light") ? "light" : "dark");
  }, []);
  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("light", next === "light");
    try {
      localStorage.setItem("felodesk-theme", next);
    } catch {
      /* ignore */
    }
    setTheme(next);
  }
  return { theme, toggle };
}
