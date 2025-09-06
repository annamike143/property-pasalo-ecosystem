// --- packages/ui/LeadCaptureModal.tsx ---
'use client';
import React from 'react';

// A generic styling object for now
const modalBackdropStyles: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    background: 'rgba(0,0,0,0.7)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 1000,
};
const modalContentStyles: React.CSSProperties = {
    background: 'white', padding: '2rem', borderRadius: '8px',
    width: '90%', maxWidth: '500px',
};

// --- TypeScript Interfaces ---
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel';
  required: boolean;
}
interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fields: FormField[];
  ctaText: string;
  onSubmit: (formData: Record<string, string>) => Promise<void>;
}

export const LeadCaptureModal: React.FC<LeadCaptureModalProps> = ({ isOpen, onClose, title, fields, ctaText, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
        data[key] = value as string;
    });
    try {
      await onSubmit(data); // Call the passed-in submit function
    } finally {
      // do not immediately reset to avoid rapid resubmits; slight delay
      setTimeout(() => setIsSubmitting(false), 1200);
    }
  };

  return (
    <div style={modalBackdropStyles} onClick={onClose}>
      <div style={modalContentStyles} onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
  <form onSubmit={handleSubmit}>
          {fields.map(field => (
            <div key={field.name} style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>{field.label}</label>
              <input
                type={field.type}
                name={field.name}
    required={field.required}
    disabled={isSubmitting}
    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc', opacity: isSubmitting ? 0.7 : 1 }}
              />
            </div>
          ))}
    <button type="submit" disabled={isSubmitting} aria-busy={isSubmitting} style={{ width: '100%', padding: '1rem', background: '#0B6E4F', color: 'white', border: 'none', borderRadius: '4px', opacity: isSubmitting ? 0.8 : 1 }}>
      {isSubmitting ? 'Submitting…' : ctaText}
          </button>
        </form>
      </div>
    </div>
  );
};
