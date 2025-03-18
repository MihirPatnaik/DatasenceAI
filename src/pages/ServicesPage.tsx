import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";

interface NavbarProps {
  setMenuOpen: (isOpen: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ setMenuOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 1);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Hover handlers
  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsDropdownOpen(false), 200);
  };

  // Navigation handler
  const handleNavigation = (path: string) => {
    setIsDropdownOpen(false); // Close dropdown
    setIsOpen(false); // Close menu
    setMenuOpen(false); // Update Layout's state
    navigate(path);
  };

  // Toggle menu and update Layout's state
  const toggleMenu = () => {
    setIsOpen(!isOpen);
    setMenuOpen(!isOpen);
  };

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/about", label: "About" },
    { path: "/contact", label: "Contact" },
    { path: "/services", label: "Price" },
  ];

  const servicesDropdown = [
    { path: "/b2b-lead-generation", label: "AI Leads" },
    { path: "/ai-data-labeling", label: "Data Labeling" },
    { path: "/business-automation", label: "AutoBiz" },
    { path: "/google-cloud-ai", label: "Cloud & AI" },
  ];

  return (
    <nav
      className={`shadow-md fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-white text-deep-blue" : "bg-deep-blue text-white"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: isScrolled ? 1 : 1.1 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Link
              to="/"
              className={`text-2xl font-bold ${
                isScrolled ? "text-deep-blue" : "text-white"
              }`}
            >
              Datasence<span className="text-light-blue">AI</span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6 items-center">
            {navLinks.map((link) => (
              <div key={link.path} className="relative flex items-center">
                <Link
                  to={link.path}
                  className={`text-base font-medium ${
                    isScrolled
                      ? "text-deep-blue hover:text-light-blue"
                      : "text-white hover:text-light-blue"
                  } transition ${
                    location.pathname === link.path
                      ? "text-light-blue font-semibold"
                      : ""
                  }`}
                >
                  {link.label}
                </Link>
                {location.pathname === link.path && (
                  <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 h-2 w-2 bg-light-blue rounded-full"></span>
                )}
              </div>
            ))}

            {/* AI Solutions Dropdown */}
            <div
              className="relative flex items-center"
              ref={dropdownRef}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className={`text-base font-medium ${
                  isScrolled
                    ? "text-deep-blue hover:text-light-blue"
                    : "text-white hover:text-light-blue"
                } flex items-center gap-1 transition focus:outline-none`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-label="Toggle AI Solutions dropdown"
                aria-expanded={isDropdownOpen}
              >
                AI Solutions
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    isDropdownOpen ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 w-60 bg-black text-white shadow-lg rounded-lg border border-silver z-50" // Changed to bg-black and text-white
                  >
                    <div className="p-4"> {/* Increased padding to ensure content stays away from border */}
                      {servicesDropdown.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => {
                            setIsDropdownOpen(false); // Close dropdown
                            setIsOpen(false); // Force close menu
                            setMenuOpen(false); // Update Layout's state
                            handleNavigation(item.path); // Navigate
                          }}
                          className="block px-4 py-2 text-sm font-medium hover:bg-light-blue/20 hover:text-light-blue transition" // Preserved hover:text-light-blue
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className={`md:hidden ${
              isScrolled ? "text-deep-blue" : "text-white"
            } focus:outline-none`}
            onClick={toggleMenu}
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.8, ease: [0.15, 0.2, 0.1, 1] }}
            className="md:hidden fixed top-0 right-0 h-full bg-[#0048e7] text-white z-40"
            style={{ width: "78vw" }}
          >
            <div className="relative h-full w-full flex flex-col items-center justify-center">
              {/* Close Button */}
              <button
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center focus:outline-none z-50"
                onClick={toggleMenu}
                aria-label="Close navigation menu"
              >
                <div className="relative w-5 h-5">
                  <motion.span
                    className="absolute left-0 w-5 h-[2px] bg-white"
                    style={{ top: "10px" }}
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 45 }}
                    transition={{ duration: 0.4, ease: [0.52, 0.01, 0.16, 1] }}
                  />
                  <motion.span
                    className="absolute left-0 w-5 h-[2px] bg-white"
                    style={{ top: "10px" }}
                    initial={{ rotate: 0 }}
                    animate={{ rotate: -45 }}
                    transition={{ duration: 0.4, ease: [0.52, 0.01, 0.16, 1] }}
                  />
                </div>
              </button>

              {/* Mobile Links */}
              <div className="px-6 py-4 space-y-6 text-center">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`block text-2xl font-normal font-['Open Sans'] text-white hover:text-gray-300 transition ${
                      location.pathname === link.path
                        ? "text-light-blue font-semibold"
                        : ""
                    }`}
                    onClick={() => handleNavigation(link.path)}
                  >
                    {link.label}
                    {location.pathname === link.path && (
                      <span className="inline-block ml-2 h-2 w-2 bg-light-blue rounded-full"></span>
                    )}
                  </Link>
                ))}

                {/* Mobile AI Solutions Dropdown */}
                <div className="relative">
                  <button
                    className="w-full px-4 py-2 text-2xl font-normal font-['Open Sans'] text-white hover:text-gray-300 flex items-center justify-between transition focus:outline-none"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    aria-label="Toggle AI Solutions dropdown"
                    aria-expanded={isDropdownOpen}
                  >
                    AI Solutions
                    <ChevronDown
                      className={`w-6 h-6 text-white transition-transform ${
                        isDropdownOpen ? "rotate-180" : "rotate-0"
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="mt-2 w-full bg-black text-white shadow-lg rounded-lg border border-silver z-50" // Changed to bg-black and text-white
                      >
                        <div className="p-4"> {/* Increased padding to ensure content stays away from border */}
                          {servicesDropdown.map((item) => (
                            <Link
                              key={item.path}
                              to={item.path}
                              onClick={() => {
                                setIsDropdownOpen(false); // Close dropdown
                                setIsOpen(false); // Force close menu
                                setMenuOpen(false); // Update Layout's state
                                handleNavigation(item.path); // Navigate
                              }}
                              className="block px-4 py-2 text-lg font-medium hover:bg-light-blue/20 hover:text-light-blue transition" // Preserved hover:text-light-blue
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;