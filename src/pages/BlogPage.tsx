import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const BlogPage = () => {
  const posts = [
    {
      title: 'How AI is Revolutionizing Data Labeling',
      excerpt: 'Discover how artificial intelligence is transforming the way we approach data labeling and annotation...',
      date: 'March 15, 2024',
      category: 'AI Technology',
      image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&q=80&w=800'
    },
    {
      title: 'Best Lead Generation Strategies for Tech Startups',
      excerpt: 'Learn the most effective B2B lead generation strategies that are helping tech startups scale...',
      date: 'March 10, 2024',
      category: 'Lead Generation',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800'
    },
    {
      title: 'Why Google Cloud is the Future of AI',
      excerpt: 'Explore the advantages of Google Cloud Platform for AI and machine learning implementations...',
      date: 'March 5, 2024',
      category: 'Cloud Computing',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800'
    }
  ];

  return (
    <div className="pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-deep-blue mb-6">
            Latest Insights & News
          </h1>
          <p className="text-xl font-normal text-silver max-w-3xl mx-auto">
            Stay updated with the latest trends in AI, data labeling, and business automation
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <motion.article
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <img
                src={post.image}
                alt={`Featured image for ${post.title}`}
                className="w-full h-48 object-cover"
                loading="lazy"
              />
              <div className="p-6">
                <div className="text-sm font-medium text-light-blue mb-2">{post.category}</div>
                <Link
                  to={`/blog/${index}`}
                  className="text-xl font-semibold text-deep-blue mb-3 hover:text-light-blue transition"
                >
                  {post.title}
                </Link>
                <p className="text-base font-normal text-silver mb-4">
                  {post.excerpt}
                </p>
                <div className="text-sm font-normal text-silver">
                  {post.date}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;