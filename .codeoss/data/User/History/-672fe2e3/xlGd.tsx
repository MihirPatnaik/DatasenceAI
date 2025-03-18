import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Database, Users, Bot, Cloud, Megaphone } from 'lucide-react';

const ServicesPage = () => {
  const services = [
    { icon: Database, title: 'AI Data Labeling & Annotation', description: 'High-quality data annotation services for training AI models, including image, video, text, and audio annotation.', features: ['Image & Video Annotation', 'Text & NLP Annotation', 'Audio Annotation', 'Quality Control & Validation'], price: 'Starting at $0.05/image', path: '/ai-data-labeling' },
    { icon: Users, title: 'B2B Lead Generation', description: 'AI-powered lead generation services to help tech companies find and connect with ideal clients.', features: ['Lead List Building', 'Email & LinkedIn Outreach', 'AI-Powered Copywriting', 'CRM Integration'], price: 'From $499/month', path: '/b2b-lead-generation' },
    { icon: Bot, title: 'AI Business Automation', description: 'Streamline your business operations with custom AI and RPA solutions.', features: ['AI Chatbot Development', 'RPA Implementation', 'Document Processing', 'Workflow Automation'], price: 'Starting at $999', path: '/business-automation' },
    { icon: Cloud, title: 'Google Cloud & AI Consulting', description: 'Expert guidance for Google Cloud implementation and AI model deployment.', features: ['Cloud Migration', 'AI/ML Model Deployment', 'Google Workspace Setup', 'Security & Compliance'], price: '$150/hour', path: '/services' },
    { icon: Megaphone, title: 'Google Ads & Digital Growth', description: 'Maximize your ROI with AI-optimized digital marketing campaigns.', features: ['Google Ads Management', 'SEO Optimization', 'AI-Based Targeting', 'Performance Analytics'], price: '10-15% of ad spend', path: '/services' },
  ];

  return (
    <div className="pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-deep-blue mb-6">Our AI-Powered Services</h1>
          <p className="text-xl font-normal text-silver max-w-3xl mx-auto">Comprehensive solutions to transform your business with artificial intelligence</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="p-8">
                <service.icon className="h-12 w-12 text-light-blue mb-6" />
                <Link to={service.path} className="text-xl font-semibold text-deep-blue mb-4 hover:text-light-blue transition">{service.title}</Link>
                <p className="text-base font-normal text-silver mb-6">{service.description}</p>
                <ul className="space-y-3 mb-6">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-base font-normal text-silver"><span className="h-1.5 w-1.5 bg-light-blue rounded-full mr-2"></span>{feature}</li>
                  ))}
                </ul>
                <div className="text-lg font-semibold text-light-blue">{service.price}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;