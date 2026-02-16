// src/smartsocial/server/agents/promptEngine.ts

import { getUserContext } from "../../utils/userContext";
import { modelProxy } from "./modelProxy";

export interface UserContext {
  industry: string;
  campaignType: string;
  tone: string;
  targetPlatform?: string;
}

export type TemplateType = "caption" | "repurpose" | "adcopy" | "hashtag";

export interface SocialPost {
  caption: string;
  hashtags: string;
}

export async function buildSocialPost(
  userPrompt: string,
  context: UserContext,
  templateType: TemplateType = "caption",
  userId: string
): Promise<SocialPost & { modelUsed: string }> {
  // --- Get user context & plan in one call ---
  const userContext = await getUserContext(userId);
  const plan = userContext.plan;

  // ✅ FIXED: Merge contexts properly without overwriting
  const mergedContext = {
    ...context, // User-provided context first (has priority)
    industry: context.industry || userContext.industry, // Use provided or fallback
    campaignType: context.campaignType || userContext.campaignType,
    tone: context.tone || userContext.tone,
  };

  const templates: Record<TemplateType, (ctx: UserContext, input: string) => string> = {
    caption: (ctx, input) => `
You are an expert social media manager. Your task is to generate a social media post package. Your output MUST be a valid JSON object with exactly two keys: "caption" and "hashtags".

**IMPORTANT: Return ONLY valid JSON without any code blocks, markdown, or additional text.**

**BUSINESS CONTEXT**
- Industry: ${ctx.industry}
- Campaign Type: ${ctx.campaignType}
- Desired Tone: ${ctx.tone}

**USER'S REQUEST**
${input}

**INSTRUCTIONS:**
1. The "caption" must be engaging and include 1-2 relevant emojis.
2. The "hashtags" must be a string of 4-5 highly relevant hashtags.

**OUTPUT FORMAT (JSON ONLY):**
{
  "caption": "Your engaging caption here...",
  "hashtags": "#hashtag1 #hashtag2 #hashtag3"
}
`,
    hashtag: (ctx, input) => `
You are a social media hashtag expert. Generate a valid JSON object with "caption" and "hashtags".

**IMPORTANT: Return ONLY valid JSON without any code blocks, markdown, or additional text.**

**BUSINESS CONTEXT**
- Industry: ${ctx.industry}

**USER'S REQUEST**
${input}

**OUTPUT FORMAT (JSON ONLY):**
{
  "caption": "Your short caption here...",
  "hashtags": "#hashtag1 #hashtag2 #hashtag3"
}
`,
  };

  // --- Sanitize user input ---
  const sanitizedInput = userPrompt.replace(/["`]/g, "");
  const fullPrompt = templates[templateType](mergedContext, sanitizedInput); // ✅ Use mergedContext

  console.log("🚀 Building social post with prompt:", fullPrompt.substring(0, 200));

  // --- Call proxy with DeepSeek for free, GPT for pro ---
  const { output, modelUsed } = await modelProxy(
    fullPrompt,
    plan,
    plan === "pro" ? "gpt" : "deepseek"
  );

  console.log("📦 Raw model output:", output);

  try {
    // ✅ FIXED: Clean JSON response before parsing
    let cleanOutput = output;
    if (cleanOutput) {
      // Remove code blocks and markdown
      cleanOutput = cleanOutput.replace(/```json\s*/g, '')
                              .replace(/```\s*/g, '')
                              .replace(/^json\s*/g, '')
                              .trim();
      
      // If it still starts with { and ends with }, use it directly
      if (!cleanOutput.startsWith('{') || !cleanOutput.endsWith('}')) {
        // Try to extract JSON from the text
        const jsonMatch = cleanOutput.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          cleanOutput = jsonMatch[0];
        }
      }
    }

    console.log("🧹 Cleaned output:", cleanOutput);
    
    const parsed: SocialPost = JSON.parse(cleanOutput);
    console.log("✅ Successfully parsed JSON");
    return { ...parsed, modelUsed };
  } catch (err) {
    console.error("❌ JSON parse failed:", err, "Raw output:", output);
    
    // Emergency fallback
    let fallbackCaption = output || "Check out our latest update!";
    let fallbackHashtags = "#socialmedia #ai";
    
    // If output contains JSON-like structure but parsing failed, try to extract
    if (output) {
      const captionMatch = output.match(/"caption":\s*"([^"]*)"/);
      const hashtagsMatch = output.match(/"hashtags":\s*"([^"]*)"/);
      
      if (captionMatch) fallbackCaption = captionMatch[1];
      if (hashtagsMatch) fallbackHashtags = hashtagsMatch[1];
    }
    
    return {
      caption: fallbackCaption,
      hashtags: fallbackHashtags,
      modelUsed,
    };
  }
}