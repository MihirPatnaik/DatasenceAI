// src/smartsocial/agents/claudeCaption.ts

export async function claudeCaption(prompt: string): Promise<string> {
  try {
    const response = await fetch("http://localhost:3001/api/claude-enhance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("❌ Claude proxy error:", err);
      return "⚠️ Claude proxy request failed.";
    }

    const data = await response.json();
    // Claude returns structured content
    return data?.content?.[0]?.text || "⚠️ Claude returned no text";
  } catch (error) {
    console.error("❌ ClaudeCaption fetch failed:", error);
    return "⚠️ Claude proxy unreachable.";
  }
}
