import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-dark-gray text-silver py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold text-deep-blue mb-4">DatasenceAI</h3>
            <p className="text-base font-normal text-silver">Transforming businesses with AI solutions.</p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-deep-blue mb-4">Services</h3>
            <ul className="space-y-2">
              <li><Link to="/ai-data-labeling" className="text-base font-normal text-silver hover:text-light-blue">AI Data Labeling</Link></li>
              <li><Link to="/b2b-lead-generation" className="text-base font-normal text-silver hover:text-light-blue">B2B Lead Generation</Link></li>
              <li><Link to="/services" className="text-base font-normal text-silver hover:text-light-blue">More Services</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold text-deep-blue mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-light-blue" /> <Link to="mailto:mihir@datasenceai.com" className="text-base font-normal text-silver hover:text-light-blue">mihir@datasenceai.com</Link></li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-light-blue" /> <span className="text-base font-normal text-silver">+91 93392 75140</span></li>
              <li className="flex items-start gap-2"><MapPin className="h-4 w-4 text-light-blue mt-1" /> <span className="text-base font-normal text-silver">Mumbai, India (HQ)<br />548 Market St, San Francisco, CA 94104 (U.S.)</span></li>
            </ul>
          </div>
        </div>
        <p className="mt-8 text-center text-base font-normal text-silver">© 2025 DatasenceAI. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;