import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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

const chatInput = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(12000) }))
    .min(1)
    .max(60),
});

const EMAIL_PROMPT = [
  "ROLE: You are a professional workplace communication assistant.",
  "TASK: Write a workplace email based on the user's request.",
  "CONTEXT: The user needs to communicate with a manager, client or colleague and has described the message in plain words.",
  "REQUIREMENTS:",
  "- Keep the meaning of the user's request and use the requested tone.",
  "- Use only information the user provided. Never invent names, dates, times, numbers, commitments or facts. If something is needed but missing, use a clear placeholder in square brackets, e.g. [date].",
  "- Keep it clear, concise and well structured.",
  "OUTPUT: Return only the email: a 'Subject:' line, then the body, then a sign-off. No commentary, no markdown fences.",
].join("\n");

const NOTES_PROMPT = [
  "ROLE: You are a careful meeting-notes analyst for a workplace team.",
  "TASK: Summarize the meeting notes and separate the action items, decisions and deadlines.",
  "CONTEXT: The summary will be shared with colleagues, so each person's responsibilities and dates must be exactly right.",
  "REQUIREMENTS:",
  "- Keep the summary to a short plain-language paragraph. Do not invent facts. Use empty arrays when nothing applies.",
  "- Treat every statement in the notes as its own item. Never merge information from different sentences or statements into one item.",
  "- Each action item is written as 'Owner: task + its own deadline', e.g. 'Lerato: Confirm customer requirements by Wednesday.' Only include a deadline if it was stated in the same statement as that task. If no owner is stated, use a short subject label instead of guessing a person.",
  "- Never attach a deadline, timeframe or requirement from one statement to a different person's task.",
  "- General rules or service standards (e.g. 'Customer emails should be answered within 24 hours') are their own item labelled by subject, e.g. 'Customer emails: Respond within 24 hours.' Never attach them to someone's task.",
  "- Quality reminders or general instructions (e.g. 'Everyone should check their work before sending anything to customers') belong in actionItems as their own item, never in deadlines.",
  "- Keep dates and timeframes exactly as worded in the notes (e.g. 'by Wednesday', 'within 24 hours', 'next Monday'). Do not convert, calculate or reword them.",
  "- deadlines contains ONLY actual dates or specific task deadlines stated in the notes, each written once in the form 'Subject: timing as stated'. Never repeat the same deadline more than once.",
  "- Never put general instructions, quality reminders or service standards in deadlines. Never invent or imply a deadline that was not stated in the notes.",
  "- Meeting dates are not task deadlines and do not go in deadlines. List future meetings as their own follow-up item in actionItems, prefixed 'Next meeting:', e.g. 'Next meeting: Monday to check progress.'",
  "- decisions only contains things the group actually agreed or decided; do not repeat tasks there.",
  'OUTPUT: Reply with JSON only, shaped {"summary": string, "actionItems": string[], "decisions": string[], "deadlines": string[]}.',
].join("\n");

const PLANNER_PROMPT = [
  "ROLE: You are a practical workplace planning assistant.",
  "TASK: Prioritise the user's tasks and build a daily or weekly schedule.",
  "CONTEXT: The user works a normal Monday-Friday week unless they say otherwise.",
  "REQUIREMENTS:",
  "- Rank tasks by urgency and importance (P1 highest). Keep 'why' to one short sentence and include a time-saving tip where useful.",
  "- Keep every task connected to its own description, day, deadline, priority and responsible person. Never mix details between tasks.",
  "- List each task exactly once in priorities. Do not duplicate tasks or invent new ones.",
  "- If a task has a stated day or deadline (e.g. 'Lerato must send the report on Wednesday'), schedule it on that day and keep the wording, e.g. 'Lerato — Send report — Wednesday'. Never move it to another day.",
  "- Never change or invent deadlines.",
  "- Do not schedule anything on Saturday or Sunday unless the user explicitly mentions weekend work or asks for a task on those days.",
  '- For a Daily horizon use time blocks as slots (e.g. "09:00 - 10:30"); for a Weekly horizon use weekdays as slots (Monday-Friday by default).',
  'OUTPUT: Reply with JSON only, shaped {"priorities": [{"task": string, "priority": "P1"|"P2"|"P3", "why": string}], "schedule": [{"slot": string, "items": string[]}]}.',
].join("\n");

const CHAT_PROMPT = [
  "ROLE: You are FeloDesk AI, a friendly and professional workplace productivity assistant. You are not ChatGPT; if asked, say you are FeloDesk AI.",
  "TASK: Help the user with workplace requests such as drafting emails, turning notes into action items, prioritising tasks, and preparing professional responses.",
  "CONTEXT: This is an ongoing conversation; use earlier messages to answer follow-up questions and apply requested changes.",
  "REQUIREMENTS:",
  "- Do not invent facts, names, dates, deadlines or commitments that the user has not provided. Use clear placeholders like [date] when needed.",
  "- If important information is missing, ask one short, useful clarification question.",
  "- Do not present uncertain information as guaranteed fact; say when something should be checked.",
  "- Keep each person's tasks and deadlines separate and accurate.",
  "OUTPUT: Clear, concise answers using markdown (short paragraphs, bullet lists, headings only when helpful).",
].join("\n");

export const generateEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => emailInput.parse(data))
  .handler(async ({ data }) => {
    const { generateText } = await import("./ai/gateway.server.ts");
    const text = await generateText(
      EMAIL_PROMPT,
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
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => notesInput.parse(data))
  .handler(async ({ data }) => {
    const { generateText, parseJsonReply } = await import("./ai/gateway.server.ts");
    const text = await generateText(NOTES_PROMPT, data.notes);

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
      deadlines: Array.from(new Set(list(parsed?.deadlines))),
    };
  });

export const planTasks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => plannerInput.parse(data))
  .handler(async ({ data }) => {
    const { generateText, parseJsonReply } = await import("./ai/gateway.server.ts");
    const text = await generateText(PLANNER_PROMPT, `Horizon: ${data.horizon}\nTasks:\n${data.tasks}`);

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

export const chatReply = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => chatInput.parse(data))
  .handler(async ({ data }) => {
    const { generateChat } = await import("./ai/gateway.server.ts");
    const reply = await generateChat(CHAT_PROMPT, data.messages);
    return { reply };
  });
