import React from 'react';
import { motion } from 'framer-motion';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-[#0033A0] mb-6">
            Privacy Policy
          </h1>
          <p className="text-xl font-normal text-[#1A2A44]">
            Learn how we handle your data and use cookies at DatasenceAI.
          </p>
        </motion.div>

        <div className="text-left space-y-6 text-[#1A2A44]">
          <section>
            <h2 className="text-2xl font-semibold text-[#0033A0] mb-4">
              1. Introduction
            </h2>
            <p className="text-base font-normal">
              At DatasenceAI, we are committed to protecting your privacy. This Privacy Policy explains how we use cookies and similar technologies on our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#0033A0] mb-4">
              2. What Are Cookies?
            </h2>
            <p className="text-base font-normal">
              Cookies are small text files stored on your device when you visit our website. They help us improve your experience by remembering preferences, analyzing usage, and enabling features like analytics.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#0033A0] mb-4">
              3. Types of Cookies We Use
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Essential Cookies</strong>: Necessary for the website to function, such as maintaining user sessions.
              </li>
              <li>
                <strong>Analytics Cookies</strong>: Help us understand how users interact with our site (e.g., via Google Analytics).
              </li>
              <li>
                <strong>Preference Cookies</strong>: Remember your settings, like currency preferences.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#0033A0] mb-4">
              4. Managing Cookies
            </h2>
            <p className="text-base font-normal">
              You can manage cookies through your browser settings or by adjusting your preferences in our cookie banner. Note that disabling cookies may affect your experience on our site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#0033A0] mb-4">
              5. Contact Us
            </h2>
            <p className="text-base font-normal">
              If you have questions about our privacy practices, please contact us at{' '}
              <a href="mailto:mihir@datasenceai.com" className="text-[#0066FF] hover:underline">
                mihir@datasenceai.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;