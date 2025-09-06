"use client";
import React, { useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import TestimonialCard, { BaseTestimonial } from './TestimonialCard';

export const ImageTestimonialsCarousel: React.FC<{ testimonials: BaseTestimonial[] }>
  = ({ testimonials }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });

  useEffect(() => {
    if (!emblaApi) return;
    if (typeof window === 'undefined') return;
    const isMobile = window.matchMedia('(max-width: 640px)').matches;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!isMobile || reduceMotion) return; // only mobile, respect reduced motion

    let raf = 0;
    let last = performance.now();
    let stopped = false;

    const stop = () => {
      stopped = true;
      if (raf) cancelAnimationFrame(raf);
    };

    const onVisibility = () => {
      if (document.hidden) stop();
    };

    const onUserInteract = () => stop();

    const step = (t: number) => {
      if (!emblaApi || stopped) return;
      const dt = t - last;
      if (dt > 3500) { // ~3.5s gentle step
        emblaApi.scrollNext();
        last = t;
      }
      raf = requestAnimationFrame(step);
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pointerdown', onUserInteract, { once: true });
    window.addEventListener('keydown', onUserInteract, { once: true });
    raf = requestAnimationFrame(step);

    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointerdown', onUserInteract);
      window.removeEventListener('keydown', onUserInteract);
    };
  }, [emblaApi]);

  if (!testimonials?.length) return null;

  return (
    <div className="embla" ref={emblaRef} style={{ overflow: 'hidden' }}>
      <div className="embla__container" style={{ display: 'flex', gap: 16 }}>
        {testimonials.map((t) => (
          <div className="embla__slide" key={t.id || t.clientName} style={{ flex: '0 0 85%', maxWidth: 420 }}>
            <TestimonialCard t={{ ...t, type: 'IMAGE' }} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageTestimonialsCarousel;
