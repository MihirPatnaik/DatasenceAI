// src/smartsocial/pages/admin/PlanAdmin.tsx

import React, { useEffect, useState } from "react";
import { httpsCallable } from "firebase/functions";
import { functions, auth, db } from "../../utils/firebase";
import { useToast } from "../../components/ui/use-toast";
import { collection, getDocs } from "firebase/firestore";
import { Loader2, Save, Shield, Database, TestTube } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PlanAdminProps {
  planId: string;
}

export default function PlanAdmin({ planId }: PlanAdminProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [features, setFeatures] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [saveStatus, setSaveStatus] = useState<string>("");

  // ✅ Test Firebase functions connectivity
  useEffect(() => {
    const testFunctions = async () => {
      try {
        const testFunction = httpsCallable(functions, 'adminUpdatePlan');
        console.log("✅ Firebase Functions module loaded successfully");
      } catch (error) {
        console.error("❌ Firebase Functions module failed to load:", error);
        toast({
          title: "Module Error",
          description: "Failed to load Firebase functions. Check your connection.",
          variant: "destructive",
        });
      }
    };
    
    testFunctions();
  }, [toast]);

  // ✅ Check admin claim
  useEffect(() => {
    const checkAdmin = async () => {
      const user = auth.currentUser;
      if (!user) {
        setIsAdmin(false);
        return;
      }
      try {
        const token = await user.getIdTokenResult(true);
        console.log("🔑 Token claims:", token.claims);
        setIsAdmin(!!token.claims.admin);
      } catch {
        setIsAdmin(false);
      }
    };
    const unsub = auth.onAuthStateChanged(() => checkAdmin());
    return () => unsub();
  }, []);

  // 🔍 Firestore load function (reusable)
  const fetchData = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "plans", planId, "planFeatures"));
      const feats: Record<string, any> = {};
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`📄 Raw data for ${doc.id}:`, data);
        
        // ✅ Extract the value property correctly
        if (data && typeof data === 'object' && data.value !== undefined) {
          feats[doc.id] = data.value;
        } else {
          feats[doc.id] = data;
        }
      });
      
      console.log("✅ FINAL Extracted features:", feats);
      setFeatures(feats);
    } catch (err) {
      console.error("❌ fetchData failed:", err);
      toast({
        title: "Load Error",
        description: "Failed to load plan data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Firestore load - FIXED data extraction
  useEffect(() => {
    fetchData();
  }, [planId, toast]);

  // ✅ FIXED Manual save function - prevents nesting
  const handleSave = async () => {
    console.log("🔍 SAVE BUTTON CLICKED - Starting save process...");
    console.log("📦 Features to save:", features);
    
    try {
      setIsSaving(true);
      setSaveStatus("Starting save...");
      
      // ✅ CLEANER: Send direct values without extra wrapping
      const featuresToSave: Record<string, any> = {};
      Object.entries(features).forEach(([key, value]) => {
        // If value is already an object with value property, use it as is
        // Otherwise, wrap it in {value: actualValue}
        if (value && typeof value === 'object' && 'value' in value) {
          featuresToSave[key] = value;
        } else {
          featuresToSave[key] = { value: value };
        }
        console.log(`📤 Preparing ${key}:`, value);
      });

      console.log("🚀 Sending to Firebase function:", { planId, features: featuresToSave });
      setSaveStatus("Calling Firebase function...");
      
      const adminUpdatePlan = httpsCallable(functions, "adminUpdatePlan");
      const result = await adminUpdatePlan({ planId, features: featuresToSave });
      
      console.log("✅ Save SUCCESSFUL:", result.data);
      setSaveStatus("Saved successfully!");
      
      // ✅ RELOAD DATA after save to get clean values
      await fetchData();
      
      toast({ 
        title: "Changes Saved!", 
        description: "Plan features updated successfully.",
        duration: 5000 
      });
      
    } catch (err: any) {
      console.error("❌ SAVE ERROR:", err);
      
      let errorMessage = "Unknown error occurred";
      if (err.code) {
        errorMessage = `Error ${err.code}: ${err.message}`;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setSaveStatus("Save failed!");
      toast({ 
        title: "Save Failed", 
        description: errorMessage, 
        variant: "destructive",
        duration: 10000 
      });
      
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(""), 5000);
    }
  };

  // ✅ Test Connection Function
  const testConnection = async () => {
    try {
      setSaveStatus("Testing connection...");
      console.log("🔍 Testing Firebase connection...");
      
      const testFunction = httpsCallable(functions, 'adminUpdatePlan');
      const result = await testFunction({ 
        planId: 'test-plan', 
        features: { test: { value: 'test' } } 
      });
      
      console.log("✅ Connection Test result:", result);
      setSaveStatus("Connection test successful!");
      toast({ 
        title: "Connection Test", 
        description: "Function call successful!",
        duration: 3000 
      });
    } catch (error: any) {
      console.error("❌ Connection Test error:", error);
      
      setSaveStatus("Connection test failed!");
      let errorMessage = error.code ? `Error ${error.code}: ${error.message}` : error.message;
      
      toast({ 
        title: "Connection Test Failed", 
        description: errorMessage,
        variant: "destructive",
        duration: 5000 
      });
    }
  };

  // Debug function to see values
  const debugFeatureValues = () => {
    console.log("🔍 DEBUG Feature Values:");
    Object.entries(features).forEach(([key, value]) => {
      console.log(`${key}:`, {
        rawValue: value,
        displayValue: getDisplayValue(value),
        type: typeof value,
        isObject: typeof value === 'object',
        hasValueProp: value && typeof value === 'object' && value.hasOwnProperty('value')
      });
    });
  };

  // Handle input changes with immediate feedback
  const handleFeatureChange = (key: string, newValue: any) => {
    setFeatures(prev => ({
      ...prev,
      [key]: newValue
    }));
    setSaveStatus("Value changed - ready to save");
  };

  // Format feature key for display
  const formatFeatureKey = (key: string) => {
    return key.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get display value - FIXED for nested objects
  const getDisplayValue = (value: any): string => {
    if (value === null || value === undefined) return "";
    
    if (typeof value === "object" && value !== null) {
      if (value.hasOwnProperty('value')) {
        const innerValue = value.value;
        if (innerValue === null || innerValue === undefined) return "";
        if (typeof innerValue === "object") return JSON.stringify(innerValue);
        return String(innerValue);
      }
      return JSON.stringify(value);
    }
    
    return String(value);
  };

  // Parse input value - FIXED to handle direct values
  const parseInputValue = (inputValue: string): any => {
    const trimmed = inputValue.trim();
    if (trimmed === "") return null;
    
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || 
        (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        const parsed = JSON.parse(trimmed);
        if (typeof parsed === 'object' && parsed !== null && parsed.hasOwnProperty('value')) {
          return parsed.value;
        }
        return parsed;
      } catch {
        return inputValue;
      }
    }
    
    if (!isNaN(Number(trimmed)) && trimmed !== "") return Number(trimmed);
    if (trimmed.toLowerCase() === 'true') return true;
    if (trimmed.toLowerCase() === 'false') return false;
    
    return inputValue;
  };

  // 🚫 Non-admins -> redirect to SignIn
  if (isAdmin === false) {
    navigate("/admin/signin");
    return null;
  }

  if (loading || isAdmin === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Loading Plan Data...</h2>
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
              <p className="text-blue-100 text-sm mt-1">
                Manage plan features and settings
              </p>
            </div>
            <div className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium">
              Plan: <span className="font-bold">{planId}</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Status Bar */}
          <div className={`mb-4 p-3 rounded-md text-sm ${
            saveStatus.includes("failed") || saveStatus.includes("Failed") ? "bg-red-50 border border-red-200 text-red-700" :
            saveStatus.includes("Saved") || saveStatus.includes("successful") ? "bg-green-50 border border-green-200 text-green-700" :
            saveStatus.includes("ready") ? "bg-yellow-50 border border-yellow-200 text-yellow-700" :
            "bg-blue-50 border border-blue-200 text-blue-700"
          }`}>
            <div className="flex justify-between items-center">
              <span>Status: <strong>{saveStatus || "Ready"}</strong></span>
              <span>Features: <strong>{Object.keys(features).length}</strong></span>
            </div>
          </div>

          {/* Features List */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Plan Features ({Object.keys(features).length})
            </h3>
            
            {Object.keys(features).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Database className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p>No features found for this plan.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(features).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {formatFeatureKey(key)}
                      </label>
                      <span className="text-xs text-gray-500">
                        Current value type: <strong>{typeof value}</strong>
                      </span>
                    </div>
                    <div className="w-64">
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={getDisplayValue(value)}
                        onChange={(e) => {
                          const newValue = parseInputValue(e.target.value);
                          handleFeatureChange(key, newValue);
                        }}
                        placeholder="Enter value..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Save Section */}
          <div className="flex justify-between items-center pt-6 border-t">
            <div className="text-sm text-gray-500">
              Click "Save Changes Now" to update features
            </div>
            <div className="flex gap-3">
              <button
                onClick={debugFeatureValues}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-yellow-700 bg-yellow-100 border border-yellow-300 rounded-md hover:bg-yellow-200"
              >
                <TestTube className="h-4 w-4 mr-2" />
                Debug Values
              </button>
              <button
                onClick={testConnection}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <TestTube className="h-4 w-4 mr-2" />
                Test Connection
              </button>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Database className="h-4 w-4 mr-2" />
                Reload Page
              </button>
              <button
                onClick={handleSave}
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
                    Save Changes Now
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Debug Output */}
          <div className="mt-6 p-4 bg-gray-100 rounded-md text-xs">
            <h4 className="font-medium mb-2">Debug Info:</h4>
            <div className="mb-2">
              <strong>Features State:</strong> 
              <pre className="whitespace-pre-wrap max-h-40 overflow-auto bg-white p-2 rounded mt-1">
                {JSON.stringify(features, null, 2)}
              </pre>
            </div>
            <div>
              <strong>Environment:</strong> {window.location.hostname}
            </div>
            <div>
              <strong>Project:</strong> {import.meta.env.VITE_FIREBASE_PROJECT_ID}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}