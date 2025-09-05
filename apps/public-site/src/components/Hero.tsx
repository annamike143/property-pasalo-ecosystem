// --- apps/public-site/src/components/Hero.tsx ---
'use client';
import React from 'react';
import './Hero.css';

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
  // For now, we use placeholder content if none is provided
  const displayContent = content || {
    attentionMessage: 'LOADING ATTENTION MESSAGE...',
    mainHeadline: 'LOADING MAIN HEADLINE...',
    subHeadline: 'LOADING SUB-HEADLINE...',
    benefitBullets: [],
  };

  return (
    <section className="hero-section">
      <div className="container hero-container">
        <h3>{displayContent.attentionMessage}</h3>
        <h1>{displayContent.mainHeadline}</h1>
        <h2>{displayContent.subHeadline}</h2>
        
        {displayContent.benefitBullets.length > 0 && (
          <div className="hero-benefits">
            <ul>
              {displayContent.benefitBullets.map((bullet) => (
                <li key={bullet.id}>{bullet.text}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="hero-cta">
          <button className="hero-cta-button" onClick={onCtaClick}>
            Get Started Today
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;