import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const PricingPage = () => {
  const [currency, setCurrency] = useState<'usd' | 'inr' | 'gbp'>('usd');

  const plans = [
    {
      name: 'Starter',
      price: {
        usd: '$999',
        inr: '₹82,000',
        gbp: '£799'
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
        usd: '$4,999',
        inr: '₹410,000',
        gbp: '£3,999'
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
      ],
      popular: true // Add popular flag for the badge
    },
    {
      name: 'Enterprise',
      price: {
        usd: 'Starting at $15,000',
        inr: 'Starting at ₹1,230,000',
        gbp: 'Starting at £11,999'
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

  console.log('PricingPage mounted');

  return (
    <div className="pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-deep-blue mb-6">
            Transparent Pricing for Every Business
          </h1>
          <p className="text-xl font-normal text-silver max-w-3xl mx-auto">
            Choose the plan that best fits your needs. All plans include our core AI features.
          </p>
        </motion.div>

        <div className="flex justify-center mb-8 space-x-1">
          <button
            onClick={() => setCurrency('usd')}
            className={`px-4 py-2 text-sm font-medium ${
              currency === 'usd' ? 'bg-light-blue text-white' : 'bg-silver text-deep-blue'
            } rounded-l-md transition`}
          >
            USD
          </button>
          <button
            onClick={() => setCurrency('inr')}
            className={`px-4 py-2 text-sm font-medium ${
              currency === 'inr' ? 'bg-light-blue text-white' : 'bg-silver text-deep-blue'
            } transition`}
          >
            INR
          </button>
          <button
            onClick={() => setCurrency('gbp')}
            className={`px-4 py-2 text-sm font-medium ${
              currency === 'gbp' ? 'bg-light-blue text-white' : 'bg-silver text-deep-blue'
            } rounded-r-md transition`}
          >
            GBP
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow ${
                plan.popular ? 'bg-light-blue/5 border border-light-blue' : ''
              }`}
            >
              {plan.popular && (
                <span className="absolute top-0 left-0 bg-yellow-400 text-black text-sm font-bold px-2 py-1 rounded-br-lg">
                  Most Popular
                </span>
              )}
              <div className="p-8">
                <h3 className="text-2xl font-bold text-deep-blue mb-4">
                  {plan.name}
                </h3>
                <div className="mb-6">
                  <span className="text-5xl font-extrabold text-light-blue">{plan.price[currency]}</span>
                  {!plan.price[currency].includes('Starting at') && (
                    <span className="text-lg font-normal text-silver">/month</span>
                  )}
                </div>
                <p className="text-base font-normal text-silver mb-8">
                  {plan.description}
                </p>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-1" />
                      <span className="text-base font-normal text-silver">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/contact"
                  className={`block w-full text-center py-3 rounded-md text-white font-medium ${
                    plan.popular
                      ? 'bg-deep-blue hover:bg-light-blue'
                      : 'bg-light-blue hover:bg-deep-blue'
                  } transition`}
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