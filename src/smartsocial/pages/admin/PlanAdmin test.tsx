//src/smartsocial/pages/admin/PlanAdmin.tsx

import React, { useEffect, useState } from "react";
import { httpsCallable } from "firebase/functions";
import { functions, auth, db } from "../../utils/firebase";
import { getPlan, getPlanFeatures } from "../../services/planService";
import { useToast } from "../../components/ui/use-toast";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Loader2, Save, RefreshCw, Shield, Database, Zap } from "lucide-react";

interface PlanAdminProps {
  planId: string;
}

export default function PlanAdmin({ planId }: PlanAdminProps) {

  // ✅ Get toast function from the hook

  const { toast } = useToast();
  const [features, setFeatures] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [planMeta, setPlanMeta] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const isEmulator =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  // 🔑 Auto sign-in to Auth Emulator
  useEffect(() => {
    if (isEmulator && !auth.currentUser) {
      console.log("⚡ Auto signing in test user (Auth Emulator)...");
      signInWithEmailAndPassword(auth, "test@example.com", "password123")
        .then((res) =>
          console.log("✅ Signed in as emulator user:", res.user.uid)
        )
        .catch((err) =>
          console.error("❌ Emulator auto sign-in failed:", err)
        );
    }
  }, [isEmulator]);

  // 🔍 Direct Firestore check
  const checkFirestoreDirectly = async () => {
    try {
      toast({
        title: "Checking Firestore",
        description: `Fetching latest data for ${planId} plan…`,
      });

      const planDoc = await getDoc(doc(db, "plans", planId));
      if (planDoc.exists()) setPlanMeta(planDoc.data());

      const featuresSnapshot = await getDocs(
        collection(db, "plans", planId, "planFeatures")
      );

      const featuresData: Record<string, any> = {};
      featuresSnapshot.forEach((doc) => {
        featuresData[doc.id] = doc.data();
      });

      if (Object.keys(featuresData).length > 0) {
        const flattened = Object.fromEntries(
          Object.entries(featuresData).map(([k, v]) => [k, v?.value ?? v])
        );
        setFeatures(flattened);

        toast({
          title: "Data Synced",
          description: `Latest ${planId} features loaded.`,
        });
      }
    } catch (error) {
      console.error("❌ Direct Firestore check failed:", error);
      toast({
        title: "Firestore Error",
        description: "Could not fetch data. Check logs.",
        variant: "destructive",
      });
    }
  };

  // 🔄 Fetch plan + features
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const meta = await getPlan(planId);
        setPlanMeta(meta);

        const feats = await getPlanFeatures(planId);
        if (feats && Object.keys(feats).length > 0) {
          const flat = Object.fromEntries(
            Object.entries(feats).map(([k, v]: [string, any]) => [
              k,
              v?.value ?? v,
            ])
          );
          setFeatures(flat);
        } else {
          await checkFirestoreDirectly();
        }
      } catch (err) {
        console.error("❌ fetchData failed:", err);
        await checkFirestoreDirectly();
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [planId]);

  // 💾 Save changes
  // In your saveChanges function:
