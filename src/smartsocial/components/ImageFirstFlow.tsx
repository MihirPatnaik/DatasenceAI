//src/smartsocial/components/ImageFirstFlow.tsx


import { motion } from "framer-motion";
import { ImageUploader } from "./media/ImageUploader";

interface ImageFirstFlowProps {
  imageUrl: string | null;
  setImageUrl: (url: string | null) => void;
  postContext: string;
  setPostContext: (context: string) => void;
  onGenerate: () => void;
  loading: boolean;
}

const CONTEXT_OPTIONS = [
  { emoji: "🛍️", label: "Product Launch", value: "product launch" },
  { emoji: "🎉", label: "Event", value: "event" },
  { emoji: "📢", label: "Announcement", value: "announcement" },
  { emoji: "🍔", label: "Food", value: "food" },
  { emoji: "👗", label: "Fashion", value: "fashion" },
  { emoji: "💡", label: "Educational", value: "educational" },
  { emoji: "🔥", label: "Promotion", value: "promotion" },
  { emoji: "✨", label: "Behind Scenes", value: "behind scenes" },
];

export default function ImageFirstFlow({
  imageUrl,
  setImageUrl,
  postContext,
  setPostContext,
  onGenerate,
  loading,
}: ImageFirstFlowProps) {
  const handleContextSelect = (value: string) => {
    setPostContext(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Start with Your Image 🖼️
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Upload your visual and we'll create the perfect caption
        </p>
      </div>

      {/* Image Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Upload Your Image
        </h3>
        <ImageUploader
          onImageUploaded={(url) => setImageUrl(url)}
          onImageRemoved={() => setImageUrl(null)}
          existingImageUrl={imageUrl || undefined}
        />
      </motion.div>

      {/* Context Selection */}
      {imageUrl && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-4"
        >
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              What's this about? 💭
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Help AI understand your image better
            </p>
            
            {/* Quick Context Options */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {CONTEXT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleContextSelect(option.value)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    postContext === option.value
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                      : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500"
                  }`}
                >
                  <div className="text-lg mb-1">{option.emoji}</div>
                  <div className="text-xs font-medium">{option.label}</div>
                </button>
              ))}
            </div>

            {/* Custom Context Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Or add specific details:
              </label>
              <textarea
                value={postContext}
                onChange={(e) => setPostContext(e.target.value)}
                placeholder="e.g., 'New summer collection launching this weekend with special discounts...'"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 h-20 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
          </div>

          {/* Generate Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onGenerate}
            disabled={loading || !imageUrl}
            className="w-full px-6 py-4 text-white rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 font-semibold text-lg transition-all shadow-lg"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating Your Post...</span>
              </div>
            ) : (
              "✨ Generate Post for This Image"
            )}
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}