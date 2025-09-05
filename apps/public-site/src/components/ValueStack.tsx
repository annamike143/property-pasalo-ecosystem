// --- apps/public-site/src/components/ValueStack.tsx ---
'use client';
import React from 'react';
import { motion } from 'framer-motion';
import './ValueStack.css';

// TypeScript Interfaces
interface ValueItem {
  id: string;
  text: string;
  value: string; // e.g., "₱35,000" or "Priceless!"
}
interface ValueStackProps {
  content: {
    mainHeadline: string;
    valueItems: ValueItem[];
    totalValueText: string;
    totalValueAmount: string;
  };
}

const ValueStack: React.FC<ValueStackProps> = ({ content }) => {
  const displayContent = content || { mainHeadline: 'Loading...', valueItems: [], totalValueText: 'TOTAL VALUE:', totalValueAmount: '₱0' };

  return (
    <section className="value-stack-section">
      <div className="container value-stack-container">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <h2>{displayContent.mainHeadline}</h2>
          <div className="value-stack-box">
            {displayContent.valueItems.map((item) => (
              <div key={item.id} className="value-item">
                <span>{item.text}</span>
                <span>{item.value}</span>
              </div>
            ))}
            <div className="total-value">
              <span>{displayContent.totalValueText}</span>
              <span>{displayContent.totalValueAmount}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ValueStack;