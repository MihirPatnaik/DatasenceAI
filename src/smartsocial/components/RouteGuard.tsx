// src/smartsocial/components/RouteGuard.tsx

import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { auth, db } from '../utils/firebase';

interface RouteGuardProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

export function RouteGuard({ children, requireOnboarding = false }: RouteGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setIsAuthenticated(true);
        
        // ✅ Check onboarding status if required
        if (requireOnboarding) {
          try {
            const userRef = doc(db, "users", user.uid);
            const snap = await getDoc(userRef);
            if (snap.exists()) {
              const data = snap.data();
              setOnboardingCompleted(!!data?.onboarding?.completed);
            } else {
              setOnboardingCompleted(false);
            }
          } catch (err) {
            console.error("❌ RouteGuard: Error checking onboarding:", err);
            setOnboardingCompleted(false);
          }
        } else {
          // ✅ For onboarding steps, just require authentication
          setOnboardingCompleted(true);
        }
      } else {
        setIsAuthenticated(false);
        setOnboardingCompleted(false);
      }
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [requireOnboarding]);

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Loading...
      </div>
    );
  }

  // ✅ Redirect to signup if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/smartsocial/onboarding/step1" replace />;
  }

  // ✅ Redirect to onboarding if onboarding required but not completed
  if (requireOnboarding && !onboardingCompleted) {
    return <Navigate to="/smartsocial/onboarding/step1" replace />;
  }

  // ✅ User is authenticated (and onboarded if required)
  return <>{children}</>;
}