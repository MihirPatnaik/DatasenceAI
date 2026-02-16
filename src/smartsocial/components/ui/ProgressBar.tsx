// src/smartsocial/components/ui/ProgressBar.tsx

import React, { useEffect, useMemo, useState } from "react";
import Confetti from "react-confetti";
import { motion } from "framer-motion";

interface ProgressBarProps {
  currentStep: number;      // 1-based
  totalSteps: number;       // >= 1
  startAtZero?: boolean;    // keep for API compatibility (default false)
  showMessages?: boolean;
  showConfetti?: boolean;
  className?: string;
  percentage?: number;      // 👈 manual override
}

const stepMessages = [
  "🚀 Getting to Know Your Business",
  "✨ Defining Your Brand Vibe",
  "🪄 Crafting Your Content Strategy",
  "🎯 Setup Complete! Ready to Shine!"
];

export function ProgressBar({
  currentStep,
  totalSteps,
  startAtZero = false,
  showMessages = true,
  showConfetti = true,
  className = "",
  percentage: percentageOverride, // 👈 pick prop
}: ProgressBarProps) {
  // Normalize step index
  const stepsOneBased = useMemo(() => {
    if (!Number.isFinite(totalSteps) || totalSteps < 1) return 1;
    return Math.max(1, Math.min(currentStep, totalSteps));
  }, [currentStep, totalSteps]);

  // Either use provided percentage or auto-calc
  const percentage = useMemo(() => {
    if (typeof percentageOverride === "number") {
      return Math.max(0, Math.min(percentageOverride, 100)); // clamp 0–100
    }
    if (totalSteps <= 1) return 100;
    return Math.round(((stepsOneBased - 1) / (totalSteps - 1)) * 100);
  }, [stepsOneBased, totalSteps, percentageOverride]);

  const [confettiOn, setConfettiOn] = useState(false);
  const [viewport, setViewport] = useState<{ width: number; height: number } | null>(null);

  // Handle confetti trigger
  useEffect(() => {
    if (percentage === 100 && showConfetti) {
      setConfettiOn(true);
      const t = setTimeout(() => setConfettiOn(false), 4000);
      return () => clearTimeout(t);
    }
  }, [percentage, showConfetti]);

  // Handle window size safely (SSR proof)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Progress message selection
  const progressMessage = useMemo(() => {
    if (!showMessages) return null;
    if (percentage === 100) return stepMessages[stepMessages.length - 1];
    const idx = Math.min(
      stepMessages.length - 2,
      Math.floor((percentage / 100) * (stepMessages.length - 1))
    );
    return stepMessages[idx] ?? stepMessages[0];
  }, [percentage, showMessages]);

  return (
    <div className={`relative w-full mb-6 ${className}`} aria-label="Onboarding progress">
      {/* Confetti */}
      {confettiOn && viewport && (
        <Confetti
          width={viewport.width}
          height={viewport.height}
          recycle={false}
          numberOfPieces={250}
          gravity={0.3}
          colors={["#6e8efb", "#a777e3", "#ff6b6b", "#4ecdc4", "#f9c74f"]}
        />
      )}

      {/* Step + % */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium text-gray-700">
          Step {stepsOneBased} of {Math.max(1, totalSteps)}
        </span>
        <span className="text-sm font-semibold text-blue-600">
          {percentage}% Complete
        </span>
      </div>

      {/* Bar */}
      <div
        className="w-full bg-gray-200 rounded-full h-3 shadow-inner overflow-hidden"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 relative"
        >
          <motion.div
            animate={{ x: ["-100%", "100%"] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-1/3"
          />
        </motion.div>
      </div>

      {/* Message */}
      {showMessages && progressMessage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mt-3 text-sm font-medium text-gray-600"
        >
          {progressMessage}
        </motion.div>
      )}
    </div>
  );
}
