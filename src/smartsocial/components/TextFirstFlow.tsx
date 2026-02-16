//src/smartsocial/components/TextFirstFlow.tsx

import { motion } from "framer-motion";

interface TextFirstFlowProps {
  userPrompt: string;
  setUserPrompt: (prompt: string) => void;
  onGenerate: () => void;
  loading: boolean;
}

const TONE_OPTIONS = [
  { emoji: "🎉", label: "Exciting", value: "exciting" },
  { emoji: "💼", label: "Professional", value: "professional" },
  { emoji: "😊", label: "Friendly", value: "friendly" },
  { emoji: "🤩", label: "Creative", value: "creative" },
  { emoji: "🔥", label: "Trendy", value: "trendy" },
  { emoji: "💡", label: "Educational", value: "educational" },
];

export default function TextFirstFlow({
  userPrompt,
  setUserPrompt,
  onGenerate,
  loading,
}: TextFirstFlowProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Start with Your Idea 💬
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Describe your post and we'll generate engaging content
        </p>
      </div>

      {/* Text Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="space-y-3">
          <label
            htmlFor="user-prompt"
            className="block text-lg font-semibold text-gray-900 dark:text-white"
          >
            What's on your mind? 💭
          </label>

          <textarea
            id="user-prompt"
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            placeholder="e.g., 'Grand opening for my cafe this Saturday with live music and special discounts...'"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-4 h-32 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          
          <div className="flex justify-between items-center">
            <p className={`text-sm ${
              userPrompt.length > 650 ? "text-red-500" : "text-gray-500 dark:text-gray-400"
            }`}>
              {userPrompt.length}/700 characters
            </p>
            {userPrompt.length > 0 && (
              <button
                onClick={() => setUserPrompt("")}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Tone Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Select tone (optional):
          </label>
          <div className="flex flex-wrap gap-2">
            {TONE_OPTIONS.map((tone) => (
              <button
                key={tone.value}
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-purple-300 dark:hover:border-purple-500 transition-colors text-sm flex items-center space-x-2"
              >
                <span>{tone.emoji}</span>
                <span>{tone.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onGenerate}
          disabled={loading || !userPrompt.trim()}
          className="w-full px-6 py-4 text-white rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 font-semibold text-lg transition-all shadow-lg"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Creating Your Post...</span>
            </div>
          ) : (
            "✨ Generate Post Content"
          )}
        </motion.button>
      </motion.div>

      {/* Info Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4"
      >
        <p className="text-sm text-blue-800 dark:text-blue-300">
          💡 <strong>Pro Tip:</strong> After generating your caption, you can choose to 
          upload your own image or generate an AI image that matches your content.
        </p>
      </motion.div>
    </div>
  );
}