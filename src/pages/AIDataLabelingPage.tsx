import React from 'react';
import { motion } from 'framer-motion';
import { Check, CheckCircle2, Database, Image, Video, Mic, MessageSquare, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar'; // Ensure this path is correct



const AIDataLabelingPage: React.FC = () => {
  return (
    <div className="pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section (Now Wrapped in <section>) */}
        <section className="mb-16 mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-6">
              AI-Powered Data Labeling for{' '}<span className="text-light-blue">Retail & E-Commerce</span>
            </h1>
            <p className="text-lg text-black max-w-3xl mx-auto mb-8">
              High-quality labeled data for smarter AI-driven business decisions.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-light-blue hover:bg-blue-700"
            >
              Get a Free Consultation
              <ArrowRight className="ml-2 h-5 w-5 text-white" />
            </Link>
            {/* Glowing circle */}
            <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-light-blue/20 blur-2xl opacity-50 animate-pulse"></div>
          </motion.div>
      </section>
        
        {/* Why Data Labeling Matters */}
        <section className="mb-16 bg-gradient-to-r from-light-blue/20 to-deep-blue/20 rounded-2xl p-8 shadow-md">
          <h2 className="text-2xl font-bold text-deep-blue mb-6">Why Data Labeling Matters?</h2>
          <p className="text-black mb-4">
            Data labeling is essential for powering AI models in Retail & E-Commerce, enhancing capabilities like:
          </p>
          <ul className="list-none space-y-4">
            <li className="flex items-center gap-2">
              <Check className="h-6 w-6 text-green-500" />
              Product Categorization & Recommendations: Accurate labels for AI-driven suggestions.
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-6 w-6 text-green-500" />
              Visual Search & Image Recognition: Automate product tagging for enhanced search.
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-6 w-6 text-green-500" />
              Sentiment Analysis: Improve marketing strategies with AI insights.
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-6 w-6 text-green-500" />
              Demand Forecasting: Optimize inventory and reduce losses.
            </li>
          </ul>
        </section>

        {/* Our Expertise */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-deep-blue mb-6">Our Expertise in Data Labeling</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-light silver rounded-xl p-6 shadow-md border border-silver"
            >
              <Database className="h-8 w-8 text-deep-blue mb-2" />
              <h3 className="text-lg font-semibold text-deep-blue mb-2">Bounding Box Annotation</h3>
              <p className="text-black">Essential for product detection and inventory tracking.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-light silver rounded-xl p-6 shadow-md border border-silver"
            >
              <Image className="h-8 w-8 text-deep-blue mb-2" />
              <h3 className="text-lg font-semibold text-deep-blue mb-2">Image Classification</h3>
              <p className="text-black">Efficient categorization for products and brand recognition.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-light silver rounded-xl p-6 shadow-md border border-silver"
            >
              <Image className="h-8 w-8 text-deep-blue mb-2" />
              <h3 className="text-lg font-semibold text-deep-blue mb-2">Semantic Segmentation</h3>
              <p className="text-black">Pixel-level accuracy for fashion and product AI models.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-light silver rounded-xl p-6 shadow-md border border-silver"
            >
              <MessageSquare className="h-8 w-8 text-deep-blue mb-2" />
              <h3 className="text-lg font-semibold text-deep-blue mb-2">Text Annotation</h3>
              <p className="text-black">Enhancing chatbots, sentiment analysis, and language models.</p>
            </motion.div>
            {/*<motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              {/*className="bg-light silver rounded-xl p-6 shadow-md border border-silver"*/}
            {/*</motion.div>*/}
              {/*<Video className="h-8 w-8 text-deep-blue mb-2" />*/}
              {/*<h3 className="text-lg font-semibold text-deep-blue mb-2">Audio/Video Annotation</h3>*/}
              {/*<p className="text-black">Training for voice assistants and video analytics.</p>*/}
            
          </div>
        </section>

        {/* Why Choose DatasenceAI */}
        <section className="mb-16 bg-gradient-to-r from-light-blue/20 to-deep-blue/20 rounded-2xl p-8 shadow-md">
          <h2 className="text-2xl font-bold text-deep-blue mb-6">Why Choose DatasenceAI?</h2>
          <ul className="list-none space-y-4">
            <li className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              AI-assisted & Human-reviewed annotation for accuracy and efficiency.
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              Expertise in Retail & E-Commerce: Fashion, groceries, and electronics.
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              Scalable & flexible solutions for startups and enterprises alike.
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              Compliant with GDPR and industry standards for data privacy.
            </li>
          </ul>
        </section>

        {/* How It Works */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-deep-blue mb-6">How Data Labeling Works?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-light-gray rounded-xl p-6 shadow-md border border-silver text-center"
            >
              <span className="text-lg font-semibold text-deep-blue mb-2">1️⃣</span>
              <p className="text-black">Upload Data – Provide images, text, videos, or catalogs.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-light-gray rounded-xl p-6 shadow-md border border-silver text-center"
            >
              <span className="text-lg font-semibold text-deep-blue mb-2">2️⃣</span>
              <p className="text-black">Labeling Process – AI-assisted annotations with human validation.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-light-gray rounded-xl p-6 shadow-md border border-silver text-center"
            >
              <span className="text-lg font-semibold text-deep-blue mb-2">3️⃣</span>
              <p className="text-black">Quality Assurance – Multiple validation rounds for accuracy.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-light-gray rounded-xl p-6 shadow-md border border-silver text-center"
            >
              <span className="text-lg font-semibold text-deep-blue mb-2">4️⃣</span>
              <p className="text-black">Final Delivery – Receive your structured labeled data.</p>
            </motion.div>
          </div>
        </section>

        {/* Pricing & Engagement */}
        <section className="mb-16 bg-gradient-to-r from-light-blue/20 to-deep-blue/20 rounded-2xl p-8 shadow-md">
          <h2 className="text-2xl font-bold text-deep-blue mb-6">Pricing & Engagement Model</h2>
          <ul className="list-none space-y-4">
            <li className="text-black">🔹 Pay-as-You-Go based on volume and complexity.</li>
            <li className="text-black">🔹 Subscription: Ongoing monthly services for AI model training.</li>
            <li className="text-black">🔹 Custom Enterprise Plans for large-scale projects.</li>
          </ul>
        </section>

        {/* CTA Section */}
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <div className="w-full max-w-3xl bg-blue-100 p-8 shadow-lg rounded-lg flex flex-col items-center">
            <div className="mb-6 flex flex-col items-center">
              <span className="text-3xl font-bold flex items-center gap-2 text-gray-800">
                <span role="img" aria-label="megaphone">📢</span> Let’s discuss your AI needs – Get a Free Consultation!
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

export default AIDataLabelingPage;