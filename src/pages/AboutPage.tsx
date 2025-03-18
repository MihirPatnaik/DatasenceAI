import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const AboutPage: React.FC = () => {
  const values = [
    { title: "Excellence", description: "We deliver top-tier AI solutions with unmatched precision and quality.", image: '/images/excellence.jpg' },
    { title: "Collaboration", description: "Partnering closely with clients to drive AI-powered success.", image: '/images/collaboration.jpg' },
    { title: "Innovation", description: "Pushing the boundaries of AI technology for transformative results.", image: '/images/innovation.jpg' },
    { title: "Trust", description: "Ensuring data security and privacy with enterprise-grade standards.", image: '/images/trust.jpg' },
  ];

  const teamMembers = [
    { 
      name: "Mihir Patnaik", 
      role: "Founder & CEO", 
      bio: "After 20 years as a QA Manager in a CRM company, I discovered the transformative power of AI in business processes and customer experience. My passion for AI led me to become a Google Cloud ML Engineer and launch DatasenceAI — a platform delivering high-quality AI data labeling, B2B lead generation, and business automation (AI + RPA) solutions to businesses worldwide.", 
      image: "/team/mihir.jpg" 
    },
  ];

  const milestones = [
    { year: "2023", event: "Founded DatasenceAI to revolutionize AI solutions." },
    { year: "2024", event: "Launched B2B lead generation services for tech startups." },
    { year: "2025", event: "Expanded to serve global enterprises with custom AI implementations." },
  ];

  return (
    <div className="pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-6">About Datasence<span className="text-light-blue">AI</span></h1>
          <p className="text-xl font-normal text-black max-w-3xl mx-auto mb-8">
            Transforming businesses with AI-powered data labeling, lead generation, and automation solutions. Discover our journey and vision.
          </p>
          <Link to="/contact" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-light-blue hover:bg-deep-blue">Get in Touch</Link>
        </motion.div>

        <section className="mb-16 bg-gradient-to-r from-light-blue/20 to-deep-blue/20 rounded-2xl p-8 shadow-md">
          <h3 className="text-3xl font-bold text-black mb-4">Our Purpose</h3>
          <p className="text-lg font-normal text-black mb-6">
            At DatasenceAI, we are committed to powering business growth through AI-driven automation, intelligent data solutions, and cutting-edge cloud innovation. Our mission is to empower organizations with smarter, faster, and more efficient ways to harness data, streamline operations, and unlock new opportunities. By leveraging advanced AI technologies and Google Cloud expertise, we deliver transformative solutions tailored to your unique needs—whether it’s through precise data labeling, impactful B2B lead generation, or seamless business automation.
          </p>
          <div className="text-center">
            <Link to="/services" className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-light-blue hover:bg-deep-blue">
              Explore Our Solutions
            </Link>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold text-black mb-6">Our Journey</h2>  
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {milestones.map((milestone, index) => (
              <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: index * 0.2 }} className="bg-light-gray rounded-xl p-4 shadow-md border border-silver">
                <span className="text-lg font-semibold text-deep-blue">{milestone.year}</span>
                <p className="text-base font-normal text-silver">{milestone.event}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-black mb-8 text-center">Our Core Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.15)" }} className="p-6 bg-gradient-to-b from-deep-blue/90 to-medium-blue/90 rounded-xl hover:bg-light-blue/10 transition-transform duration-150 ease-in-out">
                <img src={value.image} alt={`${value.title} icon`} className="h-20 w-20 mx-auto mb-4 object-contain rounded-lg" loading="lazy" onError={(e) => (e.currentTarget.src = '/images/default-icon.jpg')} />
                <h3 className="text-xl font-semibold text-white mb-2 text-center">{value.title}</h3>
                <p className="text-base font-normal text-white text-center">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold text-black mb-6">Our Leadership</h2>
          <div className="grid grid-cols-1 sm:grid-cols-1 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.2 }} className="bg-gradient-to-b from-deep-blue/90 to-medium-blue/90 rounded-xl p-6 shadow-md border border-silver text-left">
                <img src={member.image} alt={`${member.name}, ${member.role}`} className="w-32 h-32 rounded-full mx-auto mb-4 object-cover" loading="lazy" onError={(e) => (e.currentTarget.src = '/images/default-profile.jpg')} />
                <h3 className="text-lg font-semibold text-white mb-2">{member.name}</h3>
                <p className="text-base font-normal text-white mb-4">{member.role}</p>
                <p className="text-base font-normal text-white">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="py-10 bg-gradient-to-r from-light-blue/20 to-deep-blue/20 rounded-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold text-black mb-8">Trusted by Industry Leaders</h2>
              <div className="flex flex-wrap justify-center gap-8 mt-8">
                <div className="p-4 bg-white border border-silver rounded-lg shadow-md"><div className="flex items-center gap-2"><span className="text-green-500">✔</span><span className="text-xl font-bold text-deep-blue">99.9% Accuracy</span></div></div>
                <div className="p-4 bg-white border border-silver rounded-lg shadow-md"><div className="flex items-center gap-2"><span className="text-green-500">✔</span><span className="text-xl font-bold text-deep-blue">24/7 Support</span></div></div>
                <div className="p-4 bg-white border border-silver rounded-lg shadow-md"><div className="flex items-center gap-2"><span className="text-green-500">✔</span><span className="text-xl font-bold text-deep-blue">Enterprise-Grade Security</span></div></div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default AboutPage;