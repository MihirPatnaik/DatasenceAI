// File: src/agents/optimizerAgent.ts

import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';

// ✅ FIXED for Vite
const OPTIMIZER_API_KEY = import.meta.env.VITE_OPENAI_KEY_SMARTSOCIAL;

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_KEY_SMARTSOCIAL,
  dangerouslyAllowBrowser: true,
});

export interface OptimizerInput {
  caption: string;
  tone?: string;
  maxLength?: number;
  userPrompt?: string;
}

export interface OptimizerResult {
  original: string;
  optimized: string;
  suggestions?: string;
}

export async function optimizerAgent(input: OptimizerInput): Promise<OptimizerResult> {
  const { caption, tone = "default", maxLength = 2200, userPrompt } = input;

  // === Caption Optimization Prompt ===
  const captionPrompt = `
You are a caption optimizer for Instagram.
Follow these rules:
- Use the tone: "${tone}"
- Add 3–5 relevant trending hashtags at the end
- Keep the caption under ${maxLength} characters
- Use line breaks and emojis to improve readability

Here is the original caption:
"""${caption}"""

Return ONLY the final optimized caption, no notes or explanations.
`.trim();

  const captionResponse = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: captionPrompt }],
    temperature: 0.7,
  });

  const optimized = captionResponse.choices?.[0]?.message?.content?.trim() || caption;

  // === Optional Suggestions Block (Performance Coaching) ===
  let suggestions: string | undefined;

  if (userPrompt) {
    const suggestionMessages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `You're a social media performance coach.
Give smart, actionable suggestions to improve caption reach, engagement, or clicks. Use bullet points if needed.`,
      },
      {
        role: 'user',
        content: `Here is the caption: "${caption}"\nUser’s note: ${userPrompt}`,
      },
    ];

    const suggestionResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: suggestionMessages,
      temperature: 0.7,
    });

    suggestions = suggestionResponse.choices?.[0]?.message?.content?.trim();
  }

  return {
    original: caption,
    optimized,
    ...(suggestions && { suggestions }),
  };
}

export default optimizerAgent;
