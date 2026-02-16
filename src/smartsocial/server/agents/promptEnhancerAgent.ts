// server/src/agents/promptEnhancerAgent.ts

// 🚀 Dedicated to IMAGE prompt enhancement only

import { checkFirebaseCache, logToFirebase } from "../../utils/firebaseLogger";
import { sha256 } from "../../utils/hash";
import { callModel } from "./modelProxy";

type Target = "image"; // 🔒 Locked: only image supported

export const enhancePrompt = async (
  caption: string,
  style?: string
): Promise<{ prompt: string; modelUsed: string; tokensUsed?: number }> => {
  try {
    // 🗝️ Cache key
    const keyBase = `image::${style ?? "default"}::${caption}`;
    const cacheKey = await sha256(keyBase);

    // 🔍 Check cache
    const cached = await checkFirebaseCache(cacheKey, "enhancedPrompt");
    if (cached) return { prompt: cached, modelUsed: "cache" };

    // 🧠 System prompt (IMAGE ONLY)
    const systemForImage = `
You are an expert prompt engineer for image generation models.
Given a short idea, produce ONE concise, high-detail image prompt suitable for models like DALL·E or Stable Diffusion.
Rules:
- Output only a single-line prompt (no explanation).
- Include style tokens, lighting, composition, camera, color palette.
- Add atmosphere details (cinematic, dreamy, futuristic, etc.) if relevant.
`;

    const userContent = style ? `${caption} — style: ${style}` : caption;

    // 📤 Model call
    const res = await callModel({
      messages: [
        { role: "system", content: systemForImage },
        { role: "user", content: userContent },
      ],
      temperature: 0.25,
      max_tokens: 180,
    });

    const enhanced = res.output?.trim();
    const tokensUsed = res.tokensUsed;
    const modelUsed = res.modelUsed;

    if (enhanced) {
      // 📝 Log result
      await logToFirebase({
        prompt: caption,
        caption: enhanced,
        status: "enhancedPrompt",
        modelUsed,
        tokensUsed,
        cacheKey,
      });

      return { prompt: enhanced, modelUsed, tokensUsed };
    }

    // fallback
    return { prompt: caption, modelUsed: "fallback-original" };
  } catch (err) {
    console.error("Enhancer error:", err);
    return { prompt: caption, modelUsed: "error" };
  }
};
