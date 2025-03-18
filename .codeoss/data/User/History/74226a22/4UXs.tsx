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
    { name: "Mihir Patnaik", role: "Founder & CEO", bio: "Visionary leader with over 10 years in AI and data science, driving DatasenceAI's mission to transform businesses.", image: "/team/mihir.jpg" },
    { name: "Priya Sharma", role: "CTO", bio: "Tech innovator with expertise in AI automation and cloud solutions, shaping our cutting-edge offerings.", image: "/team/priya.jpg" },
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
          <h1 className="text-4xl md:text-5xl font-bold text-deep-blue mb-6">About DatasenceAI</h1>
          <p className="text-xl font-normal text-silver max-w-3xl mx-auto mb-8">
            Transforming businesses with AI-powered data labeling, lead generation, and automation solutions. Discover our journey and vision.
          </p>
          <Link to="/contact" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-light-blue hover:bg-deep-blue">Get in Touch</Link>
        </motion.div>

        <section className="mb-16 bg-gradient-to-r from-light-blue/20 to-deep-blue/20 rounded-2xl p-8 shadow-md">
          <h3 className="text-2xl font-bold text-deep-blue mb-4">Our Mission</h3>
          <p className="text-base font-normal text-silver mb-6">
            At DatasenceAI, we empower businesses with AI-powered cloud solutions, data intelligence, and lead generation strategies...
          </p>
          <h3 className="text-2xl font-bold text-deep-blue mb-4">Our Vision</h3>
          <p className="text-base font-normal text-silver">
            Our vision is to be the trusted partner for AI-driven business growth...
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold text-deep-blue mb-6">Our Journey</h2>
          const milestones = [
        {year: "2023", event: "Founded DatasenceAI in Mumbai, India to revolutionize AI solutions."},
         year: "2024", event: "Launched B2B lead generation services for tech startups." },
  { year: "2025", event: "Expanded with a U.S. presence in San Francisco to serve global enterprises." },
];
// Rest of the file remains as updated previously
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
          <h2 className="text-3xl font-bold text-deep-blue mb-8 text-center">Our Core Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.15)" }} className="p-6 bg-light-gray rounded-xl hover:bg-light-blue/10 transition-transform duration-150 ease-in-out">
                <img src={value.image} alt={`${value.title} icon`} className="h-20 w-20 mx-auto mb-4 object-contain rounded-lg" loading="lazy" onError={(e) => (e.currentTarget.src = '/images/default-icon.jpg')} />
                <h3 className="text-xl font-semibold text-deep-blue mb-2 text-center">{value.title}</h3>
                <p className="text-base font-normal text-silver text-center">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold text-deep-blue mb-6">Our Leadership</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.2 }} className="bg-white rounded-xl p-6 shadow-md border border-silver">
                <img src={member.image} alt={`${member.name}, ${member.role}`} className="w-32 h-32 rounded-full mx-auto mb-4 object-cover" loading="lazy" onError={(e) => (e.currentTarget.src = '/images/default-profile.jpg')} />
                <h3 className="text-lg font-semibold text-deep-blue mb-2">{member.name}</h3>
                <p className="text-base font-normal text-silver mb-2">{member.role}</p>
                <p className="text-base font-normal text-silver">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="py-20 bg-gradient-to-r from-light-blue/20 to-deep-blue/20 rounded-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold text-deep-blue mb-8">Trusted by Industry Leaders</h2>
              <div className="flex flex-wrap justify-center gap-8 mt-8">
                <div className="p-4 bg-white border border-silver rounded-lg shadow-md"><div className="flex items-center gap-2"><span className="text-green-500">✔</span><span className="text-xl font-bold text-deep-blue">99.9% Accuracy</span></div></div>
                <div className="p-4 bg-white border border-silver rounded-lg shadow-md"><div className="flex items-center gap-2"><span className="text-green-500">✔</span><span className="text-xl font-bold text-deep-blue">24/7 Support</span></div></div>
                <div className="p-4 bg-white border border-silver rounded-lg shadow-md"><div className="flex items-center gap-2"><span className="text-green-500">✔</span><span className="text-xl font-bold text-deep-blue">Enterprise-Grade Security</span></div></div>
              </div>
            </div>
          </div>
        </section>

        <div className="text-center mb-16">
          <p className="text-xl font-normal text-silver mb-6">Ready to transform your business with AI? Let’s connect.</p>
          <Link to="/contact" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-light-blue hover:bg-deep-blue">Contact Us</Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;