// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import App from "./App";
import AdminRoute from "./components/AdminRoute";
import "./index.css";
import { ToastProvider } from "./smartsocial/components/ui/toast";
import PlanAdmin from "./smartsocial/pages/admin/PlanAdmin";
import SignIn from "./smartsocial/pages/admin/SignIn";
import OnboardingRoutes from "./smartsocial/pages/onboarding";


// ✅ ADD THIS TAILWIND TEST COMPONENT
const TailwindTest = () => (
  <div className="fixed top-0 left-0 right-0 bg-yellow-400 text-black p-2 text-center z-50">
    <span className="font-bold">TAILWIND TEST: </span>
    <span className="bg-red-500 text-white px-2 py-1 mx-1">Red</span>
    <span className="bg-blue-500 text-white px-2 py-1 mx-1">Blue</span>
    <span className="bg-green-500 text-white px-2 py-1 mx-1">Green</span>
  </div>
);

// ✅ Wrapper for dynamic plan route
function PlanAdminWrapper() {
  const { planId } = useParams<{ planId: string }>();

  const normalizedPlanId =
    planId?.toLowerCase() === "pro"
      ? "Pro"
      : planId?.toLowerCase() === "free"
      ? "free"
      : "free";

  if (planId !== normalizedPlanId) {
    return <Navigate to={`/smartsocial/planadmin/${normalizedPlanId}`} replace />;
  }

  return <PlanAdmin planId={normalizedPlanId} />;
}

// ✅ Create a layout component that includes the test
const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <TailwindTest /> {/* This will show on every page */}
    {children}
  </>
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ToastProvider>
      <BrowserRouter>
        <AppLayout> {/* Wrap everything with the layout */}
          <Routes>
            {/* Default App */}
            <Route path="/" element={<App />} />

            {/* Sign In */}
            <Route path="/smartsocial/signin" element={<SignIn />} />

            {/* Admin routes */}
            <Route
              path="/smartsocial/admin"
              element={
                <AdminRoute>
                  <Navigate to="/smartsocial/planadmin/Pro" replace />
                </AdminRoute>
              }
            />
            
            <Route
              path="/smartsocial/planadmin/:planId"
              element={
                <AdminRoute>
                  <PlanAdminWrapper />
                </AdminRoute>
              }
            />

            {/* CATCH-ALL: All other /smartsocial/* routes go to onboarding */}
            <Route path="/smartsocial/*" element={<OnboardingRoutes />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </ToastProvider>
  </React.StrictMode>
);