async function saveChanges() {
  try {
    setIsSaving(true);
    
    // Show saving toast and get reference to update it later
    const savingToast = toast({
      title: "Saving Changes",
      description: `Updating ${planId} features…`,
      duration: 0, // Don't auto-dismiss
    });

    const adminUpdatePlan = httpsCallable(functions, "adminUpdatePlan");
    const result = await adminUpdatePlan({
      planId,
      features,
    });

    console.log("✅ Save success:", result.data);

    // Update the existing toast instead of creating a new one
    savingToast.update({
      title: "Changes Saved",
      description: `All updates applied to ${planId} successfully.`,
      variant: "default",
      duration: 5000, // Auto-dismiss after 5 seconds
    });
  } catch (err: any) {
    console.error("❌ saveChanges error:", err);
    toast({
      title: "Save Failed",
      description: err.message || "Unable to update features. Try again.",
      variant: "destructive",
      duration: 5000,
    });
  } finally {
    setIsSaving(false);
  }
}

  // 🔄 Force test update
  async function forceTestUpdate() {
  try {
    // Show the initial toast and get the toast object
    const testToast = toast({
      title: "Sending Test Update…",
      description: "Promoting test user to Pro plan…",
      duration: 0, // Don't auto-dismiss initially
    });

    const adminUpdatePlan = httpsCallable(functions, "adminUpdatePlan");
    const result = await adminUpdatePlan({
      uid: auth.currentUser?.uid,
      newPlan: "Pro",
    });

    console.log("✅ Callable function success:", result.data);

    // Update the existing toast instead of creating a new one
    testToast.update({
      title: "Test Update Sent",
      description: `User ${auth.currentUser?.uid} upgraded to Pro.`,
      duration: 5000, // Auto-dismiss after 5 seconds
    });
  } catch (err: any) {
    console.error("❌ forceTestUpdate error:", err);
    toast({
      title: "Update Failed",
      description: err.message || "Unable to run test update.",
      variant: "destructive",
      duration: 5000,
    });
  }
}

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">
          Loading {planId} plan features…
        </h2>
        <p className="text-gray-500 mt-2">Please wait while we fetch the data</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Shield className="h-7 w-7" />
                Plan Administration
              </h1>
              <p className="mt-1 opacity-90">Manage your subscription plans and features</p>
            </div>
            <div className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium">
              Active Plan: <span className="font-bold">{planId}</span>
            </div>
          </div>
        </div>

        {/* Emulator Warning */}
        {isEmulator && (
          <div className="bg-yellow-50 border-b border-yellow-200 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Running in emulator mode</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Do not use with production credentials. Auto-signed in as test@example.com</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="p-6">
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={forceTestUpdate}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Zap className="h-4 w-4 mr-2" />
              Force Test Update
            </button>
            
            <button
              onClick={checkFirestoreDirectly}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Database className="h-4 w-4 mr-2" />
              Re-check Firestore Data
            </button>
          </div>

          {/* Debug Info */}
          <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <svg className="h-5 w-5 text-gray-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Debug Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Plan Metadata</h4>
                <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
                  {planMeta ? JSON.stringify(planMeta, null, 2) : "No plan metadata available"}
                </pre>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Features ({Object.keys(features).length})</h4>
                <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
                  {JSON.stringify(features, null, 2)}
                </pre>
              </div>
            </div>
          </div>

          {/* Features Editor */}
<div className="mb-6">
  <h3 className="text-lg font-medium text-gray-900 mb-4">Plan Features Editor</h3>
  
  <div className="bg-white shadow overflow-hidden sm:rounded-md">
    <ul className="divide-y divide-gray-200">
      {Object.entries(features).map(([key, val]) => {
        // Handle complex objects by showing their string representation
        const displayValue = typeof val === 'object' && val !== null 
          ? JSON.stringify(val) 
          : String(val);
        
        let inputType: "text" | "number" | "checkbox" = "text";
        if (typeof val === "number") inputType = "number";
        if (typeof val === "boolean") inputType = "checkbox";

        return (
          <li key={key} className="px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-gray-900 truncate">{key}</span>
                <span className="text-xs text-gray-500 mt-1">
                  Current value: {displayValue}
                </span>
              </div>
              
              <div className="flex-shrink-0 ml-4">
                {inputType === "checkbox" ? (
                  <div className="flex items-center">
                    <label htmlFor={key} className="sr-only">Toggle {key}</label>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input
                        id={key}
                        type="checkbox"
                        checked={Boolean(val)}
                        onChange={(e) =>
                          setFeatures((prev) => ({
                            ...prev,
                            [key]: e.target.checked,
                          }))
                        }
                        className="sr-only"
                      />
                      <div className={`block w-10 h-6 rounded-full ${Boolean(val) ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                      <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${Boolean(val) ? 'transform translate-x-4' : ''}`}></div>
                    </div>
                    <span className="text-xs text-gray-700">{Boolean(val) ? 'Enabled' : 'Disabled'}</span>
                  </div>
                ) : (
                  <input
                    type={inputType}
                    className="border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={typeof val === 'object' ? JSON.stringify(val) : val === null ? "" : String(val)}
                    placeholder={inputType === "number" ? "Enter number" : "Enter value"}
                    onChange={(e) =>
                      setFeatures((prev) => ({
                        ...prev,
                        [key]:
                          inputType === "number"
                            ? e.target.value === "" ? null : Number(e.target.value)
                            : e.target.value,
                      }))
                    }
                  />
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  </div>
</div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={saveChanges}
              disabled={isSaving}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isSaving
                  ? "bg-purple-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}