// --- apps/public-site/src/components/Solution.tsx (DEFINITIVE FINAL POLISH) ---
'use client';
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import './Solution.css';

interface SolutionProps {
  content: {
    headline: string;
    portraitImage: string;
    storyText: string;
  };
}

const Solution: React.FC<SolutionProps> = ({ content }) => {
  const displayContent = content || { headline: 'Loading...', portraitImage: '/placeholder.jpg', storyText: 'Loading founder story...' };
  
  const storyParagraphs = displayContent.storyText.split('\n').filter(p => p.trim() !== '');

  return (
    <section className="solution-section">
      <div className="container solution-grid">
        <motion.div 
          className="founder-image-wrapper"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7 }}
        >
          <Image
            src={displayContent.portraitImage}
            alt="Mike Salazar, Founder of Property Pasalo"
            width={500}
            height={550}
            style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
          />
        </motion.div>
        <motion.div 
          className="founder-story-wrapper"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <h2>{displayContent.headline}</h2>
          {storyParagraphs.map((paragraph, index) => {
              // The last paragraph gets special styling
              if (index === storyParagraphs.length - 1) {
                  return <p key={index} className="founder-result-statement">{paragraph}</p>;
              }
              return <p key={index}>{paragraph}</p>;
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default Solution;