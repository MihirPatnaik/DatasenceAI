import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Bot, Settings, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const BusinessAutomationPage: React.FC = () => {
  const benefits = [
    { icon: Settings, title: 'Process Optimization', description: 'Reduce manual workload and improve efficiency with AI-driven workflows.' },
    { icon: TrendingUp, title: 'Scalability', description: 'Grow your business seamlessly without increasing operational costs.' },
    { icon: Bot, title: 'AI & RPA Integration', description: 'Leverage advanced AI and Robotic Process Automation for smarter, automated processes.' },
  ];

  return (
    <div className="pt-20 pb-16">
      {/* Hero Section */}
      <section className="relative text-center py-20 bg-gradient-to-r from-light-blue/20 to-deep-blue/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold text-deep-blue"
          >
            Business Automation with <span className="text-light-blue">AI & RPA</span>
          </motion.h1>
          <p className="mt-6 text-xl text-black max-w-3xl mx-auto mb-8">
            Streamline your operations with cutting-edge automation solutions that enhance productivity, reduce costs, and drive growth.
          </p>
          <Link
            to="/contact"
            className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-light-blue hover:bg-blue-700"
          >
            Get a Free Consultation
            <ArrowRight className="ml-2 h-5 w-5 text-white" />
          </Link>
          {/* Glowing circle for futuristic design */}
          <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-dark-blue/20 blur-2xl opacity-50 animate-pulse"></div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-deep-blue">Why Choose Automation?</h2>
            <p className="text-lg text-black mt-4">Boost efficiency, reduce human error, and accelerate growth with AI-powered solutions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.15)' }}
                className="p-6 bg-light-gray rounded-xl shadow-md hover:bg-light-blue/10 transition-transform duration-150 ease-in-out"
              >
                <benefit.icon className="h-12 w-12 text-deep-blue mb-4" />
                <h3 className="text-xl font-semibold text-deep-blue">{benefit.title}</h3>
                <p className="text-silver mt-2">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-r from-light-blue/10 to-deep-blue/10 rounded-2xl shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-deep-blue text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-light-gray rounded-xl p-6 shadow-md border border-silver text-center"
            >
              <span className="text-2xl font-semibold text-deep-blue mb-4">1️⃣</span>
              <p className="text-black">Assess Needs – Identify automation opportunities in your workflows.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-light-gray rounded-xl p-6 shadow-md border border-silver text-center"
            >
              <span className="text-2xl font-semibold text-deep-blue mb-4">2️⃣</span>
              <p className="text-black">Implement Solutions – Deploy AI & RPA tools tailored to your business.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-light-gray rounded-xl p-6 shadow-md border border-silver text-center"
            >
              <span className="text-2xl font-semibold text-deep-blue mb-4">3️⃣</span>
              <p className="text-black">Optimize & Scale – Continuously refine and expand automation.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-light-gray rounded-xl p-6 shadow-md border border-silver text-center"
            >
              <span className="text-2xl font-semibold text-deep-blue mb-4">4️⃣</span>
              <p className="text-black">Monitor Results – Track performance and ROI with real-time analytics.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Signals Section */}
      <section className="py-20 bg-gradient-to-r from-light-blue/20 to-deep-blue/20 rounded-2xl shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-deep-blue mb-8">
            Trusted by Leading Enterprises
          </h2>
          <div className="flex flex-wrap justify-center gap-8 mt-8">
            <div className="p-4 bg-white border border-silver rounded-xl shadow-md">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
                <span className="text-xl font-bold text-deep-blue">99.9% Uptime</span>
              </div>
            </div>
            <div className="p-4 bg-white border border-silver rounded-xl shadow-md">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
                <span className="text-xl font-bold text-deep-blue">24/7 Support</span>
              </div>
            </div>
            <div className="p-4 bg-white border border-silver rounded-xl shadow-md">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
                <span className="text-xl font-bold text-deep-blue">Enterprise-Grade Security</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <div className="text-center py-12 px-6 bg-light-gray rounded-t-2xl shadow-md">
        <p className="text-xl text-silver mb-6">
          Ready to automate your business processes? Let’s connect.
        </p>
        <Link
          to="/contact"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-light-blue hover:bg-blue-700"
        >
          Contact Us
          <ArrowRight className="ml-2 h-5 w-5 text-white" />
        </Link>
      </div>
    </div>
  );
};

export default BusinessAutomationPage;