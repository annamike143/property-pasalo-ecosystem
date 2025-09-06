"use client";
import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import TestimonialCard, { BaseTestimonial } from './TestimonialCard';

export const VideoTestimonialsCarousel: React.FC<{ testimonials: BaseTestimonial[] }>
  = ({ testimonials }) => {
  const [emblaRef] = useEmblaCarousel({ align: 'start' });
  if (!testimonials?.length) return null;
  return (
    <div className="embla" ref={emblaRef} style={{ overflow: 'hidden' }}>
      <div className="embla__container" style={{ display: 'flex', gap: 16 }}>
        {testimonials.map((t) => (
          <div className="embla__slide" key={t.id || t.clientName} style={{ flex: '0 0 85%', maxWidth: 420 }}>
            <TestimonialCard t={{ ...t, type: 'VIDEO' }} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoTestimonialsCarousel;
