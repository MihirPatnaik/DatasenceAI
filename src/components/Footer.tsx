import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <>
      <footer className="bg-black text-white py-8 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <h3 className="text-lg font-bold text-white mb-2">
                Datasence<span style={{ color: '#0066FF' }}>AI</span>
              </h3>
              <p className="text-sm font-normal text-gray-200">
                Smarter Data, Smarter Decisions
              </p>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Services</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/ai-data-labeling" className="text-sm font-medium text-gray-200 hover:text-[#0066FF] transition">
                    AI Data Labeling
                  </Link>
                </li>
                <li>
                  <Link to="/b2b-lead-generation" className="text-sm font-medium text-gray-200 hover:text-[#0066FF] transition">
                    B2B Lead Generation
                  </Link>
                </li>
                <li>
                  <Link to="/business-automation" className="text-sm font-medium text-gray-200 hover:text-[#0066FF] transition">
                    Business Automation
                  </Link>
                </li>
                <li>
                  <Link to="/google-cloud-ai" className="text-sm font-medium text-gray-200 hover:text-[#0066FF] transition">
                    Google Cloud & AI
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Contact</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#0066FF]" />
                  <a href="mailto:mihir@datasenceai.com" className="text-sm font-medium text-gray-200 hover:text-[#0066FF] transition">
                    mihir@datasenceai.com
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[#0066FF]" />
                  <span className="text-sm font-medium text-gray-200">
                    +91 93392 75140
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-[#0066FF] mt-1" />
                  <span className="text-sm font-medium text-gray-200">
                    Based in: Bhubaneswar, Odisha, India<br />
                  </span>
                </li>
              </ul>
            </div>

            {/* Policies and Links */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Policies</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/privacy-policy" className="text-sm font-medium text-gray-200 hover:text-[#0066FF] transition">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms-of-service" className="text-sm font-medium text-gray-200 hover:text-[#0066FF] transition">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/cookie-policy" className="text-sm font-medium text-gray-200 hover:text-[#0066FF] transition">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      {/* Separator Line and Social Media Section */}
      <div className="bg-black text-white text-center py-4 w-full">
        <hr className="w-full h-1 bg-[#0066FF] border-0 mb-3" />
        <div className="flex justify-center items-center gap-4 mb-3">
          <a href="https://facebook.com/datasenceai" target="_blank" rel="noopener noreferrer" className="hover:text-[#0066FF] transition">
            <Facebook className="h-5 w-5" />
          </a>
          <a href="https://twitter.com/datasenceai" target="_blank" rel="noopener noreferrer" className="hover:text-[#0066FF] transition">
            <Twitter className="h-5 w-5" />
          </a>
          <a href="https://instagram.com/datasenceai" target="_blank" rel="noopener noreferrer" className="hover:text-[#0066FF] transition">
            <Instagram className="h-5 w-5" />
          </a>
          <a href="https://youtube.com/datasenceai" target="_blank" rel="noopener noreferrer" className="hover:text-[#0066FF] transition">
            <Youtube className="h-5 w-5" />
          </a>
        </div>
        <p className="text-sm font-normal">
          © {new Date().getFullYear()} DatasenceAI. All rights reserved.
        </p>
      </div>
    </>
  );
};

export default Footer;