// --- apps/public-site/src/components/Benefits.tsx ---
'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { FaClock, FaBullseye, FaHandshake, FaChartLine } from 'react-icons/fa'; // Example icons
import './Benefits.css';

// TypeScript Interfaces
interface Benefit {
  id: string;
  icon: string; // We'll map this string to an icon component
  title: string;
  description: string;
}
interface BenefitsProps {
  content: {
    mainHeadline: string;
    benefits: Benefit[];
  };
}
// Icon Map to connect database string to a real icon
const iconMap: { [key: string]: React.ReactElement } = {
  FaClock: <FaClock />,
  FaBullseye: <FaBullseye />,
  FaHandshake: <FaHandshake />,
  FaChartLine: <FaChartLine />,
};

const Benefits: React.FC<BenefitsProps> = ({ content }) => {
  const displayContent = content || { mainHeadline: 'Loading Benefits...', benefits: [] };

  return (
    <section className="benefits-section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="benefits-headline">{displayContent.mainHeadline}</h2>
          <div className="benefits-grid">
            {displayContent.benefits.map((benefit) => (
              <div key={benefit.id} className="benefit-card">
                <div className="benefit-icon">{iconMap[benefit.icon] || <FaClock />}</div>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Benefits;