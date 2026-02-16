// src/smartsocial/agents/imageAgents.ts

import axios from "axios";
import { enhancePrompt as enhancerAgent } from "../server/agents/promptEnhancerAgent";
import { consumeQuota } from "../services/quotaService";
import { auth, db } from "../utils/firebase";
import { checkFirebaseCache, logToFirebase } from "../utils/firebaseLogger";
import { getUserContext } from "../utils/userContext";
import { claudeImageHelper } from "./claudeImageHelper";

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_KEY_SMARTSOCIAL;
const STABILITY_API_KEY = import.meta.env.VITE_STABILITY_API_KEY;
const REPLICATE_API_KEY = import.meta.env.VITE_REPLICATE_API_KEY;
const MODEL_ENV = import.meta.env.VITE_PROMPT_MODEL_ENV || "prod";
const USE_FIREBASE_CACHE = import.meta.env.VITE_USE_FIREBASE_CACHE === "true";

console.log("🔄 imageAgents.ts loaded");
console.log("🔑 Replicate Key available:", !!REPLICATE_API_KEY);
console.log("🔑 Stability AI Key available:", !!STABILITY_API_KEY);
console.log("🔑 OpenAI Key available:", !!OPENAI_API_KEY);

type ToastFn = (props: {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
}) => void;

// 🆕 LOCAL CACHE FUNCTIONS
function getLocalCacheKey(prompt: string): string {
  return `image_cache_${btoa(prompt).substring(0, 50)}`;
}

function checkLocalCache(prompt: string): string | null {
  if (import.meta.env.DEV) {
    try {
      const cached = localStorage.getItem(getLocalCacheKey(prompt));
      console.log("🔍 Local cache check for:", prompt.substring(0, 50), cached ? "HIT" : "MISS");
      return cached;
    } catch (err) {
      console.warn("Local cache check failed:", err);
    }
  }
  return null;
}

function setLocalCache(prompt: string, imageUrl: string): void {
  if (import.meta.env.DEV) {
    try {
      localStorage.setItem(getLocalCacheKey(prompt), imageUrl);
      console.log("💾 Saved to local cache:", prompt.substring(0, 50));
    } catch (err) {
      console.warn("Local cache set failed:", err);
    }
  }
}

// 🆕 TEMPORARY CACHE CLEAR FUNCTION
export function clearImageCache(): void {
  if (import.meta.env.DEV) {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('image_cache_')) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      console.log("🧹 Cleared all image cache entries:", keysToRemove.length);
    } catch (err) {
      console.warn("Cache clear failed:", err);
    }
  }
}

/* ----------------- 🔹 SDXL Turbo via Proxy ----------------- */
async function callSDXLTurbo(prompt: string): Promise<string | null> {
  try {
    console.log("🚀 Generating image via proxy...", prompt.substring(0, 100));
    
    const response = await fetch("http://localhost:3001/api/replicate-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Proxy API error:", response.status, errorText);
      throw new Error(`Proxy error: ${response.status} - ${errorText}`);
    }

    const prediction = await response.json();
    console.log("📦 Proxy prediction created:", prediction.id);

    let result = await pollReplicatePredictionViaProxy(prediction.id);
    
    if (result && result.output && result.output.length > 0) {
      console.log("✅ SDXL Turbo image generated successfully via proxy!");
      return result.output[0];
    }
    
    return null;
  } catch (error) {
    console.error("❌ SDXL Turbo via proxy failed:", error);
    return null;
  }
}

