// --- apps/public-site/src/components/Testimonials.tsx ---
'use client';
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import './Testimonials.css';

// TypeScript Interface for our testimonial data
interface Testimonial {
  id: string;
  clientName: string;
  clientPhotoUrl: string;
  quote: string;
  title: string; // e.g., "E-commerce Seller"
}
interface TestimonialsProps {
  content: Testimonial[]; // Expects an array of testimonial objects
  headline: string;
}

const Testimonials: React.FC<TestimonialsProps> = ({ content, headline }) => {
  const [emblaRef] = useEmblaCarousel({ loop: true, align: 'start' });
  const displayContent = content || [];

  if (displayContent.length === 0) {
    return <p>Loading testimonials...</p>; // Or null
  }

  return (
    <section className="testimonials-section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="testimonials-headline">{headline || 'What Our Happy Homeowners Say'}</h2>
          <div className="embla" ref={emblaRef}>
            <div className="embla__container">
              {displayContent.map((testimonial) => (
                <div className="embla__slide" key={testimonial.id}>
                  <div className="testimonial-card">
                    <div className="testimonial-image">
                      <Image
                        src={testimonial.clientPhotoUrl}
                        alt={`Portrait of ${testimonial.clientName}`}
                        width={80}
                        height={80}
                      />
                    </div>
                    <p className="testimonial-quote">&quot;{testimonial.quote}&quot;</p>
                    <div className="testimonial-author">
                      <span className="author-name">{testimonial.clientName}</span>
                      <span className="author-title">{testimonial.title}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;