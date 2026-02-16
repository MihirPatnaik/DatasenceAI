// src/main.tsx

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import "./index.css";
import { ToastProvider } from "./smartsocial/components/ui/toast";
import { UserContextProvider } from "./smartsocial/hooks/useUserContext"; // Add this import
import PlanAdmin from "./smartsocial/pages/admin/PlanAdmin";
import OnboardingRoutes from "./smartsocial/pages/onboarding";
import SchedulerManager from "./smartsocial/pages/SchedulerManager";


// ✅ Wrapper for dynamic plan route
function PlanAdminWrapper() {
  const { planId } = useParams<{ planId: string }>();

  const normalizedPlanId =
    planId?.toLowerCase() === "pro"
      ? "Pro"
      : planId?.toLowerCase() === "free"
      ? "free"
      : "free";

  // 🔄 Force canonical URL
  if (planId !== normalizedPlanId) {
    return <Navigate to={`/smartsocial/planadmin/${normalizedPlanId}`} replace />;
  }

  return <PlanAdmin planId={normalizedPlanId} />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <UserContextProvider> {/* Add this wrapper */}
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* ✅ Root path redirects to SmartSocial dashboard */}
            <Route path="/" element={<Navigate to="/smartsocial/dashboard" replace />} />
            
            {/* ✅ Main App Routes */}
            <Route path="/smartsocial/*" element={<OnboardingRoutes />} />
            
            {/* ✅ SCHEDULER ROUTE - MUST COME BEFORE CATCH-ALL */}
            <Route path="/smartsocial/scheduler" element={<SchedulerManager />} />
            
            {/* ✅ Admin Routes */}
            <Route path="/smartsocial/admin" element={<PlanAdmin planId="Pro" />} />
            <Route path="/smartsocial/planadmin/:planId" element={<PlanAdminWrapper />} />
            
            {/* ✅ Catch-all route redirects to dashboard - MUST BE LAST */}
            <Route path="*" element={<Navigate to="/smartsocial/dashboard" replace />} />
            
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </UserContextProvider> {/* Close the wrapper */}
  </React.StrictMode>
);