/* ----------------- 🔹 DIRECT Replicate Fallback ----------------- */
async function callSDXLTurboDirect(prompt: string): Promise<string | null> {
  if (!REPLICATE_API_KEY) {
    console.warn("❌ Replicate API key missing");
    return null;
  }

  try {
    console.log("🔧 Attempting direct Replicate API...", prompt.substring(0, 100));
    
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${REPLICATE_API_KEY}`,
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
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Direct Replicate API error:", response.status, errorText);
      return null;
    }

    const prediction = await response.json();
    console.log("📦 Direct prediction created:", prediction.id);

    let result = await pollReplicatePredictionDirect(prediction.id);
    
    if (result && result.output && result.output.length > 0) {
      console.log("✅ Direct SDXL Turbo image generated successfully!");
      return result.output[0];
    }
    
    return null;
  } catch (error) {
    console.error("❌ Direct SDXL Turbo failed:", error);
    return null;
  }
}

/* ----------------- 🔹 POLLING FUNCTIONS ----------------- */
// 🆕 FIXED POLLING FUNCTION FOR PROXY WITH NSFW HANDLING
async function pollReplicatePredictionViaProxy(predictionId: string, maxAttempts = 15) {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      const response = await fetch(`http://localhost:3001/api/replicate-prediction/${predictionId}`);
      
      if (!response.ok) {
        throw new Error(`Proxy poll error: ${response.status}`);
      }
      
      const prediction = await response.json();
      
      if (prediction.status === "succeeded") {
        return prediction;
      } else if (prediction.status === "failed") {
        // 🆕 BETTER NSFW HANDLING
        if (prediction.error?.includes("NSFW")) {
          console.log("🚫 NSFW content detected - stopping polling");
          return null; // Return null instead of throwing
        }
        throw new Error(`Replicate prediction failed: ${prediction.error}`);
      }
      
      console.log(`⏳ Waiting for SDXL Turbo image via proxy... (${i + 1}/${maxAttempts})`);
    } catch (error) {
      console.warn(`Poll attempt ${i + 1} failed:`, error);
      if (i === maxAttempts - 1) return null; // Return null instead of throwing
    }
  }
  
  console.log("⏰ Polling timeout reached");
  return null;
}

// 🆕 SEPARATE POLLING FUNCTION FOR DIRECT API
async function pollReplicatePredictionDirect(predictionId: string, maxAttempts = 15) {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          "Authorization": `Token ${REPLICATE_API_KEY}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Replicate poll error: ${response.status}`);
      }
      
      const prediction = await response.json();
      
      if (prediction.status === "succeeded") {
        return prediction;
      } else if (prediction.status === "failed") {
        throw new Error(`Replicate prediction failed: ${prediction.error}`);
      }
      
      console.log(`⏳ Waiting for direct SDXL Turbo image... (${i + 1}/${maxAttempts})`);
    } catch (error) {
      console.warn(`Direct poll attempt ${i + 1} failed:`, error);
      if (i === maxAttempts - 1) return null;
    }
  }
  
  console.log("⏰ Direct polling timeout reached");
  return null;
}

/* ----------------- 🔹 CORS FALLBACK FOR REPLICATE ----------------- */
async function callSDXLTurboWithFallback(prompt: string): Promise<string | null> {
  try {
    console.log("🔄 Attempting proxy first...");
    const proxyImage = await callSDXLTurbo(prompt);
    if (proxyImage) return proxyImage;
    
    console.log("🔄 Proxy failed, trying direct API...");
    const directImage = await callSDXLTurboDirect(prompt);
    return directImage;
    
  } catch (err) {
    console.warn("❌ Both proxy and direct Replicate failed:", err);
    return null;
  }
}

/* ----------------- 🔹 EMERGENCY FALLBACK ----------------- */
function getEmergencyFallbackImage(prompt: string): string | null {
  console.log("🆘 Using emergency image fallback for:", prompt.substring(0, 100));
  
  if (prompt.toLowerCase().includes('bakery') || prompt.toLowerCase().includes('bread') || prompt.toLowerCase().includes('pastry')) {
    return "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=512&h=512&fit=crop";
  }
  if (prompt.toLowerCase().includes('coffee') || prompt.toLowerCase().includes('cafe')) {
    return "https://images.unsplash.com/photo-1544787219-7f47ccb765a8?w=512&h=512&fit=crop";
  }
  if (prompt.toLowerCase().includes('sale') || prompt.toLowerCase().includes('discount')) {
    return "https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=512&h=512&fit=crop";
  }
  if (prompt.toLowerCase().includes('opening') || prompt.toLowerCase().includes('launch')) {
    return "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=512&h=512&fit=crop";
  }
  
  return null;
}

