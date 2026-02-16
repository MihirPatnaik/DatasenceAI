// src/smartsocial/pages/onboarding/steps/Step3Quiz.tsx

import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProgressBar } from "../../../components/ui/ProgressBar";
import { auth } from "../../../utils/firebase";
import { updateOnboardingStep } from "../../../utils/userService";

const Step3Quiz: React.FC = () => {
  const navigate = useNavigate();

  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const [brandVibe, setBrandVibe] = useState("");
  const [campaignType, setCampaignType] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const trimmed = {
    businessName: businessName.trim(),
    industry: industry.trim(),
    brandVibe: brandVibe.trim(),
    campaignType: campaignType.trim(),
  };

  const canSubmit = useMemo(
    () =>
      !!trimmed.businessName &&
      !!trimmed.industry &&
      !!trimmed.brandVibe &&
      !!trimmed.campaignType &&
      !isSaving,
    [trimmed.businessName, trimmed.industry, trimmed.brandVibe, trimmed.campaignType, isSaving]
  );

  const handleSubmit = async () => {
    if (!auth.currentUser) return;
    if (!canSubmit) {
      alert("⚠️ Please fill out all fields before continuing.");
      return;
    }

    try {
      setIsSaving(true);

      await updateOnboardingStep(auth.currentUser.uid, {
        businessName: trimmed.businessName,
        industry: trimmed.industry,
        brandVibe: trimmed.brandVibe,
        campaignType: trimmed.campaignType,
        progress: 2,       // ✅ step 2 progress
        completed: false,  // ✅ not yet completed
        celebrated: false, // ✅ ensure home can later trigger confetti
      });

      console.log("✅ Step2 data saved:", trimmed);

      // ✅ go to step3 next (not back to step2)
      navigate("../onboarding/step2");
    } catch (error) {
      console.error("❌ Error saving quiz:", error);
      alert("Something went wrong saving your info. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
        {/* ✅ ProgressBar for step2 */}
        {/* <ProgressBar currentStep={2} totalSteps={4} /> */}
        <ProgressBar currentStep={2} totalSteps={4} percentage={50} />

        <h2 className="text-xl font-bold mb-6 text-gray-800">
          Tell Us About Your Brand 💡
        </h2>

        {/* Business Name */}
        <input
          type="text"
          placeholder="Business Name (e.g. TechGuard)"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
        />

        {/* Industry */}
        <input
          type="text"
          placeholder="Industry (e.g. AI, Café, Fitness)"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
        />

        {/* Brand Vibe */}
        <select
          value={brandVibe}
          onChange={(e) => setBrandVibe(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Select Brand Vibe</option>
          <option value="friendly">Friendly & Welcoming</option>
          <option value="professional">Professional & Expert</option>
          <option value="fun">Playful & Fun</option>
          <option value="luxury">Premium & Luxury</option>
        </select>

        {/* Campaign Type */}
        <select
          value={campaignType}
          onChange={(e) => setCampaignType(e.target.value)}
          className="w-full mb-6 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Select Campaign Type</option>
          <option value="launch">Product Launch</option>
          <option value="sale">Promotion / Sale</option>
          <option value="event">Event Marketing</option>
          <option value="announcement">General Announcement</option>
        </select>

        {/* Save Button */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed transition font-semibold"
        >
          {isSaving ? "Saving..." : "Save & Continue →"}
        </button>
      </div>
    </div>
  );
};

export default Step3Quiz;
