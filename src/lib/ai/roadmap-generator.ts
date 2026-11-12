import "server-only";

import {
  buildRoadmapPrompt,
  parseRoadmapPlan,
  ROADMAP_SYSTEM_PROMPT,
  RoadmapPlanError,
  type AiRoadmapRequest,
  type RoadmapPlan,
} from "./roadmap-plan";

const OPENAI_BASE_URL = "https://api.openai.com/v1";
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai";

/** An error whose message is safe to show directly in the form. */
export class RoadmapGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RoadmapGenerationError";
  }
}

type AiConfig = {
  apiKey: string;
  baseUrl: string;
  model: string;
  jsonMode: boolean;
  maxTokens: number;
};

/**
 * Resolve the provider config. `AI_API_KEY` is the canonical name, but the
 * common provider-specific names are picked up as a convenience.
 */
export function getAiConfig(): AiConfig | null {
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  const apiKey = process.env.AI_API_KEY?.trim() || openaiKey || geminiKey;

  if (!apiKey) return null;

  // If only a Gemini key is present, default to Gemini's OpenAI-compatible
  // endpoint instead of sending the key to OpenAI.
  const useGeminiDefaults = !process.env.AI_BASE_URL && !openaiKey && Boolean(geminiKey);

  const baseUrl = (
    process.env.AI_BASE_URL?.trim() || (useGeminiDefaults ? GEMINI_BASE_URL : OPENAI_BASE_URL)
  ).replace(/\/+$/, "");

  const model =
    process.env.AI_MODEL?.trim() || (useGeminiDefaults ? "gemini-2.5-flash" : "gpt-4o-mini");

  const maxTokens = Number.parseInt(process.env.AI_MAX_TOKENS ?? "", 10);

  return {
    apiKey,
    baseUrl,
    model,
    jsonMode: process.env.AI_JSON_MODE !== "false",
    maxTokens: Number.isFinite(maxTokens) && maxTokens > 0 ? maxTokens : 3000,
  };
}

type ChatCompletionContent = string | Array<{ type?: string; text?: string }> | null;

type ChatCompletionResponse = {
  choices?: Array<{ message?: { content?: ChatCompletionContent } }>;
};

function extractContent(payload: ChatCompletionResponse): string {
  const content = payload.choices?.[0]?.message?.content;

  if (typeof content === "string") return content;

  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part?.text === "string" ? part.text : ""))
      .join("")
      .trim();
  }

  return "";
}

function friendlyStatusMessage(status: number): string {
  if (status === 401 || status === 403) {
    return "The AI provider rejected the API key. Check AI_API_KEY in your .env file.";
  }
  if (status === 404) {
    return "The configured AI model was not found. Check AI_MODEL in your .env file.";
  }
  if (status === 429) {
    return "The AI provider is rate limiting requests. Please try again in a minute.";
  }
  if (status === 400) {
    return "The AI provider rejected the request. Check AI_MODEL and AI_BASE_URL.";
  }
  if (status >= 500) {
    return "The AI provider is having trouble right now. Please try again shortly.";
  }
  return "The AI provider could not generate a roadmap. Please try again.";
}

export async function generateRoadmapWithAI(request: AiRoadmapRequest): Promise<RoadmapPlan> {
  const config = getAiConfig();

  if (!config) {
    throw new RoadmapGenerationError(
      "AI is not configured yet. Add AI_API_KEY to your .env file and restart the server.",
    );
  }

  const endpoint = config.baseUrl.endsWith("/chat/completions")
    ? config.baseUrl
    : `${config.baseUrl}/chat/completions`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        temperature: 0.4,
        max_tokens: config.maxTokens,
        messages: [
          { role: "system", content: ROADMAP_SYSTEM_PROMPT },
          { role: "user", content: buildRoadmapPrompt(request) },
        ],
        ...(config.jsonMode ? { response_format: { type: "json_object" } } : {}),
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      // Log provider details server-side, but never leak them to the browser.
      const detail = await response.text().catch(() => "");
      console.error(`[ai-roadmap] provider returned ${response.status}: ${detail.slice(0, 500)}`);
      throw new RoadmapGenerationError(friendlyStatusMessage(response.status));
    }

    const payload = (await response.json()) as ChatCompletionResponse;
    const content = extractContent(payload);

    if (!content) {
      throw new RoadmapGenerationError("The AI returned an empty response. Please try again.");
    }

    return parseRoadmapPlan(content, { topic: request.topic, goal: request.goal });
  } catch (error) {
    if (error instanceof RoadmapGenerationError) throw error;

    // Parsing problems already carry a learner-friendly message.
    if (error instanceof RoadmapPlanError) {
      throw new RoadmapGenerationError(error.message);
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new RoadmapGenerationError("The AI took too long to respond. Please try again.");
    }

    console.error("[ai-roadmap] request failed", error);
    throw new RoadmapGenerationError(
      "Could not reach the AI provider. Check your connection and try again.",
    );
  } finally {
    clearTimeout(timeout);
  }
}
