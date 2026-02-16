// src/smartsocial/pages/onboarding/steps/Step4PlanSelector.tsx

import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Crown,
  Leaf,
  Rocket,
  Star,
} from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProgressBar } from "../../../components/ui/ProgressBar";
import { auth } from "../../../utils/firebase";
import { redirectToCheckout } from "../../../utils/stripeService";
import { updateOnboardingStep } from "../../../utils/userService";

const Step4PlanSelector: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<"free" | "pro" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [showMoreFeatures, setShowMoreFeatures] = useState(false);

  const handleFreePlan = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    const user = auth.currentUser;
    if (!user) {
      alert("⚠️ Please log in to continue.");
      setIsProcessing(false);
      return;
    }

    try {
      await updateOnboardingStep(user.uid, {
        plan: "free",
        progress: 4,
        completed: true,
        celebrated: false,
      });

      console.log("✅ Free plan selected & onboarding complete:", user.uid);
      navigate("/smartsocial/home", { replace: true });
    } catch (error) {
      console.error("❌ Failed to select free plan:", error);
      setIsProcessing(false);
    }
  };

  const handleProPlan = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    const user = auth.currentUser;
    if (!user) {
      alert("⚠️ Please log in to continue.");
      setIsProcessing(false);
      return;
    }

    try {
      await redirectToCheckout("price_YOUR_STRIPE_PRICE_ID", user.uid);
    } catch (error) {
      console.error("❌ Error selecting pro plan:", error);
      setIsProcessing(false);
    }
  };

  const FeatureItem = ({
    text,
    comingSoon = false,
  }: {
    text: string;
    comingSoon?: boolean;
  }) => (
    <li className="flex items-start py-1.5">
      <Check
        className={`mt-0.5 mr-3 flex-shrink-0 ${
          comingSoon ? "text-gray-300" : "text-green-500"
        }`}
        size={18}
      />
      <span
        className={`${
          comingSoon ? "text-gray-400 italic text-sm" : "text-gray-700"
        }`}
      >
        {text}
        {comingSoon && <span className="ml-2">(coming soon)</span>}
      </span>
    </li>
  );

  const PlanCard = ({
    title,
    subtitle,
    icon,
    price,
    description,
    features,
    isPro = false,
    onClick,
  }: {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    price: string;
    description: string;
    features: { text: string; comingSoon?: boolean }[];
    isPro?: boolean;
    onClick: () => void;
  }) => (
    <div
      className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${
        selectedPlan === (isPro ? "pro" : "free")
          ? "border-purple-500 shadow-2xl scale-[1.02]"
          : "border-gray-200 hover:border-purple-300 hover:shadow-xl"
      } ${isPro ? "bg-gradient-to-br from-purple-50 to-indigo-50" : "bg-white"}`}
    >
      {isPro && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10 animate-pulse">
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white px-6 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg">
            <Crown size={16} />
            ⭐ Most Popular
          </div>
        </div>
      )}

      <div className="text-center mb-5">
        <div className="flex justify-center mb-3">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 hover:scale-110 ${
              isPro
                ? "bg-gradient-to-r from-purple-500 to-pink-500"
                : "bg-gradient-to-r from-green-500 to-teal-500"
            } shadow-lg`}
          >
            {icon}
          </div>
        </div>

        <h3
          className={`text-xl font-bold mb-1 ${
            isPro ? "text-purple-700" : "text-green-700"
          }`}
        >
          {title}
        </h3>
        <p className="text-gray-600 text-sm mb-3">{subtitle}</p>

        <div className="flex items-baseline justify-center mb-2">
          <span className="text-3xl font-bold text-gray-900">{price}</span>
          {isPro && (
            <span className="text-gray-500 ml-2">
              {billingCycle === "monthly" ? "/month" : "/year"}
            </span>
          )}
        </div>
        <p className="text-gray-500 text-xs">{description}</p>
      </div>

      <div className="mb-5">
        <ul className="space-y-1">
          {features
            .filter((f) => !f.comingSoon)
            .map((feature, index) => (
              <FeatureItem key={index} text={feature.text} />
            ))}
        </ul>

        {isPro && (
          <div className="mt-3">
            <button
              className="text-xs text-purple-600 flex items-center gap-1 hover:underline"
              onClick={() => setShowMoreFeatures(!showMoreFeatures)}
            >
              {showMoreFeatures ? (
                <>
                  Hide extra features <ChevronUp size={14} />
                </>
              ) : (
                <>
                  Show coming soon features <ChevronDown size={14} />
                </>
              )}
            </button>

            {showMoreFeatures && (
              <ul className="space-y-1 mt-2">
                {features
                  .filter((f) => f.comingSoon)
                  .map((feature, index) => (
                    <FeatureItem
                      key={index}
                      text={feature.text}
                      comingSoon={true}
                    />
                  ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <button
        onClick={onClick}
        disabled={isProcessing}
        className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
          isPro
            ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            : "bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-md hover:shadow-lg"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isProcessing && selectedPlan === (isPro ? "pro" : "free") ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
            Processing...
          </>
        ) : (
          <>
            {isPro ? "Get Pro Plan" : "Start with Free"}
            <ArrowRight size={16} />
          </>
        )}
      </button>

      {!isPro && (
        <p className="text-xs text-gray-500 text-center mt-2">
          Upgrade to Pro anytime without losing your work.
        </p>
      )}
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 px-4 py-6">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-60 h-60 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-60 h-60 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-60 h-60 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-6xl w-full z-10">
        <div className="text-center mb-8">
          <ProgressBar currentStep={4} totalSteps={4} percentage={100} />
          <h1 className="text-4xl font-bold text-gray-900 mb-3 mt-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            🌱 Start free, 🚀 grow big. Upgrade anytime.
          </p>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <button
              className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                billingCycle === "monthly"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setBillingCycle("monthly")}
            >
              Monthly
            </button>
            <button
              className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                billingCycle === "yearly"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setBillingCycle("yearly")}
            >
              Yearly <span className="ml-1 text-xs text-green-500">Save 20%</span>
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <PlanCard
            title="🌱 Free Plan"
            subtitle="Great for individuals just getting started"
            icon={<Leaf className="text-white" size={26} />}
            price="$0"
            description="Perfect for trying out AI-powered social media"
            features={[
              { text: "5 AI-powered posts / month" },
              { text: "Basic post templates" },
              { text: "Standard image generation" },
              { text: "1 social media platform connection" },
              { text: "Analytics dashboard (read-only view)" },
              { text: "Access to community support" },
            ]}
            onClick={() => {
              setSelectedPlan("free");
              handleFreePlan();
            }}
          />

          <PlanCard
            title="🚀 Pro Plan"
            subtitle="Best for growing creators & businesses"
            icon={<Rocket className="text-white" size={26} />}
            price={billingCycle === "monthly" ? "$19" : "$190"}
            description="Everything you need for professional social media"
            isPro={true}
            features={[
              { text: "Unlimited AI-powered posts" },
              { text: "Advanced & customizable templates" },
              { text: "High-resolution image generation" },
              { text: "Connect 5+ social media platforms" },
              { text: "Advanced analytics & insights", comingSoon: true },
              { text: "Priority customer support" },
              { text: "Automated post scheduling", comingSoon: true },
              { text: "Brand kit preservation (logos, colors, fonts)", comingSoon: true },
              { text: "Multi-user collaboration tools", comingSoon: true },
              { text: "Content export options", comingSoon: true },
            ]}
            onClick={() => {
              setSelectedPlan("pro");
              handleProPlan();
            }}
          />
        </div>

        <div className="text-center mt-10 p-5 bg-white rounded-xl shadow-lg border border-gray-100 max-w-xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
              <Star className="text-blue-600" size={18} />
            </div>
            <h3 className="text-base font-semibold text-gray-800">No surprises</h3>
          </div>
          <p className="text-gray-600 text-sm">
            <span className="font-semibold">7-day money-back guarantee.</span>{" "}
            Upgrade, downgrade, or cancel anytime.
          </p>
        </div>
      </div>

      <style>{`
              @keyframes blob {
                0% {
                  transform: translate(0px, 0px) scale(1);
                }
                33% {
                  transform: translate(30px, -50px) scale(1.1);
                }
                66% {
                  transform: translate(-20px, 20px) scale(0.9);
                }
                100% {
                  transform: translate(0px, 0px) scale(1);
                }
              }
              .animate-blob {
                animation: blob 7s infinite;
              }
              .animation-delay-2000 {
                animation-delay: 2s;
              }
              .animation-delay-4000 {
                animation-delay: 4s;
              }
            `}</style>
    </div>
  );
};

export default Step4PlanSelector;
