import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/about", label: "About" },
    { path: "/services", label: "Services" },
    { path: "/contact", label: "Contact" },
  ];

  return (
    <nav className="bg-dark-gray shadow-md fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3">
            <img src="/logo.jpg" alt="DatasenceAI Company Logo" className="h-10 w-auto" loading="lazy" />
            <span className="text-xl font-bold text-silver hidden md:block">DatasenceAI</span>
          </Link>

          <div className="hidden md:flex space-x-6 items-center">
            {navLinks.map((link) => (
              <div key={link.path} className="relative flex items-center">
                <Link to={link.path} className={`text-base font-medium text-silver hover:text-light-blue transition ${location.pathname === link.path ? "text-light-blue" : ""}`}>
                  {link.label}
                </Link>
                {location.pathname === link.path && (
                  <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 h-2 w-2 bg-light-blue rounded-full"></span>
                )}
              </div>
            ))}
          </div>

          <button
            className="md:hidden text-silver focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-dark-gray shadow-md">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`block px-4 py-2 text-base font-medium text-silver hover:bg-silver/10 ${location.pathname === link.path ? "text-light-blue" : ""}`}
              onClick={() => setIsOpen(false)}
            >
              {link.label}
              {location.pathname === link.path && (
                <span className="inline-block ml-2 h-2 w-2 bg-light-blue rounded-full"></span>
              )}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;