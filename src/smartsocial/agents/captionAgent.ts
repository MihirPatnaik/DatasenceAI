// src/smartsocial/agents/captionAgent.ts

import { modelProxy } from "../server/agents/modelProxy";
import { consumeQuota } from "../services/quotaService";
import { auth, db } from "../utils/firebase";
import { getUserContext } from "../utils/userContext";
import { claudeCaption } from "./claudeCaption";

/**
 * caption agent returns structured result so UI decides how to show toast.
 * Caller may pass `toast` if they want agent to call it directly.
 */
type ToastFn = (props: {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
}) => void;

const SMARTSOCIAL_API_KEY = import.meta.env.VITE_OPENAI_KEY_SMARTSOCIAL;
const ENV = import.meta.env.VITE_PROMPT_MODEL_ENV;

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function callCaptionAgent(
  prompt: string,
  options?: { 
    toast?: ToastFn; 
    userId?: string;
    source?: string; // Add this
    platform?: string; // Add this
  }
): Promise<{ 
  success: boolean;
  caption?: string; 
  code?: string; 
  message?: string;
  modelUsed?: string; // Add this
}> {
  const toast = options?.toast;
  const uid = options?.userId || auth.currentUser?.uid;
  const source = options?.source || 'web'; // Default to 'web'
  const platform = options?.platform || 'general';
  
  if (!uid) {
    return { 
      success: false, 
      code: "no_user", 
      message: "User not logged in.",
      modelUsed: undefined 
    };
  }

  // Log the source for analytics
  console.log(`Caption request from ${source} for platform ${platform}`);

  // Load user context (plan + planFeatures)
  let ctx;
  try {
    ctx = await getUserContext(uid);
  } catch (err) {
    console.error("getUserContext failed:", err);
    return { 
      success: false, 
      code: "ctx_error", 
      message: "Failed to load user context.",
      modelUsed: undefined 
    };
  }

  // onboarding.plan is your canonical "free" | "pro"
  const planKey: "free" | "pro" = (ctx.onboarding?.plan as "free" | "pro") || "free";

  // QUOTA: consume caption quota using centralized quotaService
  try {
    // idempotency key prevents double consumption for the same prompt
    const idempotencyKey = `caption:${uid}:${prompt}`;

    const q = await consumeQuota(
      db,
      uid,
      planKey,
      "usedCaptionQuota", // ✅ NEW
      1,
      { idempotencyKey, docPath: `users/${uid}/quota/meta` } // Also fix docPath
    );

    if (!q.success) {
      // Let UI show toast if it passed a toast function
      if (q.code === "INSUFFICIENT") {
        toast?.({
          title: "Quota Reached 🚫",
          description: "You've used your caption quota for this billing period. Upgrade to Pro.",
          variant: "destructive",
        });
        return { 
        success: false, 
        code: "quota_exhausted", 
        message: q.message || "Quota exhausted",
        modelUsed: undefined 
      };
      } else {
        return { 
          success: false, 
          code: q.code || "quota_error", 
          message: q.message || "Quota check failed",
          modelUsed: undefined
      };
    }
    }
  }catch (err) {
    console.error("consumeQuota error:", err);
    return { 
    success: false, 
    code: "quota_error", 
    message: "Failed to verify quota.",
    modelUsed: undefined
     };
  }


  // Now call primary model (OpenAI GPT)
  const systemMessage = "You are a creative caption writer for social media posts.";
  const userPrompt = `Write a short, catchy caption for this idea: "${prompt}"`;

  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SMARTSOCIAL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: systemMessage },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 120,
        }),
      });

      if (res.status === 429) {
        // rate-limited — backoff & retry
        await delay(1000 * (attempt + 1));
        attempt++;
        continue;
      }

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        console.warn("OpenAI caption error:", res.status, txt);
        break;
      }

      const payload = await res.json();
      const caption = payload?.choices?.[0]?.message?.content?.trim();
      if (caption) {
        return { 
        success: true, 
        caption,
        modelUsed: "gpt-3.5-turbo" 
      };
      } else {
        return { 
        success: false, 
        code: "empty_caption", 
        message: "Model returned empty caption.",
        modelUsed: "gpt-3.5-turbo"
    };
      }
    } catch (err) {
      console.error("callCaptionAgent: OpenAI error:", err);
      break;
    }
  }

  // PRIMARY MODEL failed — fallback chain (prod-only deepseek first)
  if (ENV === "prod") {
    try {
      const deep = await modelProxy(userPrompt, "free", "deepseek");
      if (deep?.output) {
      return { 
      success: true, 
      caption: deep.output,
      modelUsed: "deepseek"
    };
  }

    } catch (err) {
      console.warn("DeepSeek fallback failed:", err);
    }

    try {
      const claude = await claudeCaption(prompt);
      if (claude) {
      return { 
      success: true, 
      caption: claude,
      modelUsed: "claude"
     };
    }
    } catch (err) {
      console.warn("Claude fallback failed:", err);
    }
  }

  // All attempts failed
  return { 
  success: false, 
  code: "all_models_failed", 
  message: "Caption generation failed.",
  modelUsed: undefined 
 };
}
