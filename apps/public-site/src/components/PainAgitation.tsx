// --- apps/public-site/src/components/PainAgitation.tsx ---
'use client';
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import './PainAgitation.css';

// TypeScript Interfaces for our content structure
interface PainPoint {
  id: string;
  image: string;
  headline: string;
  text: string;
  imageSide: 'left' | 'right';
}
interface PainAgitationProps {
  content: {
    mainHeadline: string;
    painPoints: PainPoint[];
  };
}

const PainAgitation: React.FC<PainAgitationProps> = ({ content }) => {
  const displayContent = content || { mainHeadline: 'Loading...', painPoints: [] };

  return (
    <section className="pain-section">
      <div className="container">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
        >
          {displayContent.mainHeadline}
        </motion.h2>
        
        <div className="pain-points-container">
          {displayContent.painPoints.map((point) => (
            <div key={point.id} className={`pain-point-row ${point.imageSide === 'left' ? 'image-left' : ''}`}>
              <motion.div 
                className="pain-image-container"
                initial={{ opacity: 0, x: point.imageSide === 'left' ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.7 }}
              >
                <Image src={point.image} alt={point.headline} width={500} height={400} style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
              </motion.div>
              <motion.div 
                className="pain-text-container"
                initial={{ opacity: 0, x: point.imageSide === 'left' ? 50 : -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                <h3>{point.headline}</h3>
                <p>{point.text}</p>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PainAgitation;