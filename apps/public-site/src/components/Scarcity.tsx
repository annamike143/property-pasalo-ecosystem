// --- apps/public-site/src/components/Scarcity.tsx ---
'use client';
import React from 'react';
import { motion } from 'framer-motion';
import LiveSlots from './LiveSlots';
import './Scarcity.css';

// TypeScript Interface for our content
interface ScarcityProps {
  content: {
    strikethroughPrice: string;
    yourPriceText: string;
    mainText: string;
  };
}

const Scarcity: React.FC<ScarcityProps> = ({ content }) => {
  const displayContent = content || {
    strikethroughPrice: '₱50,000+',
    yourPriceText: 'Your Price Today: Your Feedback & Your Success Story',
    mainText: 'Loading scarcity information...'
  };

  return (
    <section className="scarcity-section">
      <div className="container scarcity-container">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7 }}
        >
          <div className="price-drop">
            <span className="strikethrough">{displayContent.strikethroughPrice}</span>
          </div>
          <h3>{displayContent.yourPriceText}</h3>
          <p className="scarcity-text">{displayContent.mainText}</p>
          
          <div className="embedded-live-slots">
            <LiveSlots />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Scarcity;