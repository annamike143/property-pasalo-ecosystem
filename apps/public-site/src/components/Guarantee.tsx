// --- apps/public-site/src/components/Guarantee.tsx ---
'use client';
import React from 'react';
import { FaShieldAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import './Guarantee.css';

interface GuaranteeProps {
  content: {
    headline: string;
    text: string;
    ctaText: string;
  };
  onCtaClick: () => void;
}

const Guarantee: React.FC<GuaranteeProps> = ({ content, onCtaClick }) => {
  const displayContent = content || {
    headline: "My \"Pioneer's Promise\" To You",
    text: "Loading guarantee...",
    ctaText: "SECURE MY FREE LIFETIME ACCOUNT NOW"
  };

  return (
    <section className="guarantee-section">
      <div className="container guarantee-container">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7 }}
        >
          <div className="guarantee-box">
            <FaShieldAlt className="guarantee-icon" />
            <h3>{displayContent.headline}</h3>
            <p>{displayContent.text}</p>
          </div>

          <button className="cta-button-main final-cta" onClick={onCtaClick}>
            {displayContent.ctaText}
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default Guarantee;