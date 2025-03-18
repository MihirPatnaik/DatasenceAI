import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar'; // Ensure this path is correct

const HomePage: React.FC = () => {
  const features = [
    { 
      title: 'AI Data Labeling', 
      description: 'High-quality data annotation for ML models', 
      path: '/ai-data-labeling', 
      image: '/images/ai-data-labeling.jpg' 
    },
    { 
      title: 'B2B Lead Generation', 
      description: 'AI-powered lead generation for tech companies', 
      path: '/b2b-lead-generation', // Updated path
      image: '/images/b2b-lead-generation.jpg' 
    },
    { 
      title: 'Business Automation', 
      description: 'Streamline operations with AI & RPA', 
      path: '/business-automation', // Updated path
      image: '/images/business-automation.jpg' 
    },
    { 
      title: 'Google Cloud & AI', 
      description: 'Expert consulting for cloud & AI implementation', 
      path: '/google-cloud-ai', // Added path explicitly
      image: '/images/google-cloud-ai.jpg' 
    },
  ];

  return (
    <div className="pt-0">
      {/* Navigation Header (Using Navbar Component) */}
      <Navbar />

      {/* Hero Section (Light Gray Background for Better Contrast) */}
      <section className="relative overflow-hidden pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-deep-blue mb-6">
              Transform Your Business with{' '}
              <span className="text-light-blue">AI-Powered Solutions</span>
            </h1>
            <p className="text-xl text-black mb-8 max-w-3xl mx-auto">
              Unlock the power of AI with our comprehensive suite of data labeling,
              lead generation, and business automation services.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-light-blue hover:bg-blue-700"
              >
                Get a Free Quote
                <ArrowRight className="ml-2 h-5 w-5 text-white" />
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center justify-center px-6 py-3 border border-silver text-base font-medium rounded-md text-deep silver bg-transparent hover:bg-silver/10"
              >
                Explore Services
              </Link>
            </div>
            {/* Futuristic glowing circle inspired by Scale */}
            <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-light-blue/20 blur-2xl opacity-50 animate-pulse"></div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-deep blue">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-deep-blue mb-4">
              Comprehensive AI Solutions
            </h2>
            <p className="text-xl text-black">
              Everything you need to accelerate your business growth
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.15)" }}
                className="p-6 bg-light-gray rounded-xl hover:bg-light-blue/10 transition-transform duration-150 ease-in-out"
              >
                {feature.path ? (
                  <Link to={feature.path} className="block h-full">
                    <img 
                      src={feature.image} 
                      alt={`${feature.title} Image`} 
                      className="h-24 w-24 mx-auto mb-4 object-contain rounded-lg"
                    />
                    <h3 className="text-xl font-semibold text-deep-blue mb-2 text-center">
                      {feature.title}
                    </h3>
                    <p className="text-black text-center">{feature.description}</p>
                  </Link>
                ) : (
                  <>
                    <img 
                      src={feature.image} 
                      alt={`${feature.title} Image`} 
                      className="h-24 w-24 mx-auto mb-4 object-contain rounded-lg"
                    />
                    <h3 className="text-xl font-semibold text-deep-blue mb-2 text-center">
                      {feature.title}
                    </h3>
                    <p className="text-black text-center">{feature.description}</p>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Signals (Matching About Page, Curved Edges) */}
      <section className="py-20 bg-gradient-to-r from-light-blue/10 to-deep-blue/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-deep-blue mb-8">
              Trusted by Tech Companies
            </h2>
            <div className="flex flex-wrap justify-center gap-8 mt-8">
              <div className="p-4 bg-white border border-silver rounded-2xl shadow-md">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                  <span className="text-xl font-bold text-deep-blue">99.9% Accuracy</span>
                </div>
              </div>
              <div className="p-4 bg-white border border-silver rounded-2xl shadow-md">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                  <span className="text-xl font-bold text-deep-blue">24/7 Support</span>
                </div>
              </div>
              <div className="p-4 bg-white border border-silver rounded-2xl shadow-md">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                  <span className="text-xl font-bold text-deep-blue">Enterprise-Grade Security</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;