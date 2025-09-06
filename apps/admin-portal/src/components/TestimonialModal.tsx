// --- apps/admin-portal/src/components/TestimonialModal.tsx ---
'use client';
import React, { useState, useEffect } from 'react';
import { ref, set, push } from 'firebase/database';
import { database } from '@/firebase';
import { Client, Testimonial, validateTestimonial, parseYouTubeId } from '@repo/types';
import './TestimonialModal.css';

interface TestimonialModalProps {
  modalState: { type: 'IMAGE' | 'VIDEO'; data: Partial<Testimonial> | null };
  onClose: () => void;
  homeowners: Client[];
}

const TestimonialModal: React.FC<TestimonialModalProps> = ({ modalState, onClose, homeowners }) => {
  const [formData, setFormData] = useState<Partial<Testimonial>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (modalState.data) {
      setFormData(modalState.data);
    } else {
      // Default state for a new testimonial
      setFormData({ type: modalState.type, rating: modalState.type === 'IMAGE' ? 5 : undefined });
    }
  }, [modalState]);

  if (!modalState.type) return null;

  const handleClientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selectedHomeowner = homeowners.find(h => h.id === selectedId);
    if (selectedHomeowner) {
      setFormData((prev: Partial<Testimonial>) => ({
        ...prev,
        clientId: selectedId,
        clientName: `${selectedHomeowner.firstName} ${selectedHomeowner.lastName}`,
        clientPhotoUrl: selectedHomeowner.profilePictureUrl || '',
      }));
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const name = target.name as keyof Testimonial;
    const value = target.value as unknown as Testimonial[keyof Testimonial];
    setFormData((prev: Partial<Testimonial>) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrors([]);
    try {
      const now = Date.now();
      const derivedYoutubeId = parseYouTubeId(formData.youtubeUrl);
      const dataToValidate: Partial<Testimonial> = {
        ...formData,
        youtubeId: derivedYoutubeId,
      };

      const validation = validateTestimonial(dataToValidate);
      if (!validation.valid) {
        setErrors(validation.errors);
        return;
      }

      const dataToSave: Partial<Testimonial> = {
        ...dataToValidate,
        updatedAt: now,
        createdAt: formData.createdAt ?? now,
      };

      if (dataToSave.id) {
        const testimonialRef = ref(database, `testimonials/${dataToSave.id}`);
        await set(testimonialRef, dataToSave);
      } else {
        const testimonialsRef = ref(database, 'testimonials');
        const newRef = push(testimonialsRef);
        const id = newRef.key as string;
        await set(newRef, { ...dataToSave, id });
      }
      alert('Testimonial saved successfully!');
      onClose();
    } catch (error) {
      console.error("Error saving testimonial:", error);
      alert("Failed to save testimonial.");
    } finally {
      setIsSaving(false);
    }
  };

  const isEditMode = !!formData.id;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>{isEditMode ? 'Edit' : 'Add New'} {modalState.type} Testimonial</h2>
        <form onSubmit={handleSubmit}>
          {errors.length > 0 && (
            <div className="error-box">
              <ul>
                {errors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="form-group">
            <label htmlFor="clientId">Select Client</label>
            <select
              id="clientId"
              name="clientId"
              value={formData.clientId || ''}
              onChange={handleClientSelect}
              required
            >
              <option value="">Choose a homeowner...</option>
              {homeowners.map(homeowner => (
                <option key={homeowner.id} value={homeowner.id}>
                  {homeowner.firstName} {homeowner.lastName}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="secondary-btn"
              style={{ marginTop: 8 }}
              onClick={() => {
                if (!formData.clientId) return;
                const selectedHomeowner = homeowners.find(h => h.id === formData.clientId);
                if (selectedHomeowner) {
                  setFormData((prev: Partial<Testimonial>) => ({
                    ...prev,
                    clientName: `${selectedHomeowner.firstName} ${selectedHomeowner.lastName}`,
                    clientPhotoUrl: selectedHomeowner.profilePictureUrl || '',
                  }));
                }
              }}
            >
              Sync from client
            </button>
          </div>

          <div className="form-group">
            <label htmlFor="clientTitle">Client Title (optional)</label>
            <input
              type="text"
              id="clientTitle"
              name="clientTitle"
              value={formData.clientTitle || ''}
              onChange={handleInputChange}
              placeholder="e.g., OFW, 10-year renter"
            />
          </div>

          {/* Quote is required for both */}
          <div className="form-group">
            <label htmlFor="quote">Quote</label>
            <textarea
              id="quote"
              name="quote"
              rows={4}
              value={formData.quote || ''}
              onChange={handleInputChange}
              placeholder="Enter the client's testimonial quote..."
              required
            />
          </div>

          {modalState.type === 'IMAGE' ? (
            <>
              <div className="form-group">
                <label htmlFor="rating">Rating (1-5)</label>
                <select
                  id="rating"
                  name="rating"
                  value={formData.rating ?? 5}
                  onChange={handleInputChange}
                >
                  <option value={5}>5 Stars</option>
                  <option value={4}>4 Stars</option>
                  <option value={3}>3 Stars</option>
                  <option value={2}>2 Stars</option>
                  <option value={1}>1 Star</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="badge">Badge (Optional)</label>
                <input
                  type="text"
                  id="badge"
                  name="badge"
                  value={formData.badge || ''}
                  onChange={handleInputChange}
                  placeholder="e.g., 'Verified Purchase', 'Top Client'"
                />
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="videoTitle">Video Title</label>
                <input
                  type="text"
                  id="videoTitle"
                  name="videoTitle"
                  value={formData.videoTitle || ''}
                  onChange={handleInputChange}
                  placeholder="Enter the video testimonial title..."
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="youtubeUrl">YouTube URL</label>
                <input
                  type="url"
                  id="youtubeUrl"
                  name="youtubeUrl"
                  value={formData.youtubeUrl || ''}
                  onChange={(e) => {
                    const url = e.target.value;
                    setFormData((prev: Partial<Testimonial>) => ({ ...prev, youtubeUrl: url, youtubeId: parseYouTubeId(url) }));
                  }}
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                />
                {formData.youtubeUrl && (
                  <small>Parsed video ID: {parseYouTubeId(formData.youtubeUrl) || 'N/A'}</small>
                )}
              </div>
            </>
          )}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="save-btn">
              {isSaving ? 'Saving...' : isEditMode ? 'Update Testimonial' : 'Add Testimonial'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TestimonialModal;
