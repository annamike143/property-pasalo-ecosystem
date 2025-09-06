// --- apps/public-site/src/components/Hero.tsx (DEFINITIVE FINAL POLISH) ---
'use client';

import React from 'react';
import LiveSlots from './LiveSlots';
import './Hero.css';

// TypeScript Interface for our content structure
interface HeroContent {
  attentionMessage: string;
  mainHeadline: string;
  subHeadline: string;
  benefitBullets: { id: string; text: string }[];
}

interface HeroProps {
  content: HeroContent;
  onCtaClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ content, onCtaClick }) => {
  // Provide a structured fallback to prevent errors if content is loading
  const displayContent = content || {
    attentionMessage: '...',
    mainHeadline: 'Loading Your Shortcut to Homeownership...',
    subHeadline: '...',
    benefitBullets: [],
  };

  return (
    <section className="hero-section">
      <div className="container hero-container">
        <h3 className="hero-attention-message">
          {displayContent.attentionMessage}
        </h3>
        
        <h1 className="hero-main-headline">
          {displayContent.mainHeadline}
        </h1>
        
        <h2 className="hero-sub-headline">
          {displayContent.subHeadline}
        </h2>
        
        <div className="intrigue-section">
          <ul className="intrigue-list">
            {displayContent.benefitBullets.map((bullet) => (
              <li key={bullet.id}>{bullet.text}</li>
            ))}
          </ul>
        </div>

        <button className="cta-button-main" onClick={onCtaClick}>
          VIEW AVAILABLE PROPERTIES
        </button>
        
        <p className="urgency-snippet">
          (Warning: This is a limited invitation for only 100 founding pioneers. Slots are filling fast.)
        </p>

        <LiveSlots />
      </div>
    </section>
  );
};

export default Hero;