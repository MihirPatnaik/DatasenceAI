// src/smartsocial/server/agents/modelProxy.ts

import Anthropic from "@anthropic-ai/sdk";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import OpenAI from "openai";
import { auth, db } from "../../utils/firebase";

console.log("🔄 modelProxy.ts loaded");
console.log("🔑 DeepSeek Key available:", !!import.meta.env.VITE_DEEPSEEK_API_KEY);
console.log("🔑 OpenAI Key available:", !!import.meta.env.VITE_OPENAI_KEY_SMARTSOCIAL);
console.log("🔑 Claude Key available:", !!import.meta.env.VITE_CLAUDE_API_KEY);

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_KEY_SMARTSOCIAL,
  dangerouslyAllowBrowser: true,
});

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_CLAUDE_API_KEY,
  dangerouslyAllowBrowser: true,
});

const DEEPSEEK_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;

type ModelName = "gpt" | "claude" | "deepseek";
type UserPlan = "free" | "pro";

interface ModelResult {
  output: string | null;
  modelUsed: string;
  tokensUsed?: number;
}

/* ----------------- 🔹 GPT Caller ----------------- */
async function callGPT(prompt: string, tier: UserPlan): Promise<ModelResult> {
  console.log("🔄 Attempting GPT API call...");
  try {
    const model = tier === "free" ? "gpt-3.5-turbo" : "gpt-4o";
    const resp = await openai.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
    });

    const tokens = resp.usage?.total_tokens ?? 0;
    const output = resp.choices?.[0]?.message?.content?.trim() || null;

    console.log("✅ GPT API success:", { modelUsed: model, tokensUsed: tokens });
    return { output, modelUsed: model, tokensUsed: tokens };
  } catch (err: any) {
    console.error("❌ GPT API error:", err.message);
    return { output: null, modelUsed: "gpt", tokensUsed: 0 };
  }
}

/* ----------------- 🔹 Claude Caller ----------------- */
async function callClaude(prompt: string): Promise<ModelResult> {
  console.log("🔄 Attempting Claude API call...");
  try {
    const resp = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      resp.content?.map((block: any) => block.text).join(" ")?.trim() || null;

    console.log("✅ Claude API success");
    return { output: text, modelUsed: "claude", tokensUsed: 0 };
  } catch (err: any) {
    console.error("❌ Claude API error:", err.message);
    return { output: null, modelUsed: "claude", tokensUsed: 0 };
  }
}

/* ----------------- 🔹 DeepSeek Caller ----------------- */
async function callDeepSeek(prompt: string): Promise<ModelResult> {
  try {
    const resp = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DEEPSEEK_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { 
            role: "system", 
            content: "You are a helpful AI assistant. Always return valid JSON without code blocks or markdown formatting." 
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 512,
        response_format: { type: "json_object" } // ✅ FORCE JSON RESPONSE
      }),
    });

    if (!resp.ok) throw new Error(await resp.text());
    const data = await resp.json();

    let text = data.choices?.[0]?.message?.content?.trim() || null;
    
    // ✅ CLEAN JSON RESPONSE - Remove code blocks if present
    if (text) {
      // Remove ```json and ``` markers
      text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    }
    
    const tokens = data.usage?.total_tokens ?? 0;

    return { output: text, modelUsed: "deepseek", tokensUsed: tokens };
  } catch (err) {
    console.error("❌ DeepSeek API error:", err);
    return { output: null, modelUsed: "deepseek", tokensUsed: 0 };
  }
}

/* ----------------- 🔹 Model Proxy (Main Router) ----------------- */
export async function modelProxy(
  prompt: string,
  tier: UserPlan = "free",
  preferredModel: ModelName = "gpt"
): Promise<ModelResult> {
  console.log("🎯 modelProxy called:", { tier, preferredModel, promptLength: prompt.length });
  
  let result: ModelResult = { output: null, modelUsed: preferredModel, tokensUsed: 0 };

  try {
    if (preferredModel === "gpt") {
      result = await callGPT(prompt, tier);
      if (!result.output) {
        console.warn("⚠️ GPT failed, trying Claude...");
        result = await callClaude(prompt);
      }
      if (!result.output) {
        console.warn("⚠️ Claude failed, trying DeepSeek...");
        result = await callDeepSeek(prompt);
      }
    } 
    else if (preferredModel === "claude") {
      result = await callClaude(prompt);
      if (!result.output) {
        console.warn("⚠️ Claude failed, trying GPT...");
        result = await callGPT(prompt, tier);
      }
      if (!result.output) {
        console.warn("⚠️ GPT failed, trying DeepSeek...");
        result = await callDeepSeek(prompt);
      }
    } 
    else if (preferredModel === "deepseek") {
      // 🚀 REMOVED THE FREE TIER RESTRICTION - Let DeepSeek try for all tiers
      console.log("🎯 Using DeepSeek as preferred model");
      result = await callDeepSeek(prompt);
      if (!result.output) {
        console.warn("⚠️ DeepSeek failed, trying GPT...");
        result = await callGPT(prompt, tier);
      }
      if (!result.output) {
        console.warn("⚠️ GPT failed, trying Claude...");
        result = await callClaude(prompt);
      }
    }

    // Final fallback if everything fails
    if (!result.output) {
      console.error("💥 All AI models failed - returning fallback message");
      result.output = "Unable to generate content at this time. Please try again later.";
    }

    console.log("🏁 Final result:", { 
      modelUsed: result.modelUsed, 
      success: !!result.output,
      outputLength: result.output?.length 
    });

    // ✅ Log in Firestore safely
    const user = auth.currentUser;
    if (user) {
      await addDoc(collection(db, "agent_logs"), {
        userId: user.uid,
        prompt,
        modelUsed: result.modelUsed,
        tokensUsed: result.tokensUsed ?? 0,
        timestamp: serverTimestamp(),
        tier,
        success: !!result.output,
      });
    }
  } catch (err) {
    console.error("🔥 modelProxy error:", err);
  }

  return result;
}

/* ----------------- 🔹 Unified Call Wrapper ----------------- */
export async function callModel({
  messages,
  tier = "free",
  preferredModel = "gpt",
}: {
  messages: { role: "user"; content: string }[];
  tier?: UserPlan;
  preferredModel?: ModelName;
}): Promise<ModelResult> {
  const prompt = messages.map((m) => m.content).join("\n");
  return modelProxy(prompt, tier, preferredModel);
}