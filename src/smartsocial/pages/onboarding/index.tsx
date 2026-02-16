// src/smartsocial/pages/onboarding/index.tsx

import { Navigate, Route, Routes } from "react-router-dom";
import { RouteGuard } from "../../components/RouteGuard";
import ExtensionAuth from "../ExtensionAuth"; // ✅ ADD THIS IMPORT
import LoginPage from "../LoginPage";
import SmartSocialDashboard from "../SmartSocialDashboard"; // ✅ NEW DASHBOARD
import SmartSocialHome from "../smartsocialHome"; // ✅ KEEP FOR POST CREATION
import Step1Signup from "./steps/Step1Signup";
import Step2AhaMoment from "./steps/Step2AhaMoment";
import Step3Quiz from "./steps/Step3Quiz";
import Step4PlanSelector from "./steps/Step4PlanSelector";

function OnboardingRoutes() {
  return (
    <Routes>
      {/* 
        🏠 DEFAULT ENTRY POINT 
        When users visit the root path, automatically redirect them to login
        This prevents blank pages and ensures consistent starting point
      */}
      <Route
        path="/"
        element={<Navigate to="login" replace />} 
      />

      {/*
        🧭 PUBLIC ROUTES - No authentication required
        These routes are accessible to all users (logged in or not)
        - Login pages for authentication
        - Signup page for new user registration
      */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signin" element={<LoginPage />} />
      <Route path="/signup" element={<Step1Signup />} />

      {/* ✅ ADD EXTENSION AUTH ROUTE HERE - BEFORE PROTECTED ROUTES */}
      <Route path="/extension-auth" element={<ExtensionAuth />} />

      {/*
        🔒 PROTECTED ROUTES - Authentication required
        These routes are wrapped with RouteGuard which:
        - Checks if user is logged in
        - Redirects to login if not authenticated
        - Only allows access to verified users
      */}
      
      {/*
        🎯 ONBOARDING JOURNEY - Sequential flow
        Note: The order here doesn't enforce sequence - that's handled by component logic
        Each step has internal checks to ensure proper progression
      */}
      
      {/*
        📝 STEP 3: User Preferences & Quiz
        Users define their brand personality, target audience, and content preferences
        This step collects crucial data for AI content generation
      */}
      <Route 
        path="/onboarding/step3"  
        element={
          <RouteGuard>
            <Step3Quiz />
          </RouteGuard>
        } 
      />

      {/*
        💡 STEP 2: Aha Moment & Brand Discovery
        Users experience the "Aha!" moment by seeing AI-generated content samples
        Builds excitement and demonstrates platform value
      */}
      <Route 
        path="/onboarding/step2"  
        element={
          <RouteGuard>
            <Step2AhaMoment />
          </RouteGuard>
        } 
      />

      {/*
        🚀 STEP 4: Plan Selection & Finalization
        Users choose their subscription plan (Free/Pro)
        Completes the onboarding journey and unlocks full platform access
      */}
      <Route 
        path="/onboarding/step4"  
        element={
          <RouteGuard>
            <Step4PlanSelector />
          </RouteGuard>
        } 
      />

      {/*
        🏡 MAIN DASHBOARD - Full access required
        This is the user's main workspace after completing onboarding
        RouteGuard with requireOnboarding=true ensures:
        - User is logged in AND has completed all onboarding steps
        - Prevents access to dashboard without proper setup
      */}
      <Route 
        path="/dashboard" 
        element={
          <RouteGuard requireOnboarding={true}>
            <SmartSocialDashboard />
          </RouteGuard>
        } 
      />

      {/*
        📝 CREATE POST PAGE - Full access required
        This is where users create new posts (your existing SmartSocialHome)
        Connected from the dashboard's "Create Post" button
      */}
      <Route 
        path="/create-post" 
        element={
          <RouteGuard requireOnboarding={true}>
            <SmartSocialHome />
          </RouteGuard>
        } 
      />

      {/*
        🏡 LEGACY HOME ROUTE - Redirect to new dashboard
        Keep for backward compatibility, redirect to new dashboard
      */}
      <Route 
        path="/home" 
        element={
          <RouteGuard requireOnboarding={true}>
            <Navigate to="/smartsocial/dashboard" replace />
          </RouteGuard>
        } 
      />

      {/*
        🛡️ SAFETY NET - Catch-all route
        Handles any undefined URLs by redirecting to dashboard (instead of login)
        Prevents 404 errors and maintains user experience
      */}
      <Route path="*" element={<Navigate to="/smartsocial/dashboard" replace />} />
    </Routes>
  );
}

export default OnboardingRoutes;