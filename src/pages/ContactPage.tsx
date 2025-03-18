import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ContactPage: React.FC = () => {
  return (
    <div className="pt-20 pb-16 bg-gradient-to-b from-deep-blue/90 to-medium-blue/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Get in Touch</h1>
          <p className="text-xl font-normal text-white max-w-3xl mx-auto">Have a question or ready to start your AI journey? We're here to help.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 bg-  p-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.15)" }} className="p-6 bg-gradient-to-b from-deep-blue/90 to-medium-blue/90 rounded-xl shadow-md hover:bg-light-blue/10 transition-transform duration-150 ease-in-out">
            <img src="/images/email.jpg" alt="Email contact icon" className="h-16 w-16 mx-auto mb-4 object-contain rounded-lg" loading="lazy" />
            <h3 className="text-lg font-semibold text-white mb-2 text-center">Email</h3>
            <p className="text-base font-medium text-light-blue mb-2 text-center">contact@datasenceai.com</p>
            <p className="text-base font-normal text-white text-center">Send us an email anytime</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.15)" }} className="p-6 bg-gradient-to-b from-deep-blue/90 to-medium-blue/90 rounded-xl shadow-md hover:bg-light-blue/10 transition-transform duration-150 ease-in-out">
            <img src="/images/phone.jpg" alt="Phone contact icon" className="h-16 w-16 mx-auto mb-4 object-contain rounded-lg" loading="lazy" />
            <h3 className="text-lg font-semibold text-white mb-2 text-center">Phone</h3>
            <p className="text-base font-medium text-light-blue mb-2 text-center">+919339275140</p>
            <p className="text-base font-normal text-white text-center">Mon-Fri from 9am to 6pm PST</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.15)" }} className="p-6 bg-gradient-to-b from-deep-blue/90 to-medium-blue/90 rounded-xl shadow-md hover:bg-light-blue/10 transition-transform duration-150 ease-in-out">
            <img src="/images/office.jpg" alt="Office location icon" className="h-16 w-16 mx-auto mb-4 object-contain rounded-lg" loading="lazy" />
            <h3 className="text-lg font-semibold text-white mb-2 text-center">Office</h3>
            <p className="text-base font-medium text-light-blue mb-1 text-center">Bhubaneswar, India (HQ)</p>
            <p className="text-base font-normal text-white text-center">Serving clients globally</p>          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="max-w-3xl mx-auto">
          <div className="bg-light-gray rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-deep-blue mb-6">Send us a Message</h2>
            <iframe src="https://docs.google.com/forms/d/e/1FAIpQLSevj1ldaG2jz9rvEuJApBU_mbGa2Tt--WULmtLQ_fVJ-jiKEg/viewform?embedded=true" width="100%" height="600" frameBorder="0" marginHeight={0} marginWidth={0} className="rounded-md">Loading…</iframe>
            <p className="text-base font-normal text-silver mt-4">
              If the form doesn’t load, please visit{' '}
              <Link to="https://docs.google.com/forms/d/e/1FAIpQLSevj1ldaG2jz9rvEuJApBU_mbGa2Tt--WULmtLQ_fVJ-jiKEg/viewform" target="_blank" rel="noopener noreferrer" className="text-light-blue hover:underline">our contact form</Link>.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactPage;