import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import ServicesPage from "./pages/ServicesPage";
import PricingPage from "./pages/PricingPage";
import AboutPage from "./pages/AboutPage";
import BlogPage from "./pages/BlogPage";
import ContactPage from "./pages/ContactPage";
import AIDataLabelingPage from "./pages/AIDataLabelingPage";
import B2BLeadGenerationPage from "./pages/B2BLeadGenerationPage";
import BusinessAutomationPage from "./pages/BusinessAutomationPage";
import GoogleCloudAI from "./pages/GoogleCloudAI"; // New import

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-light-blue/10 via-white to-light-gray">
      <Navbar />
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
          {/* Placeholder subroutes for Google Cloud AI services */}
          <Route path="/google-cloud-ai/migration" element={<div className="pt-20 pb-16 text-center text-deep-blue text-xl">Cloud Migration Strategy - Coming Soon!</div>} />
          <Route path="/google-cloud-ai/ai-design" element={<div className="pt-20 pb-16 text-center text-deep-blue text-xl">AI Solution Design - Coming Soon!</div>} />
          <Route path="/google-cloud-ai/cost-optimization" element={<div className="pt-20 pb-16 text-center text-deep-blue text-xl">Cost Optimization - Coming Soon!</div>} />
          <Route path="/google-cloud-ai/bigquery" element={<div className="pt-20 pb-16 text-center text-deep-blue text-xl">BigQuery Analytics - Coming Soon!</div>} />
          <Route path="/google-cloud-ai/workspace" element={<div className="pt-20 pb-16 text-center text-deep-blue text-xl">Google Workspace Boost - Coming Soon!</div>} />
          <Route path="/google-cloud-ai/security" element={<div className="pt-20 pb-16 text-center text-deep-blue text-xl">Security & Compliance - Coming Soon!</div>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;