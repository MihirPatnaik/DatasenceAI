// src/smartsocial/components/QuotaBar.tsx

/**
 * QuotaBar — listens to users/{uid}/quota/meta and displays captions/images usage.
 * Now uses the NEW field structure: usedCaptionQuota/captionQuota and usedImageQuota/imageQuota
 */

import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { getPlanLimits, PlanKey } from "../services/quotaService";
import { db } from "../utils/firebase";
import { useToast } from "./ui/use-toast";

type Props = {
  userId: string | null | undefined;
  compact?: boolean;
  planOverride?: PlanKey | null;
};

// NEW: Updated interface to match migrated structure
type QuotaDocShape = {
  usedCaptionQuota?: number;
  captionQuota?: number | null;
  usedImageQuota?: number;
  imageQuota?: number | null;
  usedPostQuota?: number;
  postQuota?: number | null;
  updatedAt?: any;
  [k: string]: any;
};

export default function QuotaBar({ userId, compact, planOverride = null }: Props) {
  const { toast } = useToast();
  const [quota, setQuota] = useState<QuotaDocShape | null>(null);
  const [planKey, setPlanKey] = useState<PlanKey | null>(planOverride);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    let unsubQuota: (() => void) | null = null;
    let cancelled = false;

    (async () => {
      try {
        // 1) If caller didn't pass planOverride, read user doc to derive onboarding.plan
        if (!planOverride) {
          try {
            const userRef = doc(db, "users", userId);
            const snap = await getDoc(userRef);
            const onboardingPlan = (snap.exists() && (snap.data() as any)?.onboarding?.plan) || "free";
            const normalized = onboardingPlan === "pro" ? ("pro_399" as PlanKey) : ("free" as PlanKey);
            setPlanKey(normalized);
          } catch (err) {
            console.warn("QuotaBar: failed to read user onboarding.plan, defaulting to free", err);
            setPlanKey("free");
          }
        }

        // 2) Ensure quota doc exists (defensive create). Path: users/{uid}/quota/meta
        const quotaRef = doc(db, "users", userId, "quota", "meta");
        const qSnap = await getDoc(quotaRef);

        // compute limits based on derived planKey (may be null temporarily)
        const derivedPlan = planOverride || (planKey ?? "free");
        const limits = getPlanLimits(derivedPlan as PlanKey);

        if (!qSnap.exists()) {
          // NEW: Create with correct field structure (start with 0 used)
          try {
            await setDoc(
              quotaRef,
              {
                usedCaptionQuota: 0,                    // Start with 0 used
                captionQuota: limits.captions,          // Total limit
                usedImageQuota: 0,                      // Start with 0 used
                imageQuota: limits.images,              // Total limit
                usedPostQuota: 0,                       // Start with 0 used
                postQuota: limits.posts ?? null,        // Total limit
                createdAt: serverTimestamp(),
                planKey: derivedPlan,
                migrated: false,
              },
              { merge: true }
            );
            console.log("QuotaBar: created missing quota doc for user", userId);
          } catch (createErr) {
            console.error("QuotaBar: failed to create quota doc:", createErr);
          }
        }

        // 3) Subscribe to quota doc
        unsubQuota = onSnapshot(quotaRef, (snapshot) => {
          if (cancelled) return;
          if (!snapshot.exists()) {
            setQuota(null);
            setLoading(false);
            return;
          }
          setQuota(snapshot.data() as QuotaDocShape);
          setLoading(false);
        }, (err) => {
          console.warn("QuotaBar snapshot error:", err);
          setLoading(false);
        });
      } catch (err) {
        console.warn("QuotaBar load failed:", err);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      try {
        unsubQuota?.();
      } catch (_) {}
    };
  }, [userId, planOverride, planKey]);

  // Early returns
  if (!userId) return null;
  if (loading) {
    return (
      <div className={`p-4 rounded-lg bg-white dark:bg-gray-800 ${compact ? "text-sm" : "text-base"}`}>
        <div className="animate-pulse space-y-2">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        </div>
      </div>
    );
  }

  // derive plan limits fallback
  const fallbackPlanKey = planKey ?? "free";
  const limits = getPlanLimits(fallbackPlanKey);

  // NEW: Get used counts and limits from quota doc or fallback to defaults
  const usedCaptionQuota = quota?.usedCaptionQuota ?? 0;
  const captionQuota = quota?.captionQuota ?? limits.captions;
  const usedImageQuota = quota?.usedImageQuota ?? 0;
  const imageQuota = quota?.imageQuota ?? limits.images;

  const isUnlimited = (val: number | null | undefined) => val === null;

  const renderLine = (
    label: string,
    used: number,
    limit: number | null | undefined,
    accent = "bg-indigo-600"
  ) => {
    const total = limit ?? 0;
    const remaining = isUnlimited(limit) ? null : Math.max(0, total - used);
    const pct = total === 0 ? 0 : Math.round(Math.max(0, Math.min(100, (used / total) * 100)));
    
    return (
      <div key={label} className="space-y-1">
        <div className="flex justify-between text-xs">
          {/* FIX: Add dark mode text colors */}
          <span className="text-gray-600 dark:text-gray-300">{label}</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {isUnlimited(limit) ? "Unlimited" : `${used} / ${total}`}
          </span>
        </div>
        <div
          className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2"
          role="progressbar"
          aria-label={`${label} used`}
          aria-valuenow={Math.round(pct)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={`h-2 rounded-full ${accent}`}
            style={{ width: isUnlimited(limit) ? "100%" : `${pct}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className={`p-4 rounded-lg bg-white dark:bg-gray-800 border dark:border-gray-700 ${compact ? "text-sm" : "text-base"}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold text-gray-900 dark:text-white">Quota</div> {/* FIX */}
        <button
          onClick={() => toast({ title: "Upgrade to Pro for unlimited usage", duration: 3000 })}
          className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
        >
          Upgrade
        </button>
      </div>

      <div className="space-y-3">
        {renderLine("Captions", usedCaptionQuota, captionQuota, "bg-purple-600")}
        {renderLine("Images", usedImageQuota, imageQuota, "bg-blue-600")}
      </div>
    </div>
  );
}