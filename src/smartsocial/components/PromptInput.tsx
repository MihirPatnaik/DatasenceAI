//D:\datasenceai\src\smartsocial\components\PromptInput.tsx


import { useState } from "react";
import { enhancePrompt } from "../server/agents/promptEnhancerAgent";

export default function PromptInput({
  prompt,
  setPrompt,
  setEnhancedPrompt,
  onNext
}: {
  prompt: string;
  setPrompt: (val: string) => void;
  setEnhancedPrompt: (val: string) => void;
  onNext: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleEnhance = async () => {
    if (!prompt.trim()) {
      alert("Please enter a prompt first.");
      return;
    }
    setLoading(true);
    try {
      const enhanced = await enhancePrompt(prompt);
      setEnhancedPrompt(enhanced);
      onNext();
    } catch (err) {
      console.error("Enhancement failed:", err);
      alert("Prompt enhancement failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt..."
        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
        rows={4}
        disabled={loading}
      />
      <button
        onClick={handleEnhance}
        className={`px-6 py-2 text-white rounded-lg ${
          loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
        }`}
        disabled={loading}
      >
        {loading ? "Enhancing..." : "Next"}
      </button>
    </div>
  );
}
