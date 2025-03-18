import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const PricingPage = () => {
  const plans = [
    {
      name: 'Starter',
      price: {
        usd: '$499',
        inr: '₹41,000',
        gbp: '£399'
      },
      description: 'Perfect for small businesses starting with AI',
      features: [
        'Basic Data Annotation (up to 1000 items)',
        '100 Qualified Leads/month',
        'Basic Chatbot Setup',
        '5 hours of AI Consulting',
        'Email Support'
      ]
    },
    {
      name: 'Professional',
      price: {
        usd: '$1,999',
        inr: '₹165,000',
        gbp: '£1,599'
      },
      description: 'Ideal for growing companies',
      features: [
        'Advanced Data Annotation (up to 5000 items)',
        '500 Qualified Leads/month',
        'Custom AI Chatbot',
        '20 hours of AI Consulting',
        'Priority Support',
        'Google Cloud Setup',
        'Basic RPA Implementation'
      ]
    },
    {
      name: 'Enterprise',
      price: {
        usd: 'Custom',
        inr: 'Custom',
        gbp: 'Custom'
      },
      description: 'For large organizations with specific needs',
      features: [
        'Unlimited Data Annotation',
        'Custom Lead Generation Strategy',
        'Advanced AI Solutions',
        'Dedicated AI Consultant',
        '24/7 Premium Support',
        'Custom Cloud Architecture',
        'Full RPA Implementation',
        'Custom AI Model Training'
      ]
    }
  ];

  return (
    <div className="pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Transparent Pricing for Every Business
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the plan that best fits your needs. All plans include our core AI features.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {plan.name}
                </h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-indigo-600">
                    {plan.price.usd}
                  </span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-gray-600 mb-8">
                  {plan.description}
                </p>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-1" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/contact"
                  className="block w-full text-center bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700 transition"
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingPage;