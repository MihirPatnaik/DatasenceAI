import React from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const B2BLeadGenerationPage: React.FC = () => {
  return (
    <div className="pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section with Added Gap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 mt-16 relative overflow-hidden" // Added mt-16 for top margin to create symmetry/gap
        >
          <h1 className="text-4xl md:text-5xl font-bold text-deep-blue mb-6">
            AI-Powered B2B Lead Generation for{' '}<span className="text-light-blue">Tech Companies</span>
          </h1>
          <p className="text-xl text-black max-w-3xl mx-auto mb-8">
            Transform your sales pipeline with precise, AI-driven leads that boost conversions and drive growth for tech businesses.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-light-blue hover:bg-blue-700"
          >
            Get a Free Consultation
            <ArrowRight className="ml-2 h-5 w-5 text-white" />
          </Link>
          {/* Glowing circle inspired by AIDataLabelingPage */}
          <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-dark-blue/20 blur-2xl opacity-50 animate-pulse"></div>
        </motion.div>

        {/* Why Choose Us Section */}
        <section className="mb-16 bg-gradient-to-r from-light-blue/20 to-deep-blue/20 rounded-2xl p-8 shadow-md">
          <h2 className="text-2xl font-bold text-deep-blue mb-6">Why Choose Our AI-Powered B2B Lead Generation?</h2>
          <p className="text-black mb-4">
            Our AI solutions deliver high-quality leads tailored for tech companies, driving growth with precision.
          </p>
          <ul className="list-none space-y-4">
            <li className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span className="text-black">High-Quality Leads: AI-driven targeting ensures relevant prospects for tech firms.</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span className="text-black">Data-Backed Insights: Leverage predictive analytics for smarter sales decisions.</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span className="text-black">Increased Conversions: AI filters leads with higher purchase intent, boosting ROI.</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span className="text-black">Seamless Integration: Easily connect with CRMs like Salesforce and HubSpot.</span>
            </li>
          </ul>
        </section>

        {/* How It Works Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-deep-blue mb-6">How Our B2B Lead Generation Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-light-gray rounded-xl p-6 shadow-md border border-silver text-center"
            >
              <span className="text-lg font-semibold text-deep-blue mb-2">1️⃣</span>
              <p className="text-black">Analyze your business needs and target tech audience.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-light-gray rounded-xl p-6 shadow-md border border-silver text-center"
            >
              <span className="text-lg font-semibold text-deep-blue mb-2">2️⃣</span>
              <p className="text-black">Leverage AI to identify and qualify high-potential leads.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-light-gray rounded-xl p-6 shadow-md border border-silver text-center"
            >
              <span className="text-lg font-semibold text-deep-blue mb-2">3️⃣</span>
              <p className="text-black">Deliver actionable leads to your CRM seamlessly.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-light-gray rounded-xl p-6 shadow-md border border-silver text-center"
            >
              <span className="text-lg font-semibold text-deep-blue mb-2">4️⃣</span>
              <p className="text-black">Optimize with continuous AI learning for better results.</p>
            </motion.div>
          </div>
        </section>

        {/* Our Expertise Section */}
        <section className="mb-16 bg-gradient-to-r from-light-blue/20 to-deep-blue/20 rounded-2xl p-8 shadow-md">
          <h2 className="text-2xl font-bold text-deep-blue mb-6">Our Expertise in B2B Lead Generation</h2>
          <p className="text-black mb-4">
            DatasenceAI specializes in AI-driven lead generation for tech companies, delivering tailored solutions to drive growth.
          </p>
          <ul className="list-disc pl-6 text-black space-y-2">
            <li>Advanced AI algorithms for lead scoring and targeting tech audiences.</li>
            <li>Integration with Salesforce, HubSpot, and other CRMs for seamless workflows.</li>
            <li>Real-time data enrichment for actionable insights.</li>
            <li>Proven track record with tech startups and enterprises worldwide.</li>
          </ul>
        </section>

        {/* Why Choose DatasenceAI */}
        <section className="mb-16 bg-gradient-to-r from-light-blue/20 to-deep-blue/20 rounded-2xl p-8 shadow-md">
          <h2 className="text-2xl font-bold text-deep-blue mb-6">Why Choose DatasenceAI?</h2>
          <ul className="list-none space-y-4">
            <li className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span className="text-black">AI-driven precision with human oversight for accuracy.</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span className="text-black">Tech-focused solutions for B2B lead generation challenges.</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span className="text-black">Scalable, flexible plans for startups and enterprises.</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span className="text-black">GDPR-compliant and secure data handling for trust.</span>
            </li>
          </ul>
        </section>

        {/* CTA and Contact Section */}
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <div className="w-full max-w-3xl bg-blue-100 p-8 shadow-lg rounded-lg flex flex-col items-center">
            <div className="mb-6 flex flex-col items-center">
              <span className="text-3xl font-bold flex items-center gap-2 text-gray-800">
                <span role="img" aria-label="megaphone">📢</span> Let’s Boost Your B2B Sales – Get a Free Consultation!
              </span>
            </div>
            <button className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-lg shadow-md text-lg transition-all">
              Get a Free AI Consultation
            </button>
          </div>
          <div className="mt-10 w-full max-w-3xl bg-blue-100 p-8 shadow-md rounded-lg text-center">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Contact Us</h2>
            <p className="flex items-center justify-center gap-2 text-lg text-gray-700">
              <span role="img" aria-label="email">📧</span> Email: <a href="mailto:mihir@datasenceai.com" className="text-blue-600 hover:underline">mihir@datasenceai.com</a>
            </p>
            <p className="flex items-center justify-center gap-2 mt-3 text-lg text-gray-700">
              <span role="img" aria-label="phone">📞</span> Call: +91 9339275140
            </p>
          </div>
        </div>

        {/* Trust Signals Section (Updated to match HomePage style) */}
        <section className="py-20 bg-gradient-to-r from-deep-blue/0 to-deep-blue/0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-extrabold text-deep-blue mb-8">
              Trusted by Leading Tech Companies
            </h2>
            <div className="flex flex-wrap justify-center gap-8 mt-8">
              <div className="p-4 bg-gradient-to-b from-light-blue/100 to-deep-blue/90 border-silver rounded-xl shadow-md">
                <div className="flex items-center gap-2">
                  <Check className="h-6 w-6 text-green-500" />
                  <span className="text-xl font-bold text-white">99.9% Lead Accuracy</span>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-b from-light-blue/100 to-deep-blue/90 border-silver rounded-xl shadow-md">
                <div className="flex items-center gap-2">
                  <Check className="h-6 w-6 text-green-500" />
                  <span className="text-xl font-bold text-white">24/7 Support</span>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-b from-light-blue/100 to-deep-blue/90 border-silver rounded-xl shadow-md">
                <div className="flex items-center gap-2">
                  <Check className="h-6 w-6 text-green-500" />
                  <span className="text-xl font-bold text-white">Enterprise-Grade Security</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default B2BLeadGenerationPage;