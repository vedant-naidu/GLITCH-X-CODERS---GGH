import OpenAI from "openai";
import { env, isConfigured } from "@/lib/env";

export function createOpenAIClient() {
  if (!isConfigured(env.openaiApiKey)) {
    return null;
  }

  return new OpenAI({ apiKey: env.openaiApiKey });
}