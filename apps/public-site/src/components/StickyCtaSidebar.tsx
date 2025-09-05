// --- apps/public-site/src/components/StickyCtaSidebar.tsx ---
'use client';
import React from 'react';
import './StickyCtaSidebar.css';

const StickyCtaSidebar = () => {
  return (
    <aside className="sticky-sidebar">
        <div className="cta-box">
            <h3>Interested in this Property?</h3>
            <p>Book a free, no-obligation site viewing with one of our specialists.</p>
            <button>Book a Free Site Viewing</button>
        </div>
    </aside>
  );
};
export default StickyCtaSidebar;