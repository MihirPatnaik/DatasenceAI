// src/smartsocial/server/agents/claudeProxy.ts

import express from "express";
import fetch from "node-fetch";

interface ReplicatePrediction {
  id: string;
  status: string;
  output?: string[];
  error?: string;
}

const router = express.Router();

// 🔁 Replicate Image Generation Proxy
router.post("/replicate-image", async (req, res) => {
  const { prompt } = req.body;

  try {
    console.log("🔄 Proxying Replicate image generation:", prompt.substring(0, 100));
    
    const replicateApiKey = process.env.VITE_REPLICATE_API_KEY;
    if (!replicateApiKey) {
      console.error("❌ Replicate API key missing in server");
      return res.status(500).json({ error: "Server configuration error: Replicate API key missing" });
    }
    
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${replicateApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "stability-ai/sdxl-turbo:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc",
        input: { 
          prompt: prompt,
          num_outputs: 1,
          width: 512,
          height: 512,
          scheduler: "K_EULER",
          num_inference_steps: 4,
          guidance_scale: 1.0,
          // 🆕 ADD NSFW FILTER BYPASS
          safety_tolerance: "permissive", // More permissive content filtering
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Replicate API error:", response.status, errorText);
      return res.status(response.status).json({ error: errorText });
    }

    // ✅ FIX: Add type assertion
    const prediction = await response.json() as ReplicatePrediction;
    console.log("📦 Replicate prediction created:", prediction.id);
    
    res.json(prediction);
  } catch (err) {
    console.error("Replicate proxy error:", err);
    res.status(500).json({ error: "Replicate proxy error" });
  }
});

// 🔁 Replicate Prediction Polling Proxy
router.get("/replicate-prediction/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const replicateApiKey = process.env.VITE_REPLICATE_API_KEY;
    if (!replicateApiKey) {
      return res.status(500).json({ error: "Server configuration error" });
    }

    const response = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: {
        "Authorization": `Token ${replicateApiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Replicate poll error: ${response.status}`);
    }

    // ✅ FIX: Add type assertion here too
    const prediction = await response.json() as ReplicatePrediction;
    res.json(prediction);
  } catch (err) {
    console.error("Replicate poll proxy error:", err);
    res.status(500).json({ error: "Replicate poll proxy error" });
  }
});

// 🔁 Caption / Prompt Enhancement with Safety Modifiers
router.post("/claude-enhance", async (req, res) => {
  const { prompt } = req.body;

  try {
    const claudeApiKey = process.env.VITE_CLAUDE_API_KEY;
    if (!claudeApiKey) {
      console.error("❌ Claude API key missing in server");
      return res.status(500).json({ error: "Server configuration error: Claude API key missing" });
    }

    // 🆕 ADD SAFETY MODIFIERS TO PROMPT
    const safePrompt = `Enhance this image prompt for a creative, visually rich illustration. Make it family-friendly, safe for work, professional, and suitable for commercial use: ${prompt}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": claudeApiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 300,
        messages: [
          {
            role: "user",
            content: safePrompt, // 🆕 USING SAFE PROMPT
          },
        ],
      }),
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Claude API error:", err);
    res.status(500).json({ error: "Claude proxy error" });
  }
});

export default router;