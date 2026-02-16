//D:\datasenceai\src\smartsocial\pages\NotFound.tsx

import React, { useState } from "react";
// Update the import path below if the file is not found at the alias location.
// For example, if the file is at src/agents/captionAgent.ts, use:
import { callCaptionAgent } from "@/smartsocial/agents/captionAgent";
import { claudeDiagramAgent } from "@/smartsocial/agents/claudeDiagramAgent";
import { callImageAgent } from "@/smartsocial/agents/imageAgent";
import { optimizerAgent } from "@/smartsocial/agents/optimizerAgent";
import { callPosterAgent } from "@/smartsocial/agents/posterAgent";
import { callSafetyAgent } from "@/smartsocial/agents/safetyAgent";
import { callVisionAgent } from "@/smartsocial/agents/visionAgent";
import { checkFirebaseCache, logToFirebase } from "@/smartsocial/utils/firebaseLogger";
import { getCachedResponse } from "@/smartsocial/utils/promptCache";


const MAX_PROMPT_LENGTH = 700;
const PROMPT_WARNING_THRESHOLD = 400;

const SmartSocial = () => {
  const [svgDiagram, setSvgDiagram] = useState<string | null>(null);
  const [mode, setMode] = useState<"upload" | "prompt">("prompt");
  const [promptInput, setPromptInput] = useState("");
  const [generatedCaption, setGeneratedCaption] = useState("");
  const [refinedImagePrompt, setRefinedImagePrompt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [safetyCheck, setSafetyCheck] = useState<string | null>(null);
  const [postStatus, setPostStatus] = useState<string | null>(null);
  const [aiImageUrl, setAiImageUrl] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageInsight, setImageInsight] = useState<string | null>(null);

  const handleModeChange = (value: "upload" | "prompt") => {
    setMode(value);
    resetAllStates();
  };

  const resetAllStates = () => {
    setPromptInput("");
    setGeneratedCaption("");
    setRefinedImagePrompt(null);
    setImageInsight(null);
    setImagePreviewUrl(null);
    setSelectedImage(null);
    setAiImageUrl(null);
    setPostStatus(null);
    setSafetyCheck(null);
    setSvgDiagram(null);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedImage(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeImage = async () => {
    if (!imagePreviewUrl) return;
    setImageInsight("Analyzing...");
    try {
      const caption = await callVisionAgent(imagePreviewUrl);
      await logToFirebase({ prompt: promptInput, caption, status: "visionAgent" });
      setGeneratedCaption(caption);
      setImageInsight(null);
    } catch (error) {
      setImageInsight("Failed to analyze image.");
    }
  };

  const handleClaudeDiagram = async (prompt: string) => {
    try {
      const cachedSvg = await checkFirebaseCache(prompt, "svgPrompt");
      if (cachedSvg && cachedSvg.startsWith("<svg")) {
        console.log("✅ Claude SVG served from cache");
        setSvgDiagram(cachedSvg);
        return;
      }

      const result = await claudeDiagramAgent.execute({ prompt });
      if (result !== "skip" && result.startsWith("<svg")) {
        setSvgDiagram(result);
        await logToFirebase({ prompt, caption: result, status: "svgPrompt" });
      } else {
        setSvgDiagram(null);
      }
    } catch (err) {
      console.error("❌ Claude diagram generation failed", err);
      setSvgDiagram(null);
    }
  };

  const handleGenerateFromPrompt = async () => {
    if (!promptInput) return;

    if (promptInput.length > MAX_PROMPT_LENGTH) {
      alert("Prompt too long. Please shorten your prompt to under 700 characters.");
      return;
    }

    setIsLoading(true);
    setPostStatus(null);
    setSafetyCheck(null);
    setSvgDiagram(null);

    try {
      // ✅ 1. Try Firebase cache
      const cachedCaption = await checkFirebaseCache(promptInput, "imagePrompt");
      if (cachedCaption) {
        setGeneratedCaption(cachedCaption);
        setRefinedImagePrompt(cachedCaption);
        setSafetyCheck("safe (from cache)");
        return;
      }

      // ✅ 2. Run safety check
      const safety = await callSafetyAgent(promptInput);
      setSafetyCheck(safety);

      if (safety === "safe") {
        // ✅ Check cache before hitting the caption agent
        const cachedResult = await getCachedResponse(promptInput, callCaptionAgent);
        // ✅ 3. Caption → Optimize → Refine
        const rawCaption = await callCaptionAgent(promptInput);
        const optimized = await optimizerAgent({ caption: rawCaption });

        setGeneratedCaption(optimized.optimized);
        setRefinedImagePrompt(optimized.refined);

        await logToFirebase({ prompt: promptInput, caption: optimized.optimized, status: "captionAgent" });
      } else {
        setGeneratedCaption("");
      }

      // ✅ 4. Generate SVG regardless
      await handleClaudeDiagram(promptInput);
    } catch (error) {
      console.error("Error in handleGenerateFromPrompt:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!refinedImagePrompt) return;

    try {
      await logToFirebase({ prompt: refinedImagePrompt, caption: "", status: "imagePrompt" });
      const imgUrl = await callImageAgent(refinedImagePrompt);
      await logToFirebase({ prompt: refinedImagePrompt, caption: imgUrl.imageUrl, status: "imageAgent" });
      setAiImageUrl(imgUrl.imageUrl);
    } catch (err) {
      console.error("Image generation failed:", err);
      setAiImageUrl("error");
    }
  };

  const handlePost = async () => {
    setIsLoading(true);
    const result = await callPosterAgent({
      caption: generatedCaption,
      platform: "twitter",
    });

    await logToFirebase({
      prompt: generatedCaption,
      caption: generatedCaption,
      status: "posterAgent",
    });

    setPostStatus(result.message);
    setIsLoading(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">SmartSocial AI Assistant</h1>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => handleModeChange("prompt")}
          className={`px-4 py-2 rounded ${mode === "prompt" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        >
          🧠 Generate Image from Prompt
        </button>
        <button
          onClick={() => handleModeChange("upload")}
          className={`px-4 py-2 rounded ${mode === "upload" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        >
          📷 Upload Image
        </button>
      </div>

      {mode === "prompt" && (
        <>
          <textarea
            className="w-full p-3 border rounded mb-1"
            rows={4}
            value={promptInput}
            maxLength={MAX_PROMPT_LENGTH}
            onChange={(e) => setPromptInput(e.target.value)}
            placeholder="Enter a topic or idea..."
          />
          <p
            className={`text-sm mb-2 ${
              promptInput.length > PROMPT_WARNING_THRESHOLD ? "text-red-500" : "text-gray-500"
            }`}
          >
            {promptInput.length}/{MAX_PROMPT_LENGTH} characters
          </p>

          <button
            onClick={handleGenerateFromPrompt}
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {isLoading ? "Generating..." : "Generate Caption"}
          </button>

          {safetyCheck && (
            <p className="mt-2 text-sm text-gray-600">
              Safety Check: {safetyCheck === "safe" ? "✅ Safe" : "⚠️ Not Safe"}
            </p>
          )}

          {generatedCaption && (
            <div className="mt-4 p-4 bg-gray-100 border rounded">
              <strong>Caption:</strong>
              <p>{generatedCaption}</p>

              <div className="mt-4">
                <label className="block font-semibold mb-1">🎯 Refine Image Prompt</label>
                <textarea
                  className="w-full p-2 border rounded mb-3"
                  rows={4}
                  value={refinedImagePrompt || ""}
                  onChange={(e) => setRefinedImagePrompt(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleGenerateImage}
                  className="bg-indigo-600 text-white px-4 py-2 rounded"
                >
                  🎨 Generate Image
                </button>
                <button
                  onClick={handlePost}
                  disabled={isLoading}
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  {isLoading ? "Posting..." : "Post"}
                </button>
              </div>

              {aiImageUrl && aiImageUrl !== "error" && (
                <div className="mt-4">
                  <img src={aiImageUrl} alt="AI" className="w-64 h-auto rounded" />
                </div>
              )}
              {aiImageUrl === "error" && (
                <p className="text-red-600 mt-2">Failed to generate image.</p>
              )}
              {postStatus && <p className="mt-2 text-sm text-blue-600">Status: {postStatus}</p>}

              {svgDiagram && (
                <div className="mt-6 p-4 border bg-white rounded shadow">
                  <h3 className="font-bold mb-2">📊 AI-Generated Technical Diagram</h3>
                  <div dangerouslySetInnerHTML={{ __html: svgDiagram }} />
                </div>
              )}
            </div>
          )}
        </>
      )}

      {mode === "upload" && (
        <>
          <input type="file" accept="image/*" onChange={handleImageUpload} className="mb-4" />
          {imagePreviewUrl && (
            <div className="mb-4">
              <img src={imagePreviewUrl} alt="Uploaded" className="w-64 h-auto rounded shadow" />
              <button
                onClick={handleAnalyzeImage}
                className="mt-2 bg-purple-600 text-white px-4 py-2 rounded"
              >
                Analyze Image
              </button>
            </div>
          )}

          {generatedCaption && (
            <div className="mt-4 p-4 bg-gray-100 border rounded">
              <strong>Caption:</strong>
              <p>{generatedCaption}</p>
              <button onClick={handlePost} className="mt-2 bg-green-600 text-white px-4 py-2 rounded">
                Post
              </button>
              {postStatus && <p className="mt-2 text-sm text-blue-600">Status: {postStatus}</p>}
            </div>
          )}

          {imageInsight && (
            <div className="p-4 bg-yellow-100 border rounded mt-2">
              <strong>Image Insight:</strong>
              <p>{imageInsight}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SmartSocial;







