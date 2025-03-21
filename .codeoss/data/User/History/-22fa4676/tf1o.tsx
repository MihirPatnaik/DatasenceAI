import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Cloud, Bot, Lock, BarChart2, Users, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const GoogleCloudAI: React.FC = () => {
  const services = [
    { title: 'Cloud Migration Strategy', description: 'Seamless transition to Google Cloud with minimal disruption.', icon: Cloud, path: '/google-cloud-ai/migration' },
    { title: 'AI Solution Design', description: 'Custom AI models built on Vertex AI to solve your challenges.', icon: Bot, path: '/google-cloud-ai/ai-design' },
    { title: 'Cost Optimization', description: 'Maximize ROI with smart Google Cloud resource management.', icon: BarChart2, path: '/google-cloud-ai/cost-optimization' },
    { title: 'BigQuery Analytics', description: 'Fast, scalable insights from your data with BigQuery.', icon: BarChart2, path: '/google-cloud-ai/bigquery' },
    { title: 'Google Workspace Boost', description: 'Enhance productivity with integrated Workspace solutions.', icon: Users, path: '/google-cloud-ai/workspace' },
    { title: 'Security & Compliance', description: 'Secure your cloud with Google-grade protection.', icon: Shield, path: '/google-cloud-ai/security' },
  ];

  return (
    <div className="pt-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-light-blue/0 to-deep-blue/1 pt-16 mt-19">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-deep-blue mb-6">
              Google Cloud & <span className="text-light-blue">AI Consulting</span>
            </h1>
            <p className="text-xl font-normal text-black max-w-3xl mx-auto mb-8">
              Scalable solutions powered by Google Cloud and AI to accelerate your business growth.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-light-blue hover:bg-deep-blue transition"
            >
              Get a Free Consultation
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-light-blue/20 blur-2xl opacity-50 animate-pulse"></div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-deep-blue mb-4">Google Cloud & AI Services</h2>
            <p className="text-xl font-normal text-silver max-w-3xl mx-auto">
              Expert consulting for cloud migration, AI innovation, and secure scalability.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.15)" }}
                className="p-6 bg-light-gray rounded-xl hover:bg-light-blue/10 transition-transform duration-150 ease-in-out"
              >
                <Link to={service.path} className="block h-full">
                  <div className="flex justify-center mb-4">
                    <service.icon className="h-12 w-12 text-light-blue" />
                  </div>
                  <h3 className="text-xl font-semibold text-deep-blue mb-2 text-center">{service.title}</h3>
                  <p className="text-base font-normal text-silver text-center">{service.description}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-20 bg-gradient-to-r from-light-blue/10 to-deep-blue/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-deep-blue mb-8">Why Partner with DatasenceAI?</h2>
            <div className="flex flex-wrap justify-center gap-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-4 bg-white border border-silver rounded-xl shadow-md">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                  <span className="text-xl font-bold text-deep-blue">Certified Google Partner</span>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="p-4 bg-white border border-silver rounded-xl shadow-md">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                  <span className="text-xl font-bold text-deep-blue">Proven Expertise</span>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="p-4 bg-white border border-silver rounded-xl shadow-md">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                  <span className="text-xl font-bold text-deep-blue">Enterprise-Grade Security</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-light-gray text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold text-deep-blue mb-4">Ready to Leverage Google Cloud & AI?</h3>
          <p className="text-xl font-normal text-silver mb-6 max-w-2xl mx-auto">
            Transform your business with tailored solutions—let’s get started today.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-light-blue hover:bg-deep-blue transition"
          >
            Contact Us
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default GoogleCloudAI;