import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the user has already accepted cookies
    const hasAccepted = localStorage.getItem('cookieConsent');
    if (!hasAccepted) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ y: 150, opacity: 0, scale: 0.95 }} // Start lower with slight scale down and no opacity
      animate={{
        y: 0,
        opacity: 1,
        scale: 1,
        transition: {
          delay: 1, // 1-second delay after page load
          duration: 1.2, // Slower 1.2-second slide-up and fade-in
          ease: [0.4, 0.0, 0.2, 1], // Custom easing for smooth motion
          type: "spring", // Spring effect for natural feel
          stiffness: 80,
          damping: 15,
        },
      }} // Initial animation
      transition={{ duration: 0.3 }} // Default transition for other states
      whileInView={{
        scale: [1, 1.05, 1], // Pulse effect after animation completes
        transition: {
          delay: 1.2, // Start pulse after slide-up (1.2s)
          duration: 0.5,
          times: [0, 0.5, 1],
          ease: "easeInOut",
        },
      }} // Pulse animation
      exit={{ y: 150, opacity: 0, scale: 0.95 }} // Slide down with scale effect
      className="fixed bottom-0 left-0 w-full bg-[#2D8212] text-white p-8 text-center z-50 shadow-lg" // Height increased to p-8
    >
      <p className="text-sm md:text-base mb-4">
        We use cookies to enhance your experience. By continuing, you agree to our{' '}
        <Link to="/privacy-policy" className="underline hover:text-[#D4F2C6] transition">
          Privacy Policy
        </Link>
        .
      </p>
      <button
        onClick={handleAccept}
        className="mt-2 md:mt-0 md:ml-4 px-6 py-3 bg-[#1A2A44] text-white rounded-md hover:bg-[#0033A0] transition"
      >
        Accept Cookies
      </button>
    </motion.div>
  );
};

export default CookieBanner;