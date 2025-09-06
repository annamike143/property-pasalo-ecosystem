// --- apps/public-site/src/components/LeadCaptureModal-Callable.tsx ---
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
  initialValues?: Record<string, string>;
  hiddenFields?: string[];
}

interface LeadData {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  businessPage?: string;
  type: 'LEAD' | 'SELLER_INQUIRY';
  interestedProperty?: string;
  listingId?: string;
}

const LeadCaptureModalCallable: React.FC<LeadCaptureModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  fields,
  ctaText,
  formType,
  initialValues,
  hiddenFields
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
    } else {
      // initialize form with provided initial values
      if (initialValues) {
        setFormData(prev => ({ ...initialValues, ...prev }));
      }
    }
  }, [isOpen, initialValues]);

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
        interestedProperty: formData.interestedProperty || '',
        listingId: formData.listingId || undefined
      };

      // 1. Try the callable function first; if it fails (e.g., CORS), fall back to our Next API proxy
      let inquiryId: string | undefined;
      try {
        const writeLeadToDb = httpsCallable(functions, 'writeLeadToDb');
        const result = await writeLeadToDb(leadData);
        const data = result.data as { success?: boolean; inquiryId?: string };
        inquiryId = data?.inquiryId;
      } catch (callableErr) {
        console.warn('Callable path failed, falling back to API route:', callableErr);
      }

      if (!inquiryId) {
        const resp = await fetch('/api/submit-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(leadData),
        });
        if (!resp.ok) {
          throw new Error('Failed to submit inquiry via API');
        }
        const json = await resp.json();
        inquiryId = json?.inquiryId ?? json?.data?.inquiryId;
      }

      if (!inquiryId) throw new Error('Failed to get inquiry ID from server.');

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
        inquiryId,
        type: formType,
        email: leadData.email || '',
        phone: leadData.phone || '',
        interestedProperty: leadData.interestedProperty || '',
        listingId: leadData.listingId || ''
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
          <button className="close-button" aria-label="Close" onClick={onClose}>
            &times;
          </button>

          <div className="modal-header">
            <h2>{title}</h2>
            <p>{description}</p>
          </div>

          <form onSubmit={handleSubmit} className="modal-form">
            {fields.map((field) => {
              if (hiddenFields?.includes(field.name)) {
                return null;
              }
              const defaultVal = initialValues?.[field.name];
              return (
                <div key={field.name} className="form-group">
                  <label htmlFor={field.name}>
                    {field.label} {field.required && <span className="required">*</span>}
                  </label>
                  <input
                    type={field.type}
                    id={field.name}
                    name={field.name}
                    placeholder={field.placeholder}
                    required={field.required}
                    value={formData[field.name] ?? defaultVal ?? ''}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
              );
            })}

            {error && (
              <div className="error-message">
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
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LeadCaptureModalCallable;
