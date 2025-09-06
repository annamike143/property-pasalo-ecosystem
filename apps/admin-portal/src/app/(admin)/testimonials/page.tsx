// --- apps/admin-portal/src/app/(admin)/testimonials/page.tsx (FINAL) ---
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { ref, onValue, remove } from 'firebase/database';
import { database } from '@/firebase';
import { Client, Testimonial as SharedTestimonial } from '@repo/types';
import TestimonialModal from '@/components/TestimonialModal';
import './testimonials.css'; 

export type Testimonial = SharedTestimonial;

const TestimonialsPage = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [homeowners, setHomeowners] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'IMAGE' | 'VIDEO'>('IMAGE');
  const [modalState, setModalState] = useState<{ type: 'IMAGE' | 'VIDEO'; data: Partial<Testimonial> | null } | null>(null);

  useEffect(() => {
    const testimonialsRef = ref(database, 'testimonials');
    const homeownersRef = ref(database, 'clients');

    const unsubTestimonials = onValue(testimonialsRef, (snapshot) => {
      const data = snapshot.val();
      const loaded: Testimonial[] = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
      setTestimonials(loaded);
    });

    const unsubHomeowners = onValue(homeownersRef, (snapshot) => {
        const data = snapshot.val();
        const loaded: Client[] = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
        setHomeowners(loaded.filter(c => c.status === 'HOMEOWNER'));
        setLoading(false);
    });

    return () => {
      unsubTestimonials();
      unsubHomeowners();
    };
  }, []);

  const handleDelete = async (itemId: string) => {
    if (window.confirm('Are you sure you want to permanently delete this testimonial?')) {
        await remove(ref(database, `testimonials/${itemId}`));
    }
  };

  const filteredTestimonials = useMemo(() => {
    return testimonials.filter(t => t.type === activeTab);
  }, [testimonials, activeTab]);

  if (loading) return <p>Loading testimonials and homeowners...</p>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Testimonials Management</h1>
        <button 
          className="add-new-button"
          onClick={() => setModalState({ type: activeTab, data: null })}
        >
          + Add New Testimonial
        </button>
      </div>
      <div className="tabs">
        <button className={activeTab === 'IMAGE' ? 'active' : ''} onClick={() => setActiveTab('IMAGE')}>Image Testimonials</button>
        <button className={activeTab === 'VIDEO' ? 'active' : ''} onClick={() => setActiveTab('VIDEO')}>Video Testimonials</button>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Client</th>
              <th>{activeTab === 'IMAGE' ? 'Quote / Rating' : 'Video'}</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTestimonials.length > 0 ? filteredTestimonials.map(item => (
              <tr key={item.id}>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <strong>{item.clientName}</strong>
                    {item.clientTitle && <small style={{ color: '#666' }}>{item.clientTitle}</small>}
                  </div>
                </td>
                <td>
                  {item.type === 'IMAGE' ? (
                    <div>
                      <div>“{(item.quote || '').slice(0, 70)}{(item.quote||'').length > 70 ? '…' : ''}”</div>
                      {typeof item.rating === 'number' && (
                        <div title={`${item.rating} stars`}>
                          {'★'.repeat(item.rating)}{'☆'.repeat(Math.max(0, 5 - item.rating))}
                        </div>
                      )}
                      {item.badge && <span className="badge">{item.badge}</span>}
                    </div>
                  ) : (
                    <div>
                      <div>{item.videoTitle}</div>
                      {item.youtubeId && <small style={{ color: '#666' }}>YouTube ID: {item.youtubeId}</small>}
                    </div>
                  )}
                </td>
                <td>
                  <button 
                    className="action-button edit"
                    onClick={() => setModalState({ type: item.type, data: item })}
                  >
                    Edit
                  </button>
                  <button 
                    className="action-button delete"
                    onClick={() => handleDelete(item.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={3} className="no-results">No {activeTab.toLowerCase()} testimonials found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {modalState && (
        <TestimonialModal 
          modalState={modalState}
          onClose={() => setModalState(null)}
          homeowners={homeowners}
        />
      )}
    </div>
  );
};

export default TestimonialsPage;