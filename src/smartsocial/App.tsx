// src/smartsocial/App.tsx

import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import ImagePreview from "./components/ImagePreview";
import QuotaBar from "./components/QuotaBar";
import ScrollToTop from "./components/ScrollToTop";
import { useCriticalPreload } from "./hooks/usePreload";
import OnboardingRoutes from "./pages/onboarding";
import "./styles/smartsocial.css";
import { auth } from "./utils/firebase";

interface PlaygroundState {
  prompt: string;
  enhancedPrompt: string;
  imageUrl: string;
  caption: string;
  hashtags: string;
}

export default function App() {
  useCriticalPreload();

  const [playgroundState, setPlaygroundState] = useState<PlaygroundState>({
    prompt: "",
    enhancedPrompt: "",
    imageUrl: "",
    caption: "",
    hashtags: "",
  });

  const userId = auth.currentUser?.uid || null;

  const handleStateUpdate = (updates: Partial<PlaygroundState>): void => {
    setPlaygroundState((prev) => ({ ...prev, ...updates }));
  };

  const handleBack = (): void => console.log("Back clicked");
  const handlePreviewConfirm = (): void => console.log("Preview confirmed");

  return (
    <>
      <ScrollToTop />
      <OnboardingRoutes />

      <Routes>
        <Route
          path="/playground"
          element={
            <div className="space-y-4 p-4">
              <ImagePreview
                prompt={playgroundState.prompt}
                enhancedPrompt={playgroundState.enhancedPrompt}
                imageUrl={playgroundState.imageUrl}
                caption={playgroundState.caption}
                hashtags={playgroundState.hashtags}
                setImageUrl={(url: string) => handleStateUpdate({ imageUrl: url })}
                setCaption={(caption: string) => handleStateUpdate({ caption })}
                setHashtags={(hashtags: string) => handleStateUpdate({ hashtags })}
                onBack={handleBack}
                onPreviewConfirm={handlePreviewConfirm}
              />
              {userId && <QuotaBar userId={userId} />}
            </div>
          }
        />
      </Routes>
    </>
  );
}
