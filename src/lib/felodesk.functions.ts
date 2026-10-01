import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const emailInput = z.object({
  brief: z.string().min(1).max(4000),
  recipient: z.string().max(200).optional(),
  tone: z.enum(["Formal", "Friendly", "Persuasive"]),
});

const notesInput = z.object({
  notes: z.string().min(1).max(12000),
});

const plannerInput = z.object({
  tasks: z.string().min(1).max(8000),
  horizon: z.enum(["Daily", "Weekly"]),
});

export const generateEmail = createServerFn({ method: "POST" })
  .validator((data: unknown) => emailInput.parse(data))
  .handler(async ({ data }) => {
    const { generateText } = await import("./ai/gateway.server.ts");
    const text = await generateText(
      "You write workplace emails. Return only the email: a 'Subject:' line, then the body, then a sign-off. No commentary, no markdown fences. Keep it clear, concise and well structured.",
      [
        data.recipient ? `Recipient: ${data.recipient}` : null,
        `Tone: ${data.tone}`,
        `What I want to communicate: ${data.brief}`,
      ]
        .filter(Boolean)
        .join("\n"),
    );
    return { email: text };
  });

export const summarizeNotes = createServerFn({ method: "POST" })
  .validator((data: unknown) => notesInput.parse(data))
  .handler(async ({ data }) => {
    const { generateText, parseJsonReply } = await import("./ai/gateway.server.ts");
    const text = await generateText(
      [
        'Summarize meeting notes. Reply with JSON only, shaped {"summary": string, "actionItems": string[], "decisions": string[], "deadlines": string[]}.',
        "Keep the summary to a short plain-language paragraph. Use empty arrays when nothing applies. Do not invent facts.",
        "Strict separation rules:",
        "- Treat every statement in the notes as its own item. Never merge information from different sentences or statements into one item.",
        "- Each action item is written as 'Owner: task + its own deadline', e.g. 'Lerato: Confirm customer requirements by Wednesday.' Only include a deadline if it was stated in the same statement as that task. If no owner is stated, use a short subject label instead of guessing a person.",
        "- Never attach a deadline, timeframe or requirement from one statement to a different person's task.",
        "- General rules or service standards (e.g. 'Customer emails should be answered within 24 hours') are their own item labelled by subject, e.g. 'Customer emails: Respond within 24 hours.' Never attach them to someone's task.",
        "- Keep dates and timeframes exactly as worded in the notes (e.g. 'by Wednesday', 'within 24 hours', 'next Monday'). Do not convert, calculate or reword them.",
        "- Meeting dates are not task deadlines. List future meetings separately, prefixed 'Next meeting:', e.g. 'Next meeting: Monday to check progress.' Put them in deadlines as their own line, never combined with a task.",
        "- deadlines lists each dated item once, in the form 'Subject: timing as stated', one per statement.",
        "- decisions only contains things the group actually agreed or decided; do not repeat tasks there.",
      ].join("\n"),
      data.notes,
    );

    const parsed = parseJsonReply<{
      summary?: string;
      actionItems?: string[];
      decisions?: string[];
      deadlines?: string[];
    }>(text);

    const list = (value: unknown) =>
      Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

    return {
      summary: typeof parsed?.summary === "string" ? parsed.summary : text,
      actionItems: list(parsed?.actionItems),
      decisions: list(parsed?.decisions),
      deadlines: list(parsed?.deadlines),
    };
  });

export const planTasks = createServerFn({ method: "POST" })
  .validator((data: unknown) => plannerInput.parse(data))
  .handler(async ({ data }) => {
    const { generateText, parseJsonReply } = await import("./ai/gateway.server.ts");
    const text = await generateText(
      'Organize a work task list. Reply with JSON only, shaped {"priorities": [{"task": string, "priority": "P1"|"P2"|"P3", "why": string}], "schedule": [{"slot": string, "items": string[]}]}. Rank by urgency and impact. For a Daily horizon use time blocks as slots (e.g. "09:00 - 10:30"); for a Weekly horizon use weekdays as slots. Keep "why" to one short sentence.',
      `Horizon: ${data.horizon}\nTasks:\n${data.tasks}`,
    );

    const parsed = parseJsonReply<{
      priorities?: { task?: string; priority?: string; why?: string }[];
      schedule?: { slot?: string; items?: string[] }[];
    }>(text);

    const priorities = (parsed?.priorities ?? [])
      .filter((item) => typeof item?.task === "string")
      .map((item) => ({
        task: String(item.task),
        priority: item.priority === "P1" || item.priority === "P2" || item.priority === "P3" ? item.priority : "P3",
        why: typeof item.why === "string" ? item.why : "",
      }));

    const schedule = (parsed?.schedule ?? [])
      .filter((block) => typeof block?.slot === "string")
      .map((block) => ({
        slot: String(block.slot),
        items: Array.isArray(block.items)
          ? block.items.filter((item): item is string => typeof item === "string")
          : [],
      }));

    return { priorities, schedule, raw: priorities.length || schedule.length ? "" : text };
  });
