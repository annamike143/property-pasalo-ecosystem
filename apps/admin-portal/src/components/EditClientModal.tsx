// --- apps/admin-portal/src/components/EditClientModal.tsx (ENHANCED) ---
'use client';
import React, { useState, useEffect, useContext } from 'react';
import { ref, update } from 'firebase/database';
import { database } from '@/firebase';
import { AuthContext } from '@/context/AuthContext';
import ImageUploader from './ImageUploader';
import { Client } from '../app/(admin)/clients/page';
import './EditClientModal.css';

interface EditClientModalProps {
  client: Client | null;
  onClose: () => void;
}

const EditClientModal: React.FC<EditClientModalProps> = ({ client, onClose }) => {
  const [formData, setFormData] = useState<Partial<Client>>({});
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (client) {
      setFormData(client);
    }
  }, [client]);

  if (!client) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePhotoUpload = (url: string) => {
    setFormData(prev => ({ ...prev, profilePictureUrl: url }));
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check authentication
    if (!user) {
      alert('You must be logged in to update client details.');
      return;
    }
    
    setIsSaving(true);
    try {
      console.log('Attempting to update client:', client.id);
      console.log('User authenticated:', user.uid);
      
      const updates: any = {};
      const timestamp = new Date().toISOString();
      
      // Update client data
      updates[`clients/${client.id}`] = {
        ...client,
        ...formData,
        lastModified: timestamp,
        updatedBy: user.uid
      };
      
      // If status changed, log the activity
      if (formData.status && formData.status !== client.status) {
        const activityId = `activity_${Date.now()}`;
        const statusChangeActivity = {
          id: activityId,
          type: 'STATUS_CHANGE',
          clientId: client.id,
          clientName: `${formData.firstName || client.firstName} ${formData.lastName || client.lastName}`,
          previousStatus: client.status,
          newStatus: formData.status,
          timestamp,
          updatedBy: user.uid,
          description: `Client promoted from ${client.status?.replace('_', ' ') || 'Unknown'} to ${formData.status.replace('_', ' ')}`
        };
        updates[`activities/${activityId}`] = statusChangeActivity;
      }
      
      console.log('Updates to apply:', updates);
      
      // Atomic update
      await update(ref(database), updates);
      
      alert(`Client details updated successfully! ${formData.status !== client.status ? 'Status change logged.' : ''}`);
      onClose();
    } catch (error: any) {
      console.error("Error updating client:", error);
      
      // More specific error handling
      if (error.code === 'PERMISSION_DENIED') {
        alert('Permission denied. Please check your authentication status and database permissions.');
      } else if (error.code === 'NETWORK_ERROR') {
        alert('Network error. Please check your internet connection.');
      } else {
        alert(`Failed to update client details: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Edit Client: {client.firstName} {client.lastName}</h2>
        <form onSubmit={handleSaveChanges}>
          <div className="form-grid">
            <div className="form-left">
              <div className="form-group">
                <label>Profile Photo</label>
                <ImageUploader 
                  onUploadComplete={handlePhotoUpload}
                  currentImageUrl={formData.profilePictureUrl}
                />
              </div>
            </div>
            <div className="form-right">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status || 'ACTIVE_CLIENT'}
                  onChange={handleInputChange}
                >
                  <option value="ACTIVE_CLIENT">Active Client</option>
                  <option value="HOMEOWNER">Homeowner</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  value={formData.notes || ''}
                  onChange={handleInputChange}
                  placeholder="Add any notes about this client..."
                />
              </div>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="save-btn">
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditClientModal;
