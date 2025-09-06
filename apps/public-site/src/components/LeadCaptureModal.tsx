// --- apps/public-site/src/components/LeadCaptureModal.tsx ---
'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { httpsCallable } from 'firebase/functions';
import { ref, get } from 'firebase/database';
import { functions, database } from '@/firebase';
import './SignupModal.css'; // Reuse existing styles

interface FormField {
  name: string;
  label: string;
  type: string;
  placeholder: string;
  required?: boolean;
}

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  fields: FormField[];
  ctaText: string;
  formType: 'LEAD' | 'SELLER_INQUIRY';
}

interface LeadData {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  businessPage?: string;
  type: 'LEAD' | 'SELLER_INQUIRY';
  interestedProperty?: string;
}

const LeadCaptureModal: React.FC<LeadCaptureModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  fields,
  ctaText,
  formType
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<Record<string, string>>({});

  // Reset form when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setFormData({});
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Handle body scroll lock
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Prepare lead data
      const leadData: LeadData = {
        firstName: formData.firstName || '',
        lastName: formData.lastName || '',
        email: formData.email || '',
        phone: formData.phone || '',
        businessPage: formData.businessPage || '',
        type: formType,
        interestedProperty: formData.interestedProperty || ''
      };

      // 1. Call our Next.js API route (no CORS issues)
      const response = await fetch(
        '/api/submit-lead',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(leadData)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to submit inquiry');
      }

      const result = await response.json();
      const inquiryId = result.inquiryId;

      if (!inquiryId) {
        throw new Error('Failed to get inquiry ID from server.');
      }

      // 2. Fetch the correct redirect URL from database
      const redirectKey = formType === 'LEAD' ? 'buyerRedirectUrl' : 'sellerRedirectUrl';
      const urlRef = ref(database, `siteContent/automationLinks/${redirectKey}`);
      const urlSnapshot = await get(urlRef);

      if (!urlSnapshot.exists()) {
        // Fallback if automation URL not configured
        alert('Thank you! Your inquiry has been submitted successfully. We will contact you soon.');
        onClose();
        return;
      }

      const redirectUrl = urlSnapshot.val();

      // 3. Construct URL with parameters for SmartBot
      const params = new URLSearchParams({
        firstName: leadData.firstName,
        lastName: leadData.lastName,
        inquiryId: inquiryId,
        type: formType,
        email: leadData.email || '',
        phone: leadData.phone || ''
      }).toString();

      // 4. Perform the magic redirect
      const finalUrl = `${redirectUrl}&${params}`;
      console.log('Redirecting to SmartBot:', finalUrl);

      // Close modal and redirect to SmartBot
      onClose();
      window.location.href = finalUrl;

    } catch (err: unknown) {
      console.error('Submission Error:', err);
      setError('Submission failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="modal-backdrop"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          <button className="close-button" onClick={onClose}>
            &times;
          </button>

          <div className="modal-header">
            <h2>{title}</h2>
            <p>{description}</p>
          </div>

          <form className="modal-form" onSubmit={handleSubmit}>
            {fields.map((field) => (
              <div key={field.name} className="form-group">
                <label htmlFor={field.name}>
                  {field.label}
                  {field.required && ' *'}
                </label>
                <input
                  type={field.type}
                  id={field.name}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleInputChange}
                  required={field.required}
                  placeholder={field.placeholder}
                  disabled={isSubmitting}
                />
              </div>
            ))}

            {error && (
              <div style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : ctaText}
            </button>

            <div className="privacy-notice">
              By submitting this form, you agree to be contacted by Property Pasalo.
              We respect your privacy and will never share your information.
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LeadCaptureModal;
