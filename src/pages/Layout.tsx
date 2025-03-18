// D:\datasenceai\src\pages\Layout.tsx
import React from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";

interface LayoutProps {
  children: React.ReactNode;
  isMenuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, isMenuOpen, setMenuOpen }) => {
  const contentVariants = {
    closed: {
      x: 0,
      transition: { duration: 0.8, ease: [0.15, 0.2, 0.1, 1] },
    },
    open: {
      x: "-20vw", // Adjusted to a smaller value for a subtler shift
      transition: { duration: 0.8, ease: [0.15, 0.2, 0.1, 1] },
    },
  };

  const overlayVariants = {
    hidden: {
      opacity: 0,
      transition: { duration: 0.7, ease: [0.15, 0.2, 0.1, 1] },
    },
    visible: {
      opacity: 0.7, // Increased opacity for stronger dimming
      transition: { duration: 0.7, ease: [0.15, 0.2, 0.1, 1] },
    },
  };

  return (
    <div className="relative min-h-screen">
      <Navbar setMenuOpen={setMenuOpen} />
      <motion.div
        className="fixed inset-0 bg-gray-900 pointer-events-none z-20" // Changed to bg-gray-900 for darker overlay
        variants={overlayVariants}
        initial="hidden"
        animate={isMenuOpen ? "visible" : "hidden"}
      />
      <motion.div
        className="relative z-10"
        variants={contentVariants}
        initial="closed"
        animate={isMenuOpen ? "open" : "closed"}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default Layout;