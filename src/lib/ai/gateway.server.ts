import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

import { createLovableAiGatewayRunIdFetch } from "./run-id.ts";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";
const MODEL = "openai/gpt-6-astra";

/**
 * Runs one streamed Responses call through the Lovable AI Gateway and
 * returns the final text. Server-only: reads LOVABLE_API_KEY at call time.
 */
export async function generateText(instructions: string, prompt: string): Promise<string> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) {
    throw new Error("AI is not configured for this project yet.");
  }

  const runIdFetch = createLovableAiGatewayRunIdFetch();
  const provider = createOpenAI({
    baseURL: `${GATEWAY_URL.replace(/\/+$/, "").replace(/\/v1$/, "")}/v1`,
    apiKey,
    headers: {
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
    fetch: runIdFetch.fetch,
  });

  const result = streamText({
    model: provider.responses(MODEL),
    prompt,
    providerOptions: {
      openai: {
        instructions,
        store: false,
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  let text = "";
  for await (const part of result.fullStream) {
    if (part.type === "text-delta") text += part.text;
    if (part.type === "error") {
      console.error("[felodesk] AI stream error", part.error);
      const message = part.error instanceof Error ? part.error.message : String(part.error);
      throw new Error(`The assistant could not complete this request: ${message}`);
    }
  }

  if (!text.trim()) {
    throw new Error("The assistant returned an empty response. Please try again.");
  }
  return text.trim();
}

/** Extracts a JSON object from a model reply that may be fenced or padded. */
export function parseJsonReply<T>(text: string): T | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced?.[1] ?? text).trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}