// 🆕 DEMO MODE: Add bypassCache parameter for demo purposes
export async function callImageAgent(
  caption: string,
  size: "256x256" | "512x512" | "1024x1024" = "512x512",
  userId?: string,
  toast?: ToastFn,
  bypassCache: boolean = false // 🆕 DEMO: Add this parameter to bypass cache
): Promise<{ imageUrl: string | null; modelUsed: string; code?: string; message?: string }> {
  console.log("🎯 callImageAgent called with:", caption.substring(0, 100));
  
    // 🆕 DEMO MODE: COMMENT OUT FOR DEMO TO BYPASS CACHE
  // ⬇️⬇️⬇️ COMMENT THESE LINES DURING DEMO ⬇️⬇️⬇️
    if (!bypassCache) {
    const localCached = checkLocalCache(caption);
    if (localCached) {
      console.log("✅ LOCAL CACHE HIT! Using locally cached image");
      return { imageUrl: localCached, modelUsed: "local-cache" };
    }
  }
    // ⬆️⬆️⬆️ UNCOMMENT AFTER DEMO ⬆️⬆️⬆️
  
  // 🆕 DEMO MODE ALTERNATIVE: UNCOMMENT FOR CACHE BYPASS DURING DEMO
  // ⬇️⬇️⬇️ UNCOMMENT DURING DEMO TO BYPASS CACHE ⬇️⬇️⬇️
  /*
  console.log("🎯 DEMO MODE: Bypassing cache for fresh image generation");
  */
  // ⬆️⬆️⬆️ COMMENT OUT AFTER DEMO ⬆️⬆️⬆️

  const uid = userId || auth.currentUser?.uid;
  if (!uid) {
    return { imageUrl: null, modelUsed: "no-user", code: "no_user", message: "User not logged in" };
  }

  // Load user context
  let ctx;
  try {
    ctx = await getUserContext(uid);
  } catch (err) {
    console.error("getUserContext failed:", err);
    return { imageUrl: null, modelUsed: "ctx_error", code: "ctx_error", message: "Failed to load user context" };
  }

  const planKey: "free" | "pro" = (ctx.onboarding?.plan as "free" | "pro") || "free";

  let enhancedPrompt: string = caption;

  // Try firebase cached enhancedPrompt
  if (USE_FIREBASE_CACHE) {
    try {
      const cached = (await checkFirebaseCache(caption, "enhancedPrompt")) as string | null;
      if (cached) enhancedPrompt = cached;
    } catch (err) {
      console.warn("checkFirebaseCache(enhancedPrompt) failed:", err);
    }
  }

  // 🆕 DEMO MODE: ALSO BYPASS FIREBASE CACHE FOR IMAGES
  if (!bypassCache && USE_FIREBASE_CACHE) {
    try {
      const cachedImg = (await checkFirebaseCache(enhancedPrompt, "generatedImage")) as string | null;
      if (cachedImg) {
        console.log("✅ FIREBASE CACHE HIT! Using cached image for prompt:", enhancedPrompt.substring(0, 50));
        
        // 🆕 ALSO SAVE TO LOCAL CACHE FOR FASTER ACCESS
        setLocalCache(caption, cachedImg);
        setLocalCache(enhancedPrompt, cachedImg);
        
        return { imageUrl: cachedImg, modelUsed: "firebase-cache" };
      } else {
        console.log("❌ FIREBASE CACHE MISS for prompt:", enhancedPrompt.substring(0, 50));
      }
      
    } catch (err) {
      console.warn("checkFirebaseCache(generatedImage) failed:", err);
    }
  }

  // Enhance prompt if needed
  if ((!enhancedPrompt || enhancedPrompt.trim().length < 3)) {
    try {
      const c = await claudeImageHelper(caption);
      if (c && c.trim().length > 0) {
        enhancedPrompt = c;
      } else {
        const fallback = await enhancerAgent(caption);
        // 🆕 ADD SAFETY MODIFIERS FOR NSFW PROTECTION
        enhancedPrompt = `${fallback?.prompt ?? caption} - family friendly, safe for work, professional photography`;
      }
    } catch (err) {
      console.warn("enhance prompt failed, using original caption:", err);
      // 🆕 ADD SAFETY MODIFIERS TO ORIGINAL TOO
      enhancedPrompt = `${caption} - family friendly, safe for work`;
    }

    if (USE_FIREBASE_CACHE) {
      try {
        await logToFirebase({ prompt: caption, caption: enhancedPrompt, status: "enhancedPrompt" });
      } catch (err) {
        console.warn("logToFirebase(enhancedPrompt) failed:", err);
      }
    }
  }

  console.log("🎨 Enhanced prompt:", enhancedPrompt.substring(0, 150));

  // ✅ QUOTA CHECK
  try {
    const idempotencyKey = `image:${uid}:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
    const q = await consumeQuota(db, uid, planKey, "usedImageQuota", 1, {
      idempotencyKey,
      docPath: `users/${uid}/quota/meta`,
    });

    if (!q.success) {
      if (q.code === "INSUFFICIENT") {
        toast?.({
          title: "Quota Reached 🚫",
          description: "You've used your image generation quota for this billing period. Upgrade to Pro.",
          variant: "destructive",
        });
        return { imageUrl: null, modelUsed: "quota_blocked", code: "quota_exhausted", message: q.message };
      } else {
        return { imageUrl: null, modelUsed: "quota_error", code: q.code || "quota_error", message: q.message };
      }
    }
  } catch (err) {
    console.error("consumeQuota failed:", err);
    return { imageUrl: null, modelUsed: "quota_error", code: "quota_error", message: "Failed to validate quota" };
  }

  // 🆕 PRIMARY: SDXL Turbo via Proxy
  try {
    console.log("🚀 Attempting SDXL Turbo with Replicate...");
    const turboImage = await callSDXLTurboWithFallback(enhancedPrompt);
    if (turboImage) {
      console.log("✅ SDXL Turbo success!");
      
      // 🆕 SAVE TO BOTH CACHES
      setLocalCache(caption, turboImage);
      setLocalCache(enhancedPrompt, turboImage);
      
      if (USE_FIREBASE_CACHE) {
        try {
          await logToFirebase({ prompt: enhancedPrompt, caption: turboImage, status: "generatedImage" });
        } catch (err) {
          console.warn("logToFirebase(generatedImage) failed:", err);
        }
      }
      return { imageUrl: turboImage, modelUsed: "sdxl-turbo" };
    }
  } catch (err) {
    console.warn("SDXL Turbo failed:", err);
  }

  // SECONDARY: Stability AI
  try {
    console.log("🔄 Attempting Stability AI...");
    const st = await axios.post(
      "https://api.stability.ai/v2beta/stable-image/generate/core",
      { prompt: enhancedPrompt },
      { headers: { Authorization: `Bearer ${STABILITY_API_KEY}`, Accept: "application/json" } }
    );

    const stableImage = st.data?.image || null;
    if (stableImage) {
      console.log("✅ Stability AI success!");
      
      // 🆕 SAVE TO LOCAL CACHE
      setLocalCache(caption, stableImage);
      setLocalCache(enhancedPrompt, stableImage);
      
      if (USE_FIREBASE_CACHE) {
        try {
          await logToFirebase({ prompt: enhancedPrompt, caption: stableImage, status: "generatedImage" });
        } catch (_) {}
      }
      return { imageUrl: stableImage, modelUsed: "stability-ai" };
    }
  } catch (err) {
    console.warn("Stability AI fallback failed:", err);
  }

  // TERTIARY: OpenAI images
  try {
    console.log("🔄 Attempting OpenAI...");
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: enhancedPrompt, size }),
    });

    if (res.ok) {
      const body = await res.json();
      const url = body?.data?.[0]?.url || null;
      if (url) {
        console.log("✅ OpenAI success!");
        
        // 🆕 SAVE TO LOCAL CACHE
        setLocalCache(caption, url);
        setLocalCache(enhancedPrompt, url);
        
        if (USE_FIREBASE_CACHE) {
          try {
            await logToFirebase({ prompt: enhancedPrompt, caption: url, status: "generatedImage" });
          } catch (err) {
            console.warn("logToFirebase(generatedImage) failed:", err);
          }
        }
        return { imageUrl: url, modelUsed: "openai" };
      }
    } else {
      const txt = await res.text().catch(() => "");
      console.warn("OpenAI images API returned non-ok:", res.status, txt);
    }
  } catch (err) {
    console.warn("OpenAI images request failed:", err);
  }

  // FINAL FALLBACK: Claude image
  try {
    console.log("🔄 Attempting Claude...");
    const img = await claudeImageHelper(enhancedPrompt);
    if (img) {
      console.log("✅ Claude success!");
      
      // 🆕 SAVE TO LOCAL CACHE
      setLocalCache(caption, img);
      setLocalCache(enhancedPrompt, img);
      
      if (USE_FIREBASE_CACHE) {
        await logToFirebase({ prompt: enhancedPrompt, caption: img, status: "generatedImage" });
      }
      console.log("🖼️ Claude image URL:", img);
      return { imageUrl: img, modelUsed: "claude" };
    }
  } catch (err) {
    console.warn("Claude image fallback failed:", err);
  }

  // 🆘 ULTIMATE FALLBACK: Emergency image or proper error
  console.error("💥 ALL image generation APIs failed");
  const emergencyImage = getEmergencyFallbackImage(enhancedPrompt);
  
  if (emergencyImage) {
    console.log("🆘 Using emergency fallback image");
    
    // 🆕 SAVE TO LOCAL CACHE
    setLocalCache(caption, emergencyImage);
    setLocalCache(enhancedPrompt, emergencyImage);
    
    return { imageUrl: emergencyImage, modelUsed: "emergency-fallback" };
  } else {
    return { 
      imageUrl: null, 
      modelUsed: "all-failed", 
      code: "image_generation_failed", 
      message: "Unable to generate image at this time. Please try again later." 
    };
  }
}