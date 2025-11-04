import OpenAI from "openai";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

function buildClient() {
  const provider = (process.env.LLM_PROVIDER || "openai").toLowerCase();
  if (provider === "deepseek") {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    const baseURL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1";
    if (!apiKey) {
      throw new Error("DEEPSEEK_API_KEY is required when LLM_PROVIDER=deepseek");
    }
    return new OpenAI({ apiKey, baseURL });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required when LLM_PROVIDER=openai");
  }
  return new OpenAI({ apiKey });
}

const client = buildClient();

export async function generateChatCompletion({ messages, model }) {
  const provider = (process.env.LLM_PROVIDER || "openai").toLowerCase();
  const defaultModel = provider === "deepseek" ? (process.env.LLM_MODEL || "deepseek-chat") : (process.env.LLM_MODEL || "gpt-4o-mini");
  const usedModel = model || defaultModel;

  const response = await client.chat.completions.create({
    model: usedModel,
    messages,
  });

  return response.choices?.[0]?.message?.content || "";
}


