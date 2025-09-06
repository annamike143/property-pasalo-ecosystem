// --- apps/public-site/src/components/SignupModal.tsx ---
'use client';
import React from 'react';
import LeadCaptureModal from './LeadCaptureModal-Callable';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SignupModal: React.FC<SignupModalProps> = ({ isOpen, onClose }) => {
  const sellerFields = [
    { name: 'firstName', label: 'First Name', type: 'text', placeholder: 'Your first name', required: true },
    { name: 'lastName', label: 'Last Name', type: 'text', placeholder: 'Your last name', required: true },
    { name: 'email', label: 'Email Address', type: 'email', placeholder: 'your.email@example.com', required: false },
    { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+63 9XX XXX XXXX', required: false }
  ];

  return (
    <LeadCaptureModal
      isOpen={isOpen}
      onClose={onClose}
      title="Get Your Property Pasalo Consultation"
  description="Fill out the form below and we'll help you transition from renting to owning through our proven pasalo system."
      fields={sellerFields}
      ctaText="Get My Free Consultation"
      formType="SELLER_INQUIRY"
    />
  );
};

export default SignupModal;