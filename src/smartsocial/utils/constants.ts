// utils/claudeClient.ts

export const callClaude = async ({ prompt }: { prompt: string }) => {
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-3-haiku-20240307",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  const data = await res.json();
  return data?.content?.[0]?.text || "";
};
