import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ContactPage: React.FC = () => {
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
            Get in Touch
          </h1>
          <p className="text-xl text-black max-w-3xl mx-auto">
            Have a question or ready to start your AI journey? We're here to help.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 bg-blue p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.15)" }}
            className="p-6 bg-light-gray rounded-xl shadow-md hover:bg-light-blue/10 transition-transform duration-150 ease-in-out"
          >
            <img 
              src="/images/email.jpg" 
              alt="Email Image" 
              className="h-16 w-16 mx-auto mb-4 object-contain rounded-lg"
            />
            <h3 className="text-lg font-semibold text-deep-blue mb-2 text-center">Email</h3>
            <p className="text-light-blue font-medium mb-2 text-center">contact@datasenceai.com</p>
            <p className="text-silver text-center">Send us an email anytime</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.15)" }}
            className="p-6 bg-light-gray rounded-xl shadow-md hover:bg-light-blue/10 transition-transform duration-150 ease-in-out"
          >
            <img 
              src="/images/phone.jpg" 
              alt="Phone Image" 
              className="h-16 w-16 mx-auto mb-4 object-contain rounded-lg"
            />
            <h3 className="text-lg font-semibold text-deep-blue mb-2 text-center">Phone</h3>
            <p className="text-light-blue font-medium mb-2 text-center">+1 (555) 123-4567</p>
            <p className="text-silver text-center">Mon-Fri from 9am to 6pm PST</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.15)" }}
            className="p-6 bg-light-gray rounded-xl shadow-md hover:bg-light-blue/10 transition-transform duration-150 ease-in-out"
          >
            <img 
              src="/images/office.jpg" 
              alt="Office Image" 
              className="h-16 w-16 mx-auto mb-4 object-contain rounded-lg"
            />
            <h3 className="text-lg font-semibold text-deep-blue mb-2 text-center">Office</h3>
            <p className="text-light-blue font-medium mb-2 text-center">San Francisco, CA</p>
            <p className="text-silver text-center">Silicon Valley Innovation Hub</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-light-light grey rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-deep-blue mb-6">
              Send us a Message
            </h2>
            {/* Embed Google Form with Provided Iframe */}
            <iframe
              src="https://docs.google.com/forms/d/e/1FAIpQLSevj1ldaG2jz9rvEuJApBU_mbGa2Tt--WULmtLQ_fVJ-jiKEg/viewform?embedded=true"
              width="100%"
              height="600"
              frameBorder="0"
              marginHeight={0}
              marginWidth={0}
              className="rounded-md"
            >
              Loading…
            </iframe>
            {/* Optional: Fallback Text if Iframe Fails */}
            <p className="text-silver mt-4">
              If the form doesn’t load, please visit{' '}
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSevj1ldaG2jz9rvEuJApBU_mbGa2Tt--WULmtLQ_fVJ-jiKEg/viewform"
                target="_blank"
                rel="noopener noreferrer"
                className="text-light-blue hover:underline"
              >
                our contact form
              </a>
              .
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactPage;