//datasenceai/src/App.tsx

import React, { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import CookieBanner from "./components/CookieBanner";
import Footer from "./components/Footer";
import AboutPage from "./pages/AboutPage";
import AIDataLabelingPage from "./pages/AIDataLabelingPage";
import B2BLeadGenerationPage from "./pages/B2BLeadGenerationPage";
import BlogPage from "./pages/BlogPage";
import BusinessAutomationPage from "./pages/BusinessAutomationPage";
import ContactPage from "./pages/ContactPage";
import GoogleCloudAI from "./pages/GoogleCloudAI";
import HomePage from "./pages/HomePage";
import Layout from "./pages/Layout";
import PricingPage from "./pages/PricingPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ServicesPage from "./pages/ServicesPage";

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App: React.FC = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);

  return (
    <Layout isMenuOpen={isMenuOpen} setMenuOpen={setMenuOpen}>
      <div className="min-h-screen bg-gradient-to-br from-light-blue/10 via-white to-light-gray">
        <ScrollToTop />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:id" element={<div className="pt-20 pb-16 text-center text-deep-blue text-xl">Blog Post Placeholder - Coming Soon!</div>} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/ai-data-labeling" element={<AIDataLabelingPage />} />
            <Route path="/b2b-lead-generation" element={<B2BLeadGenerationPage />} />
            <Route path="/business-automation" element={<BusinessAutomationPage />} />
            <Route path="/google-cloud-ai" element={<GoogleCloudAI />} />
            <Route path="/google-cloud-ai/migration" element={<div className="pt-20 pb-16 text-center text-deep-blue text-xl">Cloud Migration Strategy - Coming Soon!</div>} />
            <Route path="/google-cloud-ai/ai-design" element={<div className="pt-20 pb-16 text-center text-deep-blue text-xl">AI Solution Design - Coming Soon!</div>} />
            <Route path="/google-cloud-ai/cost-optimization" element={<div className="pt-20 pb-16 text-center text-deep-blue text-xl">Cost Optimization - Coming Soon!</div>} />
            <Route path="/google-cloud-ai/bigquery" element={<div className="pt-20 pb-16 text-center text-deep-blue text-xl">BigQuery Analytics - Coming Soon!</div>} />
            <Route path="/google-cloud-ai/workspace" element={<div className="pt-20 pb-16 text-center text-deep-blue text-xl">Google Workspace Boost - Coming Soon!</div>} />
            <Route path="/google-cloud-ai/security" element={<div className="pt-20 pb-16 text-center text-deep-blue text-xl">Security & Compliance - Coming Soon!</div>} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<div className="pt-20 pb-16 text-center text-deep-blue text-xl">Terms of Service - Coming Soon!</div>} />
            <Route path="/cookie-policy" element={<div className="pt-20 pb-16 text-center text-deep-blue text-xl">Cookie Policy - Coming Soon!</div>} />
          </Routes>
        </main>
        <Footer />
        <CookieBanner />
      </div>
    </Layout>
  );
};

export default App;