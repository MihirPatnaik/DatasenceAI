// src/smartsocial/pages/admin/PlanAdmin.tsx

import React, { useEffect, useState, useRef } from "react";
import { httpsCallable, HttpsCallableResult } from "firebase/functions";
import { functions, auth, db } from "../../utils/firebase";
import { getPlan, getPlanFeatures } from "../../services/planService";
import { useToast } from "../../components/ui/use-toast";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { signInWithEmailAndPassword, User } from "firebase/auth";
import {
  Loader2,
  Save,
  Shield,
  Database,
  Zap,
  Lock,
  LogIn,
  AlertCircle,
} from "lucide-react";

interface PlanAdminProps {
  planId: string;
}

interface PlanFeatures {
  [key: string]: any;
}

interface AdminUpdatePlanRequest {
  planId: string;
  features: PlanFeatures;
  uid?: string;
  newPlan?: string;
}

interface AdminUpdatePlanResponse {
  success: boolean;
  message: string;
  updatedFeatures?: PlanFeatures;
}

export default function PlanAdmin({ planId }: PlanAdminProps) {
  const { toast } = useToast();
  const [features, setFeatures] = useState<PlanFeatures>({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const isEmulator =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  // Refs
  const saveTimer = useRef<number | null>(null);
  const unmounted = useRef(false);
  const authCheckCompleted = useRef(false);
  const dataLoadAttempted = useRef(false);

  useEffect(() => {
    return () => {
      unmounted.current = true;
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, []);

  // ✅ Simplified auth check
  useEffect(() => {
    if (authCheckCompleted.current) return;

    console.log("🔄 Starting auth check...");
    
    const checkAuth = async () => {
      try {
        // Wait for auth to be ready
        await auth.authStateReady();
        const user = auth.currentUser;
        
        if (user) {
          console.log("👤 User found:", user.email);
          const tokenResult = await user.getIdTokenResult(true);
          const adminStatus = !!tokenResult.claims.admin;
          console.log("✅ Admin status:", adminStatus);
          
          setIsAdmin(adminStatus);
          setCurrentUser(user);
        } else {
          console.log("❌ No user found");
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("❌ Auth check failed:", error);
        setIsAdmin(false);
      } finally {
        setAuthChecked(true);
        authCheckCompleted.current = true;
      }
    };

    checkAuth();
  }, []);

  // 🔄 Load plan data after auth confirmation
  useEffect(() => {
    if (!authChecked || isAdmin !== true || dataLoadAttempted.current) {
      return;
    }

    console.log("✅ Auth confirmed, loading plan data...");
    loadPlanData();
  }, [authChecked, isAdmin, planId]);

  const loadPlanData = async () => {
  if (unmounted.current || dataLoadAttempted.current) return;

  dataLoadAttempted.current = true;
  setLoading(true);
  setLoadError(null);

  console.log("📥 Loading data for plan:", planId);

  try {
    // 🔥 Try Firestore first
    await loadFromFirestoreDirectly();

    // 🔄 Optionally update from planService in background
    getPlanFeatures(planId)
      .then((feats) => {
        if (feats && Object.keys(feats).length > 0) {
          const flattened = Object.fromEntries(
            Object.entries(feats).map(([k, v]) => [k, v?.value ?? v])
          );
          setFeatures(flattened);
          console.log("✅ Updated features from planService");
        } else {
          console.warn("⚠️ planService returned no features");
        }
      })
      .catch((err) => {
        console.warn("⚠️ planService failed:", err.message);
      });
  } catch (error) {
    console.error("❌ loadPlanData failed:", error);
    setLoadError(
      "Failed to load plan data: " +
        (error instanceof Error ? error.message : "Unknown error")
    );
  } finally {
    if (!unmounted.current) {
      setLoading(false);
    }
  }
};

 const loadFromFirestoreDirectly = async () => {
  try {
    console.log("🔥 Loading directly from Firestore...");

    // Load main plan doc (root fields)
    const planRef = doc(db, "plans", planId);
    const planSnap = await getDoc(planRef);
    const featuresData: PlanFeatures = {};

    if (planSnap.exists()) {
      console.log("📄 Plan root fields:", planSnap.data());
      Object.assign(featuresData, planSnap.data()); // include root fields
    } else {
      console.warn("⚠️ No root plan doc found for:", planId);
    }

    // Load subcollection planFeatures
    const featuresSnapshot = await getDocs(
      collection(db, "plans", planId, "planFeatures")
    );

    console.log("📑 Subcollection size:", featuresSnapshot.size);

    featuresSnapshot.forEach((doc) => {
      featuresData[doc.id] = doc.data();
    });

    if (Object.keys(featuresData).length > 0) {
      const flattened = Object.fromEntries(
        Object.entries(featuresData).map(([key, value]) => [
          key,
          value?.value ?? value,
        ])
      );
      setFeatures(flattened);
      console.log("✅ Firestore data loaded:", flattened);
      setLoadError(null);
    } else {
      console.warn("⚠️ No data found in Firestore for plan:", planId);
      setFeatures({});
      setLoadError(null); // allow UI to render editor (empty state)
    }
  } catch (error) {
    console.error("❌ Firestore load failed:", error);
    setLoadError(
      "Failed to load from Firestore: " +
        (error instanceof Error ? error.message : "Unknown error")
    );
  }
};

  const retryLoadData = () => {
    dataLoadAttempted.current = false;
    setLoadError(null);
    setLoading(true);
    loadPlanData();
  };

  // 💾 Save functionality
  const queueSave = (delay = 2000) => {
    if (saveTimer.current) {
      window.clearTimeout(saveTimer.current);
    }

    if (!planId || Object.keys(features).length === 0) {
      toast({
        title: "Cannot Save",
        description: "No data available to save.",
        variant: "destructive",
      });
      return;
    }

    saveTimer.current = window.setTimeout(performSave, delay);
  };

  const performSave = async () => {
    if (unmounted.current || !currentUser) return;

    setIsSaving(true);
    const saveToast = toast({
      title: "Saving Changes",
      description: "Updating plan features...",
      duration: 0,
    });

    try {
      console.log("🚀 Saving features for plan:", planId);
      
      const adminUpdatePlan = httpsCallable<AdminUpdatePlanRequest, AdminUpdatePlanResponse>(
        functions, 
        "adminUpdatePlan"
      );
      
      const result = await adminUpdatePlan({
        planId,
        features,
        uid: currentUser.uid
      });

      console.log("✅ Save successful:", result.data);
      
      saveToast.update({
        id: saveToast.id,
        title: "Changes Saved",
        description: result.data.message || "Plan updated successfully.",
        variant: "default",
      });
    } catch (error: any) {
      console.error("❌ Save failed:", error);
      
      saveToast.update({
        id: saveToast.id,
        title: "Save Failed",
        description: error?.message || "Save operation failed",
        variant: "destructive",
      });
    } finally {
      if (!unmounted.current) {
        setIsSaving(false);
      }
    }
  };

  // 🚫 Render loading states
  if (!authChecked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Checking Access...</h2>
        <p className="text-sm text-gray-500 mt-2">Verifying admin permissions</p>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <Lock className="h-10 w-10 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-800">Access Denied</h2>
        <p className="text-gray-600 mt-2">Admin privileges required.</p>
        {currentUser && (
          <div className="mt-4 p-3 bg-gray-100 rounded-md">
            <p className="text-sm text-gray-600">Signed in as: {currentUser.email}</p>
          </div>
        )}
        <button
          onClick={() => auth.signOut()}
          className="mt-4 inline-flex items-center px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800"
        >
          <LogIn className="h-4 w-4 mr-2" />
          Sign Out
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Loading Plan Data...</h2>
        {currentUser && (
          <p className="text-sm text-gray-500 mt-2">
            Signed in as: {currentUser.email} (Admin)
          </p>
        )}
        {loadError && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md max-w-md text-center">
            <AlertCircle className="h-5 w-5 text-yellow-600 mx-auto mb-2" />
            <p className="text-sm text-yellow-700">{loadError}</p>
          </div>
        )}
        <button 
          onClick={retryLoadData}
          className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Loader2 className="h-4 w-4 mr-2" />
          Retry Loading
        </button>
      </div>
    );
  }

  // ✅ Main render
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
              {currentUser && (
                <p className="text-blue-100 text-sm mt-1">
                  Signed in as: {currentUser.email} (Admin)
                </p>
              )}
            </div>
            <div className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium">
              Plan: <span className="font-bold">{planId}</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Status Bar */}
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex justify-between items-center text-sm">
              <span>Status: <strong className="text-green-600">Ready</strong></span>
              <span>Features: <strong>{Object.keys(features).length}</strong></span>
              <span>User: <strong>{currentUser?.email}</strong></span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={retryLoadData}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <Database className="h-4 w-4 mr-2" />
              Reload Data
            </button>
          </div>

          {/* Features Editor */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Plan Features Editor
            </h3>
            
            {Object.keys(features).length === 0 ? (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p>No features found for this plan.</p>
                <button 
                  onClick={retryLoadData}
                  className="mt-3 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Try reloading data
                </button>
              </div>
            ) : (
              <div className="border rounded-lg divide-y">
                {Object.entries(features).map(([key, value]) => (
                  <div key={key} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {key}
                        </label>
                        <span className="text-xs text-gray-500">
                          Current: {String(value ?? 'null')}
                        </span>
                      </div>
                      <div className="w-48">
                        <input
                          type="text"
                          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={String(value ?? '')}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            setFeatures(prev => ({
                              ...prev,
                              [key]: newValue
                            }));
                            queueSave();
                          }}
                          placeholder="Enter value..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Save Section */}
          <div className="flex justify-between items-center pt-6 border-t">
            <div className="text-sm text-gray-500">
              {Object.keys(features).length > 0 ? "Changes auto-save 2 seconds after editing" : "No features to edit"}
            </div>
            <button
              onClick={() => queueSave(0)}
              disabled={isSaving || Object.keys(features).length === 0}
              className="inline-flex items-center px-6 py-2 rounded-md text-sm font-medium shadow-sm text-white bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Saving...
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