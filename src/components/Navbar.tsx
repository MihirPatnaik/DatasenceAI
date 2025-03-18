// D:\datasenceai\src\components\Navbar.tsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";

// Update NavbarProps to be empty since no props are required
interface NavbarProps {}

const Navbar: React.FC<NavbarProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 1);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsDropdownOpen(false), 200);
  };

  const handleNavigation = (path: string) => {
    setIsDropdownOpen(false);
    setIsOpen(false);
    navigate(path);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Updated navLinks order: Home, About, Pricing, Contact
  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/about", label: "About" },
    { path: "/pricing", label: "Pricing" },
    { path: "/contact", label: "Contact" },
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
                    className={`absolute top-full right-0 mr-2 mt-2 w-60 shadow-lg rounded-lg border border-silver z-[60] ${
                      isScrolled ? "bg-white text-deep-blue" : "bg-black text-white"
                    }`}
                  >
                    <div className="p-4">
                      {servicesDropdown.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => {
                            setIsDropdownOpen(false);
                            setIsOpen(false);
                            handleNavigation(item.path);
                          }}
                          className="block px-4 py-2 text-sm font-medium hover:bg-light-blue/20 hover:text-light-blue transition"
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
            <div className="relative h-full w-full flex-col items-center justify-center">
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
                        className={`mt-2 w-full shadow-lg rounded-lg border border-silver z-50 ${
                          isScrolled ? "bg-white text-deep-blue" : "bg-black text-white"
                        }`}
                      >
                        <div className="p-4">
                          {servicesDropdown.map((item) => (
                            <Link
                              key={item.path}
                              to={item.path}
                              onClick={() => {
                                setIsDropdownOpen(false);
                                setIsOpen(false);
                                handleNavigation(item.path);
                              }}
                              className="block px-4 py-2 text-lg font-medium hover:bg-light-blue/20 hover:text-light-blue transition"
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