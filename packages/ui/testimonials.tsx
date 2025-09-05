// --- packages/ui/testimonials.tsx ---
import React from 'react';

interface TestimonialsProps {
    testimonials?: string[];
}

const Testimonials: React.FC<TestimonialsProps> = ({ testimonials = [] }) => {
    if (!testimonials.length) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                <p>No testimonials available yet.</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem' }}>
            <h3>What Our Clients Say</h3>
            <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                {testimonials.map((testimonial, index) => (
                    <blockquote 
                        key={index}
                        style={{ 
                            padding: '1rem', 
                            borderLeft: '4px solid #0A2540', 
                            backgroundColor: '#f9f9f9',
                            fontStyle: 'italic'
                        }}
                    >
                        {testimonial}
                    </blockquote>
                ))}
            </div>
        </div>
    );
};

export default Testimonials;
