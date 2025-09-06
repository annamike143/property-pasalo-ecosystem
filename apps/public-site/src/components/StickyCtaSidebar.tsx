// --- apps/public-site/src/components/StickyCtaSidebar.tsx ---
'use client';
import React, { useMemo, useState } from 'react';
import LeadCaptureModal from './LeadCaptureModal-Callable';
import './StickyCtaSidebar.css';

interface StickyCtaSidebarProps {
  listingName?: string;
  listingId?: string;
}

const StickyCtaSidebar: React.FC<StickyCtaSidebarProps> = ({ listingName, listingId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const buyerFields = useMemo(() => ([
    { name: 'firstName', label: 'First Name', type: 'text', placeholder: 'Your first name', required: true },
    { name: 'lastName', label: 'Last Name', type: 'text', placeholder: 'Your last name', required: true },
    { name: 'email', label: 'Email Address', type: 'email', placeholder: 'your.email@example.com', required: false },
    { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+63 9XX XXX XXXX', required: false },
    { name: 'interestedProperty', label: 'Property of Interest', type: 'text', placeholder: listingName || 'Which property are you interested in?', required: false }
  ]), [listingName]);

  return (
    <>
      <aside className="sticky-sidebar">
        <div className="cta-box">
          <h3>Interested in this Property?</h3>
          <p>Book a free, no-obligation site viewing with one of our specialists.</p>
          <button onClick={() => setIsModalOpen(true)}>
            Book a Free Site Viewing
          </button>
        </div>
      </aside>

    <LeadCaptureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Book Your Free Site Viewing"
        description="Fill out the form below and we'll schedule your personalized property viewing at your convenience."
        fields={buyerFields}
        ctaText="Book My Viewing Now"
        formType="LEAD"
        initialValues={{
      interestedProperty: listingName || '',
      listingId: listingId || ''
        }}
        hiddenFields={listingName ? ['interestedProperty'] : []}
      />
    </>
  );
};

export default StickyCtaSidebar;